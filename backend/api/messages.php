<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

// Connect to database
$conn = get_db_connection();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Verify admin is logged in for GET requests
            require_once __DIR__ . '/auth/auth_middleware.php';
            $user = authenticate();
            if (!$user) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }

            // Get query parameters
            $status = $_GET['status'] ?? null;
            $page = max(1, intval($_GET['page'] ?? 1));
            $per_page = 10;
            $offset = ($page - 1) * $per_page;

            // Build query
            $query = "SELECT * FROM messages";
            $countQuery = "SELECT COUNT(*) as total FROM messages";
            $params = [];

            if ($status) {
                $query .= " WHERE status = ?";
                $countQuery .= " WHERE status = ?";
                $params[] = $status;
            }

            $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = $per_page;
            $params[] = $offset;

            // Get total count
            $stmt = $conn->prepare($countQuery);
            if ($status) {
                $stmt->execute([$status]);
            } else {
                $stmt->execute();
            }
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Get messages
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calculate pagination
            $total_pages = ceil($total / $per_page);

            echo json_encode([
                'success' => true,
                'data' => $messages,
                'pagination' => [
                    'total' => intval($total),
                    'total_pages' => $total_pages,
                    'current_page' => $page,
                    'per_page' => $per_page
                ]
            ]);
            break;

        case 'POST':
            // Handle new message submission (no auth required)
            $data = json_decode(file_get_contents('php://input'), true);

            // Validate required fields
            if (!isset($data['name']) || !isset($data['email']) || !isset($data['message'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Name, email, and message are required']);
                exit;
            }

            // Validate email format
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid email format']);
                exit;
            }

            // Rate limiting - check if there are too many messages from this IP
            $ip = $_SERVER['REMOTE_ADDR'];
            $stmt = $conn->prepare("
                SELECT COUNT(*) as count 
                FROM messages 
                WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) 
                AND ip_address = ?
            ");
            $stmt->execute([$ip]);
            $messageCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            if ($messageCount >= 5) {  // Max 5 messages per hour
                http_response_code(429);
                echo json_encode(['success' => false, 'message' => 'Too many messages. Please try again later.']);
                exit;
            }

            // Sanitize inputs
            $name = htmlspecialchars(strip_tags($data['name']));
            $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
            $message = htmlspecialchars(strip_tags($data['message']));

            // Validate lengths
            if (strlen($name) > 100 || strlen($email) > 255 || strlen($message) > 1000) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Input exceeds maximum length']);
                exit;
            }

            // Insert message
            $stmt = $conn->prepare("
                INSERT INTO messages (id, name, email, message, status, ip_address)
                VALUES (UUID(), ?, ?, ?, 'unread', ?)
            ");

            $success = $stmt->execute([
                $name,
                $email,
                $message,
                $ip
            ]);

            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Message sent successfully'
                ]);
            } else {
                throw new Exception('Failed to save message');
            }
            break;

        case 'PUT':
            // Verify admin is logged in for PUT requests
            require_once __DIR__ . '/auth/auth_middleware.php';
            $user = authenticate();
            if (!$user) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }

            // Update message status
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Message ID is required']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['status']) || !in_array($data['status'], ['unread', 'read', 'replied'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Valid status is required']);
                exit;
            }

            // Sanitize admin notes
            $admin_notes = isset($data['admin_notes']) ? 
                htmlspecialchars(strip_tags($data['admin_notes'])) : null;

            $stmt = $conn->prepare("
                UPDATE messages 
                SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");

            $success = $stmt->execute([
                $data['status'],
                $admin_notes,
                $id
            ]);

            if ($success) {
                // Get updated message
                $stmt = $conn->prepare("SELECT * FROM messages WHERE id = ?");
                $stmt->execute([$id]);
                $message = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$message) {
                    throw new Exception('Message not found after update');
                }

                echo json_encode([
                    'success' => true,
                    'message' => 'Message updated successfully',
                    'data' => $message
                ]);
            } else {
                throw new Exception('Failed to update message');
            }
            break;

        case 'DELETE':
            // Verify admin is logged in for DELETE requests
            require_once __DIR__ . '/auth/auth_middleware.php';
            $user = authenticate();
            if (!$user) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }

            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Message ID is required']);
                exit;
            }

            $stmt = $conn->prepare("DELETE FROM messages WHERE id = ?");
            $success = $stmt->execute([$id]);

            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Message deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete message');
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'An error occurred while processing your request'
    ]);
}

$conn = null;

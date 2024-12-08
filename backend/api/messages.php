<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/auth/auth_middleware.php';

header('Content-Type: application/json');

// Connect to database
$conn = get_db_connection();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Verify admin is logged in for GET requests
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
            // Handle new message submission
            $data = json_decode(file_get_contents('php://input'), true);

            // Validate required fields
            if (!isset($data['name']) || !isset($data['email']) || !isset($data['message'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Name, email, and message are required']);
                exit;
            }

            // Insert message
            $stmt = $conn->prepare("
                INSERT INTO messages (id, name, email, message, status)
                VALUES (UUID(), ?, ?, ?, 'unread')
            ");

            $success = $stmt->execute([
                $data['name'],
                $data['email'],
                $data['message']
            ]);

            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Message sent successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to send message']);
            }
            break;

        case 'PUT':
            // Verify admin is logged in for PUT requests
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

            $stmt = $conn->prepare("
                UPDATE messages 
                SET status = ?, admin_notes = ?
                WHERE id = ?
            ");

            $success = $stmt->execute([
                $data['status'],
                $data['admin_notes'] ?? null,
                $id
            ]);

            if ($success) {
                // Get updated message
                $stmt = $conn->prepare("SELECT * FROM messages WHERE id = ?");
                $stmt->execute([$id]);
                $message = $stmt->fetch(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'message' => 'Message updated successfully',
                    'data' => $message
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update message']);
            }
            break;

        case 'DELETE':
            // Verify admin is logged in for DELETE requests
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
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete message']);
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
    echo json_encode(['success' => false, 'message' => 'An error occurred']);
}

$conn = null;

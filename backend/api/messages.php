<?php
require_once '../config.php';

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $conn = getConnection();
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Verify admin authentication
            session_start();
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }

            // Get query parameters
            $status = isset($_GET['status']) ? $_GET['status'] : null;
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            // Base query
            $query = "SELECT * FROM messages";
            $countQuery = "SELECT COUNT(*) FROM messages";
            $params = [];
            
            // Add status filter if provided
            if ($status && in_array($status, ['unread', 'read', 'replied'])) {
                $query .= " WHERE status = :status";
                $countQuery .= " WHERE status = :status";
                $params[':status'] = $status;
            }
            
            // Add sorting and pagination
            $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            
            // Get total count
            $stmt = $conn->prepare($countQuery);
            if ($status) {
                $stmt->bindParam(':status', $params[':status']);
            }
            $stmt->execute();
            $total = $stmt->fetchColumn();
            
            // Get messages
            $stmt = $conn->prepare($query);
            if ($status) {
                $stmt->bindParam(':status', $params[':status']);
            }
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $messages = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $messages,
                'pagination' => [
                    'total' => $total,
                    'total_pages' => ceil($total / $limit),
                    'current_page' => $page,
                    'per_page' => $limit
                ]
            ]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['name']) || !isset($data['email']) || !isset($data['message'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit;
            }

            // Validate email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid email format']);
                exit;
            }

            // Insert message
            $stmt = $conn->prepare("
                INSERT INTO messages (
                    id, name, email, message, status,
                    created_at, updated_at
                ) VALUES (
                    :id, :name, :email, :message, 'unread',
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            ");

            $messageId = uniqid('msg_', true);
            $stmt->execute([
                'id' => $messageId,
                'name' => $data['name'],
                'email' => $data['email'],
                'message' => $data['message']
            ]);

            // Get the created message
            $stmt = $conn->prepare("SELECT * FROM messages WHERE id = ?");
            $stmt->execute([$messageId]);
            $message = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'data' => $message
            ]);
            break;

        case 'PUT':
            // Verify admin authentication
            session_start();
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }

            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Message ID is required']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'];

            // Validate status if provided
            if (isset($data['status']) && !in_array($data['status'], ['unread', 'read', 'replied'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid status']);
                exit;
            }

            // Build update query dynamically
            $updateFields = [];
            $params = ['id' => $id];

            foreach ($data as $key => $value) {
                if (in_array($key, ['status', 'admin_notes'])) {
                    $updateFields[] = "$key = :$key";
                    $params[$key] = $value;
                }
            }

            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No valid fields to update']);
                exit;
            }

            $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
            $query = "UPDATE messages SET " . implode(', ', $updateFields) . " WHERE id = :id";

            $stmt = $conn->prepare($query);
            $stmt->execute($params);

            // Get the updated message
            $stmt = $conn->prepare("SELECT * FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            $message = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'data' => $message
            ]);
            break;

        case 'DELETE':
            // Verify admin authentication
            session_start();
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }

            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Message ID is required']);
                exit;
            }

            $id = $_GET['id'];

            // Delete message
            $stmt = $conn->prepare("DELETE FROM messages WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Message deleted successfully'
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred']);
}

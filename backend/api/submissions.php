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
            $query = "SELECT * FROM submissions";
            $countQuery = "SELECT COUNT(*) FROM submissions";
            $params = [];
            
            // Add status filter if provided
            if ($status && in_array($status, ['pending', 'approved', 'rejected'])) {
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
            
            // Get submissions
            $stmt = $conn->prepare($query);
            if ($status) {
                $stmt->bindParam(':status', $params[':status']);
            }
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $submissions = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $submissions,
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
            if (!isset($data['name']) || !isset($data['email']) || 
                !isset($data['tool_name']) || !isset($data['description']) || 
                !isset($data['api_link'])) {
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

            // Insert submission
            $stmt = $conn->prepare("
                INSERT INTO submissions (
                    id, name, email, tool_name, description, api_link,
                    status, created_at, updated_at
                ) VALUES (
                    :id, :name, :email, :tool_name, :description, :api_link,
                    'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            ");

            $submissionId = uniqid('sub_', true);
            $stmt->execute([
                'id' => $submissionId,
                'name' => $data['name'],
                'email' => $data['email'],
                'tool_name' => $data['tool_name'],
                'description' => $data['description'],
                'api_link' => $data['api_link']
            ]);

            // Get the created submission
            $stmt = $conn->prepare("SELECT * FROM submissions WHERE id = ?");
            $stmt->execute([$submissionId]);
            $submission = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'data' => $submission
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
                echo json_encode(['error' => 'Submission ID is required']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'];

            // Validate status if provided
            if (isset($data['status']) && !in_array($data['status'], ['pending', 'approved', 'rejected'])) {
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
            $query = "UPDATE submissions SET " . implode(', ', $updateFields) . " WHERE id = :id";

            $stmt = $conn->prepare($query);
            $stmt->execute($params);

            // If approved, create resource
            if (isset($data['status']) && $data['status'] === 'approved') {
                // Get submission details
                $stmt = $conn->prepare("SELECT * FROM submissions WHERE id = ?");
                $stmt->execute([$id]);
                $submission = $stmt->fetch();

                // Create resource
                $resourceId = uniqid('res_', true);
                $stmt = $conn->prepare("
                    INSERT INTO resources (
                        id, name, description, url, created_at, updated_at
                    ) VALUES (
                        :id, :name, :description, :url, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                ");

                $stmt->execute([
                    'id' => $resourceId,
                    'name' => $submission['tool_name'],
                    'description' => $submission['description'],
                    'url' => $submission['api_link']
                ]);
            }

            // Get the updated submission
            $stmt = $conn->prepare("SELECT * FROM submissions WHERE id = ?");
            $stmt->execute([$id]);
            $submission = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'data' => $submission
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
                echo json_encode(['error' => 'Submission ID is required']);
                exit;
            }

            $id = $_GET['id'];

            // Delete submission
            $stmt = $conn->prepare("DELETE FROM submissions WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Submission deleted successfully'
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

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
            $query = "SELECT * FROM submissions";
            $countQuery = "SELECT COUNT(*) as total FROM submissions";
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

            // Get submissions
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calculate pagination
            $total_pages = ceil($total / $per_page);

            echo json_encode([
                'success' => true,
                'data' => $submissions,
                'pagination' => [
                    'total' => intval($total),
                    'total_pages' => $total_pages,
                    'current_page' => $page,
                    'per_page' => $per_page
                ]
            ]);
            break;

        case 'POST':
            // Handle new submission
            $data = json_decode(file_get_contents('php://input'), true);

            // Validate required fields
            if (!isset($data['name']) || !isset($data['email']) || 
                !isset($data['tool_name']) || !isset($data['description']) || 
                !isset($data['api_link'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'All fields are required']);
                exit;
            }

            // Insert submission
            $stmt = $conn->prepare("
                INSERT INTO submissions (id, name, email, tool_name, description, api_link, status)
                VALUES (UUID(), ?, ?, ?, ?, ?, 'pending')
            ");

            $success = $stmt->execute([
                $data['name'],
                $data['email'],
                $data['tool_name'],
                $data['description'],
                $data['api_link']
            ]);

            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Submission received successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to submit']);
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

            // Update submission status
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Submission ID is required']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['status']) || !in_array($data['status'], ['pending', 'approved', 'rejected'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Valid status is required']);
                exit;
            }

            $stmt = $conn->prepare("
                UPDATE submissions 
                SET status = ?, admin_notes = ?
                WHERE id = ?
            ");

            $success = $stmt->execute([
                $data['status'],
                $data['admin_notes'] ?? null,
                $id
            ]);

            if ($success) {
                // Get updated submission
                $stmt = $conn->prepare("SELECT * FROM submissions WHERE id = ?");
                $stmt->execute([$id]);
                $submission = $stmt->fetch(PDO::FETCH_ASSOC);

                // If approved, create a new resource
                if ($data['status'] === 'approved') {
                    try {
                        $stmt = $conn->prepare("
                            INSERT INTO resources (id, name, description, url, category_id)
                            VALUES (UUID(), ?, ?, ?, ?)
                        ");
                        $stmt->execute([
                            $submission['tool_name'],
                            $submission['description'],
                            $submission['api_link'],
                            'ai_models' // Default category, can be updated later
                        ]);
                    } catch (Exception $e) {
                        error_log('Failed to create resource from submission: ' . $e->getMessage());
                        // Don't fail the whole request if resource creation fails
                    }
                }

                echo json_encode([
                    'success' => true,
                    'message' => 'Submission updated successfully',
                    'data' => $submission
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update submission']);
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
                echo json_encode(['success' => false, 'message' => 'Submission ID is required']);
                exit;
            }

            $stmt = $conn->prepare("DELETE FROM submissions WHERE id = ?");
            $success = $stmt->execute([$id]);

            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Submission deleted successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete submission']);
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

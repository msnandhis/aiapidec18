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
            // Handle new submission (no auth required)
            $data = json_decode(file_get_contents('php://input'), true);

            // Validate required fields
            if (!isset($data['name']) || !isset($data['email']) || 
                !isset($data['tool_name']) || !isset($data['description']) || 
                !isset($data['api_link'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'All fields are required']);
                exit;
            }

            // Validate email format
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid email format']);
                exit;
            }

            // Validate URL format
            if (!filter_var($data['api_link'], FILTER_VALIDATE_URL)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid API link format']);
                exit;
            }

            // Rate limiting - check if there are too many submissions from this IP
            $ip = $_SERVER['REMOTE_ADDR'];
            $stmt = $conn->prepare("
                SELECT COUNT(*) as count 
                FROM submissions 
                WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) 
                AND ip_address = ?
            ");
            $stmt->execute([$ip]);
            $submissionCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            if ($submissionCount >= 3) {  // Max 3 submissions per hour
                http_response_code(429);
                echo json_encode(['success' => false, 'message' => 'Too many submissions. Please try again later.']);
                exit;
            }

            // Sanitize inputs
            $name = htmlspecialchars(strip_tags($data['name']));
            $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
            $tool_name = htmlspecialchars(strip_tags($data['tool_name']));
            $description = htmlspecialchars(strip_tags($data['description']));
            $api_link = filter_var($data['api_link'], FILTER_SANITIZE_URL);

            // Insert submission
            $stmt = $conn->prepare("
                INSERT INTO submissions (id, name, email, tool_name, description, api_link, status, ip_address)
                VALUES (UUID(), ?, ?, ?, ?, ?, 'pending', ?)
            ");

            $success = $stmt->execute([
                $name,
                $email,
                $tool_name,
                $description,
                $api_link,
                $ip
            ]);

            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Submission received successfully'
                ]);
            } else {
                throw new Exception('Failed to save submission');
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

            // If approving, require category_id
            if ($data['status'] === 'approved' && !isset($data['category_id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Category is required when approving']);
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
                            $data['category_id']  // Use selected category
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
                throw new Exception('Failed to update submission');
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
                throw new Exception('Failed to delete submission');
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

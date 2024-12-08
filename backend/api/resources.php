<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/auth/auth_middleware.php';

header('Content-Type: application/json');

try {
    $conn = get_db_connection();
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get query parameters
            $category = $_GET['category'] ?? null;
            $page = max(1, intval($_GET['page'] ?? 1));
            $per_page = 12;
            $offset = ($page - 1) * $per_page;
            
            // Base query
            $query = "SELECT r.*, c.label as category_name 
                     FROM resources r 
                     LEFT JOIN categories c ON r.category_id = c.id";
            $countQuery = "SELECT COUNT(*) FROM resources r";
            $params = [];
            
            // Add category filter if provided
            if ($category) {
                $query .= " WHERE r.category_id = ?";
                $countQuery .= " WHERE r.category_id = ?";
                $params[] = $category;
            }
            
            // Add ordering and pagination
            $query .= " ORDER BY r.is_featured DESC, r.created_at DESC LIMIT ? OFFSET ?";
            $params[] = $per_page;
            $params[] = $offset;
            
            // Get total count
            $stmt = $conn->prepare($countQuery);
            if ($category) {
                $stmt->execute([$category]);
            } else {
                $stmt->execute();
            }
            $total = $stmt->fetchColumn();
            
            // Get resources
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $resources,
                'pagination' => [
                    'total' => intval($total),
                    'total_pages' => ceil($total / $per_page),
                    'current_page' => $page,
                    'per_page' => $per_page
                ]
            ]);
            break;

        case 'POST':
            // Verify admin is logged in
            $user = authenticate();
            if (!$user) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['name']) || !isset($data['category_id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Name and category are required']);
                exit;
            }

            // Insert resource
            $stmt = $conn->prepare("
                INSERT INTO resources (
                    id, name, category_id, logo, url, description, is_featured, 
                    created_at, updated_at
                ) VALUES (
                    UUID(), ?, ?, ?, ?, ?, ?,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            ");

            $success = $stmt->execute([
                $data['name'],
                $data['category_id'],
                $data['logo'] ?? null,
                $data['url'] ?? null,
                $data['description'] ?? null,
                $data['is_featured'] ?? false
            ]);

            if (!$success) {
                throw new Exception('Failed to create resource');
            }

            $id = $conn->lastInsertId();

            // Get the created resource
            $stmt = $conn->prepare("
                SELECT r.*, c.label as category_name 
                FROM resources r 
                LEFT JOIN categories c ON r.category_id = c.id 
                WHERE r.id = ?
            ");
            $stmt->execute([$id]);
            $resource = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $resource
            ]);
            break;

        case 'PUT':
            // Verify admin is logged in
            $user = authenticate();
            if (!$user) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }

            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Resource ID is required']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            // Build update query dynamically based on provided fields
            $updateFields = [];
            $params = [];

            foreach ($data as $key => $value) {
                if (in_array($key, ['name', 'category_id', 'logo', 'url', 'description', 'is_featured'])) {
                    $updateFields[] = "$key = ?";
                    $params[] = $value;
                }
            }

            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'No valid fields to update']);
                exit;
            }

            $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
            $params[] = $id; // Add ID for WHERE clause

            $query = "UPDATE resources SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $conn->prepare($query);
            $success = $stmt->execute($params);

            if (!$success) {
                throw new Exception('Failed to update resource');
            }

            // Get the updated resource
            $stmt = $conn->prepare("
                SELECT r.*, c.label as category_name 
                FROM resources r 
                LEFT JOIN categories c ON r.category_id = c.id 
                WHERE r.id = ?
            ");
            $stmt->execute([$id]);
            $resource = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $resource
            ]);
            break;

        case 'DELETE':
            // Verify admin is logged in
            $user = authenticate();
            if (!$user) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }

            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Resource ID is required']);
                exit;
            }

            // Get resource info to delete logo file if exists
            $stmt = $conn->prepare("SELECT logo FROM resources WHERE id = ?");
            $stmt->execute([$id]);
            $resource = $stmt->fetch(PDO::FETCH_ASSOC);

            // Delete logo file if it's a local file
            if ($resource && $resource['logo'] && strpos($resource['logo'], '/uploads/logos/') === 0) {
                $logoPath = __DIR__ . '/../../' . $resource['logo'];
                if (file_exists($logoPath)) {
                    unlink($logoPath);
                }
            }

            // Delete resource
            $stmt = $conn->prepare("DELETE FROM resources WHERE id = ?");
            $success = $stmt->execute([$id]);

            if (!$success) {
                throw new Exception('Failed to delete resource');
            }

            echo json_encode([
                'success' => true,
                'message' => 'Resource deleted successfully'
            ]);
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

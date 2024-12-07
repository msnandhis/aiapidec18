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
            // Get query parameters
            $category = isset($_GET['category']) ? $_GET['category'] : null;
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            // Base query
            $query = "SELECT r.*, c.label as category_name 
                     FROM resources r 
                     LEFT JOIN categories c ON r.category_id = c.id";
            $countQuery = "SELECT COUNT(*) FROM resources r";
            
            // Add category filter if provided
            if ($category) {
                $query .= " WHERE r.category_id = :category";
                $countQuery .= " WHERE r.category_id = :category";
            }
            
            // Add pagination
            $query .= " ORDER BY r.created_at DESC LIMIT :limit OFFSET :offset";
            
            // Get total count
            $stmt = $conn->prepare($countQuery);
            if ($category) {
                $stmt->bindParam(':category', $category);
            }
            $stmt->execute();
            $total = $stmt->fetchColumn();
            
            // Get resources
            $stmt = $conn->prepare($query);
            if ($category) {
                $stmt->bindParam(':category', $category);
            }
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $resources = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $resources,
                'pagination' => [
                    'total' => $total,
                    'total_pages' => ceil($total / $limit),
                    'current_page' => $page,
                    'per_page' => $limit
                ]
            ]);
            break;

        case 'POST':
            // Verify admin authentication
            session_start();
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['name']) || !isset($data['category_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit;
            }

            // Handle logo (can be URL or file upload)
            $logo = null;
            if (isset($data['logo_url'])) {
                $logo = $data['logo_url'];
            } elseif (isset($_FILES['logo'])) {
                $uploadDir = '../uploads/logos/';
                $fileName = uniqid() . '_' . basename($_FILES['logo']['name']);
                $targetPath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['logo']['tmp_name'], $targetPath)) {
                    $logo = '/backend/uploads/logos/' . $fileName;
                }
            }

            // Insert resource
            $stmt = $conn->prepare("
                INSERT INTO resources (
                    id, name, category_id, logo, url, description, is_featured, 
                    created_at, updated_at
                ) VALUES (
                    :id, :name, :category_id, :logo, :url, :description, :is_featured,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            ");

            $resourceId = uniqid('res_', true);
            $stmt->execute([
                'id' => $resourceId,
                'name' => $data['name'],
                'category_id' => $data['category_id'],
                'logo' => $logo,
                'url' => $data['url'] ?? null,
                'description' => $data['description'] ?? null,
                'is_featured' => $data['is_featured'] ?? false
            ]);

            // Get the created resource
            $stmt = $conn->prepare("
                SELECT r.*, c.label as category_name 
                FROM resources r 
                LEFT JOIN categories c ON r.category_id = c.id 
                WHERE r.id = ?
            ");
            $stmt->execute([$resourceId]);
            $resource = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'data' => $resource
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
                echo json_encode(['error' => 'Resource ID is required']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'];

            // Build update query dynamically based on provided fields
            $updateFields = [];
            $params = ['id' => $id];

            foreach ($data as $key => $value) {
                if (in_array($key, ['name', 'category_id', 'logo', 'url', 'description', 'is_featured'])) {
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
            $query = "UPDATE resources SET " . implode(', ', $updateFields) . " WHERE id = :id";

            $stmt = $conn->prepare($query);
            $stmt->execute($params);

            // Get the updated resource
            $stmt = $conn->prepare("
                SELECT r.*, c.label as category_name 
                FROM resources r 
                LEFT JOIN categories c ON r.category_id = c.id 
                WHERE r.id = ?
            ");
            $stmt->execute([$id]);
            $resource = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'data' => $resource
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
                echo json_encode(['error' => 'Resource ID is required']);
                exit;
            }

            $id = $_GET['id'];

            // Get resource info to delete logo file if exists
            $stmt = $conn->prepare("SELECT logo FROM resources WHERE id = ?");
            $stmt->execute([$id]);
            $resource = $stmt->fetch();

            // Delete logo file if it's a local file
            if ($resource && $resource['logo'] && strpos($resource['logo'], '/backend/uploads/logos/') === 0) {
                $logoPath = '../uploads/logos/' . basename($resource['logo']);
                if (file_exists($logoPath)) {
                    unlink($logoPath);
                }
            }

            // Delete resource
            $stmt = $conn->prepare("DELETE FROM resources WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Resource deleted successfully'
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

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
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $offset = ($page - 1) * $limit;
            
            // Get total count
            $stmt = $conn->query("SELECT COUNT(*) FROM categories");
            $total = $stmt->fetchColumn();
            
            // Get categories with resource count
            $query = "SELECT c.*, 
                            (SELECT COUNT(*) FROM resources r WHERE r.category_id = c.id) as resource_count
                     FROM categories c
                     ORDER BY c.label ASC
                     LIMIT :limit OFFSET :offset";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $categories = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $categories,
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
            if (!isset($data['label'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Category label is required']);
                exit;
            }

            // Check if category already exists
            $stmt = $conn->prepare("SELECT COUNT(*) FROM categories WHERE label = ?");
            $stmt->execute([$data['label']]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Category already exists']);
                exit;
            }

            // Create category ID from label
            $categoryId = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '_', $data['label']));

            // Insert category
            $stmt = $conn->prepare("
                INSERT INTO categories (
                    id, label, created_at, updated_at
                ) VALUES (
                    :id, :label, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            ");

            $stmt->execute([
                'id' => $categoryId,
                'label' => $data['label']
            ]);

            // Get the created category
            $stmt = $conn->prepare("
                SELECT c.*, 
                       (SELECT COUNT(*) FROM resources r WHERE r.category_id = c.id) as resource_count
                FROM categories c 
                WHERE c.id = ?
            ");
            $stmt->execute([$categoryId]);
            $category = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'data' => $category
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
                echo json_encode(['error' => 'Category ID is required']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'];

            // Validate required fields
            if (!isset($data['label'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Category label is required']);
                exit;
            }

            // Check if new label already exists for different category
            $stmt = $conn->prepare("SELECT COUNT(*) FROM categories WHERE label = ? AND id != ?");
            $stmt->execute([$data['label'], $id]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Category label already exists']);
                exit;
            }

            // Update category
            $stmt = $conn->prepare("
                UPDATE categories 
                SET label = :label, updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            ");

            $stmt->execute([
                'id' => $id,
                'label' => $data['label']
            ]);

            // Get the updated category
            $stmt = $conn->prepare("
                SELECT c.*, 
                       (SELECT COUNT(*) FROM resources r WHERE r.category_id = c.id) as resource_count
                FROM categories c 
                WHERE c.id = ?
            ");
            $stmt->execute([$id]);
            $category = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'data' => $category
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
                echo json_encode(['error' => 'Category ID is required']);
                exit;
            }

            $id = $_GET['id'];

            // Check if category has resources
            $stmt = $conn->prepare("SELECT COUNT(*) FROM resources WHERE category_id = ?");
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Cannot delete category with existing resources']);
                exit;
            }

            // Delete category
            $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Category deleted successfully'
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

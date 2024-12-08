<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/auth/auth_middleware.php';

header('Content-Type: application/json');

try {
    $conn = get_db_connection();
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get query parameters
            $page = max(1, intval($_GET['page'] ?? 1));
            $per_page = 50;
            $offset = ($page - 1) * $per_page;
            
            // Get total count
            $stmt = $conn->query("SELECT COUNT(*) FROM categories");
            $total = $stmt->fetchColumn();
            
            // Get categories with resource count
            $query = "SELECT c.*, 
                            (SELECT COUNT(*) FROM resources r WHERE r.category_id = c.id) as total_resources
                     FROM categories c
                     ORDER BY c.label ASC
                     LIMIT ? OFFSET ?";
            
            $stmt = $conn->prepare($query);
            $stmt->execute([$per_page, $offset]);
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $categories,
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
            if (!isset($data['label']) || !isset($data['slug'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Label and slug are required']);
                exit;
            }

            // Check if category already exists
            $stmt = $conn->prepare("SELECT COUNT(*) FROM categories WHERE label = ? OR slug = ?");
            $stmt->execute([$data['label'], $data['slug']]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Category with this label or slug already exists']);
                exit;
            }

            // Insert category
            $stmt = $conn->prepare("
                INSERT INTO categories (
                    id, label, slug, created_at, updated_at
                ) VALUES (
                    UUID(), ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            ");

            $success = $stmt->execute([
                $data['label'],
                $data['slug']
            ]);

            if (!$success) {
                throw new Exception('Failed to create category');
            }

            $id = $conn->lastInsertId();

            // Get the created category
            $stmt = $conn->prepare("
                SELECT c.*, 
                       (SELECT COUNT(*) FROM resources r WHERE r.category_id = c.id) as total_resources
                FROM categories c 
                WHERE c.id = ?
            ");
            $stmt->execute([$id]);
            $category = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $category
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
                echo json_encode(['success' => false, 'message' => 'Category ID is required']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);

            // Validate required fields
            if (!isset($data['label']) || !isset($data['slug'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Label and slug are required']);
                exit;
            }

            // Check if new label/slug already exists for different category
            $stmt = $conn->prepare("SELECT COUNT(*) FROM categories WHERE (label = ? OR slug = ?) AND id != ?");
            $stmt->execute([$data['label'], $data['slug'], $id]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Category with this label or slug already exists']);
                exit;
            }

            // Update category
            $stmt = $conn->prepare("
                UPDATE categories 
                SET label = ?, slug = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");

            $success = $stmt->execute([
                $data['label'],
                $data['slug'],
                $id
            ]);

            if (!$success) {
                throw new Exception('Failed to update category');
            }

            // Get the updated category
            $stmt = $conn->prepare("
                SELECT c.*, 
                       (SELECT COUNT(*) FROM resources r WHERE r.category_id = c.id) as total_resources
                FROM categories c 
                WHERE c.id = ?
            ");
            $stmt->execute([$id]);
            $category = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $category
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
                echo json_encode(['success' => false, 'message' => 'Category ID is required']);
                exit;
            }

            // Check if category has resources
            $stmt = $conn->prepare("SELECT COUNT(*) FROM resources WHERE category_id = ?");
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Cannot delete category with existing resources']);
                exit;
            }

            // Delete category
            $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
            $success = $stmt->execute([$id]);

            if (!$success) {
                throw new Exception('Failed to delete category');
            }

            echo json_encode([
                'success' => true,
                'message' => 'Category deleted successfully'
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

<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/auth_middleware.php';

header('Content-Type: application/json');

// Verify admin is logged in
$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Connect to database
$conn = get_db_connection();

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Fetch all users
            $stmt = $conn->prepare("
                SELECT id, name, email, role, last_login, created_at, updated_at 
                FROM admin_users 
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $users
            ]);
            break;

        case 'PUT':
            // Update user
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'User ID is required']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['name']) || !isset($data['email']) || !isset($data['role'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Name, email, and role are required']);
                exit;
            }

            // Validate role
            if (!in_array($data['role'], ['admin', 'super_admin'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid role']);
                exit;
            }

            // Check if email already exists for another user
            $stmt = $conn->prepare("
                SELECT id FROM admin_users 
                WHERE email = ? AND id != ?
            ");
            $stmt->execute([$data['email'], $id]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email already exists']);
                exit;
            }

            $stmt = $conn->prepare("
                UPDATE admin_users 
                SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            
            $success = $stmt->execute([
                $data['name'],
                $data['email'],
                $data['role'],
                $id
            ]);

            if ($success) {
                // Fetch updated user
                $stmt = $conn->prepare("
                    SELECT id, name, email, role, last_login, created_at, updated_at 
                    FROM admin_users 
                    WHERE id = ?
                ");
                $stmt->execute([$id]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'message' => 'User updated successfully',
                    'data' => $user
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update user']);
            }
            break;

        case 'DELETE':
            // Delete user
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'User ID is required']);
                exit;
            }

            // Don't allow deleting your own account
            if ($id === $user['id']) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Cannot delete your own account']);
                exit;
            }

            // Check if this is the last super_admin
            $stmt = $conn->prepare("
                SELECT COUNT(*) as count 
                FROM admin_users 
                WHERE role = 'super_admin' AND id != ?
            ");
            $stmt->execute([$id]);
            $superAdminCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // Get the role of the user being deleted
            $stmt = $conn->prepare("SELECT role FROM admin_users WHERE id = ?");
            $stmt->execute([$id]);
            $userRole = $stmt->fetch(PDO::FETCH_ASSOC)['role'];

            if ($userRole === 'super_admin' && $superAdminCount === 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Cannot delete the last super admin']);
                exit;
            }

            $stmt = $conn->prepare("DELETE FROM admin_users WHERE id = ?");
            $success = $stmt->execute([$id]);

            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete user']);
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

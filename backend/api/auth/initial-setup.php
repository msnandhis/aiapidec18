<?php
// Disable error display in output
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once '../../config.php';

header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON data from request body
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    $conn = getConnection();
    
    // Check if any admin users already exist
    $stmt = $conn->prepare("SELECT COUNT(*) FROM admin_users");
    $stmt->execute();
    $adminCount = $stmt->fetchColumn();

    if ($adminCount > 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Initial setup has already been completed']);
        exit;
    }

    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    // Validate password strength
    if (strlen($data['password']) < 8) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 8 characters long']);
        exit;
    }

    // Begin transaction
    $conn->beginTransaction();

    try {
        // Generate UUID for user ID
        $userId = uniqid('usr_', true);

        // Create admin user
        $stmt = $conn->prepare("
            INSERT INTO admin_users (
                id, 
                name, 
                email, 
                password_hash, 
                role, 
                created_at
            ) VALUES (
                ?, 
                ?, 
                ?, 
                ?, 
                'super_admin',
                CURRENT_TIMESTAMP
            )
        ");

        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt->execute([
            $userId,
            $data['name'],
            $data['email'],
            $password_hash
        ]);

        // Get the created user
        $stmt = $conn->prepare("
            SELECT id, name, email, role, created_at 
            FROM admin_users 
            WHERE id = ?
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Commit transaction
        $conn->commit();

        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];

        echo json_encode([
            'success' => true,
            'user' => $user
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollBack();
        throw $e;
    }

} catch (PDOException $e) {
    error_log("Initial setup error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error occurred'
    ]);
    exit;
} catch (Exception $e) {
    error_log("Initial setup error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred during setup'
    ]);
    exit;
}
?>

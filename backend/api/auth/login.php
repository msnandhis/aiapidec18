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

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    $conn = getConnection();
    
    // Get user by email
    $stmt = $conn->prepare("
        SELECT id, name, email, password_hash, role, last_login 
        FROM admin_users 
        WHERE email = ?
    ");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($data['password'], $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        exit;
    }

    // Begin transaction
    $conn->beginTransaction();

    try {
        // Update last login time
        $stmt = $conn->prepare("
            UPDATE admin_users 
            SET last_login = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        $stmt->execute([$user['id']]);

        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];

        // Remove sensitive information
        unset($user['password_hash']);

        // Commit transaction
        $conn->commit();

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
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error occurred'
    ]);
    exit;
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred during login'
    ]);
    exit;
}
?>

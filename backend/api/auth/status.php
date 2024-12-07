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

try {
    $conn = getConnection();
    
    // Check if any admin users exist
    $stmt = $conn->prepare("SELECT COUNT(*) FROM admin_users");
    $stmt->execute();
    $adminCount = $stmt->fetchColumn();

    // If no admin users exist, return needsInitialSetup
    if ($adminCount === 0) {
        echo json_encode([
            'needsInitialSetup' => true,
            'user' => null
        ]);
        exit;
    }

    // Check if user is logged in
    if (isset($_SESSION['user_id'])) {
        $stmt = $conn->prepare("
            SELECT id, name, email, role, last_login 
            FROM admin_users 
            WHERE id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Remove sensitive information if any
            unset($user['password_hash']);
            
            echo json_encode([
                'needsInitialSetup' => false,
                'user' => $user
            ]);
            exit;
        }
    }

    // No logged in user
    echo json_encode([
        'needsInitialSetup' => false,
        'user' => null
    ]);

} catch (PDOException $e) {
    error_log("Database error in status check: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error occurred'
    ]);
    exit;
} catch (Exception $e) {
    error_log("Error in status check: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred while checking status'
    ]);
    exit;
}
?>

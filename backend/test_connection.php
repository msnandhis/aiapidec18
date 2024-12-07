<?php
require_once 'config.php';

try {
    // Get database connection
    $conn = getConnection();
    
    // Test the connection
    $stmt = $conn->query("SELECT 1");
    
    // Send success response
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'database' => [
            'host' => DB_HOST,
            'name' => DB_NAME,
            'user' => DB_USER,
            'connected' => true
        ]
    ]);
} catch (Exception $e) {
    // Log the error
    error_log("Test connection error: " . $e->getMessage());
    
    // Send error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed',
        'database' => [
            'host' => DB_HOST,
            'name' => DB_NAME,
            'user' => DB_USER,
            'connected' => false
        ]
    ]);
}

<?php
// Load environment variables from .env file
function loadEnv($path) {
    if (file_exists($path)) {
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

// Load .env file
loadEnv(__DIR__ . '/.env');

// Database configuration
define('DB_HOST', getenv('DB_HOST'));
define('DB_USER', getenv('DB_USER'));
define('DB_PASS', getenv('DB_PASS'));
define('DB_NAME', getenv('DB_NAME'));

// Other configurations
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('API_URL', '/backend/api');  // Updated to reflect correct path in Bluehost

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Disable error display in output
ini_set('log_errors', 1); // Enable error logging
ini_set('error_log', __DIR__ . '/error.log'); // Set error log file

// Timezone
date_default_timezone_set('UTC');

// Database connection function
function getConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // Log the error
        error_log("Database connection failed: " . $e->getMessage());
        
        // Return JSON error response
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
}

// Headers for API
function setApiHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json');
}

// Set API headers by default
setApiHeaders();

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Error handler to ensure JSON response
function handleError($errno, $errstr, $errfile, $errline) {
    error_log("Error [$errno]: $errstr in $errfile on line $errline");
    
    if (!(error_reporting() & $errno)) {
        return false;
    }
    
    // Clear any output that might have been sent
    if (ob_get_length()) ob_clean();
    
    // Send JSON error response
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => 'An internal error occurred',
        'details' => DEBUG ? "$errstr in $errfile on line $errline" : null
    ]);
    exit(1);
}

// Set error handler
set_error_handler('handleError');

// Exception handler
function handleException($e) {
    error_log($e->getMessage());
    
    // Clear any output that might have been sent
    if (ob_get_length()) ob_clean();
    
    // Send JSON error response
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => 'An internal error occurred',
        'details' => DEBUG ? $e->getMessage() : null
    ]);
    exit(1);
}

// Set exception handler
set_exception_handler('handleException');

// Start output buffering
ob_start();

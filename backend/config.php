<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log errors to a file
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/error.log');

// Database configuration for Bluehost
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'rigazamy_AAKit_User');
define('DB_PASSWORD', 'gi&ij*UdnQ^h');
define('DB_NAME', 'rigazamy_AAKit');

// Create database connection
function getConnection() {
    try {
        // Log connection attempt
        error_log("Attempting database connection to " . DB_NAME . " as " . DB_USERNAME);
        
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        
        $conn = new PDO($dsn, DB_USERNAME, DB_PASSWORD, $options);
        
        // Log successful connection
        error_log("Database connection established successfully");
        
        return $conn;
    } catch(PDOException $e) {
        // Log connection error
        error_log("Database connection failed: " . $e->getMessage());
        error_log("Error code: " . $e->getCode());
        error_log("Error trace: " . $e->getTraceAsString());
        
        throw new PDOException("Connection failed: " . $e->getMessage(), (int)$e->getCode());
    }
}

// Enable CORS
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://rigazamy.com'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>

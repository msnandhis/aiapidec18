<?php
require_once '../config.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

function getResources($category = null) {
    try {
        $conn = getConnection();
        
        $sql = "SELECT r.*, c.label as category_label 
                FROM resources r 
                JOIN categories c ON r.category_id = c.id";
        
        if ($category && $category !== 'all') {
            $sql .= " WHERE r.category_id = :category";
        }
        
        $stmt = $conn->prepare($sql);
        if ($category && $category !== 'all') {
            $stmt->bindParam(':category', $category);
        }
        $stmt->execute();
        
        // Fetch all results
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Transform the data to match the frontend Resource type exactly
        $resources = array_map(function($row) {
            return array(
                'id' => $row['id'],
                'name' => $row['name'],
                'category' => $row['category_id'], // Changed from category_id to category
                'logo' => $row['logo'],
                'url' => $row['url'],
                'description' => $row['description'],
                'totalPages' => is_null($row['total_pages']) ? null : (int)$row['total_pages'],
                'currentPage' => is_null($row['current_page']) ? null : (int)$row['current_page']
            );
        }, $results);
        
        return array(
            'success' => true,
            'data' => $resources
        );
    } catch(PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return array(
            'success' => false,
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        );
    }
}

// Get JSON data from request body
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Log request details
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);
if ($data) {
    error_log("Request Data: " . json_encode($data));
}

// Handle different HTTP methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            $category = isset($_GET['category']) ? $_GET['category'] : null;
            $result = getResources($category);
            
            // Ensure proper JSON headers
            header('Content-Type: application/json; charset=utf-8');
            
            if ($result['success']) {
                // Use JSON_FORCE_OBJECT for empty arrays and JSON_UNESCAPED_SLASHES for cleaner URLs
                echo json_encode(
                    $result['data'],
                    JSON_PRETTY_PRINT | 
                    JSON_UNESCAPED_SLASHES | 
                    JSON_UNESCAPED_UNICODE
                );
            } else {
                http_response_code(500);
                echo json_encode(
                    array(
                        'error' => 'Database error: ' . $result['error'],
                        'code' => $result['error_code']
                    ),
                    JSON_PRETTY_PRINT
                );
            }
        } catch (Exception $e) {
            error_log("Server error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(
                array(
                    'error' => 'Server error: ' . $e->getMessage(),
                    'code' => $e->getCode()
                ),
                JSON_PRETTY_PRINT
            );
        }
        break;
        
    case 'OPTIONS':
        // Handle preflight requests
        http_response_code(200);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(
            array('error' => 'Method not allowed'),
            JSON_PRETTY_PRINT
        );
        break;
}
?>

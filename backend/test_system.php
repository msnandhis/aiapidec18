<?php
require_once 'config.php';

function runTests() {
    echo "Starting system tests...\n\n";
    
    try {
        // Test 1: Database Connection
        echo "Test 1: Testing Database Connection\n";
        $conn = getConnection();
        echo "✓ Database connection successful\n\n";
        
        // Test 2: Check Tables
        echo "Test 2: Checking Required Tables\n";
        $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        
        $requiredTables = ['categories', 'resources'];
        foreach ($requiredTables as $table) {
            if (in_array($table, $tables)) {
                echo "✓ Table '$table' exists\n";
            } else {
                echo "✗ Table '$table' is missing\n";
            }
        }
        echo "\n";
        
        // Test 3: Check Categories
        echo "Test 3: Checking Categories\n";
        $stmt = $conn->query("SELECT * FROM categories");
        $categories = $stmt->fetchAll();
        
        if (count($categories) > 0) {
            echo "✓ Found " . count($categories) . " categories:\n";
            foreach ($categories as $category) {
                echo "  - {$category['id']}: {$category['label']}\n";
            }
        } else {
            echo "✗ No categories found in the database\n";
        }
        echo "\n";
        
        // Test 4: Check Resources
        echo "Test 4: Checking Resources\n";
        $stmt = $conn->query("SELECT * FROM resources");
        $resources = $stmt->fetchAll();
        
        if (count($resources) > 0) {
            echo "✓ Found " . count($resources) . " resources\n";
            echo "Sample resources:\n";
            for ($i = 0; $i < min(3, count($resources)); $i++) {
                echo "  - {$resources[$i]['name']} ({$resources[$i]['category_id']})\n";
            }
        } else {
            echo "✗ No resources found in the database\n";
        }
        echo "\n";
        
        // Test 5: Test API Endpoint
        echo "Test 5: Testing API Endpoint\n";
        $ch = curl_init('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/api/resources.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            echo "✓ API endpoint is responding\n";
            $data = json_decode($response, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                echo "✓ API returns valid JSON\n";
            } else {
                echo "✗ API response is not valid JSON\n";
            }
        } else {
            echo "✗ API endpoint returned status code: $httpCode\n";
        }
        
    } catch (Exception $e) {
        echo "Error during tests: " . $e->getMessage() . "\n";
        echo "Error code: " . $e->getCode() . "\n";
        if (method_exists($e, 'getTraceAsString')) {
            echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
        }
    }
}

// Run the tests
runTests();
?>

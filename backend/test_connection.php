<?php
// Database configuration for Bluehost
$host = 'localhost';
$dbname = 'rigazamy_AAKit';
$username = 'rigazamy_AAKit_User';
$password = 'gi&ij*UdnQ^h';

try {
    // Attempt MySQL connection
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    // Set PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected successfully to MySQL database!<br>";
    
    // Test query to check if we can read data
    $stmt = $conn->query("SHOW TABLES");
    echo "<br>Available tables:<br>";
    while ($row = $stmt->fetch()) {
        echo $row[0] . "<br>";
    }
    
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>

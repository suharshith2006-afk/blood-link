<?php
// db.php — Production Safe PDO Configuration
header('Content-Type: application/json');

define('DB_HOST', 'sql108.infinityfree.com'); 
define('DB_NAME', 'if0_42305032_blood_link'); 
define('DB_USER', 'if0_42305032');          
define('DB_PASS', 'Kamma2006'); // Replace with your Hosting Account Password

try {
    // Explicitly stitch variables outside of the string quotes to avoid driver mapping errors
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4;port=3306";
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    
} catch (PDOException $e) {
    // Structural JSON fallback error handling
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failure.",
        "debug_info" => $e->getMessage() // This lets us inspect the real raw rejection code!
    ]);
    exit;
}
?>
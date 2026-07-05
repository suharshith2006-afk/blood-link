<?php
// db.php — Centralized PDO Database Connection Bridge
define('DB_HOST', 'localhost');
define('DB_NAME', 'kakinada_blood_link');
define('DB_USER', 'root'); 
define('DB_PASS', '');     

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Graceful error termination during configuration failure
    header('Content-Type: application/json', true, 500);
    echo json_encode(["success" => false, "message" => "Database connection failure."]);
    exit;
}
?>
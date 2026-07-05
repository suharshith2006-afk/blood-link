<?php
// login.php — Process multi-role secure login sessions
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid protocol method."]);
    exit;
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please fill in all credentials fields."]);
    exit;
}

try {
    // Look up user credentials in the master table
    $stmt = $pdo->prepare("SELECT id, password_hash, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Create clean user tracking session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_email'] = $email;

        echo json_encode([
            "success" => true,
            "message" => "Authentication successful! Welcome back.",
            "role" => $user['role']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid email address or account password."]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database authentication failure."]);
}
?>
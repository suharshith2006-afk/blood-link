<?php
// contact.php — Securely process and store user contact messages
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid protocol request method."]);
    exit;
}

// Extract and sanitize form values
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

// Simple server-side validation check
if (empty($name) || empty($email) || empty($phone) || empty($subject) || empty($message)) {
    echo json_encode(["success" => false, "message" => "Please fill out all available fields before sending."]);
    exit;
}

try {
    // Insert safely into our database using PDO prepared parameters
    $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $phone, $subject, $message]);

    echo json_encode(["success" => true, "message" => "✉️ Thank you, your message has been saved we will get back to you soon!"]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database insertion error: " . $e->getMessage()]);
}
?>
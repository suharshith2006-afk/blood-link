<?php
// check_session.php — Verify background active session tokens on load
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "logged_in" => true,
        "role" => $_SESSION['user_role'],
        "email" => $_SESSION['user_email']
    ]);
} else {
    echo json_encode(["logged_in" => false]);
}
exit;
?>
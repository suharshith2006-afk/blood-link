<?php
// logout.php — Instantly invalidate user session states
session_start();
$_SESSION = array(); // Clear all session variables

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy(); // Burn the session entirely
header('Content-Type: application/json');
echo json_encode(["success" => true, "message" => "Logged out successfully!"]);
exit;
?>
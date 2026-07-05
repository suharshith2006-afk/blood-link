<?php
// register.php — Process multi-role registration inputs
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid protocol method."]);
    exit;
}

// Read payload inputs cleanly
$role = $_POST['role'] ?? ''; // Expects 'donor' or 'recipient' strings
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($email) || strlen($password) < 6 || !in_array($role, ['donor', 'recipient'])) {
    echo json_encode(["success" => false, "message" => "Validation constraints mismatch error."]);
    exit;
}

try {
    $pdo->beginTransaction();

    // Check email uniqueness limits first
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "This email address is already registered."]);
        exit;
    }

    // Hash account password securely
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Insert user credential core record
    $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)");
    $stmt->execute([$email, $passwordHash, $role]);
    $userId = $pdo->lastInsertId();

    if ($role === 'donor') {
        // Capture corresponding donor data parameters
        $fullName = trim($_POST['name'] ?? '');
        $bloodGroup = $_POST['bloodGroup'] ?? '';
        $age = intval($_POST['age'] ?? 0);
        $gender = $_POST['gender'] ?? '';
        $phone = trim($_POST['phone'] ?? '');
        $locality = $_POST['locality'] ?? '';
        $address = trim($_POST['address'] ?? '');

        $stmt = $pdo->prepare("INSERT INTO donors (user_id, full_name, blood_group, age, gender, phone_number, locality_name, residential_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $fullName, $bloodGroup, $age, $gender, $phone, $locality, $address]);

    } else {
        // Capture corresponding recipient data parameters
        $fullName = trim($_POST['recipientName'] ?? '');
        $bloodGroup = $_POST['requiredBloodGroup'] ?? '';
        $phone = trim($_POST['recipientPhone'] ?? '');
        $locality = $_POST['recipientArea'] ?? '';
        $hospital = trim($_POST['preferredHospital'] ?? '');

        $stmt = $pdo->prepare("INSERT INTO recipients (user_id, full_name, phone_number, required_blood_group, locality_name, preferred_hospital) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $fullName, $phone, $bloodGroup, $locality, $hospital]);
    }

    $pdo->commit();
    echo json_encode(["success" => true, "message" => "Account registration executed flawlessly!"]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Transaction error anomaly: " . $e->getMessage()]);
}
?>
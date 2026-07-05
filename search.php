<?php
// search.php — Localized Directory Search Engine Module
session_start();
header('Content-Type: application/json');
require_once 'db.php';

// GATEKEEPER CHECK: User must be signed in to query the database
if (!isset($_SESSION['user_id'])) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(["success" => false, "message" => "Access denied. Please login to query our donor network database."]);
    exit;
}

$bloodGroup = $_GET['blood_group'] ?? 'All';
$area = $_GET['area'] ?? 'All areas';
$availableOnly = isset($_GET['available_only']) && $_GET['available_only'] === 'true';

try {
    $query = "SELECT full_name, blood_group, age, gender, phone_number, locality_name, donation_count, is_available FROM donors WHERE 1=1";
    $params = [];

    if ($bloodGroup !== 'All') {
        $query .= " AND blood_group = ?";
        $params[] = $bloodGroup;
    }

    if ($area !== 'All areas') {
        $query .= " AND locality_name = ?";
        $params[] = $area;
    }

    if ($availableOnly) {
        $query .= " AND is_available = 1";
    }

    $query .= " ORDER BY full_name ASC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $results = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($results),
        "donors" => $results
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database fetch query error: " . $e->getMessage()]);
}
?>
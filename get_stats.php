<?php
// get_stats.php — Real-time dynamic network telemetry values
header('Content-Type: application/json');
require_once 'db.php';

try {
    // 1. Core metric counts
    $totalDonors = (int)$pdo->query("SELECT COUNT(*) FROM donors")->fetchColumn();
    $availableDonors = (int)$pdo->query("SELECT COUNT(*) FROM donors WHERE is_available = 1")->fetchColumn();
    $uniqueGroupsCount = (int)$pdo->query("SELECT COUNT(DISTINCT blood_group) FROM donors")->fetchColumn();
    $hospitalCount = 0; 

    // 2. Compute 12-Month Registration Trends for the Current Year
    $monthlyBuckets = array_fill(1, 12, 0); // Pre-fill months 1 to 12 with 0
    $trendQuery = $pdo->query("
        SELECT MONTH(created_at) as msg_month, COUNT(*) as total 
        FROM users 
        WHERE role = 'donor' AND YEAR(created_at) = YEAR(CURRENT_DATE()) 
        GROUP BY MONTH(created_at)
    ");
    foreach ($trendQuery->fetchAll() as $row) {
        $monthlyBuckets[(int)$row['msg_month']] = (int)$row['total'];
    }
    $monthlyTrends = array_values($monthlyBuckets); // Convert to clean 0-indexed array [Jan...Dec]

    // 3. Fetch specific quantities available per blood group drop indicator
    $groupCountsQuery = $pdo->query("SELECT blood_group, COUNT(*) as amount FROM donors GROUP BY blood_group");
    $rawGroupData = $groupCountsQuery->fetchAll();

    $groupsMap = ['A+'=>0, 'A-'=>0, 'B+'=>0, 'B-'=>0, 'O+'=>0, 'O-'=>0, 'AB+'=>0, 'AB-'=>0];
    foreach ($rawGroupData as $row) {
        if (array_key_exists($row['blood_group'], $groupsMap)) {
            $groupsMap[$row['blood_group']] = (int)$row['amount'];
        }
    }

    $formattedAvailability = [];
    foreach ($groupsMap as $grp => $cnt) {
        $formattedAvailability[] = ["group" => $grp, "count" => $cnt];
    }

    // 4. Output complete payload response
    echo json_encode([
        "success" => true,
        "stats" => [
            "donors" => $totalDonors,
            "available" => $availableDonors,
            "hospitals" => $hospitalCount,
            "groups_count" => $uniqueGroupsCount
        ],
        "monthly_trends" => $monthlyTrends,
        "availability" => $formattedAvailability
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Telemetry compilation tracking error."]);
}
?>
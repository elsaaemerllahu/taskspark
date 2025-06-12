<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require 'db.php';

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

$userId = $_SESSION['user']['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT action, details, timestamp FROM user_activity WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10");
        $stmt->execute([$userId]);
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($activities);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    $details = $data['details'] ?? '';

    if (!$action) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing action']);
        exit;
    }

    try {
        // Insert new activity
$stmt = $pdo->prepare("INSERT INTO activities (user_id, action, details, timestamp) VALUES (?, ?, ?, NOW())");
$stmt->execute([$userId, $action, $details]);

// Keep only the latest 5, delete the rest
$cleanupStmt = $pdo->prepare("
  DELETE FROM user_activity 
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id FROM user_activity  
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 5
    ) as latest
  ) AND user_id = ?
");
$cleanupStmt->execute([$userId, $userId]);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to log activity']);
    }
    exit;
}

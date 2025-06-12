<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require 'db.php';

// Check if user is authenticated
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

$userId = $_SESSION['user']['id'];

// GET reminders for specific user
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM reminders WHERE user_id = ? ORDER BY id DESC");
    $stmt->execute([$userId]);
    $reminders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($reminders);
    exit;
}

// POST a new reminder
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['text'])) {
        echo json_encode(['error' => 'Reminder text required']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO reminders (user_id, text, done) VALUES (?, ?, 0)");
    $stmt->execute([$userId, $data['text']]);

    $id = $pdo->lastInsertId();
    echo json_encode([
        'id' => $id,
        'user_id' => $userId,
        'text' => $data['text'],
        'done' => false
    ]);
    exit;
}

// PUT to update reminder
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        echo json_encode(['error' => 'Reminder ID required']);
        exit;
    }

    // Handle different types of updates
    if ($data['type'] === 'toggle' && isset($data['done'])) {
        // Update done status
        $stmt = $pdo->prepare("UPDATE reminders SET done = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$data['done'] ? 1 : 0, $data['id'], $userId]);
    } elseif ($data['type'] === 'edit' && isset($data['text'])) {
        // Update reminder text
        $stmt = $pdo->prepare("UPDATE reminders SET text = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$data['text'], $data['id'], $userId]);
    } else {
        echo json_encode(['error' => 'Invalid update type']);
        exit;
    }

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Reminder not found or unauthorized']);
    }
    exit;
}

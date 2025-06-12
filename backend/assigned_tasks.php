<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php'; // Uses your $pdo connection
session_start();
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

$userId = $_SESSION['user']['id'];

function logActivity($pdo, $userId, $action, $details = '') {
    try {
        $stmt = $pdo->prepare("INSERT INTO user_activity (user_id, action, details) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $action, $details]);
    } catch (PDOException $e) {
        error_log("Activity log error: " . $e->getMessage());
    }
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch all tasks, with optional ?assigned_to=John
if ($method === 'GET') {
    $filter = isset($_GET['assigned_to']) ? $_GET['assigned_to'] : null;

    if ($filter) {
        $stmt = $pdo->prepare("SELECT * FROM assigned_tasks WHERE assigned_to LIKE ? ORDER BY due_date ASC");
        $stmt->execute(['%' . $filter . '%']);
    } else {
        $stmt = $pdo->query("SELECT * FROM assigned_tasks ORDER BY due_date ASC");
    }

    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($tasks);
}

// POST: Insert a new task
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['title'], $data['assigned_to'], $data['due_date'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing fields"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO assigned_tasks (title, assigned_to, due_date, status) VALUES (?, ?, ?, 'Pending')");
    $stmt->execute([
        $data['title'],
        $data['assigned_to'],
        $data['due_date']
    ]);
    logActivity($pdo, $userId, 'Assigned Task Created', "Title: {$data['title']}, Assigned to: {$data['assigned_to']}");


    echo json_encode(["success" => true]);
}

// PUT: Edit task
elseif ($method === 'PUT') {
    parse_str($_SERVER['QUERY_STRING'], $query);
    $id = isset($query['id']) ? intval($query['id']) : null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing task ID"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("UPDATE assigned_tasks SET title = ?, assigned_to = ?, due_date = ?, status = ? WHERE id = ?");
    $stmt->execute([
        $data['title'],
        $data['assigned_to'],
        $data['due_date'],
        $data['status'],
        $id
    ]);
logActivity($pdo, $userId, 'Assigned Task Updated', "Task ID: $id, Title: {$data['title']}");

    echo json_encode(["success" => true]);
}

// DELETE: Remove a task
elseif ($method === 'DELETE') {
    parse_str($_SERVER['QUERY_STRING'], $query);
    $id = isset($query['id']) ? intval($query['id']) : null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing task ID"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM assigned_tasks WHERE id = ?");
    $stmt->execute([$id]);
logActivity($pdo, $userId, 'Assigned Task Deleted', "Task ID: $id");

    echo json_encode(["success" => true]);
}

else {
    http_response_code(405);
    echo json_encode(["error" => "Method Not Allowed"]);
}

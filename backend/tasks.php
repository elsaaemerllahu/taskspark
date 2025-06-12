<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check authentication
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

require 'db.php';

function logActivity($pdo, $userId, $action, $details = '') {
    try {
        $stmt = $pdo->prepare("INSERT INTO user_activity (user_id, action, details) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $action, $details]);
    } catch (PDOException $e) {
        error_log("Activity log error: " . $e->getMessage());
    }
}

// GET tasks
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $userId = $_GET['userId'] ?? $_SESSION['user']['id'];
        
        // Verify user is requesting their own tasks
        if ($userId != $_SESSION['user']['id']) {
            throw new Exception('Unauthorized access');
        }

        $stmt = $pdo->prepare("
            SELECT id, text, done, created_at, updated_at 
            FROM tasks 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($tasks);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// POST new task
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['text']) || trim($data['text']) === '') {
            throw new Exception('Task text is required');
        }

        $userId = $_SESSION['user']['id'];
        $text = trim($data['text']);
        
        $stmt = $pdo->prepare("
            INSERT INTO tasks (user_id, text, done, created_at, updated_at) 
            VALUES (?, ?, false, NOW(), NOW())
        ");
        $stmt->execute([$userId, $text]);
        logActivity($pdo, $userId, 'Task Created', "Task: \"$text\"");

        
        // Return the created task
        $taskId = $pdo->lastInsertId();
        $stmt = $pdo->prepare("
            SELECT id, text, done, created_at, updated_at 
            FROM tasks 
            WHERE id = ?
        ");
        $stmt->execute([$taskId]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode($task);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// PUT to update task
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['id'])) {
            throw new Exception('Task ID is required');
        }

        // Verify task belongs to user
        $stmt = $pdo->prepare("SELECT user_id FROM tasks WHERE id = ?");
        $stmt->execute([$data['id']]);
        $task = $stmt->fetch();

        if (!$task || $task['user_id'] != $_SESSION['user']['id']) {
            throw new Exception('Unauthorized access');
        }

        $userId = $_SESSION['user']['id'];

        // Handle different types of updates
        if ($data['type'] === 'toggle') {
            $stmt = $pdo->prepare("
                UPDATE tasks 
                SET done = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$data['done'], $data['id']]);

            logActivity($pdo, $userId, 'Task Status Toggled', "Task ID: {$data['id']}, Done: " . ($data['done'] ? 'true' : 'false'));

        } elseif ($data['type'] === 'edit') {
            if (!isset($data['text']) || trim($data['text']) === '') {
                throw new Exception('Task text cannot be empty');
            }

            $text = trim($data['text']);
            $stmt = $pdo->prepare("
                UPDATE tasks 
                SET text = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$text, $data['id']]);
error_log("LogActivity fired for task edit: {$data['id']}, text: {$data['text']}");

            logActivity($pdo, $userId, 'Task Edited', "New Text: \"$text\"");

            $stmt = $pdo->prepare("INSERT INTO user_activity (user_id, action, details) VALUES (?, ?, ?)");
$stmt->execute([$userId, 'Task Edited (Manual Fallback)', 'Testing fallback logging']);

        }

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}


// DELETE task
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            throw new Exception('Task ID is required');
        }

        // Verify task belongs to user
        $stmt = $pdo->prepare("SELECT user_id FROM tasks WHERE id = ?");
        $stmt->execute([$data['id']]);
        $task = $stmt->fetch();
        
        if (!$task || $task['user_id'] != $_SESSION['user']['id']) {
            throw new Exception('Unauthorized access');
        }

        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->execute([$data['id']]);
        logActivity($pdo, $_SESSION['user']['id'], 'Task Deleted', "Task ID: {$data['id']}");

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

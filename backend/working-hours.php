<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight requests
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check authentication
session_start();
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

$user_id = $_SESSION['user']['id'];

// GET: Fetch working hours
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT wh.*, 
                   t.title as task_title,
                   g.title as goal_title
            FROM working_hours wh
            LEFT JOIN assigned_tasks t ON wh.task_id = t.id
            LEFT JOIN goals g ON wh.goal_id = g.id
            WHERE wh.user_id = ?
            ORDER BY wh.date DESC
        ");
        $stmt->execute([$user_id]);
        $hours = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($hours);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch working hours: ' . $e->getMessage()]);
    }
}

// POST: Log new working hours
elseif ($method === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['date']) || !isset($data['hours'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Date and hours are required']);
            exit();
        }

        $stmt = $pdo->prepare("
            INSERT INTO working_hours (
                user_id,
                date,
                hours,
                task_id,
                goal_id,
                created_at,
                bonus
            ) VALUES (?, ?, ?, ?, ?, NOW(), ?)
        ");

        $stmt->execute([
            $user_id,
            $data['date'],
            $data['hours'],
            !empty($data['task_id']) ? (int)$data['task_id'] : null,
            !empty($data['goal_id']) ? (int)$data['goal_id'] : null,
        isset($data['bonus']) && $data['bonus'] ? 1 : 0

        ]);

        // Return the newly created record
        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare("
            SELECT wh.*, 
                   t.title as task_title,
                   g.title as goal_title
            FROM working_hours wh
            LEFT JOIN assigned_tasks t ON wh.task_id = t.id
            LEFT JOIN goals g ON wh.goal_id = g.id
            WHERE wh.id = ?
        ");
        $stmt->execute([$id]);
        $entry = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode($entry);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to log working hours: ' . $e->getMessage()]);
    }
}

// DELETE: Remove working hours entry
elseif ($method === 'DELETE') {
    try {
        parse_str($_SERVER['QUERY_STRING'], $query);
        $id = isset($query['id']) ? intval($query['id']) : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Entry ID is required']);
            exit();
        }

        // Verify the entry belongs to the user
        $stmt = $pdo->prepare("SELECT user_id FROM working_hours WHERE id = ?");
        $stmt->execute([$id]);
        $entry = $stmt->fetch();

        if (!$entry || $entry['user_id'] !== $user_id) {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized access to this entry']);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM working_hours WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete entry: ' . $e->getMessage()]);
    }
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} 
<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';
function logActivity($pdo, $userId, $action, $details = '') {
    $stmt = $pdo->prepare("INSERT INTO user_activity (user_id, action, details) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $action, $details]);
}


$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight OPTIONS request
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if user is authenticated
session_start();
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(["error" => "User not authenticated"]);
    exit();
}

$user_id = $_SESSION['user']['id'];

// GET: Fetch all goals for the user
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM goals 
            WHERE user_id = ? 
            ORDER BY 
                CASE 
                    WHEN priority = 'high' THEN 1
                    WHEN priority = 'medium' THEN 2
                    WHEN priority = 'low' THEN 3
                END,
                target_date ASC
        ");
        $stmt->execute([$user_id]);
        $goals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($goals);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch goals"]);
    }
}

// POST: Create a new goal
elseif ($method === 'POST') {
    try {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['title']) || !isset($data['target_date']) || !isset($data['priority'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            exit();
        }

        $stmt = $pdo->prepare("
            INSERT INTO goals (
                user_id, 
                title, 
                description, 
                target_date, 
                priority, 
                status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $user_id,
            $data['title'],
            $data['description'] ?? '',
            $data['target_date'],
            $data['priority'],
            $data['status'] ?? 'In Progress'
        ]);

        // Fetch the newly created goal
        $goalId = $pdo->lastInsertId();
        logActivity($pdo, $user_id, 'Goal Created', "Goal: \"{$data['title']}\"");

        $stmt = $pdo->prepare("SELECT * FROM goals WHERE id = ?");
        $stmt->execute([$goalId]);
        $newGoal = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode($newGoal);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create goal"]);
    }
}

// PUT: Update a goal
elseif ($method === 'PUT') {
    try {
        parse_str($_SERVER['QUERY_STRING'], $query);
        $goalId = isset($query['id']) ? intval($query['id']) : null;

        if (!$goalId) {
            http_response_code(400);
            echo json_encode(["error" => "Missing goal ID"]);
            exit();
        }

        // Verify the goal belongs to the user
        $stmt = $pdo->prepare("SELECT user_id FROM goals WHERE id = ?");
        $stmt->execute([$goalId]);
        $goal = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$goal || $goal['user_id'] !== $user_id) {
            http_response_code(403);
            echo json_encode(["error" => "Unauthorized access to this goal"]);
            exit();
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $updates = [];
        $params = [];

        // Only update provided fields
        if (isset($data['title'])) {
            $updates[] = "title = ?";
            $params[] = $data['title'];
        }
        if (isset($data['description'])) {
            $updates[] = "description = ?";
            $params[] = $data['description'];
        }
        if (isset($data['target_date'])) {
            $updates[] = "target_date = ?";
            $params[] = $data['target_date'];
        }
        if (isset($data['priority'])) {
            $updates[] = "priority = ?";
            $params[] = $data['priority'];
        }
        if (isset($data['status'])) {
            $updates[] = "status = ?";
            $params[] = $data['status'];

                $updates[] = "updated_at = NOW()";

        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(["error" => "No fields to update"]);
            exit();
        }

        $params[] = $goalId;
        $sql = "UPDATE goals SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        logActivity($pdo, $user_id, 'Goal Updated', "Goal ID: $goalId");

        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update goal"]);
    }
}

// DELETE: Remove a goal
elseif ($method === 'DELETE') {
    try {
        parse_str($_SERVER['QUERY_STRING'], $query);
        $goalId = isset($query['id']) ? intval($query['id']) : null;

        if (!$goalId) {
            http_response_code(400);
            echo json_encode(["error" => "Missing goal ID"]);
            exit();
        }

        // Verify the goal belongs to the user
        $stmt = $pdo->prepare("SELECT user_id FROM goals WHERE id = ?");
        $stmt->execute([$goalId]);
        $goal = $stmt->fetch(PDO::FETCH_ASSOC);
logActivity($pdo, $user_id, 'Goal Deleted', "Goal ID: $goalId");

        if (!$goal || $goal['user_id'] !== $user_id) {
            http_response_code(403);
            echo json_encode(["error" => "Unauthorized access to this goal"]);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM goals WHERE id = ? AND user_id = ?");
        $stmt->execute([$goalId, $user_id]);

        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete goal"]);
    }
}

else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
} 
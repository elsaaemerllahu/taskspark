<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

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

// GET: Fetch notifications
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        ");
        $stmt->execute([$user_id]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get unread count
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as unread 
            FROM notifications 
            WHERE user_id = ? AND is_read = false
        ");
        $stmt->execute([$user_id]);
        $unreadCount = $stmt->fetch(PDO::FETCH_ASSOC)['unread'];
        
        echo json_encode([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch notifications"]);
    }
}

// PUT: Mark notifications as read
elseif ($method === 'PUT') {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['notificationId'])) {
            // Mark single notification as read
            $stmt = $pdo->prepare("
                UPDATE notifications 
                SET is_read = true 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$data['notificationId'], $user_id]);
        } else {
            // Mark all notifications as read
            $stmt = $pdo->prepare("
                UPDATE notifications 
                SET is_read = true 
                WHERE user_id = ?
            ");
            $stmt->execute([$user_id]);
        }
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update notifications"]);
    }
}

// DELETE: Delete notifications
elseif ($method === 'DELETE') {
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['notificationIds']) && is_array($data['notificationIds'])) {
            // Delete multiple selected notifications
            $placeholders = str_repeat('?,', count($data['notificationIds']) - 1) . '?';
            $params = array_merge($data['notificationIds'], [$user_id]);
            
            $stmt = $pdo->prepare("
                DELETE FROM notifications 
                WHERE id IN ($placeholders) AND user_id = ?
            ");
            $stmt->execute($params);
        }
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete notifications"]);
    }
}

else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
} 
<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require 'db.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if user is authenticated
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

$userId = $_SESSION['user']['id'];

// GET user profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // First, get basic user data including avatar
        $stmt = $pdo->prepare("SELECT id, username, email, avatar FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($profile) {
            // Get task counts
            $taskStmt = $pdo->prepare("
                SELECT 
                    COUNT(*) as taskCount,
                    SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) as completedTasks
                FROM tasks 
                WHERE user_id = ?
            ");
            $taskStmt->execute([$userId]);
            $taskStats = $taskStmt->fetch(PDO::FETCH_ASSOC);

            // Get reminder count
            $reminderStmt = $pdo->prepare("
                SELECT COUNT(*) as reminderCount
                FROM reminders 
                WHERE user_id = ?
            ");
            $reminderStmt->execute([$userId]);
            $reminderStats = $reminderStmt->fetch(PDO::FETCH_ASSOC);

            // Combine all data
            $profile['taskCount'] = (int)$taskStats['taskCount'];
            $profile['completedTasks'] = (int)$taskStats['completedTasks'];
            $profile['reminderCount'] = (int)$reminderStats['reminderCount'];
            $profile['bio'] = null; // Default value for now

            echo json_encode($profile);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Profile not found']);
        }
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}

// PUT to update profile
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    try {
        // Update only basic user data for now
        $stmt = $pdo->prepare("
            UPDATE users 
            SET 
                username = ?,
                email = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['username'],
            $data['email'],
            $userId
        ]);

        // After successful update, update the session data
        $_SESSION['user']['username'] = $data['username'];
        $_SESSION['user']['email'] = $data['email'];

        $stmt = $pdo->prepare("INSERT INTO user_activity (user_id, action, details) VALUES (?, ?, ?)");
$stmt->execute([$userId, 'Profile Updated', 'User updated their profile.']);


        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        error_log("Update error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update profile: ' . $e->getMessage()]);
    }
    exit;
}
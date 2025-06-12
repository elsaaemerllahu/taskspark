<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if user is authenticated
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

$userId = $_SESSION['user']['id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data: ' . json_last_error_msg());
        }
        
        $query = isset($data['query']) ? '%' . $data['query'] . '%' : '';
        
        // Log the query and user ID for debugging
        error_log("Search query: " . $query);
        error_log("User ID: " . $userId);

        $results = [
            'Tasks' => [],
            'Reminders' => [],
            'Assigned Tasks' => []
        ];

        // Search tasks
        $stmt = $pdo->prepare("
            SELECT id, text as title, 
                   CASE 
                     WHEN done = 1 THEN 'Completed'
                     ELSE 'Pending'
                   END as status
            FROM tasks 
            WHERE user_id = ? AND text LIKE ?
            LIMIT 5
        ");
        $stmt->execute([$userId, $query]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results['Tasks'][] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'preview' => "Status: {$row['status']}"
            ];
        }

        // Search reminders
        $stmt = $pdo->prepare("
            SELECT id, text as title, 
                   CASE 
                     WHEN done = 1 THEN 'Completed'
                     ELSE 'Pending'
                   END as status
            FROM reminders 
            WHERE user_id = ? AND text LIKE ?
            LIMIT 5
        ");
        $stmt->execute([$userId, $query]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results['Reminders'][] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'preview' => "Status: {$row['status']}"
            ];
        }

        // Search assigned tasks
        $stmt = $pdo->prepare("
            SELECT id, title, status
            FROM assigned_tasks 
            WHERE assigned_to = ? AND title LIKE ?
            LIMIT 5
        ");
        $stmt->execute([$userId, $query]);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results['Assigned Tasks'][] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'preview' => "Status: {$row['status']}"
            ];
        }

        // Remove empty categories
        $results = array_filter($results, function($category) {
            return !empty($category);
        });

        echo json_encode($results);
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'error' => 'Database error occurred',
            'details' => $e->getMessage(),
            'code' => $e->getCode()
        ]);
        exit;
    } catch (Exception $e) {
        error_log("General error: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'error' => 'Server error occurred',
            'details' => $e->getMessage()
        ]);
        exit;
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']); 
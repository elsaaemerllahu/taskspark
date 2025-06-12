<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

$userId = $_SESSION['user']['id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['avatar'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['avatar'];
    $fileName = $file['name'];
    $fileTmpName = $file['tmp_name'];
    $fileError = $file['error'];
    $fileSize = $file['size'];
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // Allowed file types
    $allowed = ['jpg', 'jpeg', 'png', 'gif'];

    // Validation
    if ($fileError !== 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Error uploading file']);
        exit;
    }

    if (!in_array($fileExt, $allowed)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Allowed types: ' . implode(', ', $allowed)]);
        exit;
    }

    if ($fileSize > 5000000) { // 5MB max
        http_response_code(400);
        echo json_encode(['error' => 'File too large. Maximum size: 5MB']);
        exit;
    }

    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/uploads';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique filename
    $newFileName = $userId . '_' . time() . '.' . $fileExt;
    $uploadPath = $uploadDir . '/' . $newFileName;

    try {
        // Move uploaded file
        if (move_uploaded_file($fileTmpName, $uploadPath)) {
            // Update database with new avatar path - store just the filename
            $stmt = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
            $stmt->execute([$newFileName, $userId]);

            // Update session data
            $_SESSION['user']['avatar'] = $newFileName;

            echo json_encode([
                'success' => true,
                'avatar' => $newFileName
            ]);
        } else {
            throw new Exception('Failed to move uploaded file');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save avatar: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']); 
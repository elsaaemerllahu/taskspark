<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
header("Content-Type: application/json");

session_start([
    'cookie_secure' => false,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax',
    'cookie_path' => '/',

]);

require 'db.php';

if (isset($_SESSION['user'])) {
    // Fetch latest user data including avatar from database
    $stmt = $pdo->prepare("SELECT id, username, email, avatar FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user']['id']]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($userData) {
        // Debug log
        error_log("Avatar path from database: " . ($userData['avatar'] ?? 'null'));
        
        // Update session with latest data
        $_SESSION['user'] = $userData;
        
        echo json_encode([
            'authenticated' => true,
            'id' => $userData['id'],
            'username' => $userData['username'],
            'email' => $userData['email'],
            'avatar' => $userData['avatar']
        ]);
    } else {
        echo json_encode(['authenticated' => false]);
    }
} else {
    echo json_encode(['authenticated' => false]);
}

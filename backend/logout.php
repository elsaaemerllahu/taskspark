<?php
session_start([
  'cookie_secure' => false,
  'cookie_httponly' => true,
  'cookie_samesite' => 'Lax',
]);

// Unset all session variables
$_SESSION = [];

// Delete the session cookie on the client
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// Destroy the session on the server
session_destroy();

echo json_encode(["message" => "Logged out"]);

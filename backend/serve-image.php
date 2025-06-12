<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
session_start();

// Check if user is authenticated
if (!isset($_SESSION['user'])) {
    header("HTTP/1.0 401 Unauthorized");
    exit;
}

// Get the image path from the query string
$imagePath = isset($_GET['path']) ? $_GET['path'] : '';

// Extract just the filename (removing directories and dangerous characters)
$filename = basename($imagePath);

// If filename starts with 'uploads', strip it
if (strpos($filename, 'uploads') === 0) {
    $filename = substr($filename, strlen('uploads'));
    $filename = ltrim($filename, '/\\');
}

// Construct the full path to the uploads directory
$fullPath = __DIR__ . '/uploads/' . $filename;

// Debug info
error_log("Original path: " . $_GET['path']);
error_log("Cleaned filename: " . $filename);
error_log("Full path: " . $fullPath);
error_log("__DIR__: " . __DIR__);

// Serve the image if it exists
if (file_exists($fullPath) && is_file($fullPath)) {
    $mimeType = mime_content_type($fullPath);
    if (strpos($mimeType, 'image/') === 0) {
        header('Content-Type: ' . $mimeType);
        readfile($fullPath);
        exit;
    } else {
        error_log("Not an image file");
    }
} else {
    error_log("File does not exist at: " . $fullPath);
}

// Return 404 if we get here
header("HTTP/1.0 404 Not Found");
header('Content-Type: application/json');
echo json_encode([
    'error' => 'Image not found',
    'path' => $imagePath,
    'filename' => $filename,
    'fullPath' => $fullPath
]);
exit;

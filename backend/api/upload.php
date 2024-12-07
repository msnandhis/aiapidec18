<?php
require_once '../config.php';

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Verify admin authentication
    session_start();
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    // Check if file was uploaded
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['file'];
    $type = isset($_POST['type']) ? $_POST['type'] : 'logo';

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.']);
        exit;
    }

    // Validate file size (max 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['error' => 'File size too large. Maximum size is 5MB.']);
        exit;
    }

    // Determine upload directory based on type
    $uploadDir = '../uploads/';
    switch ($type) {
        case 'logo':
            $uploadDir .= 'logos/';
            break;
        default:
            $uploadDir .= 'temp/';
    }

    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
        exit;
    }

    // Process image
    try {
        // Load image based on type
        switch ($file['type']) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($filepath);
                break;
            case 'image/png':
                $image = imagecreatefrompng($filepath);
                break;
            case 'image/gif':
                $image = imagecreatefromgif($filepath);
                break;
            case 'image/webp':
                $image = imagecreatefromwebp($filepath);
                break;
            default:
                throw new Exception('Unsupported image type');
        }

        // Get original dimensions
        $width = imagesx($image);
        $height = imagesy($image);

        // Calculate new dimensions (max 800x800)
        $maxDimension = 800;
        if ($width > $maxDimension || $height > $maxDimension) {
            if ($width > $height) {
                $newWidth = $maxDimension;
                $newHeight = floor($height * ($maxDimension / $width));
            } else {
                $newHeight = $maxDimension;
                $newWidth = floor($width * ($maxDimension / $height));
            }
        } else {
            $newWidth = $width;
            $newHeight = $height;
        }

        // Create new image
        $newImage = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve transparency for PNG images
        if ($file['type'] === 'image/png') {
            imagealphablending($newImage, false);
            imagesavealpha($newImage, true);
        }

        // Resize image
        imagecopyresampled(
            $newImage, $image,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $width, $height
        );

        // Save processed image
        switch ($file['type']) {
            case 'image/jpeg':
                imagejpeg($newImage, $filepath, 85);
                break;
            case 'image/png':
                imagepng($newImage, $filepath, 8);
                break;
            case 'image/gif':
                imagegif($newImage, $filepath);
                break;
            case 'image/webp':
                imagewebp($newImage, $filepath, 85);
                break;
        }

        // Clean up
        imagedestroy($image);
        imagedestroy($newImage);

    } catch (Exception $e) {
        error_log('Image processing error: ' . $e->getMessage());
        // Continue without image processing if it fails
    }

    // Return success response with file info
    echo json_encode([
        'success' => true,
        'data' => [
            'filename' => $filename,
            'path' => '/backend/uploads/' . ($type === 'logo' ? 'logos/' : 'temp/') . $filename,
            'type' => $file['type'],
            'size' => $file['size']
        ]
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred']);
}

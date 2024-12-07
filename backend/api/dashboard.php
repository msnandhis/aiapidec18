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

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $conn = getConnection();
    
    // Get total counts
    $stats = [
        'total_resources' => 0,
        'total_categories' => 0,
        'total_submissions' => 0,
        'pending_submissions' => 0,
        'total_messages' => 0,
        'unread_messages' => 0
    ];

    // Get resource count
    $stmt = $conn->query("SELECT COUNT(*) FROM resources");
    $stats['total_resources'] = (int)$stmt->fetchColumn();

    // Get category count
    $stmt = $conn->query("SELECT COUNT(*) FROM categories");
    $stats['total_categories'] = (int)$stmt->fetchColumn();

    // Get submission counts
    $stmt = $conn->query("SELECT COUNT(*) FROM submissions");
    $stats['total_submissions'] = (int)$stmt->fetchColumn();

    $stmt = $conn->query("SELECT COUNT(*) FROM submissions WHERE status = 'pending'");
    $stats['pending_submissions'] = (int)$stmt->fetchColumn();

    // Get message counts
    $stmt = $conn->query("SELECT COUNT(*) FROM messages");
    $stats['total_messages'] = (int)$stmt->fetchColumn();

    $stmt = $conn->query("SELECT COUNT(*) FROM messages WHERE status = 'unread'");
    $stats['unread_messages'] = (int)$stmt->fetchColumn();

    // Get recent submissions
    $stmt = $conn->query("
        SELECT * FROM submissions 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $stats['recent_submissions'] = $stmt->fetchAll();

    // Get recent messages
    $stmt = $conn->query("
        SELECT * FROM messages 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $stats['recent_messages'] = $stmt->fetchAll();

    // Get recent resources
    $stmt = $conn->query("
        SELECT r.*, c.label as category_name 
        FROM resources r
        LEFT JOIN categories c ON r.category_id = c.id
        ORDER BY r.created_at DESC 
        LIMIT 5
    ");
    $stats['recent_resources'] = $stmt->fetchAll();

    // Get category distribution
    $stmt = $conn->query("
        SELECT c.label, COUNT(r.id) as count
        FROM categories c
        LEFT JOIN resources r ON c.id = r.category_id
        GROUP BY c.id, c.label
        ORDER BY count DESC
    ");
    $stats['category_distribution'] = $stmt->fetchAll();

    // Get submission status distribution
    $stmt = $conn->query("
        SELECT status, COUNT(*) as count
        FROM submissions
        GROUP BY status
    ");
    $stats['submission_status'] = $stmt->fetchAll();

    // Get message status distribution
    $stmt = $conn->query("
        SELECT status, COUNT(*) as count
        FROM messages
        GROUP BY status
    ");
    $stats['message_status'] = $stmt->fetchAll();

    // Get recent activity log (combined recent actions)
    $recentActivity = [];

    // Add recent submissions to activity
    foreach ($stats['recent_submissions'] as $submission) {
        $recentActivity[] = [
            'type' => 'submission',
            'id' => $submission['id'],
            'title' => $submission['tool_name'],
            'status' => $submission['status'],
            'timestamp' => $submission['created_at']
        ];
    }

    // Add recent messages to activity
    foreach ($stats['recent_messages'] as $message) {
        $recentActivity[] = [
            'type' => 'message',
            'id' => $message['id'],
            'title' => 'Message from ' . $message['name'],
            'status' => $message['status'],
            'timestamp' => $message['created_at']
        ];
    }

    // Add recent resources to activity
    foreach ($stats['recent_resources'] as $resource) {
        $recentActivity[] = [
            'type' => 'resource',
            'id' => $resource['id'],
            'title' => $resource['name'],
            'category' => $resource['category_name'],
            'timestamp' => $resource['created_at']
        ];
    }

    // Sort activity by timestamp
    usort($recentActivity, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });

    $stats['recent_activity'] = array_slice($recentActivity, 0, 10);

    // Get daily stats for the last 7 days
    $stmt = $conn->query("
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM resources
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    ");
    $stats['daily_resources'] = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred']);
}

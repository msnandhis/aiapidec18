<?php
require_once '../config.php';

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $conn = getConnection();
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['type']) || !isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit;
            }

            // Validate type
            if (!in_array($data['type'], ['resource', 'category'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid type']);
                exit;
            }

            // Generate stats ID
            $statsId = uniqid('stats_', true);

            // Check if stats record exists
            $stmt = $conn->prepare("
                SELECT id, view_count 
                FROM page_stats 
                WHERE {$data['type']}_id = ?
            ");
            $stmt->execute([$data['id']]);
            $stats = $stmt->fetch();

            if ($stats) {
                // Update existing stats
                $stmt = $conn->prepare("
                    UPDATE page_stats 
                    SET view_count = view_count + 1,
                        last_viewed = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ");
                $stmt->execute([$stats['id']]);
            } else {
                // Create new stats record
                $stmt = $conn->prepare("
                    INSERT INTO page_stats (
                        id,
                        {$data['type']}_id,
                        view_count,
                        last_viewed,
                        created_at,
                        updated_at
                    ) VALUES (
                        :id,
                        :item_id,
                        1,
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
                    )
                ");
                $stmt->execute([
                    'id' => $statsId,
                    'item_id' => $data['id']
                ]);
            }

            // Update view count in resources/categories table
            if ($data['type'] === 'resource') {
                $stmt = $conn->prepare("
                    UPDATE resources 
                    SET views = views + 1 
                    WHERE id = ?
                ");
                $stmt->execute([$data['id']]);
            }

            echo json_encode([
                'success' => true,
                'message' => 'View tracked successfully'
            ]);
            break;

        case 'GET':
            // Verify admin authentication
            session_start();
            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }

            // Get type and period from query params
            $type = isset($_GET['type']) ? $_GET['type'] : null;
            $period = isset($_GET['period']) ? $_GET['period'] : '7days';

            // Validate type if provided
            if ($type && !in_array($type, ['resource', 'category'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid type']);
                exit;
            }

            // Determine date range based on period
            switch ($period) {
                case '24hours':
                    $interval = 'INTERVAL 24 HOUR';
                    $groupBy = 'HOUR';
                    break;
                case '7days':
                    $interval = 'INTERVAL 7 DAY';
                    $groupBy = 'DAY';
                    break;
                case '30days':
                    $interval = 'INTERVAL 30 DAY';
                    $groupBy = 'DAY';
                    break;
                default:
                    $interval = 'INTERVAL 7 DAY';
                    $groupBy = 'DAY';
            }

            // Build query based on type
            if ($type) {
                $query = "
                    SELECT 
                        DATE_FORMAT(last_viewed, '%Y-%m-%d %H:00:00') as timestamp,
                        {$type}_id as item_id,
                        SUM(view_count) as views
                    FROM page_stats
                    WHERE {$type}_id IS NOT NULL
                    AND last_viewed >= DATE_SUB(NOW(), {$interval})
                    GROUP BY {$type}_id, DATE_FORMAT(last_viewed, '%Y-%m-%d %H:00:00')
                    ORDER BY timestamp DESC
                ";
            } else {
                $query = "
                    SELECT 
                        DATE_FORMAT(last_viewed, '%Y-%m-%d %H:00:00') as timestamp,
                        SUM(CASE WHEN resource_id IS NOT NULL THEN view_count ELSE 0 END) as resource_views,
                        SUM(CASE WHEN category_id IS NOT NULL THEN view_count ELSE 0 END) as category_views
                    FROM page_stats
                    WHERE last_viewed >= DATE_SUB(NOW(), {$interval})
                    GROUP BY DATE_FORMAT(last_viewed, '%Y-%m-%d %H:00:00')
                    ORDER BY timestamp DESC
                ";
            }

            $stmt = $conn->query($query);
            $stats = $stmt->fetchAll();

            // Get top items if type is specified
            if ($type) {
                $topQuery = "
                    SELECT 
                        ps.{$type}_id as id,
                        CASE 
                            WHEN '{$type}' = 'resource' THEN r.name
                            WHEN '{$type}' = 'category' THEN c.label
                        END as name,
                        SUM(ps.view_count) as total_views
                    FROM page_stats ps
                    LEFT JOIN resources r ON ps.resource_id = r.id
                    LEFT JOIN categories c ON ps.category_id = c.id
                    WHERE ps.{$type}_id IS NOT NULL
                    GROUP BY ps.{$type}_id
                    ORDER BY total_views DESC
                    LIMIT 10
                ";
                $stmt = $conn->query($topQuery);
                $topItems = $stmt->fetchAll();

                echo json_encode([
                    'success' => true,
                    'data' => [
                        'timeline' => $stats,
                        'top_items' => $topItems
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'data' => $stats
                ]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred']);
}

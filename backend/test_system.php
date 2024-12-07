<?php
header('Content-Type: application/json');

$requirements = [
    'php_version' => [
        'required' => '7.4.0',
        'current' => PHP_VERSION,
        'status' => version_compare(PHP_VERSION, '7.4.0', '>=')
    ],
    'extensions' => [
        'pdo' => [
            'required' => true,
            'current' => extension_loaded('pdo'),
            'status' => extension_loaded('pdo')
        ],
        'pdo_mysql' => [
            'required' => true,
            'current' => extension_loaded('pdo_mysql'),
            'status' => extension_loaded('pdo_mysql')
        ],
        'json' => [
            'required' => true,
            'current' => extension_loaded('json'),
            'status' => extension_loaded('json')
        ],
        'mbstring' => [
            'required' => true,
            'current' => extension_loaded('mbstring'),
            'status' => extension_loaded('mbstring')
        ]
    ],
    'settings' => [
        'file_uploads' => [
            'required' => true,
            'current' => ini_get('file_uploads'),
            'status' => ini_get('file_uploads') == 1
        ],
        'post_max_size' => [
            'required' => '8M',
            'current' => ini_get('post_max_size'),
            'status' => intval(ini_get('post_max_size')) >= 8
        ],
        'upload_max_filesize' => [
            'required' => '8M',
            'current' => ini_get('upload_max_filesize'),
            'status' => intval(ini_get('upload_max_filesize')) >= 8
        ],
        'max_execution_time' => [
            'required' => '30',
            'current' => ini_get('max_execution_time'),
            'status' => ini_get('max_execution_time') >= 30
        ]
    ],
    'directories' => [
        'uploads' => [
            'path' => __DIR__ . '/uploads',
            'exists' => is_dir(__DIR__ . '/uploads'),
            'writable' => is_writable(__DIR__ . '/uploads'),
            'status' => is_dir(__DIR__ . '/uploads') && is_writable(__DIR__ . '/uploads')
        ],
        'uploads_logos' => [
            'path' => __DIR__ . '/uploads/logos',
            'exists' => is_dir(__DIR__ . '/uploads/logos'),
            'writable' => is_writable(__DIR__ . '/uploads/logos'),
            'status' => is_dir(__DIR__ . '/uploads/logos') && is_writable(__DIR__ . '/uploads/logos')
        ],
        'uploads_temp' => [
            'path' => __DIR__ . '/uploads/temp',
            'exists' => is_dir(__DIR__ . '/uploads/temp'),
            'writable' => is_writable(__DIR__ . '/uploads/temp'),
            'status' => is_dir(__DIR__ . '/uploads/temp') && is_writable(__DIR__ . '/uploads/temp')
        ]
    ],
    'env_file' => [
        'exists' => file_exists(__DIR__ . '/.env'),
        'readable' => is_readable(__DIR__ . '/.env'),
        'status' => file_exists(__DIR__ . '/.env') && is_readable(__DIR__ . '/.env')
    ]
];

// Check if all requirements are met
$all_requirements_met = true;
foreach ($requirements as $category => $checks) {
    if (is_array($checks)) {
        foreach ($checks as $check) {
            if (isset($check['status']) && $check['status'] === false) {
                $all_requirements_met = false;
                break 2;
            }
        }
    } elseif (isset($checks['status']) && $checks['status'] === false) {
        $all_requirements_met = false;
        break;
    }
}

// Add database connection test
try {
    require_once 'config.php';
    $conn = getConnection();
    $stmt = $conn->query("SELECT 1");
    $requirements['database'] = [
        'connected' => true,
        'error' => null
    ];
} catch (Exception $e) {
    $requirements['database'] = [
        'connected' => false,
        'error' => $e->getMessage()
    ];
    $all_requirements_met = false;
}

// Prepare response
$response = [
    'success' => $all_requirements_met,
    'message' => $all_requirements_met ? 'All system requirements are met' : 'Some system requirements are not met',
    'requirements' => $requirements
];

// Send response
echo json_encode($response, JSON_PRETTY_PRINT);

<?php
require_once 'config.php';

function importData() {
    $conn = getConnection();
    
    try {
        // Start transaction
        $conn->beginTransaction();
        
        // Insert resources data
        $stmt = $conn->prepare("
            INSERT INTO resources (id, name, category_id, logo, url, description, total_pages, current_page)
            VALUES (:id, :name, :category_id, :logo, :url, :description, :total_pages, :current_page)
        ");

        // Frontend Resources
        $frontendResources = [
            [
                'id' => 'react',
                'name' => 'React',
                'category_id' => 'frontend',
                'logo' => 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/react/react.png',
                'url' => 'https://reactjs.org',
                'description' => 'A JavaScript library for building user interfaces',
                'total_pages' => 3,
                'current_page' => 1
            ],
            [
                'id' => 'vue',
                'name' => 'Vue.js',
                'category_id' => 'frontend',
                'logo' => 'https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/vue/vue.png',
                'url' => 'https://vuejs.org',
                'description' => 'The Progressive JavaScript Framework',
                'total_pages' => null,
                'current_page' => null
            ],
            // Add other frontend resources here
        ];

        // Maps Resources
        $mapResources = [
            [
                'id' => 'leaflet',
                'name' => 'Leaflet',
                'category_id' => 'maps',
                'logo' => 'https://leafletjs.com/docs/images/logo.png',
                'url' => 'https://leafletjs.com',
                'description' => 'Open-source JavaScript library for mobile-friendly interactive maps',
                'total_pages' => 2,
                'current_page' => 1
            ],
            // Add other map resources here
        ];

        // Useful Resources
        $usefulResources = [
            [
                'id' => 'github',
                'name' => 'GitHub',
                'category_id' => 'useful',
                'logo' => 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
                'url' => 'https://github.com',
                'description' => 'Where the world builds software',
                'total_pages' => 2,
                'current_page' => 1
            ],
            // Add other useful resources here
        ];

        // WordPress Resources
        $wordpressResources = [
            [
                'id' => 'elementor',
                'name' => 'Elementor',
                'category_id' => 'wordpress',
                'logo' => 'https://elementor.com/marketing/wp-content/uploads/2021/10/Elementor-Logo-Symbol-Red.png',
                'url' => 'https://elementor.com',
                'description' => "The World's Leading WordPress Website Builder",
                'total_pages' => 2,
                'current_page' => 1
            ],
            // Add other WordPress resources here
        ];

        $allResources = array_merge($frontendResources, $mapResources, $usefulResources, $wordpressResources);

        foreach ($allResources as $resource) {
            $stmt->execute([
                ':id' => $resource['id'],
                ':name' => $resource['name'],
                ':category_id' => $resource['category_id'],
                ':logo' => $resource['logo'],
                ':url' => $resource['url'],
                ':description' => $resource['description'],
                ':total_pages' => $resource['total_pages'],
                ':current_page' => $resource['current_page']
            ]);
        }

        // Commit transaction
        $conn->commit();
        echo "Data imported successfully!\n";
        
    } catch (PDOException $e) {
        // Rollback transaction on error
        $conn->rollBack();
        echo "Error importing data: " . $e->getMessage() . "\n";
    }
}

// Run the import
importData();
?>

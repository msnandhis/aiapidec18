-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS rigazamy_AAKit;
USE rigazamy_AAKit;

-- Set character set and collation
ALTER DATABASE rigazamy_AAKit CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Drop tables if they exist
DROP TABLE IF EXISTS page_stats;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS messages;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') NOT NULL DEFAULT 'admin',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    total_resources INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_label (label),
    UNIQUE KEY unique_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    logo VARCHAR(255),           -- Store the path to the uploaded logo file
    logo_url TEXT,              -- Store external logo URL if provided
    url TEXT NOT NULL,
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    api_link TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'replied') NOT NULL DEFAULT 'unread',
    admin_notes TEXT,
    ip_address VARCHAR(45),     -- Added for rate limiting (IPv6 support)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ip_created (ip_address, created_at)  -- Index for rate limiting queries
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create page_stats table for tracking views and interactions
CREATE TABLE IF NOT EXISTS page_stats (
    id VARCHAR(36) PRIMARY KEY,
    resource_id VARCHAR(50) NULL,
    category_id VARCHAR(50) NULL,
    view_count INT DEFAULT 0,
    last_viewed TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories with slugs
INSERT INTO categories (id, label, slug) VALUES
('ai_models', 'AI Models', 'ai-models'),
('image_generation', 'Image Generation', 'image-generation'),
('text_analysis', 'Text Analysis', 'text-analysis'),
('speech_recognition', 'Speech Recognition', 'speech-recognition'),
('machine_learning', 'Machine Learning', 'machine-learning'),
('natural_language', 'Natural Language', 'natural-language'),
('computer_vision', 'Computer Vision', 'computer-vision'),
('chatbots', 'Chatbots & Assistants', 'chatbots-assistants');

-- Create triggers to update category resource counts
DELIMITER //

DROP TRIGGER IF EXISTS after_resource_insert//
CREATE TRIGGER after_resource_insert
AFTER INSERT ON resources
FOR EACH ROW
BEGIN
    UPDATE categories 
    SET total_resources = (
        SELECT COUNT(*) 
        FROM resources 
        WHERE category_id = NEW.category_id
    )
    WHERE id = NEW.category_id;
END//

DROP TRIGGER IF EXISTS after_resource_delete//
CREATE TRIGGER after_resource_delete
AFTER DELETE ON resources
FOR EACH ROW
BEGIN
    UPDATE categories 
    SET total_resources = (
        SELECT COUNT(*) 
        FROM resources 
        WHERE category_id = OLD.category_id
    )
    WHERE id = OLD.category_id;
END//

DROP TRIGGER IF EXISTS after_resource_update//
CREATE TRIGGER after_resource_update
AFTER UPDATE ON resources
FOR EACH ROW
BEGIN
    IF OLD.category_id != NEW.category_id THEN
        UPDATE categories 
        SET total_resources = (
            SELECT COUNT(*) 
            FROM resources 
            WHERE category_id = OLD.category_id
        )
        WHERE id = OLD.category_id;
        
        UPDATE categories 
        SET total_resources = (
            SELECT COUNT(*) 
            FROM resources 
            WHERE category_id = NEW.category_id
        )
        WHERE id = NEW.category_id;
    END IF;
END//

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_resources_category ON resources(category_id);
CREATE INDEX idx_resources_featured ON resources(is_featured);
CREATE INDEX idx_resources_views ON resources(views);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_page_stats_resource ON page_stats(resource_id);
CREATE INDEX idx_page_stats_category ON page_stats(category_id);
CREATE INDEX idx_page_stats_last_viewed ON page_stats(last_viewed);
CREATE INDEX idx_categories_slug ON categories(slug);

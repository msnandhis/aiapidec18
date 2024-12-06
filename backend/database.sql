-- Use the correct database
USE rigazamy_AAKit;

-- Create the categories table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL
);

-- Create the resources table
CREATE TABLE resources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    logo TEXT NOT NULL,
    url TEXT,
    description TEXT,
    total_pages INT DEFAULT NULL,
    current_page INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Insert default categories
INSERT INTO categories (id, label) VALUES
('frontend', 'Frontend'),
('maps', 'Maps'),
('useful', 'Useful'),
('wordpress', 'WordPress');

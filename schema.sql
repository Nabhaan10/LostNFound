-- Lost and Found Database Schema
-- Created: December 12, 2025
-- Description: Database schema for the Lost and Found System

-- Create the database
CREATE DATABASE IF NOT EXISTS lost_and_found;
USE lost_and_found;

-- Items table (replaces hash table structure)
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_type VARCHAR(50) NOT NULL,
    description VARCHAR(100) NOT NULL,
    reporter_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_found BOOLEAN DEFAULT FALSE,
    report_id BIGINT UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_item_type (item_type),
    INDEX idx_status (status),
    INDEX idx_is_found (is_found),
    INDEX idx_report_id (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Match history table (for tracking when lost and found items are matched)
CREATE TABLE match_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lost_item_id INT NOT NULL,
    found_item_id INT NOT NULL,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_by VARCHAR(50),
    
    FOREIGN KEY (lost_item_id) REFERENCES items(id),
    FOREIGN KEY (found_item_id) REFERENCES items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert some sample data for testing
INSERT INTO items (item_type, description, reporter_name, phone_number, is_found, report_id, status) VALUES
('wallet', 'Black leather wallet with ID cards', 'John Doe', '9876543210', FALSE, 1734000001, 'pending'),
('phone', 'iPhone 13 with blue case', 'Jane Smith', '9876543211', TRUE, 1734000002, 'pending'),
('keys', 'Car keys with Toyota keychain', 'Bob Wilson', '9876543212', FALSE, 1734000003, 'pending'),
('laptop', 'Dell Latitude 15 inch', 'Alice Brown', '9876543213', TRUE, 1734000004, 'pending');

-- View to show lost and found items separately
CREATE VIEW lost_items AS
SELECT * FROM items WHERE is_found = FALSE AND status = 'pending';

CREATE VIEW found_items AS
SELECT * FROM items WHERE is_found = TRUE AND status = 'pending';

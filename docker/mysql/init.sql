CREATE DATABASE IF NOT EXISTS lost_and_found;
USE lost_and_found;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    resolved_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_type VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    reporter_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_found BOOLEAN DEFAULT FALSE,
    report_id BIGINT UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_item_type (item_type),
    INDEX idx_status (status),
    INDEX idx_is_found (is_found),
    INDEX idx_report_id (report_id),
    INDEX idx_user_id (user_id),

    CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS match_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lost_item_id INT NOT NULL,
    found_item_id INT NOT NULL,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_by VARCHAR(50),

    CONSTRAINT fk_match_lost FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_found FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

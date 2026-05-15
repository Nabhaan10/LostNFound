-- Add users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id column to items table
ALTER TABLE items ADD COLUMN user_id INT;
ALTER TABLE items ADD FOREIGN KEY (user_id) REFERENCES users(id);

-- Create index on user_id for faster queries
CREATE INDEX idx_user_id ON items(user_id);

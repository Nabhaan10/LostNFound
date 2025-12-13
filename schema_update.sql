-- Add users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    is_staff BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id column to items table
ALTER TABLE items ADD COLUMN user_id INT;
ALTER TABLE items ADD FOREIGN KEY (user_id) REFERENCES users(id);

-- Create index on user_id for faster queries
CREATE INDEX idx_user_id ON items(user_id);

-- Insert default staff account (username: staff, password: staff2025)
-- Note: In production, use bcrypt hashing. This is plain text for simplicity.
INSERT INTO users (roll_number, password, name, phone_number, is_staff) 
VALUES ('staff', 'staff2025', 'Staff Admin', '0000000000', TRUE);

-- Add resolved_count column to users table to track resolved items
ALTER TABLE users ADD COLUMN resolved_count INT DEFAULT 0;

-- Update existing users to have correct resolved count based on current data
UPDATE users u
SET resolved_count = (
    SELECT COUNT(*) 
    FROM items 
    WHERE user_id = u.id AND status = 'resolved'
);

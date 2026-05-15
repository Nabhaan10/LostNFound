-- Remove staff-related functionality from the database

-- Remove is_staff column from users table
ALTER TABLE users DROP COLUMN is_staff;

-- Remove the default staff account if it exists
DELETE FROM users WHERE roll_number = 'staff';

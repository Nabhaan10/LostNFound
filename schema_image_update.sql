-- Add image_url column to items table
-- Run this SQL script to update your existing database

USE lost_and_found;

-- Add image_url column to store image file path
ALTER TABLE items 
ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER description;

-- Show updated structure
DESCRIBE items;

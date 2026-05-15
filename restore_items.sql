-- Quick fix to restore all items to pending status
-- Run this if you want to see your old reports again

UPDATE items 
SET status = 'pending' 
WHERE id > 0;

SELECT 
    COUNT(*) as total_items,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_items,
    SUM(CASE WHEN is_found = 0 AND status = 'pending' THEN 1 ELSE 0 END) as lost_items,
    SUM(CASE WHEN is_found = 1 AND status = 'pending' THEN 1 ELSE 0 END) as found_items
FROM items;

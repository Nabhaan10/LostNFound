const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lost_and_found',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(conn => {
        console.log('✓ Database connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('✗ Database connection failed:', err.message);
    });

// ==================== AUTHENTICATION ENDPOINTS ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { rollNumber, password, name, phoneNumber } = req.body;
        
        // Check if user already exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE roll_number = ?',
            [rollNumber]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Roll number already registered' 
            });
        }
        
        // Insert new user (plain text password for simplicity)
        const [result] = await pool.execute(
            'INSERT INTO users (roll_number, password, name, phone_number) VALUES (?, ?, ?, ?)',
            [rollNumber, password, name, phoneNumber]
        );
        
        res.json({ 
            success: true, 
            message: 'Registration successful',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { rollNumber, password } = req.body;
        
        const [rows] = await pool.execute(
            'SELECT id, roll_number, name, phone_number FROM users WHERE roll_number = ? AND password = ?',
            [rollNumber, password]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        const user = rows[0];
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user.id,
                rollNumber: user.roll_number,
                name: user.name,
                phoneNumber: user.phone_number
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============= API ENDPOINTS =============

// Report a lost item
app.post('/api/items/report-lost', async (req, res) => {
    try {
        const { itemType, description, name, phone, userId } = req.body;
        
        if (!itemType || !description || !name || !phone || !userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required' 
            });
        }
        
        const reportId = Date.now();
        
        const [result] = await pool.execute(
            'INSERT INTO items (item_type, description, reporter_name, phone_number, is_found, report_id, status, user_id) VALUES (?, ?, ?, ?, 0, ?, ?, ?)',
            [itemType, description, name, phone, reportId, 'pending', userId]
        );
        
        // Check for matching found items
        const [matches] = await pool.execute(
            'SELECT * FROM items WHERE item_type = ? AND is_found = 1 AND status = "pending" LIMIT 5',
            [itemType]
        );
        
        res.json({ 
            success: true, 
            reportId: reportId,
            itemId: result.insertId,
            message: 'Lost item reported successfully',
            matches: matches
        });
    } catch (error) {
        console.error('Error reporting lost item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Report a found item
app.post('/api/items/report-found', async (req, res) => {
    try {
        const { itemType, description, name, phone, userId } = req.body;
        
        if (!itemType || !description || !name || !phone || !userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required' 
            });
        }
        
        const reportId = Date.now();
        
        const [result] = await pool.execute(
            'INSERT INTO items (item_type, description, reporter_name, phone_number, is_found, report_id, status, user_id) VALUES (?, ?, ?, ?, 1, ?, ?, ?)',
            [itemType, description, name, phone, reportId, 'pending', userId]
        );
        
        // Check for matching lost items
        const [matches] = await pool.execute(
            'SELECT * FROM items WHERE item_type = ? AND is_found = 0 AND status = "pending" LIMIT 5',
            [itemType]
        );
        
        res.json({ 
            success: true, 
            reportId: reportId,
            itemId: result.insertId,
            message: 'Found item reported successfully',
            matches: matches
        });
    } catch (error) {
        console.error('Error reporting found item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search items by type
app.get('/api/items/search/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        const [rows] = await pool.execute(
            'SELECT * FROM items WHERE item_type = ? AND status = "pending" ORDER BY created_at DESC',
            [type]
        );
        
        res.json({ success: true, items: rows });
    } catch (error) {
        console.error('Error searching items:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search items by description keyword
app.get('/api/items/search/description/:keyword', async (req, res) => {
    try {
        const { keyword } = req.params;
        
        const [rows] = await pool.execute(
            'SELECT * FROM items WHERE description LIKE ? AND status = "pending" ORDER BY created_at DESC',
            [`%${keyword}%`]
        );
        
        res.json({ success: true, items: rows });
    } catch (error) {
        console.error('Error searching items:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all pending items
app.get('/api/items/all', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM items WHERE status = "pending" ORDER BY created_at DESC'
        );
        
        res.json({ success: true, items: rows });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get lost items only
app.get('/api/items/lost', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM items WHERE is_found = 0 AND status = "pending" ORDER BY created_at DESC'
        );
        
        res.json({ success: true, items: rows });
    } catch (error) {
        console.error('Error fetching lost items:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get found items only
app.get('/api/items/found', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM items WHERE is_found = 1 AND status = "pending" ORDER BY created_at DESC'
        );
        
        res.json({ success: true, items: rows });
    } catch (error) {
        console.error('Error fetching found items:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Resolve item (mark as resolved) - requires user ownership
app.put('/api/items/resolve/:reportId', async (req, res) => {
    try {
        const { reportId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'User ID required' 
            });
        }
        
        // Check if item exists and belongs to user
        const [items] = await pool.execute(
            'SELECT user_id FROM items WHERE report_id = ? AND status = "pending"',
            [reportId]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Item not found or already resolved' 
            });
        }
        
        if (items[0].user_id !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: 'You can only resolve your own items' 
            });
        }
        
        const [result] = await pool.execute(
            'UPDATE items SET status = "resolved", updated_at = CURRENT_TIMESTAMP WHERE report_id = ? AND user_id = ? AND status = "pending"',
            [reportId, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Item not found or already resolved' 
            });
        }
        
        res.json({ success: true, message: 'Item resolved successfully' });
    } catch (error) {
        console.error('Error resolving item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const [totalItems] = await pool.execute(
            'SELECT COUNT(*) as count FROM items'
        );
        
        const [pendingItems] = await pool.execute(
            'SELECT COUNT(*) as count FROM items WHERE status = "pending"'
        );
        
        const [resolvedToday] = await pool.execute(
            'SELECT COUNT(*) as count FROM items WHERE status = "resolved" AND DATE(updated_at) = CURDATE()'
        );
        
        const [lostItems] = await pool.execute(
            'SELECT COUNT(*) as count FROM items WHERE is_found = 0 AND status = "pending"'
        );
        
        const [foundItems] = await pool.execute(
            'SELECT COUNT(*) as count FROM items WHERE is_found = 1 AND status = "pending"'
        );
        
        res.json({
            success: true,
            stats: {
                total: totalItems[0].count,
                pending: pendingItems[0].count,
                resolvedToday: resolvedToday[0].count,
                lost: lostItems[0].count,
                found: foundItems[0].count
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}/api`);
});

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Use /tmp in production (Vercel serverless) since the function filesystem is read-only
const uploadsDir = process.env.NODE_ENV === 'production'
    ? '/tmp/uploads'
    : path.join(__dirname, 'uploads');

try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
} catch (err) {
    console.warn('Could not create uploads directory (expected in serverless):', err.message);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
});

// Wrapper so multer errors are returned as JSON instead of crashing with 500
function uploadSingle(req, res, next) {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Serve uploaded images (local dev only — not available in serverless production)
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(uploadsDir));
}

function convertPlaceholders(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

// Database connection pool
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
        }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 5432),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'lost_and_found',
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        }
);

pool.execute = async (sql, params = []) => {
    const result = await pool.query(convertPlaceholders(sql), params);
    return [result.rows, {
        insertId: result.rows[0]?.id,
        affectedRows: result.rowCount
    }];
};

pool.getConnection = async () => {
    const client = await pool.connect();
    client.execute = async (sql, params = []) => {
        const result = await client.query(convertPlaceholders(sql), params);
        return [result.rows, {
            insertId: result.rows[0]?.id,
            affectedRows: result.rowCount
        }];
    };
    client.beginTransaction = async () => client.query('BEGIN');
    client.commit = async () => client.query('COMMIT');
    client.rollback = async () => client.query('ROLLBACK');
    return client;
};

// Test database connection and run migrations
pool.query('SELECT 1')
    .then(async () => {
        const conn = await pool.getConnection();
        console.log('✓ Database connected successfully');
        
        // Migration 1: Add resolved_count column if it doesn't exist
        try {
            await conn.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS resolved_count INT DEFAULT 0');
            await conn.execute(`
                UPDATE users u
                SET resolved_count = (
                    SELECT COUNT(*) 
                    FROM items 
                    WHERE user_id = u.id AND status = 'resolved'
                )
            `);
            console.log('✓ resolved_count column ensured successfully');
        } catch (err) {
            console.error('Migration error (resolved_count):', err.message);
        }
        
        // Migration 2: Remove is_staff column if it exists
        try {
            console.log('Removing staff-related functionality...');
            await conn.execute("DELETE FROM users WHERE roll_number = 'staff'");
            await conn.execute('ALTER TABLE users DROP COLUMN IF EXISTS is_staff');
            console.log('✓ Staff functionality removed successfully');
        } catch (err) {
            console.error('Migration error (remove staff):', err.message);
        }
        
        conn.release();
    })
    .catch(err => {
        console.error('✗ Database connection failed:', err.message);
    });

// ==================== AUTO CLEANUP FUNCTION ====================

// Function to delete unresolved items older than 20 days
const cleanupOldItems = async () => {
    try {
        const twentyDaysAgo = new Date();
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
        
        // First, get the items to be deleted (to clean up their images)
        const [itemsToDelete] = await pool.execute(
            'SELECT id, image_url FROM items WHERE status = ? AND created_at < ?',
            ['pending', twentyDaysAgo]
        );
        
        // Delete the database records
        const [result] = await pool.execute(
            'DELETE FROM items WHERE status = ? AND created_at < ?',
            ['pending', twentyDaysAgo]
        );
        
        // Delete associated image files
        if (itemsToDelete.length > 0) {
            itemsToDelete.forEach(item => {
                if (item.image_url) {
                    const imagePath = path.join(__dirname, item.image_url);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
            });
        }
        
        if (result.affectedRows > 0) {
            console.log(`🗑️ Cleaned up ${result.affectedRows} old unresolved item(s) (older than 20 days)`);
        }
    } catch (error) {
        console.error('Error during cleanup:', error.message);
    }
};

// Run cleanup every 24 hours (86400000 ms)
setInterval(cleanupOldItems, 24 * 60 * 60 * 1000);

// Run cleanup on server start
cleanupOldItems();

console.log('📅 Auto-cleanup enabled: Unresolved items older than 20 days will be automatically deleted');

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
            'INSERT INTO users (roll_number, password, name, phone_number) VALUES (?, ?, ?, ?) RETURNING id',
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
app.post('/api/items/report-lost', uploadSingle, async (req, res) => {
    try {
        const { itemType, description, name, phone, userId } = req.body;
        
        if (!itemType || !description || !name || !phone || !userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required'
            });
        }
        
        const reportId = Date.now();
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        const [result] = await pool.execute(
            'INSERT INTO items (item_type, description, image_url, reporter_name, phone_number, is_found, report_id, status, user_id) VALUES (?, ?, ?, ?, ?, FALSE, ?, ?, ?) RETURNING id',
            [itemType, description, imageUrl, name, phone, reportId, 'pending', userId]
        );
        
        // Check for matching found items
        const [matches] = await pool.execute(
            "SELECT * FROM items WHERE item_type = ? AND is_found = TRUE AND status = 'pending' LIMIT 5",
            [itemType]
        );
        
        res.json({ 
            success: true, 
            reportId: reportId,
            itemId: result.insertId,
            message: 'Lost item reported successfully',
            matches: matches,
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Error reporting lost item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Report a found item
app.post('/api/items/report-found', uploadSingle, async (req, res) => {
    try {
        const { itemType, description, name, phone, userId } = req.body;
        
        if (!itemType || !description || !name || !phone || !userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required'
            });
        }
        
        const reportId = Date.now();
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        const [result] = await pool.execute(
            'INSERT INTO items (item_type, description, image_url, reporter_name, phone_number, is_found, report_id, status, user_id) VALUES (?, ?, ?, ?, ?, TRUE, ?, ?, ?) RETURNING id',
            [itemType, description, imageUrl, name, phone, reportId, 'pending', userId]
        );
        
        // Check for matching lost items
        const [matches] = await pool.execute(
            "SELECT * FROM items WHERE item_type = ? AND is_found = FALSE AND status = 'pending' LIMIT 5",
            [itemType]
        );
        
        res.json({ 
            success: true, 
            reportId: reportId,
            itemId: result.insertId,
            message: 'Found item reported successfully',
            matches: matches,
            imageUrl: imageUrl
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
            "SELECT * FROM items WHERE item_type = ? AND status = 'pending' ORDER BY created_at DESC",
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
            "SELECT * FROM items WHERE description LIKE ? AND status = 'pending' ORDER BY created_at DESC",
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
            "SELECT * FROM items WHERE status = 'pending' ORDER BY created_at DESC"
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
            "SELECT * FROM items WHERE is_found = FALSE AND status = 'pending' ORDER BY created_at DESC"
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
            "SELECT * FROM items WHERE is_found = TRUE AND status = 'pending' ORDER BY created_at DESC"
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
            "SELECT user_id, image_url FROM items WHERE report_id = ? AND status = 'pending'",
            [reportId]
        );
        
        if (items.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Item not found or already resolved' 
            });
        }
        
        // Coerce both to strings for comparison (DB returns number, body sends string)
        if (String(items[0].user_id) !== String(userId)) {
            return res.status(403).json({ 
                success: false, 
                error: 'You can only resolve your own items' 
            });
        }
        
        // Start a transaction to ensure both operations succeed or fail together
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Increment user's resolved count
            await connection.execute(
                'UPDATE users SET resolved_count = resolved_count + 1 WHERE id = ?',
                [userId]
            );
            
            // Delete the item record
            const [result] = await connection.execute(
                "DELETE FROM items WHERE report_id = ? AND user_id = ? AND status = 'pending'",
                [reportId, userId]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('Item not found or already resolved');
            }
            
            // Delete associated image if exists
            if (items[0].image_url) {
                const imagePath = path.join(__dirname, 'uploads', path.basename(items[0].image_url));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            
            await connection.commit();
            res.json({ success: true, message: 'Item resolved and removed successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
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
            "SELECT COUNT(*) as count FROM items WHERE status = 'pending'"
        );
        
        // Items are deleted on resolve, so track daily resolutions via resolved_count increments.
        // We sum resolved_count as a proxy for total resolved; daily resolved is not trackable post-delete.
        const [resolvedToday] = await pool.execute(
            'SELECT COALESCE(SUM(resolved_count), 0) as count FROM users'
        );
        
        const [lostItems] = await pool.execute(
            "SELECT COUNT(*) as count FROM items WHERE is_found = FALSE AND status = 'pending'"
        );
        
        const [foundItems] = await pool.execute(
            "SELECT COUNT(*) as count FROM items WHERE is_found = TRUE AND status = 'pending'"
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

// Get user-specific statistics and active reports
app.get('/api/user/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get total active reports (pending)
        const [totalReports] = await pool.execute(
            "SELECT COUNT(*) as count FROM items WHERE user_id = ? AND status = 'pending'",
            [userId]
        );
        
        // Get resolved count from users table
        const [userData] = await pool.execute(
            'SELECT resolved_count FROM users WHERE id = ?',
            [userId]
        );
        
        const resolvedCount = userData.length > 0 ? userData[0].resolved_count : 0;
        
        const [activeReports] = await pool.execute(
            "SELECT id, item_type, description, created_at, is_found, status, image_url FROM items WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC",
            [userId]
        );
        
        res.json({
            success: true,
            userStats: {
                total: totalReports[0].count,
                resolved: resolvedCount,
                pending: totalReports[0].count
            },
            activeReports: activeReports
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Export the app instance for Vercel deployment
module.exports = app;

// Start server only when running directly (not when imported as module for Vercel)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
}

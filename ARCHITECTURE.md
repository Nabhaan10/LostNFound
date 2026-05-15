# 🏗️ System Architecture

## Overview

The College Lost & Found System is a full-stack web application built on a 3-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│                    (React Frontend - Port 3000)              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐│
│  │  Home  │  │ Report │  │ Search │  │View All│  │ Queue  ││
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘│
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/AJAX (Axios)
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│                 (Node.js/Express - Port 5000)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              RESTful API Endpoints                    │   │
│  │  POST /api/items/report-lost                         │   │
│  │  POST /api/items/report-found                        │   │
│  │  GET  /api/items/search/type/:type                   │   │
│  │  GET  /api/items/search/description/:keyword         │   │
│  │  GET  /api/items/all                                 │   │
│  │  GET  /api/queue/:type                               │   │
│  │  PUT  /api/items/resolve/:reportId                   │   │
│  │  GET  /api/stats                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries (mysql2)
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│                     (MySQL Database)                         │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  items table  │  │ queue_items  │  │ match_history   │  │
│  │               │  │    table     │  │     table       │  │
│  │ - id          │  │ - id         │  │ - id            │  │
│  │ - item_type   │  │ - item_id    │  │ - lost_item_id  │  │
│  │ - description │  │ - queue_type │  │ - found_item_id │  │
│  │ - reporter    │  │ - position   │  │ - matched_at    │  │
│  │ - phone       │  └──────────────┘  └─────────────────┘  │
│  │ - is_found    │                                          │
│  │ - report_id   │                                          │
│  │ - status      │                                          │
│  └───────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
App.js (Root Component)
│
├── Navigation Bar
│   ├── Home Button
│   ├── Report Lost Button
│   ├── Report Found Button
│   ├── Search Button
│   └── view all button
│
├── Content Area (Dynamic Routing)
│   │
│   ├── Home Component
│   │   └── Statistics Dashboard
│   │       ├── Total Items Card
│   │       ├── Pending Items Card
│   │       ├── Resolved Today Card
│   │       ├── Lost Items Card
│   │       └── Found Items Card
│   │
│   ├── ReportLost Component
│   │   ├── Form (Item Type, Description, Name, Phone)
│   │   ├── Submit Handler
│   │   └── Matching Found Items Display
│   │
│   ├── ReportFound Component
│   │   ├── Form (Item Type, Description, Name, Phone)
│   │   ├── Submit Handler
│   │   └── Matching Lost Items Display
│   │
│   ├── Search Component
│   │   ├── Search Type Selector
│   │   ├── Search Input/Dropdown
│   │   ├── Search Button
│   │   └── Results Grid
│   │
│   ├── ViewAll Component
│   │   ├── Filter Buttons (All/Lost/Found)
│   │   └── Items Grid
│   │
│   └── ProcessQueue Component
│       ├── Queue Type Tabs (Lost/Found)
│       ├── Queue Items Display
│       └── Resolve Buttons
│
└── Footer
```

---

## Data Flow

### Report Lost Item Flow

```
User fills form → Submit button clicked
    ↓
ReportLost.js validates input
    ↓
axios.post('/api/items/report-lost', data)
    ↓
Express server receives request
    ↓
Validates required fields
    ↓
Generates report_id (timestamp)
    ↓
INSERT into items table (is_found = 0)
    ↓
INSERT into queue_items table
    ↓
SELECT matching found items (same item_type, is_found = 1)
    ↓
Return response with report_id and matches
    ↓
Frontend displays success message + matches
    ↓
User can contact match directly
```

### Search Flow

```
User enters search query → Click search
    ↓
Search.js determines search type (type/description)
    ↓
axios.get('/api/items/search/:type/:query')
    ↓
Express server receives request
    ↓
Build SQL query:
  - Type search: WHERE item_type = ?
  - Description: WHERE description LIKE %?%
    ↓
Execute query on items table
    ↓
Return matching items array
    ↓
Frontend displays results in grid
    ↓
User views contact information
```

### Queue Resolution Flow

```
Staff views queue → Clicks "Mark as Resolved"
    ↓
Confirmation dialog
    ↓
axios.put('/api/items/resolve/:reportId')
    ↓
Express server receives request
    ↓
UPDATE items SET status = 'resolved' WHERE report_id = ?
    ↓
Return success response
    ↓
Frontend refreshes queue display
    ↓
Item removed from queue
    ↓
Statistics updated
```

---

## Database Schema Design

### Items Table (Core)
```sql
items
├── id (PRIMARY KEY, AUTO_INCREMENT)
├── item_type (VARCHAR, INDEXED)
├── description (VARCHAR)
├── reporter_name (VARCHAR)
├── phone_number (VARCHAR)
├── is_found (BOOLEAN, INDEXED)
├── report_id (BIGINT, UNIQUE, INDEXED)
├── status (VARCHAR, INDEXED) -- 'pending' or 'resolved'
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Purpose: Stores all lost and found items
Indexes: item_type, is_found, status, report_id for fast queries
```

### Queue Items Table (Processing)
```sql
queue_items
├── id (PRIMARY KEY, AUTO_INCREMENT)
├── item_id (FOREIGN KEY → items.id)
├── queue_type (VARCHAR) -- 'lost' or 'found'
├── position (INT)
└── created_at (TIMESTAMP)

Purpose: Tracks items in processing queues
Relationship: Many-to-One with items table
```

### Match History Table (Tracking)
```sql
match_history
├── id (PRIMARY KEY, AUTO_INCREMENT)
├── lost_item_id (FOREIGN KEY → items.id)
├── found_item_id (FOREIGN KEY → items.id)
├── matched_at (TIMESTAMP)
└── resolved_by (VARCHAR)

Purpose: Records when items are matched and reunited
Future use: Analytics and success tracking
```

---

## API Design

### RESTful Principles

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | /api/items/report-lost | Create lost item | {itemType, description, name, phone} | {success, reportId, matches} |
| POST | /api/items/report-found | Create found item | {itemType, description, name, phone} | {success, reportId, matches} |
| GET | /api/items/search/type/:type | Search by type | None | {success, items[]} |
| GET | /api/items/search/description/:kw | Search by keyword | None | {success, items[]} |
| GET | /api/items/all | Get all pending | None | {success, items[]} |
| GET | /api/items/lost | Get lost only | None | {success, items[]} |
| GET | /api/items/found | Get found only | None | {success, items[]} |
| GET | /api/queue/:type | Get queue items | None | {success, items[]} |
| PUT | /api/items/resolve/:reportId | Mark resolved | None | {success, message} |
| GET | /api/stats | Get statistics | None | {success, stats{}} |

---

## State Management

### Frontend State (React)

```javascript
App.js State:
├── view (string) - current page view
└── stats (object) - real-time statistics

ReportLost/Found State:
├── formData (object) - form inputs
├── message (object) - success/error messages
├── matches (array) - matching items
└── loading (boolean) - submission state

Search State:
├── searchType (string) - 'type' or 'description'
├── searchQuery (string) - user input
├── items (array) - search results
├── loading (boolean) - search state
└── searched (boolean) - has search been performed

ViewAll State:
├── filter (string) - 'all', 'lost', or 'found'
├── items (array) - filtered items
└── loading (boolean) - load state

ProcessQueue State:
├── queueType (string) - 'lost' or 'found'
├── items (array) - queue items
└── loading (boolean) - load state
```

### Backend State

```javascript
Database Connection Pool:
├── Active connections: 10 max
├── Waiting queue
└── Connection timeout handling

Server State:
├── Port: 5000
├── CORS: Enabled
├── JSON Parser: Enabled
└── Environment Variables Loaded
```

---

## Security Architecture

### Input Validation

```javascript
Backend Validation:
├── Required fields check
├── Data type validation
├── Length constraints
└── SQL injection prevention (parameterized queries)

Frontend Validation:
├── Required field enforcement
├── Form validation
├── Character limits
└── Phone number format
```

### Database Security

```sql
Prepared Statements (Preventing SQL Injection):
✅ pool.execute('SELECT * FROM items WHERE id = ?', [id])
❌ query('SELECT * FROM items WHERE id = ' + id)

Connection Security:
├── Environment variables for credentials
├── Connection pooling with timeout
└── Error handling without exposing DB details
```

---

## Performance Optimization

### Database Level
- **Indexes**: item_type, is_found, status, report_id
- **Connection pooling**: Reuse connections
- **Query optimization**: Use EXPLAIN to analyze

### Application Level
- **Async/await**: Non-blocking operations
- **Error handling**: Graceful failures
- **Response compression**: (can be added)

### Frontend Level
- **Component optimization**: React memo, useCallback
- **Lazy loading**: Code splitting (can be added)
- **Asset optimization**: Minification in production

---

## Scalability Considerations

### Horizontal Scaling
```
Load Balancer (Nginx)
    ↓
┌────────┐  ┌────────┐  ┌────────┐
│ API #1 │  │ API #2 │  │ API #3 │
└────────┘  └────────┘  └────────┘
    ↓           ↓           ↓
    └───────────┴───────────┘
                ↓
        MySQL (Master)
                ↓
    ┌───────────┴───────────┐
    ↓                       ↓
MySQL (Slave 1)    MySQL (Slave 2)
```

### Caching Strategy (Future)
```
Browser Cache
    ↓
CDN (Static Assets)
    ↓
Redis Cache (Frequent Queries)
    ↓
Database
```

---

## Deployment Architecture

### Development
```
Localhost:3000 (Frontend)
    ↓
Localhost:5000 (Backend)
    ↓
Localhost:3306 (MySQL)
```

### Production (Recommended)
```
CDN (Static Files)
    ↓
Vercel/Netlify (Frontend)
    ↓
Railway/Heroku (Backend + MySQL)

OR

Single VPS:
Nginx (Reverse Proxy)
    ↓
    ├── :3000 → Frontend (PM2)
    ├── :5000 → Backend (PM2)
    └── :3306 → MySQL
```

---

## Error Handling Flow

```
Error Occurs
    ↓
Caught by try-catch
    ↓
Log error (console.error)
    ↓
Return error response:
{
    success: false,
    error: "User-friendly message"
}
    ↓
Frontend displays alert/message
    ↓
User can retry action
```

---

## Monitoring & Logging

### Current Logging
- Server startup confirmation
- Database connection status
- API request console logs

### Recommended Additions
```javascript
// Request logging
app.use(morgan('combined'));

// Error tracking
// Integrate Sentry or similar

// Performance monitoring
// Add response time tracking

// Database query logging
// Log slow queries for optimization
```

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18.2.0 | UI Framework |
| | Axios | 1.6.2 | HTTP Client |
| | CSS3 | - | Styling |
| **Backend** | Node.js | 16+ | Runtime |
| | Express | 4.18.2 | Web Framework |
| | MySQL2 | 3.6.5 | Database Driver |
| | CORS | 2.8.5 | Cross-origin |
| | Dotenv | 16.3.1 | Config |
| **Database** | MySQL | 8.0+ | Data Storage |
| **DevOps** | PM2 | - | Process Manager |
| | Nginx | - | Reverse Proxy |
| **Version Control** | Git | - | Source Control |

---

## Migration from C to Web

### Data Structure Mapping

| C Implementation | Web Implementation |
|------------------|-------------------|
| `Node* hashtable[SIZE]` | MySQL `items` table with indexes |
| `hashfunc()` | Database indexing on `item_type` |
| `Item* lostqueue[]` | `queue_items` where `queue_type='lost'` |
| `Item* foundqueue[]` | `queue_items` where `queue_type='found'` |
| `insertitem()` | `INSERT INTO items` |
| `search_item_type()` | `SELECT WHERE item_type = ?` |
| `search_by_description()` | `SELECT WHERE description LIKE %?%` |
| `enqueue_lost/found()` | `INSERT INTO queue_items` |
| `remove_by_id()` | `UPDATE items SET status='resolved'` |

### Logic Preservation

✅ **Maintained:**
- Hash-based item organization (via indexed queries)
- Queue-based processing system
- Search functionality (type and description)
- Matching algorithm (find opposite items)
- Report ID generation
- Lost/found differentiation

✅ **Enhanced:**
- Persistent storage (database vs memory)
- Web-based UI (vs terminal)
- Real-time updates
- Multi-user support
- Better data validation
- Scalability

---

This architecture is designed to be:
- **Maintainable**: Clear separation of concerns
- **Scalable**: Can handle growth in users and data
- **Secure**: Input validation and SQL injection prevention
- **Performant**: Indexed queries and connection pooling
- **User-friendly**: Modern, intuitive interface

---

_Architecture designed and implemented: December 12, 2025_

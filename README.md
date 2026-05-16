# College Lost & Found System

A modern, full-stack web application for managing lost and found items in your college. Built with React frontend, Node.js/Express backend, and PostgreSQL database, while preserving the original C code logic.

## Features

- **Report Lost Items** - Students can report items they've lost
- **Report Found Items** - Students can report items they've found
- **Smart Search** - Search by item type or description keywords
- **Automatic Matching** - System suggests potential matches when reporting items
- **View All Items** - Browse all lost and found items with filters
- **User Authentication** - Secure login with roll number and password
- **Self-Resolution** - Users can mark their own items as reunited
- **Statistics Dashboard** - Real-time stats of items and resolutions
- **Persistent Database** - All data stored in PostgreSQL database
- **Dark Mode** - Beautiful dark theme with light mode toggle

## Project Structure

```
SourceCode/
├── backend/                 # Node.js/Express API server
│   ├── server.js           # Main server file with all API endpoints
│   ├── package.json        # Backend dependencies
│   └── .env               # Database configuration
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ReportLost.js
│   │   │   ├── ReportFound.js
│   │   │   ├── Search.js
│   │   │   └── ViewAll.js
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # Styling
│   │   ├── index.js       # Entry point
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   └── package.json       # Frontend dependencies
├── legacy-c-version/      # Original C implementation
│   ├── maincode_simple.c  # Terminal version
│   ├── hashmap.c          # Hash table implementation
│   └── queue.c            # Queue implementation
├── schema.sql             # Database schema
└── schema_update.sql      # User authentication tables
```

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** - [Download PostgreSQL](https://www.postgresql.org/download/) or use Docker
3. **Git** (optional) - [Download](https://git-scm.com/)

### Step 1: Database Setup

1. **Install and start PostgreSQL**
   - If using Docker, run the provided `docker-compose.yml`
   - If using standalone PostgreSQL, ensure the service is running

2. **Create the database**
   
   Open `psql` or a PostgreSQL GUI and run:
   ```sql
   CREATE DATABASE lost_and_found;
   ```
   
   Then execute the schema:
   ```sql
   \i C:/Users/nabha/OneDrive/Desktop/Projects/SourceCode/docker/postgres/init.sql
   ```
   
   Or copy-paste the contents of `docker/postgres/init.sql` into your SQL client.

3. **Verify database creation**
   ```sql
   USE lost_and_found;
   SHOW TABLES;
   ```
   You should see: `items`, `users`, `match_history`
   
   Note: The backend also applies small PostgreSQL migrations on startup.

### Step 2: Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Configure database connection**
   
   Edit `backend/.env` file if needed:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=lost_and_found
   PORT=5000
   ```

4. **Start the backend server**
   ```powershell
   npm start
   ```
   
   You should see:
   ```
   ✓ Database connected successfully
   Server running on port 5000
   API available at http://localhost:5000/api
   ```

### Step 3: Frontend Setup

1. **Open a new terminal** and navigate to frontend directory
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Start the React development server**
   ```powershell
   npm start
   ```
   
   The app will automatically open in your browser at `http://localhost:3000`

## Usage Guide

### For Students

1. **Report a Lost Item**
   - Click "Report Lost" button
   - Select item type and fill in description
   - System will show matching found items if any exist

2. **Report a Found Item**
   - Click "Report Found" button
   - Select item type and describe the item
   - System will show people looking for similar items

3. **Search for Items**
   - Use the Search page to find items by type or keywords
   - View contact information to reach out directly

4. **Browse All Items**
   - View all pending lost and found items
   - Filter by lost or found items only
   - Mark your own items as "Reunited" when resolved

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Items

- `POST /api/items/report-lost` - Report a lost item
- `POST /api/items/report-found` - Report a found item
- `PUT /api/items/resolve/:reportId` - Mark item as reunited (owner only)
- `GET /api/items/search/type/:type` - Search by item type
- `GET /api/items/search/description/:keyword` - Search by description
- `GET /api/items/all` - Get all items
- `GET /api/items/lost` - Get lost items only
- `GET /api/items/found` - Get found items only
- `GET /api/stats` - Get statistics

## Technology Stack

### Frontend
- **React.js** - UI framework
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with gradients and animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### Database
- **MySQL** - Relational database
- Tables: `items`, `users`, `match_history`

## Original C Code Integration

The original C code functionality has been translated to the web application:

| C Code Feature | Web Implementation |
|----------------|-------------------|
| `hashmap.c` hash table | MySQL `items` table with indexes |
| `queue.c` circular queue | MySQL `queue_items` table |
| Search by type | `GET /api/items/search/type/:type` |
| Search by description | `GET /api/items/search/description/:keyword` |
| Report lost/found | `POST /api/items/report-lost/found` |
| Match finding | Automatic matching in API responses |

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check `.env` file has correct credentials
- Ensure `lost_and_found` database exists

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `package.json` or when prompted

### CORS Error
- Ensure backend is running on port 5000
- Check `cors()` is enabled in `server.js`

### Module Not Found
```powershell
# In backend directory
npm install

# In frontend directory
npm install
```

## Future Enhancements

- User authentication and authorization
- Email notifications for matches
- Image upload for items
- Location tracking of where item was found/lost
- Mobile responsive design improvements
- Real-time notifications using WebSockets
- Advanced analytics dashboard
- Multi-language support

## Development

### Running in Development Mode

**Backend with auto-reload:**
```powershell
cd backend
npm run dev
```

**Frontend with hot reload:**
```powershell
cd frontend
npm start
```

### Building for Production

```powershell
cd frontend
npm run build
```

## 📄 License

MIT License - Feel free to use this project for your college!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

For issues or questions, please create an issue in the GitHub repository.

---

**Built with ❤️ for college students**

Made by: Nabhaan
Repository: LostNFound

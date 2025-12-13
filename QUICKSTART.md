# College Lost & Found System - Quick Start Guide

## 🎯 Quick Setup (5 Minutes)

### 1. Install Prerequisites

Download and install:
- **Node.js**: https://nodejs.org/ (Download LTS version)
- **XAMPP**: https://www.apachefriends.org/ (Easiest way to get MySQL)

### 2. Setup Database

1. Start XAMPP Control Panel
2. Start **Apache** and **MySQL** modules
3. Click **Admin** button next to MySQL (opens phpMyAdmin)
4. Click **SQL** tab
5. Copy entire contents of `schema.sql` file
6. Paste and click **Go**
7. Database "lost_and_found" is now created!

### 3. Install Application

**Option A: Using Setup Script (Recommended)**
```powershell
cd C:\Users\nabha\OneDrive\Desktop\Projects\SourceCode
.\setup.bat
```

**Option B: Manual Installation**
```powershell
# Install backend
cd backend
npm install

# Install frontend (in new terminal)
cd frontend
npm install
```

### 4. Configure Database

Edit `backend/.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lost_and_found
PORT=5000
```
(Leave password empty if using XAMPP default settings)

### 5. Start Application

**Option A: Using Start Script (Recommended)**
```powershell
.\start.bat
```

**Option B: Manual Start**
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### 6. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## ✅ Verify Installation

1. Backend terminal should show:
   ```
   ✓ Database connected successfully
   🚀 Server running on port 5000
   ```

2. Frontend should open automatically in browser

3. Try reporting a test item to verify everything works!

## 🆘 Common Issues

**"Cannot connect to database"**
- Make sure XAMPP MySQL is running (green highlight)
- Check password in `.env` file

**"Port 3000 already in use"**
- Close other React apps
- Or type 'Y' when prompted to use different port

**"npm not found"**
- Install Node.js and restart terminal

## 📱 First Time Usage

1. Click **"Report Lost"** button
2. Select "Phone" as item type
3. Fill in test data
4. Submit - you should see success message!
5. Go to **"View All"** to see your item

## 🎓 Ready to Use!

Your college Lost & Found system is now running! 

Share the URL http://localhost:3000 with your friends on the same network, or deploy to a web server for college-wide access.

---

Need help? Check the full README.md for detailed documentation.

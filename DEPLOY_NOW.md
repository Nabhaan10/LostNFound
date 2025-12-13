# 🚀 Complete Deployment Guide

## Choose Your Deployment Method

### ✨ Option 1: Free Cloud (Best for College-Wide Access)
**Cost:** FREE
**Time:** 30 minutes
**Access:** Anywhere via URL

### 🏢 Option 2: College Server/Network
**Cost:** FREE
**Time:** 20 minutes  
**Access:** Within college network only

### 💻 Option 3: VPS (Most Professional)
**Cost:** $5-10/month
**Time:** 1 hour
**Access:** Anywhere via custom domain

---

## 🌟 RECOMMENDED: Free Cloud Deployment

### Step 1: Install Dependencies (5 min)

```powershell
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### Step 2: Deploy Backend to Railway (10 min)

1. **Sign up:** Go to https://railway.app/
2. **Create New Project** → **Deploy MySQL**
3. Note MySQL credentials
4. **New Service** → **Deploy from GitHub**
5. Connect your repo: `Nabhaan10/LostNFound`
6. Select `backend` as root directory
7. Add environment variables:
   ```
   DB_HOST=<railway-mysql-host>
   DB_USER=root
   DB_PASSWORD=<railway-mysql-password>
   DB_NAME=lost_and_found
   PORT=5000
   ```
8. Deploy!
9. Get your backend URL (e.g., `https://lostandfound-production.up.railway.app`)

### Step 3: Import Database to Railway (5 min)

Railway gives you a MySQL database. Import your schema:

1. In Railway, click MySQL service
2. Click "Connect"
3. Copy connection command
4. Run locally:
   ```powershell
   mysql -h <railway-host> -u root -p<password> lost_and_found < schema.sql
   ```

### Step 4: Deploy Frontend to Vercel (10 min)

1. **Sign up:** Go to https://vercel.com/
2. **Import Project** from GitHub
3. Select `frontend` directory
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy!

### Step 5: Update Frontend API URL

Before deploying frontend, update App.js:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Step 6: Test Your Deployed App

Access at: `https://your-app.vercel.app`

---

## 🏢 Option 2: Deploy on College Network

### Requirements
- College server with Windows/Linux
- Node.js installed
- MySQL installed
- Static IP on college network

### Deployment Steps

1. **Clone project to college server:**
   ```bash
   git clone https://github.com/Nabhaan10/LostNFound.git
   cd LostNFound
   ```

2. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Setup database:**
   ```bash
   mysql -u root -p < schema.sql
   ```

4. **Configure backend .env:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=lost_and_found
   PORT=5000
   ```

5. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

6. **Install PM2 (process manager):**
   ```bash
   npm install -g pm2
   ```

7. **Start backend:**
   ```bash
   cd backend
   pm2 start server.js --name lostandfound-api
   ```

8. **Serve frontend:**
   ```bash
   npm install -g serve
   cd ../frontend
   pm2 serve build 3000 --name lostandfound-web --spa
   ```

9. **Configure firewall (Windows):**
   ```powershell
   New-NetFirewallRule -DisplayName "Lost and Found" -Direction Inbound -LocalPort 3000,5000 -Protocol TCP -Action Allow
   ```

10. **Access on college network:**
    - Get server IP: `ipconfig` (Windows) or `ip addr` (Linux)
    - Access at: `http://<server-ip>:3000`
    - Share this URL with students

### Make it Auto-start on Boot

```bash
pm2 startup
pm2 save
```

---

## 💻 Option 3: VPS Deployment (DigitalOcean/AWS)

### Step 1: Get a VPS
- DigitalOcean: $6/month
- AWS Lightsail: $5/month
- Vultr: $6/month

### Step 2: Setup Server

```bash
# SSH into server
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Step 3: Deploy Application

```bash
# Clone repo
git clone https://github.com/Nabhaan10/LostNFound.git
cd LostNFound

# Backend
cd backend
npm install
pm2 start server.js --name api

# Frontend
cd ../frontend
npm install
npm run build
pm2 serve build 3000 --name web --spa
```

### Step 4: Setup Nginx

```bash
sudo nano /etc/nginx/sites-available/lostandfound
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/lostandfound /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## 🎯 Quick Start: College Network Deployment

**Easiest for immediate college use:**

```powershell
# On college server
cd C:\LostNFound

# Install
.\setup.bat

# Start (will run in background)
npm install -g pm2
cd backend
pm2 start server.js
cd ../frontend
pm2 serve build 3000 --spa

# Get server IP
ipconfig

# Share this URL: http://<IP>:3000
```

---

## 🔧 Before Deploying - Checklist

- [ ] Run `setup.bat` to install dependencies
- [ ] Test locally at localhost:3000
- [ ] Push code to GitHub
- [ ] Prepare database credentials
- [ ] Choose deployment platform
- [ ] Update API URLs in code

---

## 🆘 Need Help?

**For Railway deployment:**
- Docs: https://docs.railway.app/

**For Vercel deployment:**
- Docs: https://vercel.com/docs

**For college network:**
- Check DEPLOYMENT.md in your project

---

Which option would you like to proceed with?

1. **Free Cloud** (Railway + Vercel) - Accessible anywhere
2. **College Network** - Quick local deployment
3. **VPS** - Professional with custom domain

Let me know and I'll guide you through the specific steps!

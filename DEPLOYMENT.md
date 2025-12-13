# 🚀 Deployment Guide

## Deploy to Production

### Option 1: Deploy to Vercel (Frontend) + Railway (Backend + Database)

#### Backend Deployment (Railway)

1. **Sign up at Railway**: https://railway.app/
2. Click **"New Project"** → **"Deploy MySQL"**
3. Note down database credentials
4. Click **"New"** → **"Empty Service"**
5. Connect your GitHub repository
6. Set environment variables:
   ```
   DB_HOST=<railway-mysql-host>
   DB_USER=root
   DB_PASSWORD=<railway-mysql-password>
   DB_NAME=lost_and_found
   PORT=5000
   ```
7. Railway will auto-deploy!
8. Get your backend URL (e.g., `https://your-app.railway.app`)

#### Frontend Deployment (Vercel)

1. **Sign up at Vercel**: https://vercel.com/
2. Import your GitHub repository
3. Select **frontend** directory as root
4. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy!

Update `frontend/src/App.js`:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

---

### Option 2: Deploy to Single VPS (DigitalOcean, AWS, etc.)

#### 1. Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Setup MySQL

```bash
sudo mysql -u root -p

# In MySQL prompt:
CREATE DATABASE lost_and_found;
CREATE USER 'lostfound'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON lost_and_found.* TO 'lostfound'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u lostfound -p lost_and_found < schema.sql
```

#### 3. Deploy Backend

```bash
# Clone your repository
git clone https://github.com/Nabhaan10/LostNFound.git
cd LostNFound/backend

# Install dependencies
npm install

# Create production .env
nano .env
# Add:
DB_HOST=localhost
DB_USER=lostfound
DB_PASSWORD=your_secure_password
DB_NAME=lost_and_found
PORT=5000

# Start with PM2
pm2 start server.js --name lostandfound-api
pm2 save
pm2 startup
```

#### 4. Deploy Frontend

```bash
cd ../frontend

# Build for production
npm install
npm run build

# Install serve
sudo npm install -g serve

# Serve with PM2
pm2 serve build 3000 --name lostandfound-web --spa
pm2 save
```

#### 5. Setup Nginx Reverse Proxy

```bash
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/lostandfound

# Add:
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/lostandfound /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

### Option 3: Deploy on Local College Network

#### Requirements
- Windows/Linux server with static IP
- Node.js and MySQL installed

#### Setup

1. **Install and run as shown in QUICKSTART.md**

2. **Make accessible on network:**
   
   Update `backend/server.js`:
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {
       console.log(`Server running on http://0.0.0.0:${PORT}`);
   });
   ```

3. **Update frontend API URL** in `frontend/src/App.js`:
   ```javascript
   const API_URL = 'http://192.168.1.100:5000/api'; // Your server IP
   ```

4. **Configure Windows Firewall:**
   ```powershell
   # Allow ports 3000 and 5000
   New-NetFirewallRule -DisplayName "Lost and Found Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Lost and Found Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

5. **Access from any device on network:**
   - Frontend: `http://192.168.1.100:3000`
   - Backend: `http://192.168.1.100:5000`

---

## Production Best Practices

### Security

1. **Use environment variables** - Never commit `.env` files
2. **Enable HTTPS** - Use SSL certificates
3. **Add authentication** - Implement JWT tokens for staff areas
4. **Rate limiting** - Prevent API abuse
5. **Input validation** - Sanitize all user inputs
6. **SQL injection protection** - Use parameterized queries (already implemented)

### Performance

1. **Database indexes** - Already added in schema.sql
2. **Caching** - Implement Redis for frequently accessed data
3. **CDN** - Use CDN for static assets
4. **Compression** - Enable gzip compression
5. **Database connection pooling** - Already implemented

### Monitoring

```bash
# Install monitoring tools
npm install --save express-rate-limit helmet compression morgan

# Add to server.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

app.use(helmet());
app.use(compression());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));
```

---

## Backup Strategy

### Automated MySQL Backup

```bash
# Create backup script
nano /home/backup-db.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u lostfound -p'password' lost_and_found > /home/backups/lostandfound_$DATE.sql
find /home/backups -name "lostandfound_*.sql" -mtime +7 -delete

# Make executable
chmod +x /home/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /home/backup-db.sh
```

---

## Scaling

### For High Traffic

1. **Load Balancer** - Use Nginx for load balancing multiple backend instances
2. **Database Replication** - Setup MySQL master-slave replication
3. **Caching Layer** - Implement Redis
4. **Message Queue** - Use RabbitMQ for async tasks
5. **Microservices** - Split into separate services if needed

---

## Support & Maintenance

- Monitor error logs regularly
- Keep dependencies updated
- Regular database backups
- Performance monitoring with PM2 or similar tools
- User feedback collection

---

Need help with deployment? Create an issue on GitHub!

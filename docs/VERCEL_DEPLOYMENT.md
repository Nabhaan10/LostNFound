# Vercel Deployment Guide for Lost and Found

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub (recommended for continuous deployment)
3. **Database Hosting**: Vercel doesn't provide MySQL hosting. You need an external database service.

## Database Hosting Options

Since Vercel is serverless, you need a hosted MySQL database. Choose one:

### Recommended Options:

1. **PlanetScale** (Free tier available)
   - Visit: https://planetscale.com
   - MySQL-compatible, serverless
   - Free tier: 5GB storage, 1 billion row reads/month

2. **Railway** (Free tier available)
   - Visit: https://railway.app
   - Provides MySQL with generous free tier
   - Easy setup

3. **AWS RDS** (Paid, but reliable)
   - Visit: https://aws.amazon.com/rds/
   - Production-ready MySQL hosting

4. **Aiven** (Free tier available)
   - Visit: https://aiven.io
   - Managed MySQL service

## Deployment Steps

### Step 1: Set Up Your Database

1. Choose a database provider from above
2. Create a new MySQL database instance
3. Run the schema SQL file to create tables:
   ```sql
   -- Use the contents of schema.sql
   ```
4. Note your database connection details:
   - Host
   - Username
   - Password
   - Database name
   - Port (usually 3306)

### Step 2: Prepare Environment Variables

You'll need these environment variables in Vercel:

```
DB_HOST=your-database-host.com
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=lost_and_found
PORT=5000
NODE_ENV=production
```

### Step 3: Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**:
   - In the Vercel dashboard, go to Settings > Environment Variables
   - Add all the environment variables listed above
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll get a live URL like `https://your-project.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Add Environment Variables**:
   ```bash
   vercel env add DB_HOST
   vercel env add DB_USER
   vercel env add DB_PASSWORD
   vercel env add DB_NAME
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Step 4: Update API URLs in Frontend

If your frontend has hardcoded API URLs, update them to use the Vercel domain:

In your React components, the API calls should use relative URLs (already configured):
```javascript
// This works automatically on Vercel
axios.get('/api/items/all')
```

Or use environment variables:
```javascript
const API_URL = process.env.REACT_APP_API_URL || '/api';
```

## Important Configuration Notes

### File Uploads on Vercel

⚠️ **Important**: Vercel's serverless functions have a temporary filesystem. Uploaded files won't persist.

**Solutions**:

1. **Use Cloud Storage** (Recommended):
   - AWS S3
   - Cloudinary
   - UploadCare
   - Vercel Blob Storage

2. **Quick Fix for Testing**: 
   - Store images as base64 in database (not recommended for production)

### Example: Using Vercel Blob Storage

Install the package:
```bash
cd backend
npm install @vercel/blob
```

Update file upload logic to use Vercel Blob instead of local storage.

## Post-Deployment

### 1. Test Your Deployment

Visit your Vercel URL and test:
- User registration and login
- Creating lost/found reports
- Searching items
- Image uploads (if configured with cloud storage)

### 2. Set Up Custom Domain (Optional)

1. Go to Vercel Dashboard > Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

### 3. Monitor Your Application

- **Vercel Analytics**: Enable in dashboard for performance monitoring
- **Logs**: Check function logs in Vercel dashboard for errors
- **Database**: Monitor your database usage and connection limits

## Troubleshooting

### Common Issues:

1. **Database Connection Fails**:
   - Check if database allows connections from all IPs (0.0.0.0/0)
   - Verify environment variables are set correctly in Vercel
   - Ensure database service is running

2. **API Routes Return 404**:
   - Check `vercel.json` routing configuration
   - Ensure `api/index.js` exists and exports the app correctly

3. **Image Uploads Don't Work**:
   - Expected on Vercel without cloud storage
   - Implement cloud storage solution (see above)

4. **Build Fails**:
   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

### Getting Help:

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: support@vercel.com
- Community Discord: https://vercel.com/discord

## Environment Variables Reference

Required variables for production:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host URL | `mysql-abc.railway.app` |
| `DB_USER` | Database username | `root` or `admin` |
| `DB_PASSWORD` | Database password | `your-secure-password` |
| `DB_NAME` | Database name | `lost_and_found` |
| `PORT` | Server port (optional) | `5000` |
| `NODE_ENV` | Environment | `production` |

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment to production
- Pull requests create preview deployments
- Vercel provides unique URLs for each deployment

## Cost Considerations

- **Vercel**: Free tier includes:
  - 100GB bandwidth
  - Unlimited websites
  - Serverless function execution
  
- **Database**: Choose based on your usage
  - PlanetScale/Railway free tiers are generous for small projects
  - Monitor usage to avoid unexpected costs

## Next Steps

After successful deployment:

1. ✅ Test all functionality
2. ✅ Set up cloud storage for images
3. ✅ Configure custom domain (optional)
4. ✅ Enable analytics and monitoring
5. ✅ Set up database backups
6. ✅ Share your live URL!

---

**Your application is now live on Vercel! 🚀**

For questions or issues, refer to the troubleshooting section or Vercel's documentation.

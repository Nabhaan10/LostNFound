# 🚀 Quick Start: Image Upload Feature

## Step 1: Update Database (Required!)
```bash
# Run this command in your terminal:
mysql -u root -p lost_and_found < schema_image_update.sql
```

**Or** manually execute in MySQL:
```sql
USE lost_and_found;
ALTER TABLE items ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER description;
```

## Step 2: Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## Step 3: Test It Out! 🎉

1. Go to **Report Lost** or **Report Found**
2. Fill in the details
3. Click "Choose File" to select an image
4. See the preview appear
5. Submit the form
6. View your item with the image in Search or View All!

## That's It! ✨

Your Lost & Found app now supports image uploads!

### Features:
- 📸 Upload images (optional)
- 👁️ Preview before submitting
- 🔍 View images in search results
- 📱 Works on mobile devices
- 💾 Images saved locally in `backend/uploads/`

### Notes:
- Images are **optional** - forms work without them
- Maximum size: **5MB**
- Supported formats: **JPG, PNG, GIF, WebP**
- Old items still work fine!

### Need More Info?
See [IMAGE_UPLOAD_GUIDE.md](IMAGE_UPLOAD_GUIDE.md) for complete documentation.

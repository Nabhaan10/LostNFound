# Image Upload Feature - Setup & Usage Guide

## 🎉 New Feature Added: Image Upload for Lost & Found Items

Users can now upload images of lost/found items to help with identification and make searching easier!

## 📋 Setup Instructions

### 1. Update Database Schema

Run the SQL script to add the `image_url` column to your items table:

```bash
mysql -u root -p lost_and_found < schema_image_update.sql
```

Or manually run:
```sql
USE lost_and_found;
ALTER TABLE items ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER description;
```

### 2. Install Backend Dependencies

The `multer` package has already been installed. If you need to reinstall:

```bash
cd backend
npm install
```

### 3. Uploads Directory

The backend automatically creates an `uploads/` directory when it starts. Images will be stored in:
```
backend/uploads/
```

### 4. Start the Application

```bash
# Backend
cd backend
npm start

# Frontend (in a new terminal)
cd frontend
npm start
```

## 🚀 Features

### User Experience:
- ✅ **Optional Image Upload** - Users can attach images when reporting lost or found items
- ✅ **Image Preview** - See uploaded image before submitting
- ✅ **File Size Limit** - 5MB maximum per image
- ✅ **Supported Formats** - JPEG, JPG, PNG, GIF, WebP
- ✅ **Image Display** - All uploaded images are displayed in:
  - Search results
  - View all items
  - Matching items suggestions

### Technical Implementation:
- **Backend**: Uses Multer middleware for file upload handling
- **Storage**: Images stored in `backend/uploads/` directory
- **Database**: Image paths stored as `/uploads/filename.jpg` in `image_url` column
- **Frontend**: FormData used for multipart file uploads
- **Security**: File type validation and size limits enforced

## 📸 How to Use

### Reporting Items with Images:

1. **Report Lost/Found Item**
   - Fill in the item details (type, description, contact info)
   - Click "Choose File" to select an image
   - Preview the image before submitting
   - Submit the form

2. **Searching Items**
   - Search results now display images if available
   - Images help identify items more accurately
   - Contact information remains visible

3. **View All Items**
   - Browse all items with their images
   - Filter by Lost/Found status
   - Images displayed prominently in item cards

## 🔒 Security & Validation

- **File Type Validation**: Only image files allowed (jpeg, jpg, png, gif, webp)
- **File Size Limit**: 5MB maximum per image
- **Unique Filenames**: Timestamp + random string to prevent conflicts
- **Error Handling**: Proper error messages for invalid uploads

## 📁 File Structure

```
backend/
├── server.js (Updated with multer configuration)
├── uploads/ (Auto-created directory for images)
└── package.json (Added multer dependency)

frontend/
└── src/
    └── components/
        ├── ReportLost.js (Updated with image upload)
        ├── ReportFound.js (Updated with image upload)
        ├── Search.js (Updated to display images)
        └── ViewAll.js (Updated to display images)
```

## 🔧 Configuration

### Change Upload Limits (backend/server.js):

```javascript
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Change size limit here (currently 5MB)
    },
    fileFilter: (req, file, cb) => {
        // Add or remove allowed file types here
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        // ...
    }
});
```

### Change Image Display Size (Components):

In Search.js, ViewAll.js, ReportLost.js, ReportFound.js:
```javascript
style={{
    width: '100%',
    maxHeight: '200px', // Change display height here
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #ddd'
}}
```

## 🐛 Troubleshooting

### Images not uploading?
- Check if `backend/uploads/` directory exists
- Verify file size is under 5MB
- Ensure file type is supported (jpg, png, gif, webp)

### Images not displaying?
- Verify backend is serving static files: `app.use('/uploads', express.static(uploadsDir))`
- Check if image URL is correct in database
- Ensure backend server is running

### Database error?
- Make sure you've run the schema update script
- Verify `image_url` column exists in items table

## 📊 Database Schema

New column added to `items` table:
```sql
image_url VARCHAR(255) DEFAULT NULL
```

This stores the relative path to the uploaded image, e.g., `/uploads/1234567890-123456789.jpg`

## 🎯 Future Enhancements

Possible improvements for the future:
- [ ] Multiple images per item
- [ ] Image compression for faster loading
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Image thumbnails for list views
- [ ] Image editing/cropping before upload
- [ ] Image search/matching using AI

## ✅ Testing Checklist

- [x] Upload image when reporting lost item
- [x] Upload image when reporting found item
- [x] View image in search results
- [x] View image in view all page
- [x] View images in matching suggestions
- [x] File size validation works
- [x] File type validation works
- [x] Images persist after server restart
- [x] Forms work without images (optional field)

## 📝 Notes

- Images are **optional** - users can still submit items without images
- Old items (without images) will continue to work normally
- Images are stored locally in the backend/uploads directory
- For production deployment, consider using cloud storage (S3, Cloudinary, etc.)

---

**Feature developed on:** January 25, 2026
**Version:** 1.1.0

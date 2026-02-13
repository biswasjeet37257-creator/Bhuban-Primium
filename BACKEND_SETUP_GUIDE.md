# Backend Setup & Video Fix Guide

## 🔍 Analysis Complete

### Current Status:
- ✅ Backend code is properly structured
- ✅ MongoDB is running (mongod.exe detected)
- ✅ 3 video files exist in `backend/uploads/`
- ❌ Database is empty (0 videos)
- ❌ Backend server is not running
- ❌ Video "jeet" not registered in database

### Root Cause:
The video files were uploaded to the `uploads` folder but never registered in the MongoDB database. This happens when:
1. The backend server wasn't running during upload
2. The upload failed silently
3. Files were manually copied to uploads folder

## 🎯 Solution Path: MIGRATE EXISTING FILES

This is the BEST approach because:
- ✅ Preserves existing video files
- ✅ No need to re-upload
- ✅ Fixes database sync issue
- ✅ Quick and automated

## 📋 Step-by-Step Fix

### Step 1: Migrate Existing Videos to Database
```bash
cd backend
node migrate-videos.js
```

This will:
- Connect to MongoDB
- Scan all video files in `uploads/` folder
- Create database entries for each video
- Link them to the default user
- Show you a summary of migrated videos

### Step 2: Start the Backend Server
```bash
node start-server.js
```
OR
```bash
npm start
```

The server will start on http://localhost:5000

### Step 3: Verify Videos Appear
1. Open `index.html` in your browser
2. All 3 videos should now appear in the grid
3. Click on any video to play it
4. The "jeet" video should be playable

### Step 4: Test Upload (Optional)
1. Open `creator-studio.html`
2. Upload a new test video
3. Verify it appears in the home feed
4. Verify it plays correctly

## 🛠️ Alternative: Fresh Start (if migration fails)

If migration doesn't work, you can start fresh:

```bash
# 1. Clear database
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bhuban').then(() => { mongoose.connection.db.dropDatabase().then(() => { console.log('Database cleared'); process.exit(0); }); });"

# 2. Delete old uploads
rm -rf uploads/*

# 3. Start server
npm start

# 4. Re-upload videos through the web interface
```

## 📊 Verification Commands

### Check if MongoDB is running:
```bash
tasklist | findstr mongod
```

### Check videos in database:
```bash
node check-videos.js
```

### Test API endpoint:
```bash
curl http://localhost:5000/api/videos
```

### Check uploaded files:
```bash
dir uploads
```

## 🔧 Backend Architecture

```
backend/
├── server.js              # Main server (Express + CORS + Routes)
├── config/
│   └── db.js             # MongoDB connection
├── models/
│   ├── User.js           # User schema
│   └── Video.js          # Video schema
├── controllers/
│   ├── auth.js           # Authentication logic
│   ├── videos.js         # Video CRUD + streaming
│   └── ai.js             # AI assistant
├── routes/
│   ├── auth.js           # Auth endpoints
│   ├── videos.js         # Video endpoints
│   └── ai.js             # AI endpoints
├── middleware/
│   ├── auth.js           # JWT authentication
│   ├── async.js          # Async handler
│   └── upload.js         # Multer file upload
└── uploads/              # Video storage
```

## 🎬 Video Flow

### Upload Flow:
1. User selects video in `creator-studio.html`
2. FormData sent to `POST /api/videos`
3. Multer saves file to `uploads/` folder
4. Controller creates database entry
5. Returns video object with ID

### Playback Flow:
1. Frontend fetches `GET /api/videos`
2. Displays video cards with thumbnails
3. User clicks video
4. Video player loads from `/uploads/[filename]`
5. Supports streaming with range requests

## 🐛 Common Issues

### "Cannot connect to MongoDB"
- Start MongoDB: `net start MongoDB` (Windows)
- Check if running: `tasklist | findstr mongod`

### "Video not found"
- Run migration script
- Check if file exists in uploads folder
- Verify database has entry

### "CORS error"
- Restart backend server
- Check CORS config in server.js
- Clear browser cache

### "Upload fails"
- Check file size (max 500MB)
- Verify file format (MP4, MOV, etc.)
- Check backend logs for errors

## 📝 Next Steps After Fix

1. ✅ Verify all 3 videos play correctly
2. ✅ Test uploading a new video
3. ✅ Test video deletion
4. ✅ Test video streaming (seek/pause)
5. ✅ Check mobile responsiveness

## 🎉 Success Indicators

You'll know it's working when:
- Backend starts without errors
- `http://localhost:5000/api/videos` returns JSON with videos
- Videos appear in the home feed
- Videos play when clicked
- Upload works from creator studio

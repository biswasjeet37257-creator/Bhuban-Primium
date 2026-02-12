# 🚀 BHUBAN V19.0 - PHASE B BACKEND SETUP GUIDE

## 📋 **OVERVIEW**

Phase B adds real backend functionality to your Bhuban platform:
- Real-time weather API
- Google/Apple OAuth authentication
- Video transcoding & storage
- Screen sharing (WebRTC)
- MongoDB database
- Cloud file storage
- Real AI integration (OpenAI/Gemini)

---

## 🛠️ **PREREQUISITES**

### Required Software:
1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) OR use MongoDB Atlas (cloud)
3. **Git** - [Download](https://git-scm.com/)
4. **Code Editor** - VS Code recommended

### Required Accounts (Free Tiers Available):
1. **Google Cloud Console** - OAuth & APIs
2. **OpenWeatherMap** - Weather API
3. **OpenAI** OR **Google AI Studio** - AI integration
4. **Cloudinary** OR **AWS S3** - Video storage
5. **MongoDB Atlas** - Cloud database (optional)

---

## 📦 **STEP 1: INITIALIZE BACKEND**

### 1.1 Create Backend Folder
```bash
cd "c:\Users\h\Desktop\Bhuban UI"
mkdir backend
cd backend
```

### 1.2 Initialize Node.js Project
```bash
npm init -y
```

### 1.3 Install Dependencies
```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
npm install passport passport-google-oauth20 passport-apple
npm install multer cloudinary openai axios socket.io
npm install nodemon --save-dev
```

---

## 🔐 **STEP 2: ENVIRONMENT SETUP**

### 2.1 Create `.env` File
Create `backend/.env`:
```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/bhuban
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhuban

# JWT Secret
JWT_SECRET=your_super_secret_key_change_this_in_production

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Apple OAuth
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY_PATH=./AuthKey_XXXXX.p8

# Weather API
OPENWEATHER_API_KEY=your_openweathermap_api_key

# AI Integration (Choose one)
OPENAI_API_KEY=your_openai_api_key
# OR
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Cloudinary (Video Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 🌐 **STEP 3: GET API KEYS**

### 3.1 Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Bhuban"
3. Enable APIs: "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env`

### 3.2 Weather API Setup
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Go to "API Keys" tab
4. Copy your API key to `.env`

### 3.3 OpenAI API Setup (For Advanced AI)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account
3. Go to "API Keys"
4. Create new secret key
5. Copy to `.env`

**OR use Google AI Studio:**
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Get API key
3. Copy to `.env`

### 3.4 Cloudinary Setup (Video Storage)
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Dashboard shows: Cloud Name, API Key, API Secret
4. Copy all three to `.env`

---

## 💾 **STEP 4: DATABASE SETUP**

### Option A: Local MongoDB
```bash
# Install MongoDB Community Server
# Start MongoDB service
mongod --dbpath "C:\data\db"
```

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get connection string
6. Update `MONGODB_URI` in `.env`

---

## 📁 **STEP 5: BACKEND FILE STRUCTURE**

I'll create the starter files for you. Your structure will be:

```
backend/
├── .env
├── package.json
├── server.js
├── config/
│   ├── db.js
│   └── passport.js
├── models/
│   ├── User.js
│   ├── Video.js
│   └── Comment.js
├── routes/
│   ├── auth.js
│   ├── videos.js
│   ├── weather.js
│   └── ai.js
├── middleware/
│   └── auth.js
└── uploads/
```

---

## 🚀 **STEP 6: RUN BACKEND**

### 6.1 Update `package.json` Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 6.2 Start Server
```bash
npm run dev
```

Server will run on: `http://localhost:5000`

---

## 🔗 **STEP 7: CONNECT FRONTEND**

### 7.1 Update Frontend API Calls
In your HTML files, replace localStorage with API calls:

```javascript
// Before (localStorage)
const videos = JSON.parse(localStorage.getItem('bhuban_uploads') || '[]');

// After (API)
const response = await fetch('http://localhost:5000/api/videos');
const videos = await response.json();
```

### 7.2 Enable CORS
Already configured in backend server.js

---

## 📱 **STEP 8: ADVANCED FEATURES**

### 8.1 Real-Time Weather
```javascript
// In ai-assistant.html, replace simulated weather:
async function getWeather() {
  const response = await fetch('http://localhost:5000/api/weather?city=YourCity');
  const data = await response.json();
  return data.weather;
}
```

### 8.2 OAuth Login
```javascript
// Add login button in index.html:
function loginWithGoogle() {
  window.location.href = 'http://localhost:5000/auth/google';
}
```

### 8.3 Video Upload with Transcoding
```javascript
// In creator-studio.html:
async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('video', file);
  
  const response = await fetch('http://localhost:5000/api/videos/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });
  
  return await response.json();
}
```

---

## 🎯 **STEP 9: TESTING**

### 9.1 Test Weather API
```bash
curl http://localhost:5000/api/weather?city=London
```

### 9.2 Test OAuth
Navigate to: `http://localhost:5000/auth/google`

### 9.3 Test Video Upload
Use Postman or frontend upload form

---

## 🔒 **STEP 10: SECURITY**

### Production Checklist:
- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS (use Let's Encrypt)
- [ ] Set up rate limiting
- [ ] Add input validation
- [ ] Enable MongoDB authentication
- [ ] Use environment-specific configs
- [ ] Add logging (Winston/Morgan)
- [ ] Set up monitoring (PM2)

---

## 📊 **DEPLOYMENT OPTIONS**

### Option 1: Vercel (Frontend) + Railway (Backend)
- Frontend: Deploy to Vercel
- Backend: Deploy to Railway
- Database: MongoDB Atlas

### Option 2: AWS
- Frontend: S3 + CloudFront
- Backend: EC2 or Lambda
- Database: DocumentDB or Atlas

### Option 3: DigitalOcean
- Droplet for both frontend + backend
- Managed MongoDB

---

## 🆘 **TROUBLESHOOTING**

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
net start MongoDB
```

### Port Already in Use
```bash
# Change PORT in .env to 5001 or 8000
PORT=5001
```

### CORS Errors
```javascript
// Ensure backend has CORS enabled
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 📚 **NEXT STEPS**

1. ✅ Install Node.js and MongoDB
2. ✅ Get all API keys
3. ✅ Run backend setup commands
4. ✅ Test each API endpoint
5. ✅ Connect frontend to backend
6. ✅ Deploy to production

---

## 💡 **QUICK START COMMANDS**

```bash
# 1. Navigate to project
cd "c:\Users\h\Desktop\Bhuban UI"

# 2. Create backend
mkdir backend
cd backend

# 3. Initialize
npm init -y

# 4. Install dependencies
npm install express mongoose dotenv cors bcryptjs jsonwebtoken passport passport-google-oauth20 multer cloudinary openai axios socket.io

# 5. Create .env file (copy from above)

# 6. Run server (after I create the files)
npm run dev
```

---

**Ready to proceed?** I'll now create all the backend starter files for you!

Type **"create backend files"** and I'll generate:
- server.js
- Database config
- User/Video models
- Auth routes
- API routes
- Middleware

This will give you a fully functional backend to start with! 🚀

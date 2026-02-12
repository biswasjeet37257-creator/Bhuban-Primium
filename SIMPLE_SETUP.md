# 🛠️ SIMPLE SETUP GUIDE (100% FREE)

You only need to download 2 programs. The rest is just copy-pasting commands.

## 1️⃣ DOWNLOAD & INSTALL

### 1. Node.js (The Engine)
- **Download:** [https://nodejs.org/](https://nodejs.org/) (Select "LTS" version)
- **Install:** Run the installer and click Next > Next > Finish.

### 2. MongoDB (The Database)
- **Download:** [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Install:** Run the installer.
- **IMPORTANT:** On the "Service Configuration" screen, keep everything default.
- **CRITICAL:** Check the box **"Install MongoDB Compass"**.

---

## 2️⃣ CONFIGURE (One-Time Setup)

### 1. Create your Environment File
1. Go to your `backend` folder.
2. Create a new file named `.env`.
3. Paste this exact text into it:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bhuban
JWT_SECRET=bhuban_secret_key_123
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Get your free key here: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=PASTE_YOUR_GEMINI_KEY_HERE
```

### 2. Install Project Tools
Open your terminal (Command Prompt) inside the `backend` folder and run:
```bash
npm install
```

---

## 3️⃣ RUN THE SERVER

Every time you want to work on your app, just run:
```bash
npm run dev
```

That's it! Your backend is now running on `http://localhost:5000`.

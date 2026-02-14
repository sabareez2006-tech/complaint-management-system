# 🚀 Deployment Guide: Netlify (Frontend) & Render (Backend)

Since you have a separate **Frontend (React)** and **Backend (Node/Express)**, the best approach is to host them separately but connect them.

## 📦 Phase 1: Push Code to GitHub
Ensure your code is on GitHub.
1. Create a repository on GitHub.
2. Push your `complaint-system` folder to it.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
   *(If you already have it on GitHub, skip this).*

---

## 🗄️ Phase 2: Deploy Database & Backend (Render)

### 1. Create Database (PostgreSQL)
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **PostgreSQL**.
3. Name it `complaint-db`.
4. Pick the **Free** tier.
5. Click **Create Database**.
6. **Copy the "Internal Connection String"** (for later) and **"External Connection String"** (if you want to connect from your computer).

### 2. Deploy Backend (Node.js)
1. On Render, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. **Settings:**
   - **Name:** `complaint-server`
   - **Root Directory:** `server` (Important!)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. **Environment Variables** (Scroll down to "Advanced"):
   - `DB_HOST`: *(From your Render DB details - usually the hostname part of the internal connection string)*
   - `DB_USER`: *(Render DB user)*
   - `DB_PASSWORD`: *(Render DB password)*
   - `DB_NAME`: *(Render DB name)*
   - `DB_PORT`: `5432`
   - **OR easiest method:** Add a single variable `DATABASE_URL` and paste the **Internal Connection String** (if your code supports it, otherwise stick to individual variables). *Note: Your current code uses individual variables (`DB_HOST`, etc.).*
5. Click **Create Web Service**.
6. **Wait for deployment.** Once it says "Live", copy the URL (e.g., `https://complaint-server.onrender.com`).

---

## 🌐 Phase 3: Deploy Frontend (Netlify)

1. Go to [Netlify](https://app.netlify.com/).
2. Click **Add new site** -> **Import from Git**.
3. Select your GitHub repository.
4. **Settings:**
   - **Base directory:** `client` (Important!)
   - **Build command:** `ci=npm run build`
   - **Publish directory:** `client/build`
5. **Environment Variables** (Click "Show advanced" or go to Site Settings later):
   - Key: `REACT_APP_API_URL`
   - Value: `https://YOUR-RENDER-BACKEND-URL.onrender.com/api` (Paste the URL from Phase 2).
6. Click **Deploy Site**.

---

## 📱 Phase 4: Convert Website to App (Flutter)

Once your backend is live on Render:

1. Open `complaint_app/lib/services/api_service.dart`.
2. Update the `baseUrl` to your new **Render Backend URL**:
   ```dart
   static const String baseUrl = 'https://YOUR-RENDER-BACKEND-URL.onrender.com/api';
   ```
3. **Generate the App:**
   - **For Android (APK):**
     ```bash
     cd complaint_app
     flutter build apk --release
     ```
     *Output: `build/app/outputs/flutter-apk/app-release.apk` (Send this to your phone!).*

   - **For iOS (IPA):** (Requires Mac with Xcode)
     ```bash
     cd complaint_app
     flutter build ios --release
     ```
     *(Then Archive & Export via Xcode).*

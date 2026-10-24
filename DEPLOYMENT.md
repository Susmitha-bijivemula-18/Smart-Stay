# 🚀 StayNest Production Deployment Guide (Vercel + Render)

Complete, zero-error step-by-step guide to deploying **StayNest** across cloud platforms:
- **Frontend**: [Vercel](https://vercel.com) (React 19 + Vite 7 SPA)
- **Backend**: [Render](https://render.com) (Spring Boot 3.2 + Java 17 + Supabase Cloud PostgreSQL)
- **AI Engine**: [Render](https://render.com) (Python 3.10 + Flask + Gunicorn)

---

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#-pre-deployment-checklist)
2. [Order of Deployment (Important!)](#-order-of-deployment-important)
3. [Step 0: Push Latest Code to GitHub](#-step-0-push-latest-code-to-github)
4. [Step 1: Deploy Python AI Service on Render](#-step-1-deploy-python-ai-service-on-render)
5. [Step 2: Deploy Spring Boot Backend on Render](#-step-2-deploy-spring-boot-backend-on-render)
6. [Step 3: Deploy Frontend on Vercel](#-step-3-deploy-frontend-on-vercel)
7. [Step 4: Connect Everything & Verify](#-step-4-connect-everything--verify)
8. [Troubleshooting & Common Questions](#-troubleshooting--common-questions)

---

## 🔍 Pre-Deployment Checklist

All deployment blockers have already been eliminated in the codebase:
- ✅ **Dynamic Port Binding**: Spring Boot listens on `${PORT:8081}` and AI service listens on `os.environ.get('PORT', 5000)`.
- ✅ **CORS Wildcard Configuration**: Spring Boot security allows `https://*.vercel.app` and `https://*.onrender.com`.
- ✅ **API Base URL Isolation**: Frontend uses `import.meta.env.VITE_API_BASE_URL` with zero hardcoded `localhost:8081` URLs.
- ✅ **Vercel SPA Routing**: `frontend/vercel.json` is configured with client-side rewrites to prevent 404 errors on page reload.
- ✅ **Production WSGI**: `gunicorn` is added to `ai-service/requirements.txt` for high-concurrency production serving.
- ✅ **Java 17 Specification**: `backend/system.properties` ensures Render builds with OpenJDK 17.

---

## ⚡ Order of Deployment (Important!)

Deploy in this exact sequence because each service depends on the one before it:

```
[1. AI Service on Render] ──► Provides AI_SERVICE_URL
        │
        ▼
[2. Backend on Render]    ──► Provides VITE_API_BASE_URL
        │
        ▼
[3. Frontend on Vercel]   ──► Complete Live Web App
```

---

## 📦 Step 0: Push Latest Code to GitHub

Open terminal in the project root:
```bash
git add .
git commit -m "feat: prepare production configuration for Render and Vercel"
git push origin main
```

---

## 🐍 Step 1: Deploy Python AI Service on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository (`smart-pg-management`).
4. Fill in the service configuration:
   - **Name**: `staynest-ai-service`
   - **Region**: Singapore (Southeast Asia) or closest to your users / database
   - **Branch**: `main`
   - **Root Directory**: `ai-service`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Instance Type**: `Free`
5. In the **Environment Variables** section, add:
   | Key | Value |
   |---|---|
   | `FLASK_DEBUG` | `false` |
   | `PYTHON_VERSION` | `3.10.12` |
6. In **Advanced**:
   - **Health Check Path**: `/health`
7. Click **Create Web Service**.
8. Wait ~2 minutes for the build to finish. Once live, copy your service URL:
   👉 Example: `https://staynest-ai-service.onrender.com`
   *(Test in browser: `https://staynest-ai-service.onrender.com/health` should return `{"status":"ok"}`)*

---

## ☕ Step 2: Deploy Spring Boot Backend on Render

1. On [Render Dashboard](https://dashboard.render.com), click **New +** > **Web Service**.
2. Select your GitHub repository (`smart-pg-management`).
3. Fill in the service configuration:
   - **Name**: `staynest-backend`
   - **Region**: Same region as AI service (e.g. Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
   - **Instance Type**: `Free`
4. In the **Environment Variables** section, configure:
   | Key | Value | Notes |
   |---|---|---|
   | `AI_SERVICE_URL` | `https://staynest-ai-service.onrender.com` | **Paste URL from Step 1** |
   | `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173` | Allows Vercel preview & prod URLs |
   | `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | Secure signing key |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db.ybvpmydjqtdoiehlidwj.supabase.co:5432/postgres` | Supabase Cloud Database |
   | `SPRING_DATASOURCE_USERNAME` | `postgres` | Database user |
   | `SPRING_DATASOURCE_PASSWORD` | `Chakri@**0987` | Database password |

   *(Note: The database settings are pre-configured in `application.properties`, so they are already set even if left blank, but setting them explicitly in Render is recommended practice).*

5. In **Advanced**:
   - **Health Check Path**: `/pg/list`
6. Click **Create Web Service**.
7. Wait ~3–4 minutes for Maven to download dependencies and build the JAR.
8. Once live, copy your backend URL:
   👉 Example: `https://staynest-backend.onrender.com`

---

## ⚡ Step 3: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository (`smart-pg-management`).
4. In the Project Configuration:
   - **Framework Preset**: `Vite` (detected automatically)
   - **Root Directory**: Click **Edit** and select `frontend` (⚠️ **Crucial step!**)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)
5. Expand the **Environment Variables** section:
   | Key | Value | Notes |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://staynest-backend.onrender.com` | **Paste Backend URL from Step 2** (No trailing slash `/`) |
6. Click **Deploy**.
7. In ~45 seconds, your application is live with a global CDN URL:
   👉 Example: `https://staynest.vercel.app`

---

## ✅ Step 4: Connect Everything & Verify

1. Open your Vercel URL in your browser: `https://staynest.vercel.app`
2. Test the core flows:
   - **Homepage**: Browse PG listings and city filters (verifies frontend → backend connection).
   - **AI Radar / Location Search**: Search a city/town like "Bangalore" or "Kukatpally" (verifies backend → AI service connection).
   - **Auth**: Register a new user or log in with credentials.
   - **Bookings**: Book a bed slot, view passbook receipt, test cancel refund flow.
   - **Page Refresh**: Refresh on `/bookings` or `/profile` (verifies `vercel.json` rewrite works without 404).

---

## 🛠️ Troubleshooting & Common Questions

### 1. Render Free Tier Spin-Down (Cold Starts)
- Render Free Tier services spin down after 15 minutes of inactivity.
- On the first request after being idle, the service takes ~45–60 seconds to boot up.
- **Solution**: You can set up a free uptime monitor like [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) to ping `https://staynest-backend.onrender.com/pg/list` every 10 minutes to keep it warm 24/7.

### 2. CORS Errors in Browser Console
- If you see `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`:
  - Verify that `CORS_ALLOWED_ORIGINS` on Render contains your exact Vercel URL (e.g., `https://staynest.vercel.app,https://*.vercel.app`).
  - Remember that our `WebSecurityConfig.java` has pattern matching enabled for all `*.vercel.app` domains automatically!

### 3. Page Refresh Shows 404 on Vercel
- This happens when client-side routing is not redirected to `index.html`.
- We have already included `frontend/vercel.json`:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
  Ensure this file is committed and present in `frontend/vercel.json`.

### 4. Updating the Code in Future
- Every time you run `git push origin main`:
  - Vercel will automatically re-deploy your frontend in seconds.
  - Render will automatically re-build and re-deploy your backend and AI service.

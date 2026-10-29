# 🚀 Free Cloud Deployment Guide

This guide explains how to deploy the entire platform for **free** so anyone worldwide can access it.

---

## 🏗️ Architecture for 100% Free Hosting

| Component | Recommended Free Host | Free Tier Allowance | Time to Deploy |
| :--- | :--- | :--- | :--- |
| **Frontend (React)** | [Vercel](https://vercel.com) | Unlimited bandwidth & builds, Global CDN, Free SSL | ~2 mins |
| **Database (MySQL)** | [Aiven.io](https://aiven.io) or [TiDB Cloud](https://tidbcloud.com) | 5GB Storage, 1GB RAM, 100% Free Forever (No credit card) | ~3 mins |
| **Backend (Spring Boot)** | [Render.com](https://render.com) | 750 free compute hours/month, automatic HTTPS | ~5 mins |
| **AI Service (FastAPI)** | [Render.com](https://render.com) | Free Web Service | ~3 mins |

---

## Step 1: Push Code to GitHub

All cloud deployment services connect automatically to GitHub for continuous deployment.

1. Ensure all changes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "fix(backend): resilient database uri parsing, health checks, and 512MB RAM tuning for Render"
git push origin main
```

---

## Step 2: Cloud MySQL Database (Aiven.io)

### Status Check in Aiven Console
Make sure your MySQL database in [Aiven Console](https://console.aiven.io) is **Running / Active** (not Powered Off or Suspended). When powered off, Aiven temporarily unpublishes the DNS name.

Your Aiven MySQL URI format:
```text
mysql://avnadmin:<PASSWORD>@<HOST>:<PORT>/defaultdb?ssl-mode=REQUIRED
```

The Spring Boot backend now has an auto-parser that supports:
1. `mysql://` URI format directly
2. OR standard `jdbc:mysql://` format:
```text
jdbc:mysql://<HOST>:<PORT>/defaultdb?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=true&sslMode=REQUIRED&serverTimezone=UTC
```

---

## Step 3: Deploy Spring Boot Backend on Render.com

1. Sign up / Log in at [Render.com](https://render.com).
2. Go to your web service: **`smart-society-backend-nh1o`** (or create a New Web Service).
3. Connect your repository: `https://github.com/radarsh07/smart-society-platform`
4. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Docker` (Render automatically uses `backend/Dockerfile`)
   - **Instance Type**: `Free`
5. Under **Environment Variables**, set:
   | Key | Value |
   | :--- | :--- |
   | `SPRING_DATASOURCE_URL` | `mysql://avnadmin:<YOUR_AIVEN_PASSWORD>@<YOUR_AIVEN_HOST>:<PORT>/defaultdb?ssl-mode=REQUIRED` |
   | `SPRING_DATASOURCE_USERNAME` | `avnadmin` |
   | `SPRING_DATASOURCE_PASSWORD` | `<YOUR_AIVEN_PASSWORD>` |
   | `PORT` | `8080` |
   | `JWT_SECRET` | `QnJvd3NlcndhdGVyLWF1dGgta2V5LXNlY3JldC0zMi1ieXRlcy1taW5pbXVt` |
6. Click **Manual Deploy** → **Clear build cache & deploy**.
7. Test the health check endpoint in your browser:
   `https://smart-society-backend-nh1o.onrender.com/`
   Returns: `{"status": "UP", "service": "Smart Society Management Backend"}`

---

## Step 4: Deploy React Frontend on Vercel

1. Log into [Vercel](https://vercel.com) and go to your project: `smart-society-platform`.
2. Under **Settings** → **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://smart-society-backend-nh1o.onrender.com/api` |
3. Under **Deployments**, click **Redeploy**.
4. Your frontend is live at:
   `https://smart-society-platform-hack-3ec7.vercel.app` (or your assigned Vercel URL).

---

## 🔒 Post-Deployment Verification & Pre-Seeded Accounts

Once deployed, you can immediately log in with:
1. **Admin Portal**: Username `admin`, Password `admin123`
2. **Resident Portal**: Username `abhishek`, Password `abhishek123`
3. **Security Guard Portal**: Username `guard`, Password `guard123`
4. **Maintenance Staff Portal**: Username `staff`, Password `staff123`

# 🚀 Free Cloud Deployment Guide

This guide explains how to deploy the entire platform for **free** so anyone worldwide can access it.

---

## 🏗️ Architecture for 100% Free Hosting

| Component | Recommended Free Host | Free Tier Allowance | Time to Deploy |
| :--- | :--- | :--- | :--- |
| **Frontend (React)** | [Vercel](https://vercel.com) | Unlimited bandwidth & builds, Global CDN, Free SSL | ~2 mins |
| **Database (MySQL)** | [Aiven.io](https://aiven.io) or [TiDB Cloud](https://tidbcloud.com) | 5GB Storage, 1GB RAM, 100% Free Forever (No credit card) | ~3 mins |
| **Backend (Spring Boot)** | [Render.com](https://render.com) or [Koyeb](https://koyeb.com) | 750 free compute hours/month, automatic HTTPS | ~5 mins |
| **AI Service (FastAPI)** | [Render.com](https://render.com) | Free Web Service | ~3 mins |

---

## Step 1: Push Code to GitHub

All cloud deployment services connect automatically to GitHub for continuous deployment.

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `smart-society-platform`).
2. In your terminal, run:
```bash
git add .
git commit -m "feat: complete platform with security gate pass & society modules"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

---

## Step 2: Create Free Cloud MySQL Database (Aiven.io or TiDB Cloud)

### Option A: Aiven for MySQL (Recommended - Free Forever, No Credit Card)
1. Sign up at [Aiven.io](https://aiven.io).
2. Click **Create Service** → Select **MySQL** → Select the **Free Tier**.
3. Choose any cloud region closest to you (e.g. AWS Mumbai or Singapore).
4. Click **Create Service**.
5. Once created, copy the **Service URI** or the credentials:
   - **Host**
   - **Port** (e.g. `12345`)
   - **User** (`avnadmin`)
   - **Password**
   - **Database** (`defaultdb` or create `ssasm_db`)

Your Spring Boot JDBC URL will look like:
```text
jdbc:mysql://<HOST>:<PORT>/defaultdb?sslmode=require&allowPublicKeyRetrieval=true
```

---

## Step 3: Deploy Spring Boot Backend on Render.com

1. Sign up at [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure settings:
   - **Name**: `ssasm-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Docker` (Render automatically uses `backend/Dockerfile`)
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `SPRING_DATASOURCE_URL`: `<YOUR_AIVEN_JDBC_URL>`
   - `SPRING_DATASOURCE_USERNAME`: `<YOUR_AIVEN_DB_USERNAME>`
   - `SPRING_DATASOURCE_PASSWORD`: `<YOUR_AIVEN_DB_PASSWORD>`
   - `PORT`: `8080`
   - `JWT_SECRET`: `QnJvd3NlcndhdGVyLWF1dGgta2V5LXNlY3JldC0zMi1ieXRlcy1taW5pbXVt`
6. Click **Create Web Service**.
7. Render will build and launch your backend at:
   `https://ssasm-backend.onrender.com`

---

## Step 4: Deploy React Frontend on Vercel

1. Sign up at [Vercel](https://vercel.com).
2. Click **Add New** → **Project** → Import your GitHub repository.
3. In **Project Settings**:
   - **Root Directory**: Click edit and choose `frontend`.
   - **Framework Preset**: `Vite` (auto-detected).
4. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://ssasm-backend.onrender.com/api` (URL from Step 3)
5. Click **Deploy**.
6. In ~60 seconds, your frontend will be live worldwide at:
   `https://your-project.vercel.app`

---

## Step 5: (Optional) Deploy Python AI Microservice on Render

1. On Render, click **New +** → **Web Service**.
2. Connect your repository.
3. Configure:
   - **Root Directory**: `ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Click **Create Web Service**.

---

## 🔒 Post-Deployment Verification

Open your live Vercel URL in your browser or on mobile:
1. Log in with **`admin` / `admin123`** → Society Admin Portal.
2. Log in with **`abhishek` / `abhishek123`** → Resident Portal (shows your digital gate pass `GP-RES-6-101`).
3. Log in with **`guard` / `guard123`** → Security Gate Scanner console.

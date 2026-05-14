# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



You’re absolutely right—that setup phase is the "foundation" of the whole backend, and you definitely want those specific configuration steps in your README for a smooth re-deployment during an exam.

Here is the **complete, consolidated guide** including the detailed EC2 launch configuration and every troubleshooting fix we implemented.

---

# 🚀 MERN Task Manager: The Ultimate Deployment & Troubleshooting Master Guide

This document covers the complete transition from a local development environment to a live production stack using **AWS (S3 + EC2)** and **MongoDB Atlas**.

---

## 📂 Phase 1: GitHub & Database Preparation

### 1. Repository Migration

To move the project from a third-party clone to your own GitHub:

* **Commands:**
```bash
git remote remove origin
git remote add origin https://github.com/your-username/your-new-repo.git
git branch -M main
git push -u origin main

```



### 2. MongoDB Atlas Configuration

* **Special Character Handling:** If your password contains `@`, it must be URL-encoded to `%40` to prevent URI parsing errors.
* **Network Access:** In Atlas, go to **Network Access** > **Add IP Address** > **Allow Access From Anywhere (0.0.0.0/0)** (essential for initial AWS connectivity).
* **Connection String Format:**
`MONGO_URI=mongodb+srv://<user>:<encoded_password>@cluster.mongodb.net/taskmanager?appName=TaskManager`

---

## 🌐 Phase 2: Frontend Deployment (Amazon S3)

### 1. Build & API Update

* **Step:** Update your frontend API config from `localhost:5000` to your **EC2 Public IP**.
* **Command:** `npm run build`

### 2. S3 Bucket Setup

* **Create Bucket:** Uncheck "Block all public access."
* **Static Website Hosting:** Enable this in **Properties**; set `index.html` as the Index and Error document.
* **Permissions (Bucket Policy):** Paste this in the **Permissions** tab:

```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
            }
        ]
    }
    ```

---

## 🖥️ Phase 3: Backend Deployment (Amazon EC2)

### 1. Launching the Instance (Step-by-Step)
Go to the **EC2 Dashboard** > **Launch Instance** and select these exact settings:
*   **Name:** `task-manager-backend`
*   **AMI (OS):** **Amazon Linux 2023** (Free Tier eligible).
*   **Instance Type:** **t3.micro** (or t2.micro).
*   **Key Pair:** Create a new RSA `.pem` key named `task-manager-key`. **Download it immediately.**
*   **Network Settings (Security Group):**
    *   **Allow SSH:** From "My IP" (for security).
    *   **Allow HTTP:** From "Anywhere" (0.0.0.0/0).
    *   **Custom TCP Rule (CRITICAL):** Add Port `5000` (or your backend port) and set source to "Anywhere".

### 2. Resolving the "Unprotected Private Key" (Windows Error)
**Problem:** Windows permissions are too "broad" for SSH keys, causing a `Permission Denied` error.
**Solution:** Run these in your local PowerShell:
```powershell
icacls.exe "task-manager-key.pem" /reset
icacls.exe "task-manager-key.pem" /grant:r "$($env:username):(R)"
icacls.exe "task-manager-key.pem" /inheritance:r

```

### 3. Server Provisioning

Connect via SSH: `ssh -i "task-manager-key.pem" ec2-user@<YOUR-EC2-IP>` and run:

```bash
# System Update & Tools
sudo dnf update -y
sudo dnf install git -y

# Install Node.js 20
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Clone & Environment Setup
git clone <your-repo-link>
cd backend
npm install
nano .env  # Paste your MONGO_URI and PORT=5000 here

```

### 4. Background Persistence (PM2)

To keep the API running after closing the terminal:

```bash
sudo npm install pm2 -g
pm2 start index.js --name "task-api"
pm2 save
pm2 startup  # Follow the on-screen instructions to run the generated command

```

---

## ✅ Final Working State

* **Frontend:** Hosted at the S3 Website Endpoint URL.
* **Backend:** Running on EC2 Port 5000 via PM2.
* **Database:** MongoDB Atlas Cloud.

---

This covers every single click and command we used! You can now push this to your repo with full confidence. Ready for that git push?

```

```
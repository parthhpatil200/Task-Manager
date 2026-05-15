const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create a task
router.post('/', async (req, res) => {
    const task = new Task({
        title:       req.body.title,
        description: req.body.description,
        priority:    req.body.priority    || 'medium',
        category:    req.body.category    || 'Other',
        status:      req.body.status      || 'todo',
        dueDate:     req.body.dueDate     || null,
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update a task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (req.body.title       != null) task.title       = req.body.title;
        if (req.body.description != null) task.description = req.body.description;
        if (req.body.priority    != null) task.priority    = req.body.priority;
        if (req.body.category    != null) task.category    = req.body.category;
        if (req.body.status      != null) {
            task.status    = req.body.status;
            task.completed = req.body.status === 'done';
        }
        if (req.body.dueDate     != null) task.dueDate     = req.body.dueDate;
        if (req.body.completed   != null) task.completed   = req.body.completed;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.deleteOne();
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;




// You’re absolutely right—that setup phase is the "foundation" of the whole backend, and you definitely want those specific configuration steps in your README for a smooth re-deployment during an exam.

// Here is the **complete, consolidated guide** including the detailed EC2 launch configuration and every troubleshooting fix we implemented.

// ---

// # 🚀 MERN Task Manager: The Ultimate Deployment & Troubleshooting Master Guide

// This document covers the complete transition from a local development environment to a live production stack using **AWS (S3 + EC2)** and **MongoDB Atlas**.

// ---

// ## 📂 Phase 1: GitHub & Database Preparation

// ### 1. Repository Migration

// To move the project from a third-party clone to your own GitHub:

// * **Commands:**
// ```bash
// git remote remove origin
// git remote add origin https://github.com/your-username/your-new-repo.git
// git branch -M main
// git push -u origin main

// ```



// ### 2. MongoDB Atlas Configuration

// * **Special Character Handling:** If your password contains `@`, it must be URL-encoded to `%40` to prevent URI parsing errors.
// * **Network Access:** In Atlas, go to **Network Access** > **Add IP Address** > **Allow Access From Anywhere (0.0.0.0/0)** (essential for initial AWS connectivity).
// * **Connection String Format:**
// `MONGO_URI=mongodb+srv://<user>:<encoded_password>@cluster.mongodb.net/taskmanager?appName=TaskManager`

// ---

// ## 🌐 Phase 2: Frontend Deployment (Amazon S3)

// ### 1. Build & API Update

// * **Step:** Update your frontend API config from `localhost:5000` to your **EC2 Public IP**.
// * **Command:** `npm run build`

// ### 2. S3 Bucket Setup

// * **Create Bucket:** Uncheck "Block all public access."
// * **Static Website Hosting:** Enable this in **Properties**; set `index.html` as the Index and Error document.
// * **Permissions (Bucket Policy):** Paste this in the **Permissions** tab:

// ```json
//     {
//         "Version": "2012-10-17",
//         "Statement": [
//             {
//                 "Sid": "PublicReadGetObject",
//                 "Effect": "Allow",
//                 "Principal": "*",
//                 "Action": "s3:GetObject",
//                 "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
//             }
//         ]
//     }
//     ```

// ---

// ## 🖥️ Phase 3: Backend Deployment (Amazon EC2)

// ### 1. Launching the Instance (Step-by-Step)
// Go to the **EC2 Dashboard** > **Launch Instance** and select these exact settings:
// *   **Name:** `task-manager-backend`
// *   **AMI (OS):** **Amazon Linux 2023** (Free Tier eligible).
// *   **Instance Type:** **t3.micro** (or t2.micro).
// *   **Key Pair:** Create a new RSA `.pem` key named `task-manager-key`. **Download it immediately.**
// *   **Network Settings (Security Group):**
//     *   **Allow SSH:** From "My IP" (for security).
//     *   **Allow HTTP:** From "Anywhere" (0.0.0.0/0).
//     *   **Custom TCP Rule (CRITICAL):** Add Port `5000` (or your backend port) and set source to "Anywhere".

// ### 2. Resolving the "Unprotected Private Key" (Windows Error)
// **Problem:** Windows permissions are too "broad" for SSH keys, causing a `Permission Denied` error.
// **Solution:** Run these in your local PowerShell:
// ```powershell
// icacls.exe "task-manager-key.pem" /reset
// icacls.exe "task-manager-key.pem" /grant:r "$($env:username):(R)"
// icacls.exe "task-manager-key.pem" /inheritance:r

// ```

// ### 3. Server Provisioning

// Connect via SSH: `ssh -i "task-manager-key.pem" ec2-user@<YOUR-EC2-IP>` and run:

// ```bash
// # System Update & Tools
// sudo dnf update -y
// sudo dnf install git -y

// # Install Node.js 20
// curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
// sudo dnf install -y nodejs

// # Clone & Environment Setup
// git clone <your-repo-link>
// cd backend
// npm install
// nano .env  # Paste your MONGO_URI and PORT=5000 here

// ```

// ### 4. Background Persistence (PM2)

// To keep the API running after closing the terminal:

// ```bash
// sudo npm install pm2 -g
// pm2 start index.js --name "task-api"
// pm2 save
// pm2 startup  # Follow the on-screen instructions to run the generated command

// ```

// ---

// ## ✅ Final Working State

// * **Frontend:** Hosted at the S3 Website Endpoint URL.
// * **Backend:** Running on EC2 Port 5000 via PM2.
// * **Database:** MongoDB Atlas Cloud.

// ---

// This covers every single click and command we used! You can now push this to your repo with full confidence. Ready for that git push?

// ```

// ```
// General Cloud Concepts
// 1. What are the three main Service Models in Cloud Computing?

// IaaS (Infrastructure as a Service): You get raw hardware/VMs (e.g., AWS EC2). You manage the OS and apps.

// PaaS (Platform as a Service): You get a platform to deploy code without managing servers (e.g., AWS Elastic Beanstalk, Heroku).

// SaaS (Software as a Service): Ready-to-use software (e.g., Gmail, Salesforce).

// 2. What is the difference between Public, Private, and Hybrid Clouds?

// Public: Resources shared by multiple organizations over the internet (AWS, Azure).

// Private: Cloud infrastructure used exclusively by a single organization.

// Hybrid: A mix of on-premises infrastructure and public cloud, connected together.

// 3. What are "Availability Zones" (AZ) and "Regions"?

// Region: A physical location in the world where AWS has multiple data centers (e.g., ap-south-1 for Mumbai).

// Availability Zone: One or more discrete data centers within a Region with redundant power and networking. High availability is achieved by spreading resources across multiple AZs.

// AWS Compute & Storage
// 4. What is AWS EC2 and what does "t2.micro" signify?

// EC2 (Elastic Compute Cloud): Provides resizable virtual servers.

// t2.micro: It is an Instance Type. "t" is the family (burstable performance), "2" is the generation, and "micro" is the size (CPU/RAM capacity).

// 5. What is the difference between S3 and EBS?

// S3 (Simple Storage Service): Object storage used for static files, backups, and web hosting (What you used for your Frontend). It is accessible via URL.

// EBS (Elastic Block Store): Block storage used as a hard drive for EC2 instances (Where your Ubuntu OS was installed). It must be "attached" to a server.

// 6. What is an AMI (Amazon Machine Image)?

// It is a template that contains the software configuration (OS, application server, and applications) required to launch your instance. You used an Ubuntu 24.04 AMI for your backend.

// Networking & Security
// 7. What is a VPC (Virtual Private Cloud)?

// A VPC is a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define. It gives you complete control over your networking environment.

// 8. Explain Security Groups vs. Network ACLs.

// Security Group: Acts as a virtual firewall for your instance (EC2). It is stateful (if you allow inbound, outbound is automatically allowed).

// Network ACL: An optional layer of security for your subnet that acts as a firewall for controlling traffic in and out of one or more subnets (Stateless).

// 9. What is the Range of Private IP addresses (CIDR blocks)?
// The standard private IP ranges (defined by RFC 1918) used in VPCs are:

// 10.0.0.0 – 10.255.255.255 (10/8 prefix)

// 172.16.0.0 – 172.31.255.255 (172.16/12 prefix)

// 192.168.0.0 – 192.168.255.255 (192.168/16 prefix)

// 10. What is the purpose of an Internet Gateway (IGW)?

// It is a VPC component that allows communication between your VPC and the internet. Without an IGW, your EC2 instance cannot be reached via its Public IP.

// Deployment & Scalability
// 11. What is "Auto Scaling" and "Elastic Load Balancing" (ELB)?

// Auto Scaling: Automatically adds or removes EC2 instances based on demand (CPU usage, etc.).

// ELB: Automatically distributes incoming application traffic across multiple target instances to ensure no single server is overwhelmed.

// 12. What is the "Shared Responsibility Model" in AWS?

// AWS is responsible for security "OF" the cloud (Physical hardware, global infrastructure).

// The Customer is responsible for security "IN" the cloud (Patching the OS, configuring Security Groups, managing data/passwords).

// 13. What is CloudWatch?

// A monitoring and observability service that collects data (logs, metrics) and allows you to set alarms if things go wrong (e.g., if EC2 CPU usage hits 90%).

// Advanced/Scenario-based
// 14. Why did you use PM2 for your backend deployment?

// PM2 is a Process Manager. In production, if your Node.js code crashes, the server stops. PM2 automatically restarts the process and ensures the "Engine" keeps running even after a server reboot.

// 15. What is "Serverless" computing (AWS Lambda)?

// A model where you run code without provisioning or managing servers. You only pay for the compute time you consume. (Unlike EC2, where you pay as long as the server is "Running").

// Bonus "Pro" Question: How does S3 Static Website Hosting work?
// Answer: S3 serves the files (HTML/CSS/JS) via a generated URL. Since it is "Static," it cannot execute server-side code (like Node.js or Python). This is why the Frontend must be "built" (compiled) into static files before uploading.

// Final Tip for Viva: If they ask you about costs, mention that you used the AWS Free Tier, which provides 750 hours of t2.micro per month and 5GB of S3 storage for the first year.

// Is there any specific AWS service that still feels like a "black box" to you?

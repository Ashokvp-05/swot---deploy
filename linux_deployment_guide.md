# Swot HRMS - Enterprise Linux Server Deployment Guide

This document provides a highly professional, production-grade deployment strategy for the Swot HRMS project. This guide ensures your Next.js Frontend, Node.js/Prisma Backend, and PostgreSQL Database are deployed securely, efficiently, and are accessible via standard HTTPS.

---

## Phase 1: Server Provisioning & Security
Before deploying code, it is critical to secure the server environment against unauthorized access.

### 1. Access Your Server
```bash
ssh ubuntu@YOUR_SERVER_IP
```

### 2. Update System Packages
```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 3. Configure the Firewall (UFW)
In a production environment, you should strictly limit incoming traffic. We only want to allow SSH (for you) and HTTP/HTTPS (for web traffic). Docker containers will run safely behind this wall.
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Phase 2: Install Core Dependencies
We will install Docker (for containerization) and Nginx (as a reverse proxy to handle domain routing and SSL).

### 1. Install Docker & Docker Compose
```bash
# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release git

# Add Docker's official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 2. Install Nginx and Certbot (For SSL/HTTPS)
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

---

## Phase 3: Project Setup & Configuration

### 1. Clone the Repository
For production, standard practice is to host web applications in the `/var/www/` directory.
```bash
sudo mkdir -p /var/www/swot-hrms
sudo chown -R $USER:$USER /var/www/swot-hrms
cd /var/www/swot-hrms

# Clone your project (Replace with your actual Git URL)
git clone https://github.com/your-username/swot-project-main.git .
```

### 2. Environment Variables (.env)
Create the `.env` file securely. Do not skip this step.
```bash
cp .env.example .env
nano .env
```
Ensure you update the URLs to your **actual domain names** (e.g., `https://hrms.yourcompany.com`) rather than the IP address. For production, generate highly secure passwords.
```env
# 1. Server Configuration
FRONTEND_URL=https://hrms.yourcompany.com
BACKEND_URL=https://api.yourcompany.com

# 2. Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_highly_secure_db_password
POSTGRES_DB=antigravity_db

# 3. Security & Authentication
JWT_SECRET=your_long_random_jwt_string
AUTH_SECRET=your_long_random_auth_string
```

---

## Phase 4: Launching the Application
Execute Docker Compose. Our Dockerfile configuration is already optimized to run Prisma database migrations dynamically on startup.

```bash
sudo docker compose up -d --build
```
*Wait 1-2 minutes for the database to initialize, the backend to migrate, and the Next.js frontend to compile.*

---

## Phase 5: Nginx Reverse Proxy & SSL (Production Routing)
Right now, the app is running on ports 3000 and 4000. We must map your public domain names to these ports so users can access them without typing `:3000`.

### 1. Configure Nginx for the Frontend
```bash
sudo nano /etc/nginx/sites-available/hrms-frontend
```
Paste the following (replace `hrms.yourcompany.com` with your domain):
```nginx
server {
    listen 80;
    server_name hrms.yourcompany.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Configure Nginx for the Backend API
```bash
sudo nano /etc/nginx/sites-available/hrms-backend
```
Paste the following (replace `api.yourcompany.com` with your API domain):
```nginx
server {
    listen 80;
    server_name api.yourcompany.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable the Sites
```bash
sudo ln -s /etc/nginx/sites-available/hrms-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/hrms-backend /etc/nginx/sites-enabled/

# Remove default nginx placeholder
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration for syntax errors
sudo nginx -t

# Restart Nginx to apply changes
sudo systemctl restart nginx
```

### 4. Enable HTTPS (SSL Certificates)
Run Certbot to automatically fetch free Let's Encrypt SSL certificates and upgrade your traffic to secure HTTPS.
```bash
sudo certbot --nginx -d hrms.yourcompany.com -d api.yourcompany.com
```
*Follow the on-screen prompts. When asked, choose the option to **Redirect** HTTP traffic to HTTPS.*

---

## Phase 6: Operational Maintenance

**View Real-Time Production Logs:**
```bash
# View all logs
sudo docker compose logs -f

# View logs for a specific service
sudo docker compose logs -f backend
```

**Deploying Updates (Continuous Deployment):**
When you push new code to your repository, log into the server and run:
```bash
cd /var/www/swot-hrms
git pull origin main
sudo docker compose up -d --build
```
*(Docker will cleverly rebuild only the containers whose code has changed, minimizing downtime).*

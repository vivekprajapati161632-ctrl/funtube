# FunTube

FunTube is a full-stack video sharing platform (YouTube-like) built for DevOps and cloud interview practice.

## Features

### User features
- JWT signup/login
- Skip Login mode for guest browsing
- Default test account seeded automatically: `Admin / 1234`
- Profile page with uploaded videos and channel data

### Video features
- Upload video + thumbnail + title + description + tags
- Watch page with HTML5 player
- Like / unlike videos
- Recommended videos
- Watch history (per logged-in user)

### Sharing features
- Share to WhatsApp, Facebook, Twitter (X)
- Copy share link
- Public shareable URL format: `/watch/:videoId`

### Channel features
- Channel page with channel videos
- Subscribe / unsubscribe
- Subscriber count

### DevOps features
- Dockerized frontend, backend, MongoDB, and Nginx
- Docker Compose local orchestration
- Nginx reverse proxy (`/` => frontend, `/api` => backend)
- GitHub Actions CI/CD workflow
- AWS EC2 deployment path
- Logging and health checks

## Tech stack
- Frontend: React + Vite + Bootstrap
- Backend: Node.js + Express + JWT + Multer
- Database: MongoDB + Mongoose
- Storage:
  - Local files in development (`/uploads`)
  - AWS S3 in production (`USE_S3=true`)
- Reverse proxy: Nginx

## Project structure

```text
funtube/
  frontend/
  backend/
  nginx/
  database/
  .github/workflows/ci.yml
  docker-compose.yml
  README.md
```

## Default test account
- Username: `Admin`
- Email: `admin@funtube.local`
- Password: `1234`

Seed logic: `backend/src/services/seedService.js`

## Local development

### 1) Install dependencies

```bash
cd funtube/backend
npm install

cd ../frontend
npm install
```

### 2) Run with Docker Compose

```bash
cd funtube
docker compose up --build -d
```

Open:
- App: http://localhost
- Backend health: http://localhost/api/health

Stop:
```bash
docker compose down
```

### 3) Run manually without Docker

1. Start MongoDB locally (example using Docker):
```bash
docker run -d --name funtube-mongo -p 27017:27017 mongo:7
```

2. Start backend:
```bash
cd funtube/backend
cp .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
npm install
npm run dev
```

3. Start frontend:
```bash
cd funtube/frontend
cp .env.example .env
# Windows PowerShell: Copy-Item .env.example .env
npm install
npm run dev
```

4. Open:
- Frontend dev URL: http://localhost:5173
- Through Nginx (compose mode): http://localhost

## API summary

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`

- Videos
  - `GET /api/videos`
  - `GET /api/videos/:id`
  - `GET /api/videos/recommended/:id`
  - `POST /api/videos` (multipart)
  - `PUT /api/videos/:id`
  - `DELETE /api/videos/:id`
  - `POST /api/videos/:id/like`
  - `DELETE /api/videos/:id/like`
  - `POST /api/videos/:id/history`
  - `GET /api/videos/history/me`

- Channels and subscriptions
  - `GET /api/channels/me`
  - `GET /api/channels/:channelId`
  - `POST /api/subscriptions/:channelId`
  - `DELETE /api/subscriptions/:channelId`

## Storage modes

### Local storage (default)
- `USE_S3=false`
- Files stored under backend `/uploads`

### S3 storage (production)
Set backend environment:
- `USE_S3=true`
- `AWS_REGION=...`
- `AWS_S3_BUCKET=...`
- AWS credentials via IAM role (recommended on EC2) or env vars

## AWS EC2 deployment guide

### 1) Launch EC2
- Ubuntu 22.04 instance
- Security Group inbound rules:
  - `22` (SSH)
  - `80` (HTTP)
  - `443` (HTTPS)

### 2) Install Docker and Compose plugin

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and SSH back in.

### 3) Deploy app

```bash
git clone <your-repo-url> /opt/funtube
cd /opt/funtube/funtube
docker compose up -d --build
```

### 4) Domain configuration
- Create DNS A records:
  - `funtube.yourdomain.com` -> EC2 public IP
  - `www.funtube.yourdomain.com` -> EC2 public IP

### 5) HTTPS with Let's Encrypt

Recommended approach for interview-friendly setup: host-level Nginx TLS termination.

1. Install host Nginx + Certbot:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

2. Configure host Nginx to proxy to Docker Nginx (`127.0.0.1:80`), then test:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

3. Request cert:
```bash
sudo certbot --nginx -d funtube.yourdomain.com -d www.funtube.yourdomain.com
```

4. Auto-renew check:
```bash
sudo systemctl status certbot.timer
```

## CI/CD (GitHub Actions)
Workflow file: `funtube/.github/workflows/ci.yml`

Pipeline stages:
1. Backend install + tests
2. Frontend install + build
3. Deploy to EC2 on push to `main`

Set these repository secrets:
- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`

On deploy, workflow runs:
```bash
cd /opt/funtube
git pull origin main
docker compose up -d --build
docker image prune -f
```

## Monitoring and logging

### Application health
- `GET /api/health`

### Container logs
```bash
cd funtube
docker compose logs -f nginx
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
```

### Basic production monitoring recommendations
- Install CloudWatch Agent on EC2 and ship `/var/lib/docker/containers/*/*.log`
- Add uptime checks for `/api/health`
- Alert on container restarts and high CPU/memory

## Troubleshooting

- `401 Unauthorized`: token missing/expired; login again
- Upload fails: verify Nginx `client_max_body_size` and backend file size limits
- `502 Bad Gateway`: check backend/frontend container health and logs
- Mongo connection errors: verify `MONGO_URI` and Mongo container status
- CORS issues in manual mode: set `CLIENT_ORIGIN` in backend `.env`

## Interview practice checklist
- Docker + Docker Compose
- Nginx reverse proxy and routing
- JWT auth and secured APIs
- MongoDB schema and indexing
- EC2 deployment and SSL/TLS
- CI/CD automation
- Log-based production troubleshooting

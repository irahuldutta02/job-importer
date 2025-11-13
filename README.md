# 🧩 Scalable Job Importer with Queue Processing & History Tracking

A complete system for fetching, processing, and managing job data from external XML feeds with background processing and real-time monitoring.

## 🎯 Features

- **Automated Feed Processing**: Fetches jobs from multiple XML APIs hourly
- **Queue-Based Processing**: Uses Redis + BullMQ for scalable background processing
- **Import History Tracking**: Detailed logging of all import runs with statistics
- **Real-Time Dashboard**: Next.js frontend with live updates every 5 seconds
- **Error Handling**: Comprehensive retry logic and failure tracking
- **Configurable**: Environment-based configuration for feeds, schedules, and concurrency

## 🏗️ Architecture

```
/client              → Next.js 15 App Router Frontend
  ├── Dockerfile     → Production container setup
  └── src/app/       → App router pages and components
/server              → Node.js + Express Backend
  ├── Dockerfile     → Production container setup
  └── src/           → Server source code
/docs                → Architecture documentation
docker-compose.yml   → Complete application stack
```

**Key Components:**

- **Feed Fetcher**: Converts XML feeds to JSON
- **Queue System**: Redis + BullMQ for job processing
- **Background Workers**: Process jobs asynchronously
- **MongoDB**: Stores jobs and import logs
- **Cron Scheduler**: Hourly automated imports

## 🚀 Setup & Installation

Choose your preferred setup method:

### Option 1: Docker Setup (Recommended)

**Prerequisites:**

- Docker and Docker Compose
- No Node.js installation required

**One-Command Deployment:**

```bash
# Start the entire application stack
docker-compose up --build
```

This single command will:

- Build and start **MongoDB** on port `27017`
- Build and start **Redis** on port `6379`
- Build and start **Backend Server** on port `4000`
- Build and start **Frontend Client** on port `3000`
- Configure automatic job imports every hour
- Set up health checks and proper service dependencies

**Stop the Application:**

```bash
# Stop all services
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

### Option 2: Local Development Setup (Without Docker)

**Prerequisites:**

- Node.js 20+ and npm
- MongoDB (local installation or cloud service)
- Redis (local installation or cloud service)

**Step-by-Step Installation:**

```bash
# 1. Clone and navigate to project
git clone <repository-url>
cd job-importer

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
cd ..

# 4. Configure environment variables
cp server/.env.example server/.env
# Edit server/.env with your database configurations

# 5. Start services in separate terminals:

# Terminal 1 - Start MongoDB (if local)
mongod --dbpath /path/to/your/db

# Terminal 2 - Start Redis (if local)
redis-server

# Terminal 3 - Start Backend Server
cd server && npm run dev

# Terminal 4 - Start Frontend Client
cd client && npm run dev
```

**Local Environment Configuration:**

Edit `server/.env`:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Local Database Configuration
MONGO_URI=mongodb://localhost:27017/job_importer
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Job Processing
CONCURRENCY=4
BATCH_SIZE=50

# Feed URLs (comma-separated)
FEED_URLS=https://jobicy.com/?feed=job_feed,https://jobicy.com/?feed=job_feed&job_categories=data-science

# Cron Schedule (every 5 minutes for development)
IMPORT_CRON_SCHEDULE=*/5 * * * *

# Logging
LOG_LEVEL=info
```

### Option 3: Hybrid Setup (Local Code + Docker Databases)

**Best of both worlds for development:**

```bash
# 1. Start only databases with Docker
docker-compose up mongo redis -d

# 2. Install and run applications locally
cd server && npm install && npm run dev    # Terminal 1
cd client && npm install && npm run dev    # Terminal 2
```

### Access the Application

Once running (any setup method):

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Import Logs**: http://localhost:4000/api/imports/logs

## 📋 API Endpoints

### Import Management

- `POST /api/imports/run` - Queue single feed import
- `POST /api/imports/trigger-now` - Trigger all scheduled feeds immediately
- `GET /api/imports/logs` - Get import history
- `GET /api/imports/stats` - Get job statistics

### Example Usage

```bash
# Manually trigger all feeds now
curl -X POST http://localhost:4000/api/imports/trigger-now

# Queue specific feed
curl -X POST http://localhost:4000/api/imports/run \
  -H "Content-Type: application/json" \
  -d '{"feedUrl":"https://jobicy.com/?feed=job_feed"}'

# View import logs
curl http://localhost:4000/api/imports/logs
```

## ⚙️ Configuration

### Environment Variables (.env)

Copy `server/.env.example` to `server/.env` and configure:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration (matches docker-compose.yml)
MONGO_URI=mongodb://localhost:27017/job_importer
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Job Processing
CONCURRENCY=4
BATCH_SIZE=50

# Feed URLs (comma-separated)
FEED_URLS=https://jobicy.com/?feed=job_feed,https://jobicy.com/?feed=job_feed&job_categories=data-science

# Cron Schedule (hourly by default, set to */5 * * * * for every 5 minutes in development)
IMPORT_CRON_SCHEDULE=0 * * * *

# Logging
LOG_LEVEL=info
```

### Supported Feed URLs

- `https://jobicy.com/?feed=job_feed` - General jobs
- `https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time` - SMM full-time
- `https://jobicy.com/?feed=job_feed&job_categories=data-science` - Data science jobs
- `https://www.higheredjobs.com/rss/articleFeed.cfm` - Higher education jobs

## 📊 Monitoring

The frontend dashboard provides:

- **Real-time Updates**: Refreshes every 5 seconds
- **Import History Table**: All recent imports with detailed statistics
- **Metrics**: Total fetched, imported, new, updated, and failed jobs per feed
- **Feed Tracking**: Monitor which feeds are being processed

## 🔧 Development & Testing

### Testing the System

Once your setup is running, test the import system:

```bash
# Manually trigger all feeds immediately
curl -X POST http://localhost:4000/api/imports/trigger-now

# Check if imports are working
curl http://localhost:4000/api/imports/logs
```

### API Testing

```bash
# Test single feed import
curl -X POST http://localhost:4000/api/imports/run \
  -H "Content-Type: application/json" \
  -d '{"feedUrl":"https://jobicy.com/?feed=job_feed"}'

# Check import logs
curl http://localhost:4000/api/imports/logs | jq

# Get job statistics
curl http://localhost:4000/api/imports/stats | jq

# Or use the included script
node script.js https://jobicy.com/?feed=job_feed
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection**:

   ```bash
   # Ensure Docker services are running
   docker-compose up -d
   docker-compose ps  # Check service status
   ```

2. **Port Conflicts**:

   ```bash
   # Check if ports are in use
   netstat -an | findstr "3000\|4000\|27017\|6379"
   ```

3. **No Imports**:

   ```bash
   # Check server logs and manually trigger
   curl -X POST http://localhost:4000/api/imports/trigger-now
   ```

4. **Feed Errors**: Verify feed URLs are accessible and return valid XML

### Database Access

```bash
# Connect to MongoDB
docker exec -it <mongo_container_id> mongosh job_importer

# In MongoDB shell:
> db.jobs.count()
> db.importlogs.find().sort({createdAt:-1}).limit(5)

# Connect to Redis
docker exec -it <redis_container_id> redis-cli
> KEYS *
```

### Clean Reset

```bash
# Stop and remove all data (fresh start)
docker-compose down -v
docker-compose up -d
```

## 📚 Documentation

- [Architecture Documentation](./docs/architecture.md) - Detailed system design
- Project layout: `/server` (backend), `/client` (frontend), `/docs` (documentation)
- Docker setup: `docker-compose.yml` with full application stack

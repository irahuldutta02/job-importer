# Architecture Documentation

## System Overview

The Scalable Job Importer is a modern, microservices-inspired application designed to fetch, process, and manage job data from external XML feeds with high reliability and scalability.

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   External      │    │     Backend      │    │    Frontend     │
│   XML Feeds     │──▶│   (Node.js)      │───▶│   (Next.js)     │
│                 │    │                  │    │                 │
│ • Jobicy.com    │    │ • Express API    │    │ • Admin UI      │
│ • HigherEdJobs  │    │ • Cron Scheduler │    │ • Real-time     │
│ • Custom APIs   │    │ • Queue System   │    │   Dashboard     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Data Layer     │
                       │                  │
                       │ • MongoDB        │
                       │ • Redis Queue    │
                       │ • Import Logs    │
                       └──────────────────┘
```

## Core Components

### 1. Feed Fetcher Service

- **Purpose**: Fetch and parse XML job feeds from external APIs
- **Features**: HTTP client with timeout, XML to JSON conversion, error handling
- **Data Flow**: External API → XML → Parse → Normalize → Jobs Array

### 2. Queue System (BullMQ + Redis)

- **Purpose**: Background job processing with configurable concurrency
- **Features**: Retry logic, failure tracking, horizontal scalability
- **Configuration**: 4 workers default, exponential backoff, 3 retry attempts

### 3. Cron Scheduler

- **Purpose**: Automated hourly imports of all configured feeds
- **Schedule**: `0 * * * *` (configurable via IMPORT_CRON_SCHEDULE)
- **Feeds**: Jobicy.com, HigherEdJobs.com, and custom RSS feeds

### 4. Background Worker

- **Processing**: Fetch → Parse → Check Existing → Insert/Update → Log Stats
- **Statistics**: totalFetched, totalImported, newJobs, updatedJobs, failedJobs
- **Error Handling**: Detailed failure reasons and recovery

### 5. MongoDB Collections

**Jobs Collection**:

```javascript
{
  externalId: String (unique),  // Feed-specific ID
  title: String,               // Job title
  company: String,             // Company name
  location: String,            // Job location
  description: String,         // Job description
  url: String,                // Application URL
  raw: Object,                // Original XML data
  lastSeenAt: Date,           // Last seen in feed
  createdAt/updatedAt: Date
}
```

**Import Logs Collection**:

```javascript
{
  feedUrl: String,            // Source feed URL
  startedAt: Date,           // Import start
  finishedAt: Date,          // Import end
  totalFetched: Number,      // Jobs in feed
  totalImported: Number,     // Successfully processed
  newJobs: Number,           // New records
  updatedJobs: Number,       // Updated records
  failedJobs: Array,         // Failures with reasons
  createdAt/updatedAt: Date
}
```

### 6. API Endpoints

| Method | Endpoint                   | Purpose                  |
| ------ | -------------------------- | ------------------------ |
| POST   | `/api/imports/run`         | Queue single feed import |
| POST   | `/api/imports/trigger-now` | Trigger all feeds now    |
| GET    | `/api/imports/logs`        | Get import history       |
| GET    | `/api/imports/stats`       | Get job statistics       |

### 7. Frontend Dashboard (Next.js 15)

- **Real-time Updates**: SWR with 5-second refresh interval
- **Features**: Import history table, job statistics, responsive design
- **Technology**: App Router, Tailwind CSS, TypeScript support

## Data Flow

### Complete Import Process

```
1. Cron Trigger (Hourly) →
2. Queue Feed URLs →
3. Workers Process (Parallel) →
4. Store in MongoDB →
5. Frontend Updates (Real-time)
```

### Error Handling Strategy

- **Network**: Timeouts, retries, graceful degradation
- **Parsing**: XML error recovery, validation, sanitization
- **Database**: Duplicate handling, connection retry, transactions
- **Queue**: Failure tracking, dead letter queue, manual retry

## Scalability Features

### Horizontal Scaling

- Multiple backend instances share Redis queue
- Stateless design enables load balancing
- Configurable worker concurrency

### Performance Optimization

- Database indexing on externalId, company, createdAt
- Lean queries for read operations
- Redis caching for queue management
- Connection pooling for database efficiency

## Configuration

### Key Environment Variables

```bash
FEED_URLS=https://jobicy.com/?feed=job_feed,https://jobicy.com/?feed=job_feed&job_categories=data-science
IMPORT_CRON_SCHEDULE=0 * * * *  # Hourly
CONCURRENCY=4                    # Worker threads
MONGO_URI=mongodb://localhost:27017/job_importer
REDIS_HOST=127.0.0.1
```

## Monitoring & Health Checks

### Application Monitoring

- Structured logging with Winston
- Import success/failure rates
- Queue depth monitoring
- Database connection health

### Metrics Tracked

- Total jobs processed
- Import run statistics
- Processing time per feed
- Error rates and types
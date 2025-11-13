const { Queue, Worker } = require("bullmq");
const { connection } = require("../config/bull");
const { importProcessor } = require("../workers/importWorker");

const queueName = "feed-import-queue";
let queue;

async function initQueue() {
  queue = new Queue(queueName, { connection });
  const concurrency = parseInt(process.env.CONCURRENCY || "4", 10);
  new Worker(queueName, importProcessor, { connection, concurrency });
  return queue;
}

async function enqueueFeed(feedUrl) {
  if (!queue) queue = new Queue(queueName, { connection });
  const job = await queue.add(
    "import-feed",
    { feedUrl },
    { attempts: 3, backoff: { type: "exponential", delay: 1000 } }
  );
  return job;
}

// Alias for consistency with cron service
const addImportJob = enqueueFeed;

module.exports = { initQueue, enqueueFeed, addImportJob };

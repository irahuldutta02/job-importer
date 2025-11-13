const cron = require("node-cron");
const { addImportJob } = require("../queues/importQueue");
const logger = require("../utils/logger");

class CronService {
  constructor() {
    this.tasks = [];
  }

  startHourlyImports() {
    const cronSchedule = process.env.IMPORT_CRON_SCHEDULE || "0 * * * *"; // Every hour by default
    const feedUrls = process.env.FEED_URLS
      ? process.env.FEED_URLS.split(",")
      : [
          "https://jobicy.com/?feed=job_feed",
          "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
          "https://jobicy.com/?feed=job_feed&job_categories=data-science",
          "https://www.higheredjobs.com/rss/articleFeed.cfm",
        ];

    logger.info(`Setting up cron job with schedule: ${cronSchedule}`);
    logger.info(`Feed URLs to process: ${feedUrls.length} feeds`);

    const task = cron.schedule(
      cronSchedule,
      async () => {
        logger.info("Starting scheduled feed imports...");

        for (const feedUrl of feedUrls) {
          try {
            await addImportJob(feedUrl.trim());
            logger.info(`Queued import job for: ${feedUrl}`);
          } catch (error) {
            logger.error(`Failed to queue import job for ${feedUrl}:`, error);
          }
        }

        logger.info(`Queued ${feedUrls.length} import jobs`);
      },
      {
        scheduled: false, // Don't start automatically
      }
    );

    this.tasks.push(task);
    return task;
  }

  startAllTasks() {
    logger.info("Starting all cron tasks...");
    this.tasks.forEach((task) => {
      if (task && typeof task.start === "function") {
        task.start();
      }
    });
  }

  stopAllTasks() {
    logger.info("Stopping all cron tasks...");
    this.tasks.forEach((task) => {
      if (task && typeof task.stop === "function") {
        task.stop();
      }
    });
  }

  // Manual trigger for testing
  async triggerImportsNow() {
    const feedUrls = process.env.FEED_URLS
      ? process.env.FEED_URLS.split(",")
      : [
          "https://jobicy.com/?feed=job_feed",
          "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
          "https://jobicy.com/?feed=job_feed&job_categories=data-science",
          "https://www.higheredjobs.com/rss/articleFeed.cfm",
        ];

    logger.info("Manually triggering feed imports...");

    for (const feedUrl of feedUrls) {
      try {
        await addImportJob(feedUrl.trim());
        logger.info(`Queued import job for: ${feedUrl}`);
      } catch (error) {
        logger.error(`Failed to queue import job for ${feedUrl}:`, error);
      }
    }

    return { message: `Queued ${feedUrls.length} import jobs`, feedUrls };
  }
}

module.exports = new CronService();

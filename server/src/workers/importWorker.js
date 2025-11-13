const { fetchFeed } = require('../services/feedFetcher');
const Job = require('../models/Job');
const ImportLog = require('../models/ImportLog');
const logger = require('../utils/logger');

async function processFeed(job) {
  const { feedUrl } = job.data;
  const startedAt = new Date();
  const failedJobs = [];
  let totalFetched = 0;
  let totalImported = 0;
  let newJobs = 0;
  let updatedJobs = 0;

  try {
    const items = await fetchFeed(feedUrl);
    totalFetched = items.length;

    for (const it of items) {
      try {
        if (!it.externalId) {
          failedJobs.push({ reason: 'Missing externalId', item: it });
          continue;
        }
        const existing = await Job.findOne({ externalId: it.externalId }).exec();
        if (!existing) {
          const doc = new Job(Object.assign({ externalId: it.externalId }, it));
          await doc.save();
          newJobs++;
          totalImported++;
        } else {
          await Job.updateOne({ externalId: it.externalId }, { $set: { ...it, lastSeenAt: new Date() } }).exec();
          updatedJobs++;
          totalImported++;
        }
      } catch (err) {
        failedJobs.push({ reason: err.message, item: it });
      }
    }
  } catch (err) {
    failedJobs.push({ reason: 'Fetch/Parse error: ' + err.message, item: null });
  } finally {
    const finishedAt = new Date();
    const log = new ImportLog({
      feedUrl,
      startedAt,
      finishedAt,
      totalFetched,
      totalImported,
      newJobs,
      updatedJobs,
      failedJobs,
    });
    try {
      await log.save();
    } catch (err) {
      logger.error('Failed to save import log', err);
    }
    logger.info(`Feed processed: ${feedUrl} fetched=${totalFetched} imported=${totalImported} new=${newJobs} updated=${updatedJobs} failed=${failedJobs.length}`);
  }
}

module.exports = { importProcessor: processFeed };

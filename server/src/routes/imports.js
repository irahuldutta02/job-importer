const express = require("express");
const router = express.Router();
const { enqueueFeed } = require("../queues/importQueue");
const ImportLog = require("../models/ImportLog");
const cronService = require("../services/cronService");

router.post("/run", async (req, res) => {
  const { feedUrl } = req.body;
  if (!feedUrl) return res.status(400).json({ error: "feedUrl is required" });
  try {
    const job = await enqueueFeed(feedUrl);
    res.json({ ok: true, jobId: job.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const logs = await ImportLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec();
    res.json({ ok: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual trigger for all scheduled feeds
router.post("/trigger-now", async (req, res) => {
  try {
    const result = await cronService.triggerImportsNow();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get job statistics
router.get("/stats", async (req, res) => {
  try {
    const Job = require("../models/Job");
    const totalJobs = await Job.countDocuments();
    const recentImports = await ImportLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();
    const lastImport = recentImports[0] || null;

    res.json({
      ok: true,
      stats: {
        totalJobs,
        lastImport,
        recentImports: recentImports.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const ImportLogSchema = new mongoose.Schema({
  feedUrl: String,
  startedAt: Date,
  finishedAt: Date,
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: [
    {
      reason: String,
      item: mongoose.Schema.Types.Mixed,
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('ImportLog', ImportLogSchema);

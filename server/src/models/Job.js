const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  externalId: { type: String, required: true, index: true, unique: true },
  title: String,
  company: String,
  location: String,
  description: String,
  url: String,
  raw: mongoose.Schema.Types.Mixed,
  lastSeenAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);

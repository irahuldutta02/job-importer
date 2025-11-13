const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/job_importer';
  await mongoose.connect(uri, { dbName: 'job_importer' });
  logger.info('Connected to MongoDB');
}

module.exports = { connectDB };

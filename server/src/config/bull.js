const IORedis = require("ioredis");
const host = process.env.REDIS_HOST || "127.0.0.1";
const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
const connection = new IORedis({ host, port, maxRetriesPerRequest: null });
module.exports = { connection };

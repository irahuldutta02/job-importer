const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const importRoutes = require("./routes/imports");
const { initQueue } = require("./queues/importQueue");
const cronService = require("./services/cronService");
const logger = require("./utils/logger");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/imports", importRoutes);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB();
    await initQueue();

    // Set up cron jobs for scheduled imports
    cronService.startHourlyImports();
    cronService.startAllTasks();

    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
      logger.info(
        `Scheduled imports will run according to: ${
          process.env.IMPORT_CRON_SCHEDULE || "0 * * * *"
        }`
      );
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

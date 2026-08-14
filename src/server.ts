import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";
import { seedAdmin } from "./scripts/adminSeeder";

const startServer = async () => {
  const PORT = Config.PORT;

  try {
    await AppDataSource.initialize();
    logger.info("Database connected successfully.");

    // Seed admin user on startup (CRITICAL BLOCKING STEP)
    const adminResult = await seedAdmin();
    logger.info(`Admin initialization complete: ${adminResult.message}`);

    // Server starts listening only after admin seeding is complete
    app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

void startServer();

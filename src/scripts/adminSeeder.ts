import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import { Config } from "../config";
import Logger from "../config/logger";
import createHttpError from "http-errors";

export interface AdminSeederResult {
  created: boolean;
  message: string;
}

export const seedAdmin = async (): Promise<AdminSeederResult> => {
  const userRepository = AppDataSource.getRepository(User);

  try {
    // 1. Pull dynamic configurations from environment variables
    const adminEmail = Config.ADMIN_EMAIL || "ssain5840@gmail.com";
    const adminPassword = Config.ADMIN_PASSWORD;

    // Validate required credentials
    if (!adminPassword) {
      const err = createHttpError(
        500,
        "Admin password is not set in environment variables.",
      );
      throw err;
    }

    if (!adminEmail) {
      const err = createHttpError(
        500,
        "Admin email is not set in environment variables.",
      );
      throw err;
    }

    // 2. Hash the password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 3. Insert admin user with idempotency (orIgnore prevents duplicates on multiple launches)
    const result = await userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        firstName: "Sagar",
        lastName: "admin",
        email: adminEmail.toLowerCase().trim(),
        password: hashedPassword,
        role: "admin",
        tenant: null,
      })
      .orIgnore()
      .execute();

    if (result.identifiers.length > 0) {
      Logger.info("Admin user created successfully.");
      return { created: true, message: "Admin user created successfully." };
    } else {
      Logger.info("Admin user already exists. Skipping creation.");
      return {
        created: false,
        message: "Admin user already exists. Skipping creation.",
      };
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    Logger.error(`Error initializing the admin user: ${errorMessage}`);
    throw error;
  }
};

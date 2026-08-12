import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
  url:
    process.env.DATABASE_URL ||
    "mysql://dataset_user:dataset_password@localhost:3306/dataset_db",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || "dataset_user",
  password: process.env.DB_PASSWORD || "dataset_password",
  database: process.env.DB_NAME || "dataset_db",
}));

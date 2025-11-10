import { Pool } from "pg";
import { env } from "../config/env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Unexpected database error", error);
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};

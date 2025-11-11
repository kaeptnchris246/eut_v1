import { Pool, QueryResult, QueryResultRow } from "pg";
import { env } from "../config/env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on("error", (error: Error) => {
  console.error("Unexpected database error", error);
});

export const db = {
  query: async <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: ReadonlyArray<unknown>,
  ): Promise<QueryResult<T>> => pool.query<T>(text, params as any[] | undefined),
  getClient: () => pool.connect(),
};

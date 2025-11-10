import { db } from "../utils/db.js";

export interface Transaction {
  id: string;
  commitmentId: string | null;
  userId: string | null;
  fundId: string | null;
  type: string;
  amount: number;
  meta: Record<string, unknown>;
  createdAt: string;
}

interface TransactionRow {
  id: string;
  commitment_id: string | null;
  user_id: string | null;
  fund_id: string | null;
  tx_type: string;
  amount: string;
  meta: Record<string, unknown> | null;
  created_at: Date;
}

const mapTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  commitmentId: row.commitment_id,
  userId: row.user_id,
  fundId: row.fund_id,
  type: row.tx_type,
  amount: Number(row.amount),
  meta: row.meta ?? {},
  createdAt: row.created_at.toISOString(),
});

export const listTransactionsForUser = async (userId: string) => {
  const result = await db.query<TransactionRow>(
    `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [userId],
  );
  return result.rows.map(mapTransaction);
};

export const createTransaction = async (input: {
  commitmentId?: string | null;
  userId?: string | null;
  fundId?: string | null;
  type: string;
  amount: number;
  meta?: Record<string, unknown>;
}) => {
  const result = await db.query<TransactionRow>(
    `INSERT INTO transactions (commitment_id, user_id, fund_id, tx_type, amount, meta)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.commitmentId ?? null,
      input.userId ?? null,
      input.fundId ?? null,
      input.type,
      input.amount,
      input.meta ?? {},
    ],
  );
  return mapTransaction(result.rows[0]);
};

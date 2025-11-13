import { db } from "../utils/db.js";
import { badRequest, notFound } from "../utils/errors.js";

export interface Fund {
  id: string;
  code: string;
  name: string;
  description: string | null;
  currency: string;
  targetAmount: number;
  minCommitment: number;
  status: string;
  createdAt: string;
}

interface FundRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  currency: string;
  target_amount: string;
  min_commitment: string;
  status: string;
  created_at: Date;
}

const mapFund = (row: FundRow): Fund => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description,
  currency: row.currency,
  targetAmount: Number(row.target_amount),
  minCommitment: Number(row.min_commitment),
  status: row.status,
  createdAt: row.created_at.toISOString(),
});

export const listFunds = async () => {
  const result = await db.query<FundRow>("SELECT * FROM funds ORDER BY created_at DESC");
  return result.rows.map(mapFund);
};

export const getFundById = async (id: string) => {
  const result = await db.query<FundRow>("SELECT * FROM funds WHERE id = $1", [id]);
  if (!result.rowCount) {
    throw notFound("Fund not found");
  }
  return mapFund(result.rows[0]);
};

export const createFund = async (input: {
  code: string;
  name: string;
  description?: string | null;
  currency?: string;
  targetAmount: number;
  minCommitment: number;
  status?: string;
}) => {
  const existing = await db.query<FundRow>("SELECT * FROM funds WHERE code = $1", [input.code]);
  if (existing.rowCount && existing.rowCount > 0) {
    throw badRequest("Fund code already exists");
  }

  const result = await db.query<FundRow>(
    `INSERT INTO funds (code, name, description, currency, target_amount, min_commitment, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.code,
      input.name,
      input.description ?? null,
      input.currency ?? "EUR",
      input.targetAmount,
      input.minCommitment,
      input.status ?? "open",
    ],
  );

  return mapFund(result.rows[0]);
};

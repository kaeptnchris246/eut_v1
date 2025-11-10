import { db } from "../utils/db.js";
import { badRequest } from "../utils/errors.js";

export interface Wallet {
  id: string;
  userId: string;
  address: string | null;
  chain: string | null;
  createdAt: string;
}

interface WalletRow {
  id: string;
  user_id: string;
  address: string | null;
  chain: string | null;
  created_at: Date;
}

const mapWallet = (row: WalletRow): Wallet => ({
  id: row.id,
  userId: row.user_id,
  address: row.address,
  chain: row.chain,
  createdAt: row.created_at.toISOString(),
});

export const listWalletsForUser = async (userId: string) => {
  const result = await db.query<WalletRow>(
    `SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows.map(mapWallet);
};

export const createWallet = async (input: { userId: string; address?: string | null; chain?: string | null }) => {
  if (!input.address && !input.chain) {
    throw badRequest("Address or chain must be provided");
  }
  const result = await db.query<WalletRow>(
    `INSERT INTO wallets (user_id, address, chain)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.userId, input.address ?? null, input.chain ?? "offchain"],
  );
  return mapWallet(result.rows[0]);
};

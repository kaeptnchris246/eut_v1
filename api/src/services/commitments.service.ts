import { db } from "../utils/db.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";
import { createTransaction } from "./transactions.service.js";

export interface Commitment {
  id: string;
  fundId: string;
  userId: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface CommitmentRow {
  id: string;
  fund_id: string;
  user_id: string;
  amount: string;
  status: string;
  created_at: Date;
}

const mapCommitment = (row: CommitmentRow): Commitment => ({
  id: row.id,
  fundId: row.fund_id,
  userId: row.user_id,
  amount: Number(row.amount),
  status: row.status,
  createdAt: row.created_at.toISOString(),
});

export const listCommitmentsForUser = async (userId: string) => {
  const result = await db.query<CommitmentRow>(
    `SELECT * FROM commitments WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows.map(mapCommitment);
};

export const createCommitment = async (input: { userId: string; fundId: string; amount: number }) => {
  const fundResult = await db.query(
    "SELECT id, status, min_commitment FROM funds WHERE id = $1",
    [input.fundId],
  );
  if (!fundResult.rowCount) {
    throw notFound("Fund not found");
  }
  const fund = fundResult.rows[0] as { id: string; status: string; min_commitment: string };
  if (fund.status !== "open") {
    throw badRequest("Fund is not open for commitments");
  }
  if (input.amount < Number(fund.min_commitment)) {
    throw badRequest("Commitment below minimum amount");
  }

  const result = await db.query<CommitmentRow>(
    `INSERT INTO commitments (fund_id, user_id, amount, status)
     VALUES ($1, $2, $3, 'reserved')
     RETURNING *`,
    [input.fundId, input.userId, input.amount],
  );

  const commitment = mapCommitment(result.rows[0]);
  await createTransaction({
    commitmentId: commitment.id,
    fundId: commitment.fundId,
    userId: commitment.userId,
    type: "reserve",
    amount: commitment.amount,
  });

  return commitment;
};

export const confirmCommitment = async (input: { userId: string; commitmentId: string }) => {
  const result = await db.query<CommitmentRow>(
    `SELECT * FROM commitments WHERE id = $1 AND user_id = $2`,
    [input.commitmentId, input.userId],
  );
  if (!result.rowCount) {
    throw notFound("Commitment not found");
  }
  const commitment = result.rows[0];
  if (commitment.status !== "reserved") {
    throw badRequest("Only reserved commitments can be confirmed");
  }

  const updated = await db.query<CommitmentRow>(
    `UPDATE commitments SET status = 'confirmed' WHERE id = $1 RETURNING *`,
    [input.commitmentId],
  );
  const mapped = mapCommitment(updated.rows[0]);

  await createTransaction({
    commitmentId: mapped.id,
    fundId: mapped.fundId,
    userId: mapped.userId,
    type: "confirm",
    amount: mapped.amount,
  });

  return mapped;
};

export const cancelCommitment = async (input: { userId: string; commitmentId: string }) => {
  const result = await db.query<CommitmentRow>(
    `SELECT * FROM commitments WHERE id = $1 AND user_id = $2`,
    [input.commitmentId, input.userId],
  );
  if (!result.rowCount) {
    throw notFound("Commitment not found");
  }
  const commitment = result.rows[0];
  if (commitment.status === "cancelled") {
    return mapCommitment(commitment);
  }
  if (commitment.status === "confirmed") {
    throw forbidden("Confirmed commitments cannot be cancelled");
  }

  const updated = await db.query<CommitmentRow>(
    `UPDATE commitments SET status = 'cancelled' WHERE id = $1 RETURNING *`,
    [input.commitmentId],
  );
  const mapped = mapCommitment(updated.rows[0]);

  await createTransaction({
    commitmentId: mapped.id,
    fundId: mapped.fundId,
    userId: mapped.userId,
    type: "refund",
    amount: mapped.amount,
  });

  return mapped;
};

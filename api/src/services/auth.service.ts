import { db } from "../utils/db.js";
import { conflict, unauthorized } from "../utils/errors.js";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
}

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  password_hash: string;
  created_at: Date;
}

const mapUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  role: row.role,
  createdAt: row.created_at.toISOString(),
});

export const createUser = async (email: string, password: string, fullName?: string | null) => {
  const existing = await db.query<UserRow>("SELECT * FROM app_users WHERE email = $1", [email.toLowerCase()]);
  if (existing.rowCount && existing.rowCount > 0) {
    throw conflict("Email is already registered");
  }

  const result = await db.query<UserRow>(
    `INSERT INTO app_users (email, full_name, role, password_hash)
     VALUES ($1, $2, 'investor', crypt($3, gen_salt('bf')))
     RETURNING *`,
    [email.toLowerCase(), fullName ?? null, password],
  );

  return mapUser(result.rows[0]);
};

export const authenticateUser = async (email: string, password: string) => {
  const result = await db.query<UserRow>(
    `SELECT * FROM app_users WHERE email = $1 AND password_hash = crypt($2, password_hash)`,
    [email.toLowerCase(), password],
  );
  if (!result.rowCount) {
    throw unauthorized("Invalid credentials");
  }
  const user = result.rows[0];
  if (!user.password_hash) {
    throw unauthorized("Password authentication is not available for this account");
  }
  return mapUser(user);
};

export const findUserById = async (id: string) => {
  const result = await db.query<UserRow>("SELECT * FROM app_users WHERE id = $1", [id]);
  if (!result.rowCount) {
    return null;
  }
  return mapUser(result.rows[0]);
};

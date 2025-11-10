import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export const signToken = (payload: TokenPayload, expiresIn = "12h") =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn });

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;

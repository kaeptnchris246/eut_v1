import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { forbidden, unauthorized } from "../utils/errors.js";

export type UserRole = "admin" | "investor" | "spv_manager";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export type AuthenticatedRequest<
  TBody = unknown,
  TParams = Record<string, string>,
  TQuery = Record<string, unknown>,
> = Request<TParams, any, TBody, TQuery> & {
  user?: AuthenticatedUser;
};

const normaliseRole = (value: string | undefined): UserRole => {
  const normalised = value?.toLowerCase();
  if (normalised === "admin" || normalised === "spv_manager" || normalised === "investor") {
    return normalised;
  }
  return "investor";
};

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(unauthorized("Authorization header missing"));
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: normaliseRole(payload.role),
    };
    return next();
  } catch (error) {
    return next(unauthorized("Invalid or expired token"));
  }
};

export const requireRole = (roles: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized());
    }
    const allowed = roles.map((role) => normaliseRole(role));
    if (!allowed.includes(req.user.role)) {
      return next(forbidden("Insufficient permissions"));
    }
    return next();
  };

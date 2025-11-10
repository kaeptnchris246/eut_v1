import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { forbidden, unauthorized } from "../utils/errors.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

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
      role: payload.role,
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
    if (!roles.includes(req.user.role)) {
      return next(forbidden("Insufficient permissions"));
    }
    return next();
  };

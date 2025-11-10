import { Request, Response, NextFunction } from "express";
import { createUser, authenticateUser, findUserById } from "../services/auth.service.js";
import { signToken } from "../utils/jwt.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName } = req.body as { email: string; password: string; fullName?: string };
    const user = await createUser(email, password, fullName);
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return res.status(201).json({ user, token });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await authenticateUser(email, password);
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return res.json({ user, token });
  } catch (error) {
    return next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

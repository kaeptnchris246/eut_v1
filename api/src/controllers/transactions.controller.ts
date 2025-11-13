import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { listTransactionsForUser } from "../services/transactions.service.js";

export const getMyTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const transactions = await listTransactionsForUser(req.user!.id);
    return res.json({ transactions });
  } catch (error) {
    return next(error);
  }
};

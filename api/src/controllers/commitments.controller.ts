import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { cancelCommitment, confirmCommitment, createCommitment, listCommitmentsForUser } from "../services/commitments.service.js";

export const getMyCommitments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const commitments = await listCommitmentsForUser(req.user!.id);
    return res.json({ commitments });
  } catch (error) {
    return next(error);
  }
};

export const reserveCommitment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { fundId, amount } = req.body as { fundId: string; amount: number };
    const commitment = await createCommitment({
      fundId,
      amount,
      userId: req.user!.id,
    });
    return res.status(201).json({ commitment });
  } catch (error) {
    return next(error);
  }
};

export const confirmMyCommitment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const commitment = await confirmCommitment({
      commitmentId: id,
      userId: req.user!.id,
    });
    return res.json({ commitment });
  } catch (error) {
    return next(error);
  }
};

export const cancelMyCommitment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const commitment = await cancelCommitment({
      commitmentId: id,
      userId: req.user!.id,
    });
    return res.json({ commitment });
  } catch (error) {
    return next(error);
  }
};

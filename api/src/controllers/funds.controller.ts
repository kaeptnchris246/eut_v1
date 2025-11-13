import { Request, Response, NextFunction } from "express";
import { createFund, getFundById, listFunds } from "../services/funds.service.js";

export const getFunds = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const funds = await listFunds();
    return res.json({ funds });
  } catch (error) {
    return next(error);
  }
};

type FundParams = { id: string };
type CreateFundBody = {
  code: string;
  name: string;
  description?: string;
  currency?: string;
  targetAmount: number;
  minCommitment: number;
  status?: string;
};

export const getFund = async (
  req: Request<FundParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const fund = await getFundById(req.params.id);
    return res.json({ fund });
  } catch (error) {
    return next(error);
  }
};

export const addFund = async (
  req: Request<Record<string, string>, any, CreateFundBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, name, description, currency, targetAmount, minCommitment, status } = req.body;
    const fund = await createFund({
      code,
      name,
      description,
      currency,
      targetAmount,
      minCommitment,
      status,
    });
    return res.status(201).json({ fund });
  } catch (error) {
    return next(error);
  }
};

import { NextFunction, RequestHandler, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { stageSwapTransaction } from "../services/swap.service.js";

export interface SwapBody {
  fromToken: string;
  toToken: string;
  amount: string;
  walletAddress: string;
}

type SwapParams = Record<string, string>;

const handler: RequestHandler<SwapParams, any, SwapBody> = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest<SwapBody>;
    if (!authReq.user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const result = await stageSwapTransaction({
      fromToken: authReq.body.fromToken,
      toToken: authReq.body.toToken,
      amount: authReq.body.amount,
      walletAddress: authReq.body.walletAddress,
      user: authReq.user,
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const createSwap = handler;

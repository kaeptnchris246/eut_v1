import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { createWallet, listWalletsForUser } from "../services/wallets.service.js";

export const getMyWallets = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const wallets = await listWalletsForUser(req.user!.id);
    return res.json({ wallets });
  } catch (error) {
    return next(error);
  }
};

export const addWallet = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { address, chain } = req.body as { address?: string; chain?: string };
    const wallet = await createWallet({
      userId: req.user!.id,
      address,
      chain,
    });
    return res.status(201).json({ wallet });
  } catch (error) {
    return next(error);
  }
};

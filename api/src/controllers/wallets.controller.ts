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

type AddWalletBody = { address?: string; chain?: string };

export const addWallet = async (
  req: AuthenticatedRequest<AddWalletBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { address, chain } = req.body;
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

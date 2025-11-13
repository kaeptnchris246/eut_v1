import { Router } from "express";
import { z } from "zod";
import { addWallet, getMyWallets } from "../controllers/wallets.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../utils/validator.js";

const router = Router();

router.get("/me", authenticate, getMyWallets);

router.post(
  "/",
  authenticate,
  validateRequest({
    body: z.object({
      address: z.string().min(3).max(200).optional(),
      chain: z.string().min(2).max(50).optional(),
    }),
  }),
  addWallet,
);

export default router;

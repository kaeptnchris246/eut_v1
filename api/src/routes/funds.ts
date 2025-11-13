import { Router } from "express";
import { z } from "zod";
import { addFund, getFund, getFunds } from "../controllers/funds.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { validateRequest } from "../utils/validator.js";

const router = Router();

router.get("/", authenticate, getFunds);
router.get<{ id: string }>(
  "/:id",
  authenticate,
  validateRequest({ params: z.object({ id: z.string().uuid() }) }),
  getFund,
);

router.post<Record<string, any>, any, {
  code: string;
  name: string;
  description?: string;
  currency?: string;
  targetAmount: number;
  minCommitment: number;
  status?: string;
}>(
  "/",
  authenticate,
  requireRole(["admin"]),
  validateRequest({
    body: z.object({
      code: z.string().min(2).max(50),
      name: z.string().min(2).max(200),
      description: z.string().max(2000).optional(),
      currency: z.string().length(3).optional(),
      targetAmount: z.number().positive(),
      minCommitment: z.number().positive(),
      status: z.enum(["open", "closed"]).optional(),
    }),
  }),
  addFund,
);

export default router;

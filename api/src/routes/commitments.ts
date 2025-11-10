import { Router } from "express";
import { z } from "zod";
import {
  cancelMyCommitment,
  confirmMyCommitment,
  getMyCommitments,
  reserveCommitment,
} from "../controllers/commitments.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../utils/validator.js";

const router = Router();

router.get("/me", authenticate, getMyCommitments);

router.post(
  "/",
  authenticate,
  validateRequest({
    body: z.object({
      fundId: z.string().uuid(),
      amount: z.number().positive(),
    }),
  }),
  reserveCommitment,
);

router.patch(
  "/:id/confirm",
  authenticate,
  validateRequest({ params: z.object({ id: z.string().uuid() }) }),
  confirmMyCommitment,
);

router.patch(
  "/:id/cancel",
  authenticate,
  validateRequest({ params: z.object({ id: z.string().uuid() }) }),
  cancelMyCommitment,
);

export default router;

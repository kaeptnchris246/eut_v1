import { Router } from "express";
import { z } from "zod";
import { signup, login, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validateRequest } from "../utils/validator.js";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post(
  "/signup",
  validateRequest({
    body: credentialsSchema.extend({ fullName: z.string().min(1).max(120).optional() }),
  }),
  signup,
);

router.post(
  "/login",
  validateRequest({ body: credentialsSchema }),
  login,
);

router.get("/me", authenticate, me);

export default router;

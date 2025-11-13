import { Router } from "express";
import { createSwap } from "../controllers/swap.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();
router.post("/", authenticate, createSwap);

export default router;

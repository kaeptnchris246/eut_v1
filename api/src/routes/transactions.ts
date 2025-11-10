import { Router } from "express";
import { getMyTransactions } from "../controllers/transactions.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/me", authenticate, getMyTransactions);

export default router;

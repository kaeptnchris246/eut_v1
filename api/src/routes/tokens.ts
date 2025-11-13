import { Router } from "express";
import { listTokens } from "../controllers/tokens.controller.js";

const router = Router();

router.get("/", listTokens);

export default router;

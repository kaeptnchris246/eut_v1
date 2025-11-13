import cors from "cors";
import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { apiRateLimiter, securityMiddleware } from "./config/security.js";
import authRoutes from "./routes/auth.js";
import fundsRoutes from "./routes/funds.js";
import commitmentsRoutes from "./routes/commitments.js";
import transactionsRoutes from "./routes/transactions.js";
import walletsRoutes from "./routes/wallets.js";
import tokensRoutes from "./routes/tokens.js";
import swapRoutes from "./routes/swap.js";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler } from "./middlewares/error.js";

export const createApp = () => {
  const app = express();

  const allowedOrigins = env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000", "http://localhost:5173"];

  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());
  app.use(securityMiddleware);
  app.use(apiRateLimiter);

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRoutes);
  app.use("/funds", fundsRoutes);
  app.use("/commitments", commitmentsRoutes);
  app.use("/transactions", transactionsRoutes);
  app.use("/wallets", walletsRoutes);
  app.use("/tokens", tokensRoutes);
  app.use("/swap", swapRoutes);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use((req: Request, res: Response) => {
    res.status(404).json({ status: "error", message: "Not found" });
  });

  app.use(errorHandler);

  return app;
};

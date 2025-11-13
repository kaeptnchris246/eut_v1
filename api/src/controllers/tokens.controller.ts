import { NextFunction, Request, Response } from "express";
import { getTokens, toPublicToken } from "../services/token-registry.service.js";

export const listTokens = (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = getTokens().map(toPublicToken);
    res.json({ tokens });
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      details: error.details ?? null,
    });
  }

  console.error("Unexpected error", error);
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { badRequest } from "./errors.js";

interface ValidateSchema {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

export const validateRequest = (schema: ValidateSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(badRequest("Validation failed", error.format()));
      }
      next(error);
    }
  };

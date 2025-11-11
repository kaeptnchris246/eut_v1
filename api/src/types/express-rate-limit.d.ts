declare module "express-rate-limit" {
  import { RequestHandler } from "express";

  interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string | Record<string, any>;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
  }

  function rateLimit(options?: RateLimitOptions): RequestHandler;
  export default rateLimit;
}

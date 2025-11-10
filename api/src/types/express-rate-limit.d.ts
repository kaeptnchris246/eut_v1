declare module "express-rate-limit" {
  import { RequestHandler } from "express";
  interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
  }
  function rateLimit(options?: RateLimitOptions): RequestHandler;
  export default rateLimit;
}

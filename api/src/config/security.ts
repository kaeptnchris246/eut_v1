import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const securityMiddleware = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"] ,
      "img-src": ["'self'", "data:"] ,
      "connect-src": ["'self'"],
    },
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

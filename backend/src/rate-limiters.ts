import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const isTest = process.env.NODE_ENV === "test";

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60, // 60 requests in 1 min
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
});

export const ipLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // 5 requests in 1 min
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
});

export const anonymousIdLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // 5 requests in 1 min
  // Prefer anonymous_id as the key so limits apply per user, not per IP
  keyGenerator: (req) => req.body.anonymous_id || ipKeyGenerator(req.ip ?? "unknown"),
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
});

export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20, // 20 requests in 1 min
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
});

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const isTest = process.env.NODE_ENV === "test";

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60, // 60 requests in 1 min
  keyGenerator: (req, res) => ipKeyGenerator(req, res) || "unknown",
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
});

export const ipLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // 5 requests in 1 min
  keyGenerator: (req, res) => ipKeyGenerator(req, res) || "unknown",
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
});

export const anonymousIdLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // 5 requests in 1 min
  keyGenerator: (req, res) => req.body.anonymous_id || ipKeyGenerator(req, res) || "unknown",
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
});

export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20, // 20 requests in 1 min
  keyGenerator: (req, res) => ipKeyGenerator(req, res) || "unknown",
  skip: () => isTest,
  standardHeaders: true,
  legacyHeaders: false,
});

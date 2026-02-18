import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const ipLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // 5 requests in 1 min
  keyGenerator: (req) => ipKeyGenerator(req) || "unknown",
  standardHeaders: true,
  legacyHeaders: false,
});

const anonymousIdLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // 5 requests in 1 min
  keyGenerator: (req) => req.body.anonymous_id || ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
});

const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20, // 20 requests in 1 min
  keyGenerator: (req) => ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
});
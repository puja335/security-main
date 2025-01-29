// ratelimiter.middleware.js
import rateLimit from "express-rate-limit";

export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests from this IP",
  path = "*",
}) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.headers["x-forwarded-for"];
    },
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000 / 60), // minutes
      });
    },
    skip: (req) => {
      // Whitelist certain IPs if needed
      const whitelistedIPs = process.env.WHITELISTED_IPS?.split(",") || [];
      return whitelistedIPs.includes(req.ip);
    },
  });
};

// Specific limiters for different routes
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later",
  // path: "/api/auth/*",
});

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many API requests",
  path: "/api/*",
});


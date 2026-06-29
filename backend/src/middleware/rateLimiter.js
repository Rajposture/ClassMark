import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per IP every 15 minutes
  message: {
    message: "Too many requests. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});
const { RateLimiterMemory } = require("rate-limiter-flexible");

const rateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
});

async function chatRateLimiter(req, res, next) {
  try {
    const key = req.ip || req.headers["x-forwarded-for"] || "local";
    await rateLimiter.consume(key);
    next();
  } catch (_error) {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please wait a moment and try again.",
    });
  }
}

module.exports = { chatRateLimiter };

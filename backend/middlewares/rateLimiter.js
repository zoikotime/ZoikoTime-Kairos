const { RateLimiterMemory, RateLimiterPostgres } = require("rate-limiter-flexible");
const sequelize = require("../config/database");

// ─── Chat Rate Limiter (20 requests per 60 seconds per IP) ───────────────────
const rateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
});

// ─── Email Rate Limiter (5 emails per 24 hours per user email) ───────────────
// Persists in PostgreSQL — survives server restarts
const emailRateLimiter = new RateLimiterPostgres({
  storeClient: sequelize,
  points: 5,
  duration: 86400,        // 24 hours in seconds
  tableName: "email_rate_limits",  // auto created by the library
});

// ─── Chat Rate Limiter Middleware ─────────────────────────────────────────────
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

// ─── Email Rate Limiter Middleware ────────────────────────────────────────────
async function mailRateLimiter(req, res, next) {
  try {
    // Key is per user email — each email gets its own 5/day limit
    const key = req.body?.email || req.body?.user?.email || req.ip || "local";
    await emailRateLimiter.consume(key);
    next();
  } catch (error) {
    const retrySecs = Math.ceil((error.msBeforeNextReset || 0) / 1000 / 3600);
    res.status(429).json({
      success: false,
      message: `Daily email limit reached (5/day). Try again in ${retrySecs} hour(s).`,
    });
  }
}

module.exports = { chatRateLimiter, mailRateLimiter };
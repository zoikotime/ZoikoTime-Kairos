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
  duration: 86400,
  tableName: "email_rate_limits",
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
    const key = req.body?.user?.email || req.ip || "local";
    await emailRateLimiter.consume(key);
    next();
  } catch (error) {
    const ms = error.msBeforeNextReset || 0;
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.ceil((totalSeconds % 3600) / 60);

    // Build a human-readable retry string e.g. "2 hr 34 min" or "45 min"
    let retryAfter = "";
    if (hours > 0 && minutes > 0) {
      retryAfter = `${hours} hr ${minutes} min`;
    } else if (hours > 0) {
      retryAfter = `${hours} hr`;
    } else {
      retryAfter = `${minutes} min`;
    }

    return res.status(429).json({
      success: false,
      code: "EMAIL_LIMIT_REACHED",           // ← frontend keys off this
      message: `You've reached the daily limit of 5 emails. Try again in ${retryAfter}.`,
      retryAfter,                             // e.g. "2 hr 34 min"
      msBeforeNextReset: ms,                  // raw ms for frontend countdown if needed
    });
  }
}

module.exports = { chatRateLimiter, mailRateLimiter };
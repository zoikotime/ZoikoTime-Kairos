const { Router } = require("express");
const { body } = require("express-validator");
const {
  closeSession,
  createSession,
  getChatHistory,
  getChatUiContext,
  getTrackedPrompts,
  getUserSessions,
  removeSession,
  sendChatMessage,
} = require("../controllers/chatController");
const { chatRateLimiter } = require("../middlewares/rateLimiter");

const router = Router();

router.post(
  "/",
  chatRateLimiter,
  [
    body("message").trim().notEmpty().withMessage("Message is required."),
    body("user.email").isEmail().withMessage("Valid email required"),
  ],
  sendChatMessage,
);

router.get("/context", getChatUiContext);
router.get("/sessions", getUserSessions);
router.get("/new-prompts", getTrackedPrompts);
router.post("/sessions", createSession);
router.patch("/sessions/:sessionId/end", closeSession);
router.delete("/sessions/:sessionId", removeSession);
router.get("/history/:sessionId", getChatHistory);

module.exports = router;

const { Router } = require("express");
const { body } = require("express-validator");
const {
  closeSession,
  createSession,
  getChatHistory,
  getChatUiContext,
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
    body("sessionId").trim().notEmpty().withMessage("Session ID is required."),
    body("message").trim().notEmpty().withMessage("Message is required."),
  ],
  sendChatMessage,
);

router.get("/context", getChatUiContext);
router.get("/sessions", getUserSessions);
router.post("/sessions", createSession);
router.patch("/sessions/:sessionId/end", closeSession);
router.delete("/sessions/:sessionId", removeSession);
router.get("/history/:sessionId", getChatHistory);

module.exports = router;

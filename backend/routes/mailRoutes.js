const express = require("express");
const router = express.Router();
const {
  sendMailHandler,
  getMailStatusHandler,
} = require("../controllers/mailController");
const { mailRateLimiter } = require("../middlewares/rateLimiter");

router.get("/status", getMailStatusHandler);
router.post("/send", mailRateLimiter, sendMailHandler);

module.exports = router;

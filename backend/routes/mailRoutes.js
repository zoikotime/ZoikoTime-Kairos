const express = require("express");
const router = express.Router();
const { sendMailHandler } = require("../controllers/mailController");
const { mailRateLimiter } = require("../middlewares/rateLimiter");

router.post("/send", mailRateLimiter, sendMailHandler);

module.exports = router;
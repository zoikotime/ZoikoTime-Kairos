const express = require("express");
const router = express.Router();
const { sendMailHandler } = require("../controllers/mailController");

router.post("/send", sendMailHandler);

module.exports = router;
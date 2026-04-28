const { Router } = require("express");
const { escalateIssue } = require("../controllers/escalateController");

const router = Router();

router.post("/", escalateIssue);

module.exports = router;

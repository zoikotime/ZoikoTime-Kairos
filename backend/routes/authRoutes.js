const { Router } = require("express");
const { body } = require("express-validator");
const { verifyEmployee } = require("../controllers/authController");

const router = Router();

router.post(
  "/verify",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid work email is required."),
    body("company").trim().notEmpty().withMessage("Company is required."),
  ],
  verifyEmployee,
);

module.exports = router;

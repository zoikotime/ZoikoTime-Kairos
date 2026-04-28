const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createEmployeeId, findOrCreateConversationForUser } = require("../services/chatService");

async function verifyEmployee(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const { name, email, company } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const employeeId = createEmployeeId(company, normalizedEmail);

    let userPayload = {
      name: name.trim(),
      email: normalizedEmail,
      company: company.trim(),
      employeeId,
    };

    try {
      const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        { ...userPayload },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      userPayload = {
        name: user.name,
        email: user.email,
        company: user.company,
        employeeId: user.employeeId,
      };
    } catch (_error) {
      // Continue without Mongo persistence during initial local setup.
    }

    const activeConversation = await findOrCreateConversationForUser({
      name: userPayload.name,
      email: userPayload.email,
      company: userPayload.company,
      employeeId: userPayload.employeeId,
    });

    const token = jwt.sign(
      {
        email: userPayload.email,
        sessionId: activeConversation.sessionId,
      },
      process.env.JWT_SECRET || "development-secret",
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      sessionId: activeConversation.sessionId,
      expiresAt: activeConversation.expiresAt,
      token,
      user: {
        name: userPayload.name,
        email: userPayload.email,
        company: userPayload.company,
        employeeId: userPayload.employeeId,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { verifyEmployee };

const { Router } = require("express");
const {
  createSupportRequest,
  getBootstrapData,
  getEmployeeSummary,
  getHealth,
  getHistory,
  getOverview,
  getWorkspaceConfig,
  sendChatMessage,
} = require("../controllers/chatbotController");

const router = Router();

router.get("/health", getHealth);
router.get("/bootstrap", getBootstrapData);
router.post("/chatbot", sendChatMessage);
router.post("/support", createSupportRequest);
router.get("/workspace-config", getWorkspaceConfig);
router.get("/employee-summary", getEmployeeSummary);
router.get("/history/:sessionId", getHistory);
router.get("/admin/overview", getOverview);

module.exports = router;
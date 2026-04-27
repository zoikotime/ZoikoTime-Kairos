import { Router } from "express";
import {
  createSupportRequest,
  getBootstrapData,
  getEmployeeSummary,
  getHealth,
  getHistory,
  getOverview,
  getWorkspaceConfig,
  sendChatMessage,
} from "../controllers/chatbotController.js";

const router = Router();

router.get("/health", getHealth);
router.get("/api/bootstrap", getBootstrapData);
router.post("/api/chatbot", sendChatMessage);
router.post("/api/support", createSupportRequest);
router.get("/api/workspace-config", getWorkspaceConfig);
router.get("/api/employee-summary", getEmployeeSummary);
router.get("/api/history/:sessionId", getHistory);
router.get("/api/admin/overview", getOverview);

export default router;

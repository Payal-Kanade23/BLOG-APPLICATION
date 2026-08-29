import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from '../middleware/authorize.js';
import { PERMISSIONS } from '../utils/permission.js';
const router = express.Router();

router.get("/audit-logs", authMiddleware, authorize(PERMISSIONS.VIEW_ANALYTICS), getAuditLogs);

export default router;

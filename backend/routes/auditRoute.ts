import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authMiddleware } from "../middleware/authMiddleware";
import { authorize } from '../middleware/authorize';
import { PERMISSIONS } from '../utils/permission';
const router = express.Router();

router.get("/audit-logs", authMiddleware, authorize(PERMISSIONS.VIEW_ANALYTICS), getAuditLogs);

export default router;

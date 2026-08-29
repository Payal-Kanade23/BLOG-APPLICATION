import express from "express";
import { z } from "zod";
import { createComment, deleteComment, listComments, updateComment } from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { PERMISSIONS } from "../utils/permission.js";

const router = express.Router();
const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(1000),
  parentComment: z.string().optional().nullable(),
});

router.get("/blog/:blogId/comments", authMiddleware, authorize(PERMISSIONS.VIEW_BLOG), listComments);
router.post("/blog/:blogId/comments", authMiddleware, authorize(PERMISSIONS.COMMENT_BLOG), validate(commentSchema), createComment);
router.patch("/blog/:blogId/comments/:commentId", authMiddleware, authorize(PERMISSIONS.EDIT_COMMENT), validate(commentSchema), updateComment);
router.delete("/blog/:blogId/comments/:commentId", authMiddleware, authorize(PERMISSIONS.DELETE_COMMENT), deleteComment);
export default router;

import express from "express";
import { createBlog, updateBlog, deleteBlog, getBlog, getAllUserBlog, getAllBlog, getDashboard } from "../controllers/blogController.js";
import z from "zod";
import { validate } from "../middleware/validate.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { getLike, likeBlog } from "../controllers/likeController.js";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { authorize } from "../middleware/authorize.js";
import { PERMISSIONS } from "../utils/permission.js";

/*---------------------------VALIDATION--------------------------*/
const BlogSchema = z.object({
  title: z.string().min(3, "Blog title must be atleast 3 character long! "),
  subtitle: z.string().min(1, "subtitle is required"),
  content: z.string().min(1, "Blog description is required!"),
  Visibility: z.enum(["PUBLIC", "PRIVATE"]),
});

const route = express.Router();

//---------------------add new blog--------------------

route.post("/blog", authMiddleware, validate(BlogSchema), authorize(PERMISSIONS.CREATE_BLOG), createBlog);

route.put("/blog/:blogId", authMiddleware, validate(BlogSchema), authorize(PERMISSIONS.EDIT_BLOG), updateBlog);

route.delete("/blog/:blogId", authMiddleware, authorize(PERMISSIONS.DELETE_BLOG), deleteBlog);

route.get("/blog/:blogId", authMiddleware, authorize(PERMISSIONS.VIEW_BLOG), getBlog);

//user specific blogs
route.get("/blogs", authMiddleware, authorize(PERMISSIONS.VIEW_BLOG), getAllUserBlog);

//admin blog
route.get("/blogs/admin", authMiddleware, authorize(PERMISSIONS.VIEW_BLOG), getAllBlog);

// Dashboard
route.get("/blogs/public", optionalAuth,getDashboard);



//----------------------------------like -------------------------------
route.get("/like",authMiddleware , getLike);

route.post("/blog/:id/like",authMiddleware,authorize(PERMISSIONS.LIKE_BLOG),likeBlog);











route.post("/blog/:id/like", authMiddleware, authorize(PERMISSIONS.LIKE_BLOG), likeBlog);

export default route;

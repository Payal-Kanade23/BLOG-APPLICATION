import type { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Blog from "../models/Blog.js";
import { PERMISSIONS, ROLE_PERMISSIONS, type ROLES } from "../utils/permission.js";

export function registerCommentSocket(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (typeof token !== "string") return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId).select("role isBlocked");
      if (!user || user.isBlocked) return next(new Error("Unauthorized"));
      socket.data.userId = user.id;
      socket.data.role = user.role;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("comment:join", async (blogId: string, done?: (result: { ok: boolean }) => void) => {
      if (!mongoose.isValidObjectId(blogId)) return done?.({ ok: false });
      const role = socket.data.role as ROLES;
      if (!ROLE_PERMISSIONS[role]?.includes(PERMISSIONS.VIEW_BLOG)) return done?.({ ok: false });
      const blog = await Blog.exists({ _id: blogId });
      if (!blog) return done?.({ ok: false });
      await socket.join(`blog:${blogId}`);
      done?.({ ok: true });
    });

    socket.on("comment:leave", (blogId: string) => socket.leave(`blog:${blogId}`));
  });
}

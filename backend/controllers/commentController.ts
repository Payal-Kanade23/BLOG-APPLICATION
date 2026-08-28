import type { NextFunction, Response } from "express";
import type { Server } from "socket.io";
import mongoose from "mongoose";
import Blog from "../models/Blog";
import Comment from "../models/Comment";
import type { AuthRequest } from "../utils/express";
import { ROLES } from "../utils/permission";

const authorFields = "name profileImage role";
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

type CommentCursor = { createdAt: string; id: string };

const decodeCursor = (value: unknown): CommentCursor | null => {
  if (typeof value !== "string") return null;
  try {
    const cursor = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as CommentCursor;
    if (!mongoose.isValidObjectId(cursor.id) || Number.isNaN(new Date(cursor.createdAt).getTime())) return null;
    return cursor;
  } catch {
    return null;
  }
};

const encodeCursor = (comment: { _id: mongoose.Types.ObjectId; createdAt: Date }) =>
  Buffer.from(JSON.stringify({ createdAt: comment.createdAt.toISOString(), id: comment._id.toString() })).toString("base64url");

const emitComment = (req: AuthRequest, event: string, payload: unknown) => {
  const io = req.app.get("io") as Server | undefined;
  if (io) io.to(`blog:${req.params.blogId}`).emit(event, payload);
};

export const listComments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const blogId = req.params.blogId;
    if (typeof blogId !== "string" || !mongoose.isValidObjectId(blogId)) {
      return res.status(400).json({ success: false, message: "Invalid blog id" });
    }

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
    const cursor = decodeCursor(req.query.cursor);
    if (typeof req.query.cursor !== "undefined" && !cursor) {
      return res.status(400).json({ success: false, message: "Invalid comment cursor" });
    }

    const beforeCursor = cursor
      ? {
          $or: [
            { createdAt: { $lt: new Date(cursor.createdAt) } },
            { createdAt: new Date(cursor.createdAt), _id: { $lt: cursor.id } },
          ],
        }
      : {};
    const page = await Comment.find({ blog: blogId, ...beforeCursor })
      .populate("author", authorFields)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = page.length > limit;
    const comments = hasMore ? page.slice(0, limit) : page;

    // A recent reply can have an older parent. Include its ancestor chain so every
    // page can be rendered as a valid tree, while the cursor still paginates only
    // the requested comments.
    const included = new Map(comments.map((comment) => [comment._id.toString(), comment]));
    let parentIds = comments
      .map((comment) => comment.parentComment?.toString())
      .filter((parentId): parentId is string => Boolean(parentId) && !included.has(parentId!));
    while (parentIds.length > 0) {
      const parents = await Comment.find({ _id: { $in: parentIds }, blog: blogId })
        .populate("author", authorFields)
        .lean();
      const nextParentIds: string[] = [];
      for (const parent of parents) {
        const parentId = parent._id.toString();
        if (included.has(parentId)) continue;
        included.set(parentId, parent);
        const ancestorId = parent.parentComment?.toString();
        if (ancestorId && !included.has(ancestorId)) nextParentIds.push(ancestorId);
      }
      parentIds = [...new Set(nextParentIds)];
    }

    return res.status(200).json({
      success: true,
      data: [...included.values()],
      nextCursor: hasMore && comments.length > 0 ? encodeCursor(comments[comments.length - 1]) : null,
      hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const blogId = req.params.blogId;
    const { body, parentComment } = req.body as { body: string; parentComment?: string | null };
    const authorId = req.user?.userId;
    if (!authorId || typeof blogId !== "string" || !mongoose.isValidObjectId(blogId)) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const blog = await Blog.findById(blogId).select("_id");
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    if (parentComment) {
      if (!mongoose.isValidObjectId(parentComment)) {
        return res.status(400).json({ success: false, message: "Invalid parent comment" });
      }
      const parent = await Comment.findOne({ _id: parentComment, blog: blogId });
      if (!parent) return res.status(400).json({ success: false, message: "Parent comment does not belong to this blog" });
    }

    const comment = await Comment.create({ blog: blogId, author: authorId, body, parentComment: parentComment || null });
    await Blog.findByIdAndUpdate(blogId, { $inc: { totalComments: 1 } });
    const data = await comment.populate("author", authorFields);
    const payload = data.toObject();
    emitComment(req, "comment:created", payload);
    return res.status(201).json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { blogId, commentId } = req.params;
    const { body } = req.body as { body: string };
    if (
      typeof blogId !== "string" ||
      typeof commentId !== "string" ||
      !mongoose.isValidObjectId(blogId) ||
      !mongoose.isValidObjectId(commentId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid comment request" });
    }
    const comment = await Comment.findOne({ _id: commentId, blog: blogId, isDeleted: false });
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    const canManage = req.user?.role === ROLES.ADMIN || comment.author.toString() === req.user?.userId;
    if (!canManage) return res.status(403).json({ success: false, message: "You can only edit your own comments" });
    comment.body = body;
    await comment.save();
    const data = await comment.populate("author", authorFields);
    const payload = data.toObject();
    emitComment(req, "comment:updated", payload);
    return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { blogId, commentId } = req.params;
    if (
      typeof blogId !== "string" ||
      typeof commentId !== "string" ||
      !mongoose.isValidObjectId(blogId) ||
      !mongoose.isValidObjectId(commentId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid comment request" });
    }
    const comment = await Comment.findOne({ _id: commentId, blog: blogId, isDeleted: false });
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    const canManage = req.user?.role === ROLES.ADMIN || comment.author.toString() === req.user?.userId;
    if (!canManage) return res.status(403).json({ success: false, message: "You can only delete your own comments" });
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.body = "[deleted]";
    await comment.save();
    await Blog.findByIdAndUpdate(blogId, { $inc: { totalComments: -1 } });
    emitComment(req, "comment:deleted", { _id: commentId, blog: blogId });
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

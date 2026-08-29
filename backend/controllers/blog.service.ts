import mongoose from "mongoose";
import Blog from "../models/Blog.js";

interface FindAllParams {
  search?: string | undefined;
  page?: string | number | undefined;
  limit?: string | number | undefined;
  sortBy?: string | undefined;
  sortOrder?: string | undefined;
}

const ALLOWED_SORT_FIELDS = new Set(["createdAt", "totalLikes", "totalComments", "title"]);

export const BlogService = {
  async findAll(params: FindAllParams) {
    const { search, page, limit, sortBy, sortOrder } = params;
    const pageNum = Math.max(parseInt(String(page ?? "1"), 10) || 1, 1);
    const limitNum = Math.max(parseInt(String(limit ?? "10"), 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    try {
      const filter: Record<string, any> = {};

      if (search?.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [{ title: regex }, { content: regex }];
      }

      const sortField = sortBy && ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : "createdBy";
      const sortDirection = sortOrder === "asc" ? 1 : -1;

      const [data, total] = await Promise.all([
        Blog.find(filter)
          .populate({
            path: "author",
            populate: {
              path: "followers",
              select: "name",
            },
          })
          .populate({
            path: "author",
            populate: {
              path: "followings",
              select: "name",
            },
          })
          .sort({ [sortField]: sortDirection })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Blog.countDocuments(filter),
      ]);

      return {
        data: data || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total || 0,
          totalPages: Math.ceil((total || 0) / limitNum),
          hasNextPage: pageNum * limitNum < (total || 0),
          hasPrevPage: pageNum > 1,
        },
      };
    } catch (err) {
      return {
        data: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  },
};

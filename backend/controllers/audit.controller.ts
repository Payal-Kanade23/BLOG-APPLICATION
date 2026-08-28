import Audit from "../models/Audit";
import type { Request, Response } from "express";
import User from "../models/User";
export const getAuditLogs = async (req: Request, res: Response) => {
  try {

    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
    } = req.query;

    // Parse & sanitize numeric params
    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit as string, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort direction as 1 / -1
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortField = (sortBy as string) || "createdAt";

   
    // Optional search filter (adjust fields to match your schema)
    const filter: Record<string, any> = {};
   
    
    if(typeof search === "string" && search?.trim()){
      const regex = new RegExp(search.trim(),"i");

      const users = await User.find({
        name:regex,
      }).select("_id");

      const authorIds = users.map((user:any)=>user._id);

      
      filter.$or = [
        {author:{$in:authorIds}},
        {resource:regex}
      ]
    }
    console.log(filter)

    const [logs, total] = await Promise.all([
      Audit.find(filter)
        .populate("author", "name email")
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limitNum)
        .lean(),

      Audit.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);

    return res.status(500).json({
      message: "Failed to fetch audit logs",
    });
  }
};
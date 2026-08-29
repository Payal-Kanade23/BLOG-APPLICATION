import { AuthRequest } from "../utils/express.js";
import { Response } from "express";
import mongoose from "mongoose";
import Blog from "../models/Blog.js";
import { Like } from "../models/Like.js";
import { logAudit } from "../service/audit.service.js";
import User from "../models/User.js";



export const likeBlog = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const blogId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!mongoose.isValidObjectId(blogId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID",
      });
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const existingLike = await Like.findOne({
      blog: blogId,
      user: userId,
    });

    // UNLIKE
    if (existingLike) {
      await Like.deleteOne({
        _id: existingLike._id,
      });

      await Blog.findByIdAndUpdate(blogId, {
        $inc: {
          totalLikes: -1,
        },
      });

       await logAudit({
       author: blog._id.toString(),
       action: "BLOG UNLIKED",
       resource: "blog",
       resourceId: blog._id.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });

      return res.status(200).json({
        success: true,
        status: "unliked",
        message: "Blog unliked successfully",
        totalLikes: Math.max(0, blog.totalLikes - 1)
      });
    }

    // LIKE
    await Like.create({
      blog: blogId,
      user: userId,
    });


    await Blog.findByIdAndUpdate(blogId, {
        $inc: {
          totalLikes: 1,
        },
      });

       await logAudit({
       author: userId,
       action: "BLOG LIKED",
       resource: "blog",
       resourceId: blog._id.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
    return res.status(200).json({
      success: true,
      status: "liked",
      message: "Blog liked successfully",
      totalLikes: blog.totalLikes + 1
       
    });
  } catch (error: any) {
    console.error("Like error:", error);

    // Duplicate like protection
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Blog already liked",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to like blog",
    });
  }
};

export const getLike = async (
  req: AuthRequest,
  res: Response
) =>{

  try{
  const userId = req.user?.userId;
 
      if(!userId){
         return res.status(400).json({
             success : false,
             message : "User does not exists",
 
         })
      }
 
      const likes = await Like.find({user:userId});
 
     
      if(!likes){
         return res.status(404).json({
             success : false,
             message : "Blog Not Found!",
             
         })
      }

  


   return res.status(200).json({
    success:true,
    message:"All likes fetched",
    data:likes
   })
  }catch(error){
    res.status(500).json({
       success:false,
    message:"Internal Error"+error,
    })
  }
}
import Blog from "../models/Blog";
import type {  Request,Response, NextFunction } from "express";
import { AuthRequest } from "../utils/express";
import User from "../models/User";
import { BlogService } from "./blog.service";
import { logAudit } from "../service/audit.service";
import mongoose from "mongoose";
export const createBlog = async(
     req: AuthRequest,
      res: Response,
      next: NextFunction
)=>{
    try{

     const userId = req.user?.userId;

     const {title ,subtitle, content , Visibility} = req.body;

     const user = await User.findById(userId);
     if(!user){
        return res.status(400).json({
            success : false,
            message : "User does not exists",

        })
     }
     let blog;
     if(user.isPrivate === true){

        blog = await Blog.create({
        author:userId,
        title,
        subtitle,
        content,
        Visibility : "PRIVATE"
     }) 
     }else{
        blog = await Blog.create({
        author:userId,
        title,
        subtitle,
        content,
        Visibility 
     })

    }
      await logAudit({
       author: blog._id.toString(),
       action: "BLOG CREATED",
       resource: "user",
       resourceId: blog._id.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });

     if(blog){
        return res.status(200).json({
            success : true,
            message : "Blog Created Successfully!",
            data: blog
        })
     }
    


    }catch(error){
      res.status(500).json({
      success: false,
      message: "Internal Server error" + error,
    });
    }
}

export const updateBlog = async(
     req: AuthRequest,
      res: Response,
      next: NextFunction
)=>{
    try{

     const userId = req.user?.userId;
     const blogId = req.params.blogId;
     const {title ,subtitle, content , Visibility} = req.body;



     if(!userId){
        return res.status(400).json({
            success : false,
            message : "User does not exists",

        })
     }
     const blogSave = await Blog.findById(blogId).populate<{ author: { _id: string; isPrivate: boolean } }>(
    "author",
    "isPrivate"
  );
     if (!blogSave) {
  return res.status(404).json({
    success: false,
    message: "Blog not found",
  });
}
     let blog;
     if( blogSave.author.isPrivate === true){
        blog =  await Blog.findByIdAndUpdate(blogId,{
        title ,
        subtitle,
        content ,
        Visibility : "PRIVATE"
     },
    {
        new:true,
         runValidators: true,
    });
     }else{
       blog =  await Blog.findByIdAndUpdate(blogId,{
        title ,
        subtitle,
        content ,
        Visibility 
     },
    {
        new:true,
         runValidators: true,
    }); 
     }
     

    await logAudit({
       author: blog?._id.toString(),
       action: "BLOG UPDATED",
       resource: "user",
       resourceId: blog?._id.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });


     if(!blog){
        return res.status(200).json({
            success : false,
            message : "Blog Not Found!",
            
        })
     }

     if(blog){
        return res.status(201).json({
            success : true,
            message : "Blog Updated Successfully!",
            data: blog
        })
     }

     
    


    }catch(error){
      res.status(500).json({
      success: false,
      message: "Internal Server error" + error,
    });
    }
}


export const deleteBlog = async(
     req: AuthRequest,
      res: Response,
      next: NextFunction
)=>{
    try{

     const userId = req.user?.userId;

     const blogId = req.params.blogId;




     if(!userId){
        return res.status(400).json({
            success : false,
            message : "User does not exists",

        })
     }
      
          const SaveBlog = await Blog.findById(blogId);

      const blog = await Blog.findByIdAndDelete(blogId);

       if(!blog){
        return res.status(404).json({
            success : false,
            message : "Blog Not Found!",
            
        })
     }
     await logAudit({
       author:userId,
       action: "BLOG DELETED",
       resource: "blog",
       resourceId: blog._id.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });

     
        return res.status(200).json({
            success : true,
            message : "Blog deleted Successfully!",
            
        })

    }catch(error){
      res.status(500).json({
      success: false,
      message: "Internal Server error" + error,
    });
    }
}




export const getBlog = async(
     req: AuthRequest,
      res: Response,
      next: NextFunction
)=>{
    try{

     const userId = req.user?.userId;
     const blogId = req.params.blogId;
    


     if(!userId){
        return res.status(400).json({
            success : false,
            message : "User does not exists",

        })
     }

     const blog = await Blog.findById(blogId).populate("author");

    

     if(!blog){
        return res.status(404).json({
            success : false,
            message : "Blog Not Found!",
            
        })
     }


     await logAudit({
       author: userId,
       action: "BLOG FETCHED",
       resource: "blog",
       resourceId: blog._id.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
     
        return res.status(201).json({
            success : true,
            message : "Blog fetched Successfully!",
            data: blog
        })
     

     
    


    }catch(error){
      res.status(500).json({
      success: false,
      message: "Internal Server error" + error,
    });
    }
}


export const getAllUserBlog = async(
     req: AuthRequest,
      res: Response,
      next: NextFunction
)=>{
    try{

     const userId = req.user?.userId;


     if(!userId){
        return res.status(400).json({
            success : false,
            message : "User does not exists",

        })
     }

     const blogs = await Blog.find({author:userId}).populate("author");

    

     if(!blogs){
        return res.status(404).json({
            success : false,
            message : "Blog Not Found!",
            
        })
     }

      await logAudit({
       author: userId,
       action: "USER BLOG FETCHED",
       resource: "user",
       resourceId: userId.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
     
        return res.status(201).json({
            success : true,
            message : "Blog fetched Successfully!",
            data: blogs
        })
     

     
    


    }catch(error){
      res.status(500).json({
      success: false,
      message: "Internal Server error" + error,
    });
    }
}

export const getDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    console.log("userif:",userId)
    const user = userId ? await User.findById(userId) : null;
console.log("sjdhfgsdftds:",user)
    let blogs;

    if (!user) {
      console.log("enter")
      // Not logged in — only public blogs
      blogs = await Blog.aggregate([
        {
          $match: {
            Visibility: "PUBLIC",
          },
        },
      ]);
      console.log("a;;",blogs)
    } else {
      if(user.role === "ADMIN"){
        blogs = await Blog.find();
        return res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blogs,
    });
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);

     blogs = await Blog.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "author",
    },
  },
  {
    $unwind: { path: "$author" },
  },
  {
    $match: {
      $or: [
        { Visibility: "PUBLIC" },
        { Visibility: "PRIVATE", "author.followers": userObjectId },
        { "author._id": userObjectId },
      ],
    },
  },
]);
    }

    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server error: " + error,
    });
  }
};



//------------------------------ADMIN DASHBOARD----------------------------------
export const getAllBlog = async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{


    const {
      page , 
      limit , 
      sortBy ,
      sortOrder,
      search
    } = req.query;




     const result = await BlogService.findAll({
      search : typeof search === "string" ? search : undefined,
      page: page as any,
      limit: limit as any,
      sortBy: typeof sortBy === "string" ? sortBy : undefined,
      sortOrder : typeof sortOrder === "string" ? sortOrder : undefined,

     })
     

     res.status(201).json({
        success:true,
        message:"Blogs fetched Successfully!",
        ...result
     })
} 






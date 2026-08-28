import User from "../models/User";
import { AuthRequest } from "../utils/express";
import { Request,Response, NextFunction } from "express";
import mongoose from "mongoose";
import Blog from "../models/Blog";
import bcrypt from 'bcryptjs';
import { logAudit } from "../service/audit.service";
import { ROLE_PERMISSIONS, ROLES } from "../utils/permission";
export const getAllUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    
    const userId =  req.user?.userId;


   const users = await User.find({
  _id: { $ne: userId },
  role: { $ne: ROLES.ADMIN },
})
  .populate("followers", "name")
  .populate("followings", "name");

 await logAudit({
       author: userId?.toString(),
       action: " USER FETCHED ",
       resource: "user",
       resourceId: userId?.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data:users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error" + error,
      
    });
  }
};


export const getProfile = async (req:AuthRequest, res:Response) => {
  try {
    const requestedUserId = req.params.id;

    // /profile
    // Get logged-in user's ID from JWT middleware
    const userId = requestedUserId || req.user?.userId;

    const user = await User.findById(userId).populate("followers followings");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isOwnProfile =
      req.user?.userId === userId;

    let blogs:any = [];

    // Own profile → show own posts
    if (isOwnProfile) {
      blogs = await Blog.find({
        author: userId,
      }).sort({ createdAt: -1 });
    }

      if (user.role === "ADMIN") {
  return res.status(200).json({
    success: true,
    message: "Admin Profile fetched ",
    data:{user,blogs}
  });
}

    // Other user's profile
    else {
      // Private profile → DON'T fetch posts
    

      // Public profile → ONLY public posts
    
        blogs = await Blog.find({
          author: userId,
        }).sort({ createdAt: -1 });
      
    }

     await logAudit({
       author: userId?.toString(),
       action: " USER PROFILE FETCHED ",
       resource: "user",
       resourceId: userId?.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
    return res.status(200).json({
      success: true,
      data: {
        user,
        blogs,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile " + error,
    });
  }
};


export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not exists",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(400).json({
        success: false,
        message: "Error in deleting Blog ",
      });
    }

     const Saveuser = deletedUser;
    await Blog.deleteMany({
      author: id,
    });

      
       await logAudit({
       author: Saveuser._id?.toString(),
       action: " USER DELETED ",
       resource: "user",
       resourceId: user._id?.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
    return res.status(200).json({
      success: true,
      message: "User and all associated blogs deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error" + error,
    });
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

   const updateData: any = {};

if (req.body.name !== undefined) {
  updateData.name = req.body.name;
}

if (req.body.email !== undefined) {
  updateData.email = req.body.email;
}

if (req.body.isPrivate !== undefined) {
  updateData.isPrivate = req.body.isPrivate === "true";
}

    if(req.body.isPrivate === "true"){
      await Blog.updateMany(
        {author: userId},
        {$set:{Visibility:"PRIVATE"}}
      );
    }

    if(req.user?.role === ROLES.ADMIN){
      updateData.isPrivate = false 
    }
    if (req.body.password) {
      updateData.passwordHash = await bcrypt.hash(
        req.body.password,
        10
      );
    }

    if (req.file) {
      updateData.profileImage =
        `/uploads/profile/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
 await logAudit({
       author: user._id?.toString(),
       action: " USER UPDATED ",
       resource: "user",
       resourceId: user._id?.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      // The database user document intentionally does not own permissions.
      // Return the effective permissions derived from the server role mapping.
      data: {
        user,
        permissions: ROLE_PERMISSIONS[user.role as ROLES] ?? [],
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};



export const followUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const targetUserId = req.params.id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.isValidObjectId(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid current user ID",
      });
    }

    if (!mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target user ID",
      });
    }

    // Cannot follow yourself
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    
  
    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

      if (targetUser.role === "ADMIN") {
  return res.status(403).json({
    success: false,
    message: "You cannot follow an admin",
  });
}

    // --------------------------------
    // CHECK IF ALREADY FOLLOWING
    // --------------------------------

    const isFollowing = targetUser.followers.some(
      (id) => id.toString() === currentUserId.toString()
    );

    // --------------------------------
    // UNFOLLOW
    // --------------------------------

    if (isFollowing) {
      await User.findByIdAndUpdate(targetUserId, {
        $pull: {
          followers: currentUserId,
        },
      });

      await User.findByIdAndUpdate(currentUserId, {
        $pull: {
          followings: targetUserId,
        },
      });

       await logAudit({
       author: currentUserId.toString(),
       action: " UNFOLLOW USER  ",
       resource: "user",
       resourceId: currentUserId.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
      return res.status(200).json({
        success: true,
        status: "follow",
        message: "User unfollowed successfully",
      });
    }

    // --------------------------------
    // CHECK PENDING REQUEST
    // --------------------------------

    const existingRequest = targetUser.followRequest.find(
      (request) =>
        request.sender?.toString() === currentUserId.toString() &&
        request.status === "pending"
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        status: "pending",
        message: "Follow request already sent",
      });
    }

    // --------------------------------
    // PRIVATE USER
    // --------------------------------

    if (targetUser.isPrivate) {
      targetUser.followRequest.push({
        sender: new mongoose.Types.ObjectId(currentUserId),
        status: "pending",
      });

      await targetUser.save();

      await logAudit({
       author: currentUserId.toString(),
       action: " FOLLOW REQUEST SENT  ",
       resource: "user",
       resourceId: currentUserId.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
      return res.status(200).json({
        success: true,
        status: "pending",
        message: "Follow request sent",
      });
    }

    // --------------------------------
    // PUBLIC USER
    // --------------------------------

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: {
        followers: currentUserId,
      },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: {
        followings: targetUserId,
      },
    });

    await logAudit({
       author: currentUserId.toString(),
       action: " FOLLOW USER  ",
       resource: "user",
       resourceId: currentUserId.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
    return res.status(200).json({
      success: true,
      status: "following",
      message: "User followed successfully",
    });

  } catch (error) {
    console.error("Follow/Unfollow error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to follow/unfollow user",
    });
  }
};

export const acceptFollowRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const senderId = req.params.senderId;
    const receiverId = req.user?.userId;

    if (!receiverId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find request
    const request = receiver.followRequest.find(
      (request) =>
        request.sender?.toString() === senderId &&
        request.status === "pending"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Follow request not found",
      });
    }

    await User.findByIdAndUpdate(receiverId, {
  $addToSet: {
    followers: senderId,
  },
});

// Add receiver to sender's following
await User.findByIdAndUpdate(senderId, {
  $addToSet: {
    followings: receiverId,
  },
});

// Remove request
await User.findByIdAndUpdate(receiverId, {
  $pull: {
    followRequest: {
      sender: senderId,
    },
  },
});
await logAudit({
       author: senderId.toString(),
       action: " FOLLOW REQUEST ACCEPTED  ",
       resource: "user",
       resourceId: senderId.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
    return res.status(200).json({
      success: true,
      status: "following",
      message: "Follow request accepted",
    });
  } catch (error) {
    console.error("Accept request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to accept follow request",
    });
  }
};

export const rejectFollowRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const senderId = req.params.senderId;
    const receiverId = req.user?.userId;

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requestExists = receiver.followRequest.some(
      (request) =>
        request.sender?.toString() === senderId &&
        request.status === "pending"
    );

    if (!requestExists) {
      return res.status(404).json({
        success: false,
        message: "Follow request not found",
      });
    }

    await User.findByIdAndUpdate(receiverId, {
  $pull: {
    followRequest: {
      sender: senderId,
    },
  },
})    


    await receiver.save();
await logAudit({
       author: senderId.toString(),
       action: " FOLLOW REQUEST REJECTED  ",
       resource: "user",
       resourceId: senderId.toString(),
       ipAddress: req.ip,
       userAgent: req.headers["user-agent"],
     });
    return res.status(200).json({
      success: true,
      status: "follow",
      message: "Follow request rejected",
    
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject follow request",
    });
  }
};

export const getFollowRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId)
      .populate({
        path: "followRequest.sender",
        select: "name email profileImage ",
      });

      console.log("user:",user)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const pendingRequests = user.followRequest.filter(
      (request) => request.status === "pending"
    );

    return res.status(200).json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests,
    });
  } catch (error) {
    console.error("Get follow requests error:", error);

    return res.status(500).json({
      success: false, 
      message: "Failed to fetch follow requests "+error,
    });
  }
};

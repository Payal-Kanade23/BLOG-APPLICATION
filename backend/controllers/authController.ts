import User from "../models/User";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ROLE_PERMISSIONS, ROLES } from "../utils/permission";
import { logAudit } from "../service/audit.service";
/*---------------------------SIGNUP----------------------*/

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
  
) => {
  try {
    const { role, email, name, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Already exists",
      });
    }

    if (role === ROLES.ADMIN) {
      const adminExists = await User.exists({ role: ROLES.ADMIN });
      if (adminExists) {
        return res.status(403).json({
          success: false,
          message: "Admin already exists , only one admin is allowed. ",
        });
      }
    }

    const passwordhash = await bcrypt.hash(password, 10);

    let newUser;
    if(role === ROLES.ADMIN){
      newUser = await User.create({
      name,
      email,
      password: passwordhash,
      role,
      isPrivate:true
    });
    }else{
      newUser = await User.create({
      name,
      email,
      password: passwordhash,
      role,
      isPrivate:false
    });
    }
    

    await logAudit({
  author: newUser._id.toString(),
  action: "REGISTER",
  resource: "user",
  resourceId: newUser._id.toString(),
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

    
    const token = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const permissions = ROLE_PERMISSIONS[role  as ROLES];


    
    res.status(200).json({
      success: true,
      message: "Successfully User Created!",
      data:{
         _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isPrivate:false,
        permissions,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server error" + error,
    });
  }
};

//----------------------------------LOGIN------------------------------------

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exists",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({
        success: false,
        message: "Invalid credential",
      });
    }

    await logAudit({
  author: user._id.toString(),
  action: "LOGIN",
  resource: "user",
  resourceId: user._id.toString(),
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const permissions = ROLE_PERMISSIONS[user.role as ROLES] ?? [];
       

    return res.status(200).json({
      success: true,
      message: "Login successful",

      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPrivate:user.isPrivate,
        permissions,
      },

      token,
    });

    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error" + error,
    });
  }
};


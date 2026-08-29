import type { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { Multer } from "multer";
import { ROLES } from "./permission.js";
export interface AuthRequest extends Request{
    user?:UserPayload,
    file?: Express.Multer.File;

}
export interface UserPayload extends JwtPayload{
    userId:string;
    role:ROLES;
    
}
import { AuthRequest  } from "../utils/express.js"
import { Response, NextFunction } from "express"
import { PERMISSIONS, ROLE_PERMISSIONS, ROLES } from "../utils/permission.js"
export const authorize = (permission:PERMISSIONS)=>{
    return(req:AuthRequest , res:Response , next:NextFunction) =>{
        const role : ROLES | undefined = req.user?.role;

        if(!role){
            return res.status(401).json({
                message:"Unauthorized",
            })
        }

        const permissions = ROLE_PERMISSIONS[role];

        if(!permissions?.includes(permission)){
            return res.status(403).json({
                message:"Forbidden",
            })
        }
        next()
    }
}
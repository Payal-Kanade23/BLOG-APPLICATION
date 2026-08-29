import type{ Request  , Response , NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { ROLE_PERMISSIONS, ROLES } from '../utils/permission.js';
import { AuthRequest, UserPayload } from '../utils/express.js';
import User from '../models/User.js';



export const authMiddleware = async(
req:AuthRequest,
res:Response,
next:NextFunction
)=>{


    try{
const authHeader = req.headers.authorization;

if(!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({
     success:false,
     message:"NO token provide",
})

const token = authHeader.split(" ")[1]!;

const decoded = jwt.verify(
    token , 
    process.env.JWT_SECRET!
) as UserPayload;

    // Do not use the role embedded in a potentially old JWT as the source of
    // authorization. This makes role changes and account blocks effective on
    // the very next request.
    const user = await User.findById(decoded.userId).select("role isBlocked");
    if (!user || user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const role = user.role as ROLES;
    req.user = {...decoded, role,
    permissions: ROLE_PERMISSIONS[role]

    };
    next();

    }catch(error){
    res.status(401).json({
        success:false,
        message:"Unauthorized"
    })
    }
}

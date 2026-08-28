import { api } from "../../../api"

const API = api;
import type{ Role} from "../../../utils/constant";
interface LoginPayload{
    email:string;
    password:string;
} 



interface FollowRequest {
    sender:User,
    status:string,
}

export interface User{
        _id: string,
        name: string,
        email: string,
        role: Role,
        permissions:string[],  
        profileImage?:string|null,
        isVerified?:string,
        isBlocked?:string,
        followers?:User[],
        followings?:User[],
        isPrivate?:boolean,
        followRequest?:FollowRequest[],
}
interface LoginResponse{
    success:boolean;
    message:string;
    data:User;
    token:string
}
export const loginUser = async(data:LoginPayload):Promise<LoginResponse> =>{
      const response = await API.post("/auth/login",data);
      return response.data;
}  
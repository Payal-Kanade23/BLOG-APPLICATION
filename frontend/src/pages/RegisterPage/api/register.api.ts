import { api } from "../../../api"
import { User } from "../../LoginPage/api/login.api";
const API = api;
import type{ Role} from "../../../utils/constant";
interface RegisterPayload{
    name:string,
    email:string;
    password:string;
    role:"ADMIN"| "USER"
    isPrivate:boolean;
} 




interface RegisterResponse{
    success:boolean;
    message:string;
    data:User;
    token:string
}
export const registerUser = async(data:RegisterPayload):Promise<RegisterResponse> =>{
      const response = await API.post("/auth/register",data);
      return response.data;
}  
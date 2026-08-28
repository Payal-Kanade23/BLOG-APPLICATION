import { api } from "../../../api";
import type { Role } from "../../../utils/constant";
const API = api;
import type { User } from "../../LoginPage/api/login.api";

interface UserResponse{
    success:boolean;
    message:string;
    data:User[];
    
}
export const getAllUser = async():Promise<UserResponse> =>{

    const token = localStorage.getItem("token");
    const response = await API.get("/api/users",{
        
        headers:{
            Authorization :  `Bearer ${token}`
 
        }
      });
      return response.data;
} 


export const followUser = async (id: string) => {
        const token = localStorage.getItem("token");

  const response = await API.post(
    `/api/users/${id}/follow`,
    {},
    {
       headers:{
            Authorization :  `Bearer ${token}`
 
        }
    }
  );

  return response.data;
};
import { api } from "../../../api";
import { User } from "../../LoginPage/api/login.api";
const API = api;
import type { Blog } from "../../CreateEditBlog/api/createBlog.api";
export interface ProfileData {
  user: User;
  blogs: Blog[];
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: ProfileData;
}

export const getProfile = async (id?: string): Promise<ProfileResponse> => {

  const res = await api.get<ProfileResponse>(id ? `/api/profile/${id}` : "/api/profile",{
    headers:{
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
  return res.data;
};

export interface UpdateProfileData {
  user: User;
  permissions: string[];
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: UpdateProfileData;
}

export const editProfile = async (payload: FormData): Promise<UpdateProfileResponse> => {
    
  const res = await api.put<UpdateProfileResponse>("/api/user", payload, {
    headers: { 
        Authorization: `Bearer ${localStorage.getItem("token")}`
        
     },
  });
  return res.data;
};
import { api } from "../../../api"
const API = api;

import type { Blog } from "../../CreateEditBlog/api/createBlog.api";
interface BlogResponse{
    success:boolean;
    message:string;
    data:Blog[];
    
}

export async function getMyBlogs(
):Promise<BlogResponse> {

   const token = localStorage.getItem("token");
  const response = await API.get(
    "/api/blogs",
    {
      
       headers : {
              Authorization : `Bearer ${token}`,
  
          },
    
    }
  );
  return response.data;

}
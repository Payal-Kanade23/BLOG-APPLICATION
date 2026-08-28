import { api } from "../../../api";
import type { Blog } from "../../CreateEditBlog/api/createBlog.api";

const API = api;

interface BlogResponse {
    success:boolean;
    message:string;
    data:Blog[]
}



export const getBlogs = async():Promise<BlogResponse> =>{
    
    const token = localStorage.getItem("token");

    const response = await API.get('/api/blogs',{
        headers :{
            Authorization :  `Bearer ${token}`
        }
     
     });
    return response.data;
}


export const likeBlog = async (blogId: string) => {
    
    const token = localStorage.getItem("token");

    const response = await API.post(
    `/api/blog/${blogId}/like`,
    {},
    {
        headers :{
            Authorization :  `Bearer ${token}`
        }
    }
   
  );

  return response.data;
};

interface Like{
    _id:string,
    blog:string,
    user:string
}
interface LikeResponse {
    success:boolean,
    message:string,
    data:Like[]
}
export const getlike = async():Promise<LikeResponse>=>{
    const token = localStorage.getItem("token");

    const response = await API.get(
    `/api/like`,

    {
        headers :{
            Authorization :  `Bearer ${token}`
        }
    }
   
  );

  return response.data;
}



//dashboard public blogs
export async function getPublicBlogs(
):Promise<BlogResponse> {
    const token = localStorage.getItem("token");

  const response = await API.get(
    "/api/blogs/public",
     {
        headers :{
            Authorization :  `Bearer ${token}`
        }
    }
   
  );
  return response.data;

}
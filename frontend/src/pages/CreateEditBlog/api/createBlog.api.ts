import { api } from "../../../api";
import type{ User } from "../../LoginPage/api/login.api";

const API = api;
export interface BlogPayload {

    title:string;
    subtitle:string
    content:string;
    Visibility:"" | "PUBLIC" | "PRIVATE";

}

export interface Blog{
    _id :string;
    author:User;
    title:string;
    subtitle:string;
    content:string;
    Visibility:"" | "PUBLIC" | "PRIVATE";
    totalLikes:number;
    totalComments:number;
    createdAt:string;
    updatedAt:string;
    
}

interface BlogResponse {
    success:boolean;
    message:string;
    data:Blog
}
interface BlogResponses {
    success:boolean;
    message:string;
    data:Blog[]
}

export const addBlog = async(data:BlogPayload):Promise<BlogResponse> =>{
    
    const token = localStorage.getItem("token");

    const response = await API.post("/api/blog",data,{
        headers :{
            Authorization :  `Bearer ${token}`
        }
     
     });
    return response.data;
}

export const editBlog = async(data:BlogPayload, id:string):Promise<BlogResponse> =>{
    
    const token = localStorage.getItem("token");

    const response = await API.put(`/api/blog/${id}`,data,{
        headers :{
            Authorization :  `Bearer ${token}`
        }
     
     });
    return response.data;
}

export const deleteBlog = async(id:string):Promise<BlogResponse> =>{
    
    const token = localStorage.getItem("token");

    const response = await API.delete(`/api/blog/${id}`,{
        headers :{
            Authorization :  `Bearer ${token}`
        }
     
     });
    return response.data;
}

export const getBlog = async(id:string):Promise<BlogResponse> =>{
    
    const token = localStorage.getItem("token");

    const response = await API.get(`/api/blog/${id}`,{
        headers :{
            Authorization :  `Bearer ${token}`
        }
     
     });
    return response.data;
}

export const getUserBlogs = async():Promise<BlogResponses> =>{
    
    const token = localStorage.getItem("token");

    const response = await API.get(`/api/blogs`,{
        headers :{
            Authorization :  `Bearer ${token}`
        }
     
     });
    return response.data;
}

import type{ Blog } from "../CreateEditBlog/api/createBlog.api";
// Matches the pattern used by getComments/getBlogs elsewhere in dashboard.api.ts
import { api } from "../../api";
import type { AuditLog } from "./component/auditColumn";
const API = api;
export interface GetBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "totalLikes" | "totalComments" | "title";
  sortOrder?: "asc" | "desc";
  visibility?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetBlogsResponse {
  success: boolean;
  data: Blog[];
  pagination: PaginationMeta;
}

interface BlogResponse {
    success:boolean;
    message:string;
}
export const deleteUser = async(id:string):Promise<BlogResponse> =>{
    
    const token = localStorage.getItem("token");

    const response = await API.delete(`/api/user/${id}`,{
        headers :{
            Authorization :  `Bearer ${token}`
        }
     
     });
    return response.data;
}


export const getBlogs = async (
  params: GetBlogsParams = {}
): Promise<GetBlogsResponse> => {
  // Strip undefined/empty values so the URL only carries params you actually set
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  ) as Record<string, string | number>;

  const query = new URLSearchParams(
    Object.entries(cleaned).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
      {} as Record<string, string>
    )
  );





       const token = localStorage.getItem("token");
  
    
     
  const res = await API.get(`/api/blogs/admin?${query.toString()}`, 
   {
          headers : {
              Authorization : `Bearer ${token}`,
  
          },
        }
);

  
  return res.data;
};


interface AuditParams{
  page?:number;
  limit?:number;
  search?:string;
  sortBy?: "createdAt" | "resource";
  sortOrder?: "asc" | "desc";
}

interface getAuditResponse {
  success: boolean;
  logs: AuditLog[];
  pagination: PaginationMeta;
}

//get Audit reports
export async function getAuditLogs(
  params:AuditParams = {}
):Promise<getAuditResponse> {

   const token = localStorage.getItem("token");
  const response = await API.get(
    "/api/audit-logs",
    {
       params,
       headers : {
              Authorization : `Bearer ${token}`,
  
          },
    
    }
  );
  return response.data;

}



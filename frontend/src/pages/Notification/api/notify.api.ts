import { api } from "../../../api";

const API = api;

export const getFollowRequests = async () => {
     const token = localStorage.getItem("token");
  const response = await API.get(
    `/api/users/follow-requests`,
     {
        headers :{
            Authorization :  `Bearer ${token}`
        }
    }
   
  );

  return response.data;
};

export const acceptFollowRequest = async (senderId: string) => {
     const token = localStorage.getItem("token");
  const response = await API.patch(
    `/api/users/follow-request/${senderId}/accept`,
     {},
     {
        headers :{
            Authorization :  `Bearer ${token}`
        }
    }
   
    
  );

  return response.data;
};

export const rejectFollowRequest = async (senderId: string) => {
     const token = localStorage.getItem("token");
  const response = await API.patch(
    `/api/users/follow-request/${senderId}/reject`,
    {},
    {
        headers :{
            Authorization :  `Bearer ${token}`
        }
    } 
    
  );

  return response.data;
};
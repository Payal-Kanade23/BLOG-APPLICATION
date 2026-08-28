import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import AddForm from "./ui/AddForm";
import { addBlog, type BlogPayload } from "./api/createBlog.api";

function CreateBlog() {
  const navigate = useNavigate();

  const handleCreate = async (data: BlogPayload) => {
    try {

      const response = await addBlog(data);
      console.log("response create:",response)
      toast.success(response?.message || "Blog created successfully!");

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Error creating blog!"
      );
    } 
  }

  return (

      
        <div className="pt-16 lg:pl-8">
          <AddForm onSubmit={handleCreate} />
        </div>

  );
}

export default CreateBlog;
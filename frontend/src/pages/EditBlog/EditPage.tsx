import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import AddForm from "../CreateEditBlog/ui/AddForm";
import type{ BlogPayload } from "../CreateEditBlog/api/createBlog.api";
import { getBlog , editBlog} from "../CreateEditBlog/api/createBlog.api";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Blog } from "../CreateEditBlog/api/createBlog.api";

function EditBlog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  console.log("id:",id)

  const [blog, setBlog] = useState<Blog>();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!id) return;

        setLoading(true);

        const response = await getBlog(id);
        console.log(response)

        setBlog(response.data);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch blog"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);


  const handleCreate = async (data: BlogPayload) => {
    try {
      setLoading(true);

      const response = await editBlog(data, id!);

      toast.success(response?.message || "Blog Edited successfully!");

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Error Editing blog!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 flex justify-center ">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-lg font-medium text-gray-600">
            Creating blog...
          </p>
        </div>
      ) : (
        <div className="w-full max-w-3xl rounded-xl p-4 sm:p-6 shadow-lg">
          <AddForm onSubmit={handleCreate} initialData={blog}/>
        </div>
      )}
    </div>
  );
}

export default EditBlog;
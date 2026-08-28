import { ArrowLeft, Calendar, Eye, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { getBlog } from "../CreateEditBlog/api/createBlog.api";
import type{ Blog } from "../CreateEditBlog/api/createBlog.api";
import Comments from "./Comments";


function ViewBlog() {
    console.log("🔥 Viewblog rendered");
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!id) return;

        setLoading(true);

        const response = await getBlog(id);
        

        setBlog(response.data);
      } catch (error: unknown) {
        toast.error(
          axios.isAxiosError(error)
            ? error.response?.data?.message || "Failed to fetch blog"
            : "Failed to fetch blog"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-slate-900" />
          <p className="text-sm text-gray-500">
            Loading blog...
          </p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Blog not found
        </h2>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-2 py-6 sm:px-4 sm:py-10">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Article */}
      <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

        {/* Header */}
        <div className="px-6 py-8 sm:px-10 sm:py-12">

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3">

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                blog.Visibility === "PUBLIC"
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {blog.Visibility}
            </span>

            <span className="text-gray-300">•</span>

            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={14} />
              {new Date(blog.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </div>

          </div>

          {/* Title */}
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            {blog.title}
          </h1>

          {/* Author */}
          <div className="mt-7 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
              <User size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                {blog.author?.name ||
                  
                  "Author"}
              </p>

              <p className="text-xs text-gray-500">
                {blog.author?.email}
              </p>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Content */}
        <div className="px-6 py-8 sm:px-10 sm:py-12">

          <div className="whitespace-pre-wrap text-base leading-8 text-gray-700 sm:text-lg">
            {blog.content}
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 sm:px-10">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Eye size={15} />
              Blog details
            </div>

            <p className="text-xs text-gray-400">
              Updated{" "}
              {new Date(blog.createdAt).toLocaleDateString(
                "en-IN"
              )}
            </p>

          </div>

        </div>

      </article>
      {id && <Comments blogId={id} />}
    </div>
  );
}

export default ViewBlog;

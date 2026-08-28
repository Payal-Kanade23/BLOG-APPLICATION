import {
  Search,
  Heart,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  MessageCircle,
  Plus,
  LayoutDashboard,
  Compass,
  Bookmark,
  LogOut,
  Feather,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { deleteBlog, type Blog } from "../CreateEditBlog/api/createBlog.api";
import { getlike } from "../Dashboard/api/dashboard.api";
import { getPublicBlogs } from "../Dashboard/api/dashboard.api";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../auth/authStore";
import Comments from "./Comments";
import LikeBlog from "./LikeBlog";
import { hasPermission } from "../../utils/utils";
import { PERMISSIONS } from "../../utils/constant";
import { getBlogs } from "../AdminDashboard/admin.api";
import { getMyBlogs } from "./api/myblog.api";
interface UserProps{
  mode:string
}
function ViewUserBlogs({mode}:UserProps) {
    console.log("🔥 userDashboard rendered");
 const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const user = useAuthStore((s:any) => s.user);
  // NOTE: adjust `logout` to whatever your authStore actually exposes
  const logout = useAuthStore((s: any) => s.logout);
  const [userLikedBlog, setUserLikedBlog] = useState<string[]>([]);
  
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const isOwnBlog = (blogAuhtorId:string):boolean =>{
    return blogAuhtorId === user?._id
  }

 const fetchBlogs = async () => {
    try {
      setLoading(true);
      let res ;
       if(mode === "Dashboard" ){
        if(user?.role === "ADMIN"){
          console.log("---")
          res = await getBlogs();
           setBlogs(res.data);
        }else{
          console.log("dadjhesjd")
          res = await getPublicBlogs();
           setBlogs(res.data);

          
    }}else{
     res = await getMyBlogs();
      setBlogs(res.data) 
    }
     
     setShowComments(
            Object.fromEntries(res.data?.map((blog:any) => [blog._id, false]))
          );

    } catch (error) {
      console.error("Error fetching Blogs:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLikes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getlike();
      setUserLikedBlog(res.data.map((item: any) => item.blog));
    } catch (error) {
      console.error("Error fetching Blogs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(()=>{
     console.log("🔥 userDashboard rendered useeefcet");
    fetchBlogs();
    if(user){
       fetchLikes();
     }
    
       
  
    
  },[user])


  

  const [searchQuery, setSearchQuery] = useState("");

const filteredBlogs = blogs.filter((blog) => {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return true;
  return (
    blog.title?.toLowerCase().includes(query) ||
    blog.subtitle?.toLowerCase().includes(query)
  );
});

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteBlog(id);
      toast.success(response?.message || "Blog deleted successfully!");
      fetchBlogs();
    } catch (error) {
      console.log(error);
    }
  };

  
  return (
    <div>
      

     <main className="pt-16 lg:pl-64">
  <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
    {/* Header */}
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {mode === "Dashboard" ? "Discover Stories" : "Your Blogs"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {mode === "Dashboard"
            ? "Explore fresh stories from the TeaPost community."
            : "Manage and explore all your stories."}
        </p>
      </div>

      {user?.role !== "ADMIN" &&
        hasPermission(user?.permissions, PERMISSIONS.CREATE_BLOG) && (
          <button
            onClick={() => navigate("/create-blog")}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-300 active:translate-y-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Blog
          </button>
        )}
    </div>

    {/* Search */}
    <div className="relative mb-6">
      <Search
        size={17}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search blogs..."
        className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
    </div>

    {/* Blog List */}
    <div className="space-y-4">
      {filteredBlogs.map((blog) => (
      
              <div
                key={blog._id}
                className="group rounded-2xl border border-gray-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          blog.Visibility === "PUBLIC"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {blog.Visibility}
                      </span>

                      <span className="text-xs text-gray-400">
                        {new Date(blog.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <h2 className="mt-3 truncate text-xl font-semibold text-gray-900">
                      {blog.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                      {blog.subtitle}
                    </p>
                  </div>

                  
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex flex-row gap-3 text-xs text-gray-400">
                    
                    <Link
                      to={`/view-blog/${blog._id}`}
                      className="flex flex-row gap-1.5 hover:text-indigo-600"
                    >
                      <Eye size={15} />
                      <span>View blog</span>
                    </Link>
                    
                    {hasPermission(user?.permissions , PERMISSIONS.LIKE_BLOG) && (
                     <LikeBlog
                      blogId={blog._id}
                      fetchLikes={fetchLikes}
                      setBlogs={setBlogs}
                      userLikedBlog={userLikedBlog}
                      totalLikes={blog.totalLikes}
                    />
                    )}
                   
                  </div>

                  <div className="flex items-center gap-2">
                    {hasPermission(user?.permissions,PERMISSIONS.COMMENT_BLOG) && (
                       <button
                      type="button"
                      onClick={() => {
                        setShowComments((prev) => ({
                          ...prev,
                          [blog._id]: !prev[blog._id],
                        }));
                      }}
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
                    >
                      <MessageCircle size={18} />
                      <span>
                        {showComments[blog._id] ? "Hide comments" : "Comments"}
                      </span>
                    </button>
                    )}
                   

                    {hasPermission(user?.permissions,PERMISSIONS.EDIT_BLOG) && isOwnBlog(blog.author._id) && mode !== "Dashboard" && (
                      <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100">
                      <Link
                        to={`/edit-blog/${blog._id}`}
                        className="flex flex-row items-center gap-1.5 hover:text-gray-600"
                      >
                        <Pencil size={15} />
                        Edit
                      </Link>
                    </button>
                    ) }
                    
                     {hasPermission(user?.permissions,PERMISSIONS.DELETE_BLOG) && isOwnBlog(blog.author._id) && mode !== "Dashboard" && (
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                    ) }

                    
                  </div>
                </div>

                {showComments[blog._id] && <Comments blogId={blog._id} />}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {blogs.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No blogs found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Start writing your first blog.
              </p>
              
              <button
                onClick={() =>{user ? navigate("/create-blog") : navigate("/login")} }
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >{user?.role === "ADMIN" && "Only User Can Publish Blogs" }
               {user?.role !== "ADMIN" ?   (hasPermission(user?.permissions , PERMISSIONS.CREATE_BLOG) ? "Publish your first blog" : "Login to Publish Your First Blog") : undefined }  
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ViewUserBlogs;
import  { type SetStateAction ,type Dispatch } from 'react';
import { likeBlog } from '../Dashboard/api/dashboard.api';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';
import type { Blog } from '../CreateEditBlog/api/createBlog.api';
import { cn } from '../../utils/utils';
interface LikeProps{
    blogId:string,
    setBlogs:Dispatch<SetStateAction<Blog[]>>,
    fetchLikes:()=>Promise<void>,
    userLikedBlog:string[],
    totalLikes:number,
}
function LikeBlog({blogId  ,totalLikes, setBlogs , fetchLikes , userLikedBlog}:LikeProps) {
  

  const handleLike = async (blogId: string) => {
  try {

    const response = await likeBlog(blogId);

    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog._id === blogId
          ? {
              ...blog,
              totalLikes: response.totalLikes,
            }
          : blog
      )
    );

    fetchLikes();

    
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message === "Unauthorized" ? "Login to Like the blog!" : error?.response?.data?.message ||
        "Failed to like blog"
    );
  } 
};



  return (
    <div className='flex items-center justify-center'>
      <button
      className='flex flex-row gap-1.5'
  onClick={() => handleLike(blogId)}
  >
  <Heart
    size={18}
className={cn(
  userLikedBlog.includes(blogId)
    ? "border-none"
    : "border border-gray-100"
)}  fill={userLikedBlog.includes(blogId) ? "red" : "none"}
  />

  <span>{totalLikes}</span>
</button>
    </div>
  );
}

export default LikeBlog;

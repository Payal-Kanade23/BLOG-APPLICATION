import { createPortal } from "react-dom";
import { useCallback, useEffect, useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, X, Trash } from "lucide-react";
import type { Blog } from "../../CreateEditBlog/api/createBlog.api";
import toast from "react-hot-toast";

interface AuditDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: Blog | null;
  onBlogUpdate?:()=>void;
}

type CommentItem = {
  text: string;
  name: string;
};

// Instagram's signature multi-color gradient — used once, on the avatar ring.
const IG_RING =
  "bg-[conic-gradient(from_-90deg,#F58529,#DD2A7B_25%,#8134AF_50%,#515BD4_75%,#F58529)]";

export default function AuditDetailsDialog(props: AuditDetailsDialogProps) {
  const { open, onOpenChange, blog ,onBlogUpdate} = props;

  // Hooks must run on every render — keep them above any early return.
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
 
  const [commentList, setCommentList] = useState<Record<string, CommentItem>>({});

  // const fetchComments = useCallback(async (b: Blog) => {
  //   try {
  //     const results = await getComments(b._id);
  //     const merged: Record<string, CommentItem> = {};
  //     results.comments.forEach((item: any) => {
  //       merged[item._id] = { text: item.text, name: item.user.name };
  //     });
  //     setCommentList(merged);
  //   } catch (error) {
  //     console.error("Error fetching comments:", error);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (blog) fetchComments(blog);
  // }, [blog, fetchComments]);


  // const handleDelete =async (id:string , blogId:string) =>{
  //   try{

  //     const res = await deleteComment(id , blogId)
  //     toast.success(res.message);
  //     fetchComments(blog!)
  //     onBlogUpdate!();
      

  //   }catch(error:any){
  //     toast.error(error?.response.data.message)
  //   }
  // }

  if (!open || !blog) return null;

  const timeAgo = blog.createdAt ? formatTimeAgo(blog.createdAt) : "";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[92vw] max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-xl shadow-2xl max-h-[88vh] overflow-hidden flex flex-col border border-[#DBDBDB]"
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EFEFEF]">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${IG_RING} p-[2px] shrink-0`}>
              <div className="h-full w-full rounded-full bg-white p-[2px]">
                <div className="h-full w-full rounded-full bg-[#EFEFEF] flex items-center justify-center text-xs font-semibold text-[#262626]">
                  {initials(blog.author?.name)}
                </div>
              </div>
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#262626]">
                {blog.author?.name ?? "unknown"}
              </p>
              <p className="text-xs text-[#8E8E8E]">
                {blog.author?.role}
                {timeAgo && <span> · {timeAgo}</span>}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1.5 hover:bg-[#EFEFEF] transition"
            aria-label="Close"
          >
            <X size={20} className="text-[#262626]" />
          </button>
        </div>

        {/* ================= BODY (scrollable) ================= */}
        <div className="flex-1 overflow-y-auto">
          {/* Stat pills — replaces the boxed "cards" grid */}
          <div className="flex items-center justify-around px-4 py-3 border-b border-[#EFEFEF] text-center">
            <StatPill label="Likes" value={blog.totalLikes} />
            <StatPill label="Comments" value={blog.totalComments} />
            <StatPill
              label="Followers"
              value={blog.author?.followers?.length}
              onClick={() => setShowFollowers(true)}
            />
            <StatPill
              label="Following"
              value={blog.author?.followings?.length}
              onClick={() => setShowFollowing(true)}
            />
          </div>

          {/* <FollowModal
            open={showFollowers}
            onClose={() => setShowFollowers(false)}
            title="Followers"
            users={blog.author?.followers}
          />
          <FollowModal
            open={showFollowing}
            onClose={() => setShowFollowing(false)}
            title="Following"
            users={blog.author?.following}
          /> */}

         

          {/* Caption-style content */}
          <div className="px-4 pt-3 pb-2 text-sm text-[#262626]">
            <span className="font-semibold mr-1.5">Username: {blog.author?.name}</span>
            <span className="font-semibold block sm:inline">Blog: {blog.title}</span>
            <p className="mt-1 whitespace-pre-wrap break-words">Content: {blog.content}</p>
          </div>

          <p className="px-4 pb-2 text-[11px] uppercase tracking-wide text-[#8E8E8E]">
            {blog.author?.email} · id {blog.author?._id}
          </p>

          <div className="border-t border-[#EFEFEF] mx-4" />

          {/* Comments — Instagram inline style, no card chrome */}
          <div className="px-4 py-3 space-y-3">
            {Object.entries(commentList).length === 0 && (
              <p className="text-sm text-[#8E8E8E]">No comments yet.</p>
            )}
            {Object.entries(commentList).map(([id, c]) => (
              <div className="flex flex-row w-full">
                <p key={id} className="text-sm text-[#262626] leading-snug">
                <span className="font-semibold mr-1.5">{c.name}</span>
                {c.text}
                </p>
                <Trash className="ml-auto" size={20}
                      //  onClick={()=>handleDelete(id , blog._id)}
                       />
                </div>
              
            ))}
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="border-t border-[#EFEFEF] px-4 py-3 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wide text-[#8E8E8E]">
            {blog.Visibility}
          </p>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-[#0095F6] hover:bg-[#1877F2] transition text-white text-sm font-semibold px-5 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StatPill({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: number;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className="flex flex-col items-center leading-tight">
      <span className="text-sm font-semibold text-[#262626]">{value ?? 0}</span>
      <span className="text-[11px] text-[#8E8E8E]">{label}</span>
    </Tag>
  );
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTimeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString();
}

import { MessageCircle, Send, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../../auth/authStore";
import { hasPermission } from "../../utils/utils";
import { PERMISSIONS } from "../../utils/constant";
import { createComment, deleteComment, getComments, type BlogComment } from "./comments.api";

const socketUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
type CreatedEvent = BlogComment & { ancestors?: BlogComment[] };

function CommentNode({ comment, tree, reply, remove }: { comment: BlogComment; tree: Map<string | null, BlogComment[]>; reply: (comment: BlogComment) => void; remove: (id: string) => void }) {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const canDelete = comment.author?._id === user?._id || hasPermission(permissions, PERMISSIONS.DELETE_COMMENT);
  const children = tree.get(comment._id) ?? [];

  // Deleted comment: render nothing for itself, but keep its replies alive
  if (comment.isDeleted) {
    if (children.length === 0) return null;
    return (
      <>
        {children.map((child) => (
          <CommentNode key={child._id} comment={child} tree={tree} reply={reply} remove={remove} />
        ))}
      </>
    );
  }

  return <li className="relative mt-5 pl-0 sm:pl-8">
    <div className="absolute left-0 top-0 hidden h-full w-px bg-gray-200 sm:block" />
    <div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{comment.author?.name?.[0]?.toUpperCase() ?? "?"}</div>
      <div className="min-w-0 flex-1"><div className="rounded-2xl bg-gray-50 px-4 py-3">
        <div className="flex items-baseline justify-between gap-3"><p className="text-sm font-semibold text-gray-900">{comment.author?.name ?? "Deleted user"}</p><time className="shrink-0 text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</time></div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">{comment.body}</p>
      </div>
        <div className="mt-1 flex gap-3 px-2"><button type="button" onClick={() => reply(comment)} className="text-xs font-semibold text-gray-500 hover:text-slate-900">Reply</button>{canDelete && <button type="button" onClick={() => remove(comment._id)} className="text-xs font-semibold text-red-500 hover:text-red-700"><Trash2 className="mr-1 inline" size={12} />Delete</button>}</div>
        {children.length > 0 && <ul>{children.map((child) => <CommentNode key={child._id} comment={child} tree={tree} reply={reply} remove={remove} />)}</ul>}
      </div></div>
  </li>;
}

export default function Comments({ blogId }: { blogId: string }) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<BlogComment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const cursor = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const permissions = useAuthStore((state) => state.permissions);
  const canComment = hasPermission(permissions, PERMISSIONS.COMMENT_BLOG);
  const merge = useCallback((items: BlogComment[]) => setComments((current) => {
    const byId = new Map(current.map((item) => [item._id, item]));
    items.forEach((item) => byId.set(item._id, { ...byId.get(item._id), ...item }));
    return [...byId.values()];
  }), []);
  const load = useCallback(async (pageCursor?: string | null) => {
    if (loadingRef.current) return;
    loadingRef.current = true; setLoading(true);
    try { const page = await getComments(blogId, pageCursor); merge(page.data); cursor.current = page.nextCursor; setHasMore(page.hasMore); }
    catch { toast.error("Could not load comments"); }
    finally { loadingRef.current = false; setLoading(false); }
  }, [blogId, merge]);

  useEffect(() => { cursor.current = null; setComments([]); setHasMore(false); void load(); }, [blogId, load]);
  useEffect(() => {
    const token = localStorage.getItem("token"); if (!token) return;
    const socket = io(socketUrl, { auth: { token }, transports: ["websocket", "polling"] });
    const join = () => socket.emit("comment:join", blogId);
    const created = (event: CreatedEvent) => merge([...(event.ancestors ?? []), event]);
    const updated = (comment: BlogComment) => merge([comment]);
    const deleted = ({ _id }: { _id: string }) => setComments((current) => current.map((item) => item._id === _id ? { ...item, isDeleted: true, body: "" } : item));
    socket.on("connect", join); socket.on("comment:created", created); socket.on("comment:updated", updated); socket.on("comment:deleted", deleted);
    return () => { socket.emit("comment:leave", blogId); socket.off("connect", join); socket.off("comment:created", created); socket.off("comment:updated", updated); socket.off("comment:deleted", deleted); socket.disconnect(); };
  }, [blogId, merge]);
  const tree = useMemo(() => { const result = new Map<string | null, BlogComment[]>(); comments.forEach((item) => result.set(item.parentComment, [...(result.get(item.parentComment) ?? []), item])); result.forEach((items) => items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))); return result; }, [comments]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!body.trim() || !canComment) return; try { setSubmitting(true); await createComment(blogId, body, replyTo?._id); setBody(""); setReplyTo(null); } catch (error) { toast.error(axios.isAxiosError(error) ? error.response?.data?.message ?? "Could not publish comment" : "Could not publish comment"); } finally { setSubmitting(false); } };
  const remove = async (id: string) => { try { await deleteComment(blogId, id); } catch { toast.error("Could not delete comment"); } };
  const loadOlder = () => { if (hasMore && cursor.current) void load(cursor.current); };
  return <section id="comments" className="mt-8 scroll-mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10"><div className="flex items-center gap-2"><MessageCircle size={20} /><h2 className="text-lg font-bold text-gray-900">Comments <span className="text-sm font-medium text-gray-400">{comments.filter((item) => !item.isDeleted).length}</span></h2></div>
    {canComment ? <form onSubmit={submit} className="mt-5"><div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">{replyTo && <div className="mb-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-gray-500">Replying to <strong className="text-gray-700">{replyTo.author?.name ?? "Deleted user"}</strong><button type="button" onClick={() => setReplyTo(null)}><X size={15} /></button></div>}<textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} rows={3} placeholder="Add a comment…" className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-gray-400" /><div className="mt-2 flex justify-end"><button disabled={submitting || !body.trim()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"><Send size={15} />Post</button></div></div></form> : <p className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">You do not have permission to comment on this blog.</p>}
    <div className="mt-6 max-h-[36rem] overflow-y-auto pr-2" onScroll={(event) => { const target = event.currentTarget; if (target.scrollHeight - target.scrollTop - target.clientHeight < 80) loadOlder(); }}><ul>{(tree.get(null) ?? []).map((item) => <CommentNode key={item._id} comment={item} tree={tree} reply={setReplyTo} remove={remove} />)}</ul>{loading && <p className="py-4 text-center text-sm text-gray-400">Loading comments…</p>}{!loading && comments.length === 0 && <p className="py-4 text-center text-sm text-gray-400">No comments yet.</p>}{!hasMore && comments.length > 0 && <p className="py-4 text-center text-xs text-gray-400">You’re all caught up.</p>}</div>
  </section>;
}

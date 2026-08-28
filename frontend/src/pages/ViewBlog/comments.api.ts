import { api } from "../../api";

export interface CommentAuthor { _id: string; name: string; profileImage?: string; role: string }
export interface BlogComment {
  _id: string;
  blog: string;
  author: CommentAuthor;
  parentComment: string | null;
  body: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentPage {
  data: BlogComment[];
  nextCursor: string | null;
  hasMore: boolean;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const getComments = async (blogId: string, cursor?: string | null) =>
  (await api.get<CommentPage>(`/api/blog/${blogId}/comments`, {
    headers: authHeaders(),
    params: { limit: 20, ...(cursor ? { cursor } : {}) },
  })).data;

export const createComment = async (blogId: string, body: string, parentComment?: string) =>
  (await api.post<{ data: BlogComment }>(`/api/blog/${blogId}/comments`, { body, parentComment: parentComment ?? null }, { headers: authHeaders() })).data;

export const deleteComment = async (blogId: string, commentId: string) =>
  api.delete(`/api/blog/${blogId}/comments/${commentId}`, { headers: authHeaders() });

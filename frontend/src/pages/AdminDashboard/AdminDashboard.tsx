import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Blog } from '../CreateEditBlog/api/createBlog.api.ts';
import { getBlogs } from './admin.api.ts';
import { Landmark, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import DataTable from '../../components/DataTable.tsx';
import { getColumns } from './component/userColumns.tsx';
import { deleteBlog } from '../CreateEditBlog/api/createBlog.api.ts';
import DeleteDialog from './component/DeletConfirmDialog.tsx';
import AuditDetailsDialog from './component/AuditDetailsDialog.tsx';
import { deleteUser } from './admin.api.ts';
type SortOrder = "asc" | "desc";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [deleteType, setDeleteType] = useState<"blog" | "user" | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ---- Initial full-page load vs. subsequent background refetches ----
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ---- Search / sort / pagination state ----
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced value actually sent to the API
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState<"createdAt" | "totalLikes" | "totalComments" | "title">("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Debounce the search box -> `search`, and reset to page 1 whenever it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getBlogs({
        page,
        limit,
        search: search || undefined,
        sortBy,
        sortOrder,
      });

      setBlogs( res.data ?? []);
      setPagination(res.pagination ?? null);
    } catch (error) {
      console.error("Error fetching Blogs:", error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async () => {
    if (!selectedBlog) return;
    try {
      await deleteBlog(selectedBlog._id);
      await fetchBlogs();
      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    await deleteUser(selectedUserId);
    await fetchBlogs();
    setDeleteOpen(false);
  };

  const handleConfirm = async () => {
    if (deleteType === "blog") {
      await handleDelete();
    } else if (deleteType === "user") {
      await handleDeleteUser();
    }
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return (
    <div>
      {isInitialLoad && loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium text-xs uppercase tracking-widest animate-pulse">Establishing Secure Connection...</p>
        </div>
      ) : (
        <>
          <AuditDetailsDialog
            open={detailOpen}
            onOpenChange={setDetailOpen}
            blog={selectedBlog}
            onBlogUpdate={() => fetchBlogs()}
          />

          <DeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleConfirm}
          />

          {/* ================= SEARCH + SORT BAR ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search blogs..."
                className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {(["createdAt", "totalLikes", "totalComments", "title"] as const).map((field) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    sortBy === field
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {field === "createdAt" ? "Date" : field === "totalLikes" ? "Likes" : field === "totalComments" ? "Comments" : "Title"}
                  {sortBy === field && (
                    <ArrowUpDown size={12} className={sortOrder === "asc" ? "rotate-180" : ""} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ================= TABLE ================= */}
          {blogs.length === 0 && !loading ? (
            <div className="text-center py-40 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-8">
                <Landmark size={40} className="text-gray-200" />
              </div>
              <p className="text-gray-900 font-bold text-2xl tracking-tight">No Blogs Found</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mt-3 font-medium px-6">
                {search ? `No blogs match "${search}".` : "Currently No Blogs Exists in Application."}
              </p>
            </div>
          ) : (
            <div className={loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
              <DataTable
                columns={getColumns({
                  onView: (blog) => {
                    setSelectedBlog(blog);
                    setDetailOpen(true);
                  },
                  onDelete: (blog) => {
                    setDeleteType("blog");
                    setSelectedBlog(blog);
                    setDeleteOpen(true);
                  },
                  onUserDelete: (userId, blog) => {
                    setDeleteType("user");
                    setSelectedUserId(userId);
                    setSelectedBlog(blog);
                    setDeleteOpen(true);
                  }
                })}
                data={blogs}
                loading={loading}
              />
            </div>
          )}

          {/* ================= PAGINATION ================= */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <p>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;

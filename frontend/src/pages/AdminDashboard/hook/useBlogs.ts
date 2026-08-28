import { useEffect, useState } from "react";
import type{ GetBlogsParams , PaginationMeta } from "../admin.api";
import type { Blog } from "../../Dashboard/api/dashboard.api";
import { getBlogs } from "../admin.api";
export function useBlogs(initialParams: GetBlogsParams = {}) {
  const [params, setParams] = useState<GetBlogsParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialParams,
  });

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getBlogs(params);
        if (!cancelled) {
          setBlogs(res.data);
          setPagination(res.pagination);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [params]);

  // Debounced search — resets to page 1 whenever the search term changes
  const setSearch = (search: string) => {
    setParams((p) => ({ ...p, search, page: 1 }));
  };

  const setPage = (page: number) => setParams((p) => ({ ...p, page }));

  const setSort = (sortBy: GetBlogsParams["sortBy"], sortOrder: GetBlogsParams["sortOrder"]) =>
    setParams((p) => ({ ...p, sortBy, sortOrder, page: 1 }));

  const setUserId = (userId?: string) =>
    setParams((p) => ({ ...p, userId, page: 1 }));

  return { blogs, pagination, loading, error, params, setSearch, setPage, setSort, setUserId };
}
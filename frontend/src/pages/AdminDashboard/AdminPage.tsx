import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  Landmark,
  ChevronRight,
  ChevronLeft,
  X,
  Activity,
  FileText,
  Clock3,
  Database,
  RefreshCw,
} from "lucide-react";

import { getAuditLogs } from "./admin.api";
import DataTable from "../../components/DataTable";
import { getColumns, type AuditLog } from "./component/auditColumn";

type SortOrder = "asc" | "desc";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function AdminPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [sortBy, setSortBy] =
    useState<"createdAt" | "resource">("createdAt");

  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [pagination, setPagination] =
    useState<PaginationMeta | null>(null);

  // ---------------- SEARCH DEBOUNCE ----------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ---------------- FETCH AUDIT LOGS ----------------

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAuditLogs({
        page,
        limit,
        search: search || undefined,
        sortBy,
        sortOrder,
      });

      setLogs(res.logs ?? []);
      setPagination(res.pagination ?? null);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  // ---------------- SORT ----------------

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder((order) =>
        order === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }

    setPage(1);
  };

  // ---------------- CLEAR SEARCH ----------------

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // ---------------- ANALYTICS ----------------

  const analytics = useMemo(() => {
    const resources = new Set(
      logs.map((log: any) => log.resource).filter(Boolean)
    );

    const latestLog = logs[0];

    return {
      visibleLogs: logs.length,
      resources: resources.size,
      totalLogs: pagination?.total ?? 0,
      latestResource: latestLog?.resource ?? "—",
    };
  }, [logs, pagination]);

  // ---------------- RENDER ----------------

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Activity size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Audit Logs
                </h1>

                <p className="mt-0.5 text-sm text-slate-500">
                  Monitor and review activity across your application
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchAudit}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Activities
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {pagination?.total ?? 0}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Across the application
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Database size={19} />
              </div>
            </div>
          </div>

          {/* Visible */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Current Results
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {analytics.visibleLogs}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Logs on this page
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText size={19} />
              </div>
            </div>
          </div>

          {/* Resources */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Resources
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {analytics.resources}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Unique resources shown
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Landmark size={19} />
              </div>
            </div>
          </div>

          {/* Latest */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Latest Resource
                </p>

                <p className="mt-2 truncate text-xl font-bold tracking-tight text-slate-900">
                  {analytics.latestResource}
                </p>

                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Clock3 size={12} />
                  Most recent activity
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 size={19} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= MAIN CARD ================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}

          <div className="border-b border-slate-100 p-4 sm:p-5">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              {/* Search */}

              <div className="relative w-full xl:max-w-md">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) =>
                    setSearchInput(e.target.value)
                  }
                  placeholder="Search audit logs..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />

                {searchInput && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort */}

              <div className="flex flex-wrap items-center gap-2">

                <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Sort by
                </span>

                {(["createdAt", "resource"] as const).map(
                  (field) => (
                    <button
                      key={field}
                      onClick={() => toggleSort(field)}
                      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
                        sortBy === field
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {field === "createdAt"
                        ? "Date"
                        : "Resource"}

                      {sortBy === field && (
                        <ArrowUpDown
                          size={13}
                          className={
                            sortOrder === "asc"
                              ? "rotate-180 transition-transform"
                              : "transition-transform"
                          }
                        />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Active search */}

            {search && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium">
                  Showing results for
                </span>

                <span className="rounded-md bg-indigo-50 px-2 py-1 font-semibold text-indigo-600">
                  "{search}"
                </span>

                <button
                  onClick={clearSearch}
                  className="font-semibold text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Results header */}

          <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Activity History
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Review recent actions performed in the system
              </p>
            </div>

            {pagination && (
              <div className="text-xs font-medium text-slate-500">
                {pagination.total} total records
              </div>
            )}
          </div>

          {/* ================= TABLE / EMPTY ================= */}

          {logs.length === 0 && !loading ? (
            <div className="px-6 py-24 text-center">

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                <Search
                  size={30}
                  className="text-slate-300"
                />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                No audit logs found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                {search
                  ? `We couldn't find any activity matching "${search}". Try a different search term.`
                  : "There is currently no activity recorded in the application."}
              </p>

              {search && (
                <button
                  onClick={clearSearch}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                columns={getColumns}
                data={logs}
                loading={loading}
              />
            </div>
          )}

          {/* ================= PAGINATION ================= */}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

              <div className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">
                  Page {pagination.page}
                </span>{" "}
                of {pagination.totalPages}
                <span className="mx-2 text-slate-300">
                  •
                </span>
                {pagination.total} records
              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    setPage((p) => Math.max(p - 1, 1))
                  }
                  disabled={!pagination.hasPrevPage || loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <button
                  onClick={() =>
                    setPage((p) => p + 1)
                  }
                  disabled={!pagination.hasNextPage || loading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "../utils/utils";

interface DataTableProps<TData extends object> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  className?: string;
}

export default function DataTable<TData extends object>({
  columns,
  data,
  loading = false,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-slate-200 bg-white",
        className
      )}
    >
      <table className="w-full min-w-max border-separate border-spacing-0">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index, headers) => {
                const isFirst = index === 0;
                const isLast = index === headers.length - 1;

                return (
                  <th
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600",

                      isFirst &&
                        "sticky left-0 z-20 border-r border-slate-200 pl-6",

                      isLast &&
                        "sticky right-0 z-20 border-l border-slate-200 pr-6"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-32 text-center text-sm text-slate-500"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                  Loading...
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-32 text-center text-sm text-slate-500"
              >
                No data found
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="group transition-colors hover:bg-slate-50"
              >
                {row.getVisibleCells().map((cell, index, cells) => {
                  const isFirst = index === 0;
                  const isLast = index === cells.length - 1;

                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        "whitespace-nowrap border-b border-slate-100 px-4 py-3 text-sm text-slate-700",

                        isFirst &&
                          "sticky left-0 z-10 border-r border-slate-100 bg-white pl-6 group-hover:bg-slate-50",

                        isLast &&
                          "sticky right-0 z-10 border-l border-slate-100 bg-white pr-6 group-hover:bg-slate-50"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
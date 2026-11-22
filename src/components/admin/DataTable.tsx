"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Search, Table, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  accessorKey: keyof T & string;
  header: string;
  sortable?: boolean;
  cell?: (value: unknown, row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowActions?: (row: T) => ReactNode;
  emptyMessage?: string;
  pageSizeOptions?: number[];
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowActions,
  emptyMessage = "No records found.",
  pageSizeOptions = [10, 25, 50],
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const searchable = columns.filter((c) => c.cell === undefined);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchable.some((col) => {
        const val = row[col.accessorKey];
        return val != null && String(val).toLowerCase().includes(q);
      }),
    );
  }, [data, search, searchable]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sort.key] as string | number | boolean;
      const bVal = b[sort.key] as string | number | boolean;
      if (aVal < bVal) return sort.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev && prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  };

  return (
    <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 bg-muted/30">
        <div className="flex items-center gap-2 w-full max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pr-8"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-transparent border-none text-xs text-muted-foreground outline-none p-0"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessorKey}
                  className={cn(
                    "p-3 text-left text-xs font-medium text-muted-foreground",
                    col.sortable && "cursor-pointer select-none hover:bg-muted/50",
                  )}
                  onClick={() => col.sortable && toggleSort(col.accessorKey as string)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sort?.key === col.accessorKey && (
                      sort.dir === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {rowActions && <th className="p-3 text-right text-xs font-medium text-muted-foreground">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="p-6 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr key={String(row.id)} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.accessorKey} className="p-3">
                      {col.cell ? col.cell(row[col.accessorKey], row) : String(row[col.accessorKey])}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="p-3 text-right">{rowActions(row as T)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs">
          <p className="text-muted-foreground">
            Showing {Math.min(paginated.length, (currentPage - 1) * pageSize + 1)} to{" "}
            {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="xs"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

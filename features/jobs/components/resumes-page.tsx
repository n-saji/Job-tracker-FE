"use client";

import { useEffect, useMemo, useState } from "react";

import { STATUS_LABELS } from "@/features/jobs/constants/labels";
import { formatAppliedDate, listResumes } from "@/lib/api/jobs";
import type { ListResumesResponse, ResumeItem } from "@/lib/types/job";

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function ResumesPage() {
  const [rows, setRows] = useState<ResumeItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    if (!total) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / limit));
  }, [limit, total]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response: ListResumesResponse = await listResumes(page, limit);
        if (cancelled) {
          return;
        }
        setRows(response.data);
        setTotal(response.total);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(
          err instanceof Error ? err.message : "Failed to load resumes.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [limit, page]);

  return (
    <div className="rounded-3xl bg-white/90 p-6 shadow-xl dark:bg-slate-900/80">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          Resume Library
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Generated resumes by latest applied date
        </h2>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                  Applied
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                  Updated
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                  Resume Link
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-300"
                    colSpan={6}
                  >
                    Loading resumes...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-300"
                    colSpan={6}
                  >
                    No generated resumes found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.job_id}
                    className="border-t border-slate-100 dark:border-slate-700/70"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {row.company_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                      {row.role_title}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                      {STATUS_LABELS[row.status]}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                      {formatAppliedDate(row.applied_at)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                      {formatDateTime(row.updated_at)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <a
                        href={row.resume_link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200"
                      >
                        Open resume
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Page{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {page}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {totalPages}
          </span>{" "}
          ({total} resumes)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || loading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page >= totalPages || loading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

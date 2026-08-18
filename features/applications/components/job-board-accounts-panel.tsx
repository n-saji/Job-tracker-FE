"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

import { getAuthStatus } from "@/lib/api/auth";
import type { JobBoardAccount, JobBoardAccountStatus } from "@/lib/types/auth";

const STATUS_LABELS: Record<JobBoardAccountStatus, string> = {
  NOT_CONFIGURED: "Not configured",
  AUTHENTICATED: "Authenticated",
  SESSION_EXPIRED: "Session expired",
  AUTH_REQUIRED: "Login required",
  AUTHENTICATING: "Authenticating…",
};

function badgeClass(status: JobBoardAccountStatus): string {
  switch (status) {
    case "AUTHENTICATED":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700";
    case "AUTH_REQUIRED":
    case "SESSION_EXPIRED":
      return "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700";
    case "AUTHENTICATING":
      return "bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600";
  }
}

function needsAttention(status: JobBoardAccountStatus): boolean {
  return status === "AUTH_REQUIRED" || status === "SESSION_EXPIRED";
}

export function JobBoardAccountsPanel() {
  const [accounts, setAccounts] = useState<JobBoardAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAuthStatus()
      .then((data) => {
        if (!cancelled) setAccounts(data);
      })
      .catch(() => {
        // Non-critical widget — fail silently rather than blocking the page.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || accounts.length === 0) {
    return null;
  }

  const attentionNeeded = accounts.filter((a) => needsAttention(a.status));

  return (
    <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        Job Board Accounts
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {accounts.map((account) => (
          <span
            key={account.job_board}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(account.status)}`}
          >
            {account.status === "AUTHENTICATED" ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : needsAttention(account.status) ? (
              <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Loader2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {account.job_board}: {STATUS_LABELS[account.status]}
          </span>
        ))}
      </div>
      {attentionNeeded.length > 0 && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Authenticating a job board is a local action (it opens a real
          browser window for you to log in) — run it from a terminal:{" "}
          {attentionNeeded.map((a, i) => (
            <span key={a.job_board}>
              {i > 0 && ", "}
              <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
                {`python -m agent auth ${a.job_board} --headed --url <url>`}
              </code>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

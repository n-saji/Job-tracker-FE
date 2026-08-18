import type { ApplicationStatus } from "@/lib/types/application";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  QUEUED: "Queued",
  RUNNING: "Running",
  FORM_FILLED: "Form Filled",
  AWAITING_REVIEW: "Awaiting Review",
  SUBMITTED: "Submitted",
  FAILED: "Failed",
  REQUIRES_HUMAN: "Requires Attention",
  CANCELLED: "Cancelled",
};

export function getApplicationStatusBadgeClass(
  status: ApplicationStatus,
): string {
  switch (status) {
    case "SUBMITTED":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700";
    case "AWAITING_REVIEW":
    case "FORM_FILLED":
      return "bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700";
    case "RUNNING":
      return "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700";
    case "REQUIRES_HUMAN":
      return "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700";
    case "FAILED":
      return "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700";
    case "CANCELLED":
      return "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600";
    case "QUEUED":
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600";
  }
}

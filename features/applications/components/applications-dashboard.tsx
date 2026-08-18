"use client";

import { CheckCircle2, Loader2, TriangleAlert, X, XCircle } from "lucide-react";

import type {
  Application,
  ApplicationEvent,
  ApplicationStatus,
} from "@/lib/types/application";
import { ACTIVE_APPLICATION_STATUSES } from "@/lib/types/application";
import { useApplicationsDashboard } from "@/features/applications/hooks/use-applications-dashboard";
import { JobBoardAccountsPanel } from "@/features/applications/components/job-board-accounts-panel";
import {
  APPLICATION_STATUS_LABELS,
  getApplicationStatusBadgeClass,
} from "@/features/applications/status-labels";

const SUMMARY_STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "RUNNING",
  "QUEUED",
  "AWAITING_REVIEW",
  "REQUIRES_HUMAN",
  "FAILED",
];

function isActive(application: Application): boolean {
  return (ACTIVE_APPLICATION_STATUSES as string[]).includes(
    application.status,
  );
}

function isCancellable(application: Application): boolean {
  return application.status === "QUEUED" || application.status === "RUNNING";
}

function eventTone(eventType: string): "success" | "warning" | "error" | "neutral" {
  if (/FAILED|UNAVAILABLE/.test(eventType)) {
    return "error";
  }
  if (/REQUIRES_HUMAN|SKIPPED|CANCELLED/.test(eventType)) {
    return "warning";
  }
  if (/SUBMITTED|AWAITING_REVIEW|ANSWERED|FILLED|SYNCED/.test(eventType)) {
    return "success";
  }
  return "neutral";
}

function EventIcon({ eventType }: { eventType: string }) {
  const tone = eventTone(eventType);
  if (tone === "error") {
    return <XCircle className="h-4 w-4 text-rose-500" aria-hidden="true" />;
  }
  if (tone === "warning") {
    return (
      <TriangleAlert className="h-4 w-4 text-amber-500" aria-hidden="true" />
    );
  }
  if (tone === "success") {
    return (
      <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
    );
  }
  return (
    <div className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600" />
  );
}

function formatEventType(eventType: string): string {
  return eventType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(parsed);
}

function DetailPanel({
  application,
  events,
  loadingEvents,
  cancelling,
  onClose,
  onCancel,
}: {
  application: Application;
  events: ApplicationEvent[];
  loadingEvents: boolean;
  cancelling: boolean;
  onClose: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
              {application.role_title}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {application.company_name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close details"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getApplicationStatusBadgeClass(application.status)}`}
          >
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
          {isCancellable(application) && (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="inline-flex h-8 items-center rounded-lg border border-rose-300 px-3 text-xs font-semibold text-rose-700 transition hover:border-rose-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-700 dark:text-rose-300"
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>

        {application.error && (
          <div className="mx-5 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {application.error}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Progress
          </p>
          {loadingEvents && events.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No events yet.
            </p>
          ) : (
            <ol className="space-y-3">
              {events.map((event, index) => (
                <li key={`${event.event_type}-${index}`} className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <EventIcon eventType={event.event_type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {formatEventType(event.event_type)}
                      </p>
                      <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
                        {formatTimestamp(event.created_at)}
                      </span>
                    </div>
                    {event.message && (
                      <p className="mt-0.5 break-words text-xs text-slate-600 dark:text-slate-400">
                        {event.message}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export function ApplicationsDashboard() {
  const {
    applications,
    loading,
    error,
    detailApplication,
    events,
    loadingEvents,
    cancellingId,
    openDetail,
    closeDetail,
    onCancel,
  } = useApplicationsDashboard();

  const summary = SUMMARY_STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));

  const anyActive = applications.some(isActive);

  return (
    <div className="relative flex h-full min-h-full flex-col overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-amber-300/35 blur-3xl" />

      <main className="relative flex h-full w-full max-w-full flex-col overflow-hidden pb-16 md:pb-0">
        <header className="z-30 border-b border-slate-200/80 bg-white/80 px-4 py-5 shadow-lg backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/80 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-lg font-black uppercase tracking-[0.16em] text-slate-700 dark:text-slate-100">
                Applications
              </p>
              {anyActive && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
                  Live
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {summary.map(({ status, count }) => (
                <span
                  key={status}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getApplicationStatusBadgeClass(status)}`}
                >
                  {APPLICATION_STATUS_LABELS[status]}: {count}
                </span>
              ))}
            </div>
          </div>
        </header>

        {error && (
          <div className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300 sm:mx-6 lg:mx-8">
            {error}
          </div>
        )}

        <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
          <JobBoardAccountsPanel />

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No applications yet. Apply to a job from the Jobs page to see it
              here.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-700 dark:bg-slate-900/50">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      onClick={() => openDetail(application)}
                      className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {application.company_name}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {application.role_title}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getApplicationStatusBadgeClass(application.status)}`}
                        >
                          {APPLICATION_STATUS_LABELS[application.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isCancellable(application) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void onCancel(application.id);
                            }}
                            disabled={cancellingId === application.id}
                            className="inline-flex h-8 items-center rounded-lg border border-rose-300 px-3 text-xs font-semibold text-rose-700 transition hover:border-rose-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-700 dark:text-rose-300"
                          >
                            {cancellingId === application.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {detailApplication && (
        <DetailPanel
          application={detailApplication}
          events={events}
          loadingEvents={loadingEvents}
          cancelling={cancellingId === detailApplication.id}
          onClose={closeDetail}
          onCancel={() => void onCancel(detailApplication.id)}
        />
      )}
    </div>
  );
}

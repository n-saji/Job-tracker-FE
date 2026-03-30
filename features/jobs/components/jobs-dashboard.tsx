"use client";

import { Download, Edit, Moon, Sun, Trash2 } from "lucide-react";

import { formatAppliedDate } from "@/lib/api/jobs";
import {
  DISCARD_REASONS,
  JOB_STATUSES,
  type DiscardReason,
  type JobStatus,
} from "@/lib/types/job";
import {
  DISCARD_REASON_LABELS,
  PAGE_LIMIT_OPTIONS,
  STATUS_LABELS,
} from "@/features/jobs/constants/labels";
import { useJobsDashboard } from "@/features/jobs/hooks/use-jobs-dashboard";
import { useTheme } from "@/features/jobs/hooks/use-theme";
import {
  getStatusBadgeClass,
  shouldResetDiscardReason,
} from "@/features/jobs/utils/dashboard-utils";

export function JobsDashboard() {
  const { theme, toggleTheme } = useTheme();

  const {
    apiBaseUrl,
    jobs,
    page,
    limit,
    total,
    totalPages,
    showDiscardedJobs,
    statusFilter,
    discardReasonFilter,
    companyFilter,
    locationFilter,
    loadingJobs,
    jobsError,
    analytics,
    loadingAnalytics,
    notice,
    isFormOpen,
    isCreateMode,
    form,
    formErrors,
    submitting,
    checkingApplyLink,
    deletingId,
    applyConfirmJob,
    markingAppliedId,
    selectedJobIds,
    showBulkDeleteConfirm,
    bulkDeleting,
    bulkTargetStatus,
    bulkDiscardReason,
    bulkUpdatingStatus,
    generatingResumeById,
    allVisibleSelected,
    selectAllRef,
    setPage,
    setLimit,
    setShowDiscardedJobs,
    setStatusFilter,
    setDiscardReasonFilter,
    setCompanyFilter,
    setLocationFilter,
    setForm,
    setFormErrors,
    setApplyConfirmJob,
    setSelectedJobIds,
    setShowBulkDeleteConfirm,
    setBulkTargetStatus,
    setBulkDiscardReason,
    openCreate,
    openEdit,
    closeForm,
    onSubmitForm,
    onDelete,
    toggleJobSelection,
    toggleAllVisibleJobSelections,
    onConfirmBulkDelete,
    onBulkStatusUpdate,
    onApplyLinkClick,
    onConfirmApplied,
    applyStatusFilter,
    getSummaryCardClass,
    onGenerateResume,
    validateApplyLinkUniqueness,
  } = useJobsDashboard();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(120deg,#f8fafc_0%,#f1f5f9_38%,#e2e8f0_100%)] pb-12 transition-colors dark:bg-[linear-gradient(120deg,#020617_0%,#0f172a_45%,#1e293b_100%)]">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-amber-300/35 blur-3xl" />

      <main className="relative mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-xl backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
                Job Tracker Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
                Track every role, interview, and offer.
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openCreate}
                className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                New Application
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                aria-label="Toggle color theme"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </header>

        {notice && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              notice.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
            }`}
          >
            {notice.message}
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <button
            type="button"
            onClick={() => applyStatusFilter("", "card")}
            className={getSummaryCardClass("")}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
              Total Jobs
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {loadingAnalytics ? "..." : analytics.total}
            </p>
          </button>
          {JOB_STATUSES.slice(0, 2).map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => applyStatusFilter(status, "card")}
              className={getSummaryCardClass(status)}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                {STATUS_LABELS[status]}
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {loadingAnalytics ? "..." : analytics.byStatus[status]}
              </p>
            </button>
          ))}
          {JOB_STATUSES.slice(2).map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => applyStatusFilter(status, "card")}
              className={getSummaryCardClass(status)}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                {STATUS_LABELS[status]}
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {loadingAnalytics ? "..." : analytics.byStatus[status]}
              </p>
            </button>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur sm:p-6 dark:border-slate-700 dark:bg-slate-900/90">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <label className="flex min-w-40 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Status
              <select
                value={statusFilter}
                onChange={(event) => {
                  applyStatusFilter(event.target.value as JobStatus | "");
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">All statuses</option>
                {JOB_STATUSES.filter(
                  (status) => showDiscardedJobs || status !== "discarded",
                ).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>

            {showDiscardedJobs && statusFilter === "discarded" && (
              <label className="flex min-w-45 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Discard Reason
                <select
                  value={discardReasonFilter}
                  onChange={(event) => {
                    setPage(1);
                    setDiscardReasonFilter(
                      event.target.value as DiscardReason | "",
                    );
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">All reasons</option>
                  {DISCARD_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {DISCARD_REASON_LABELS[reason]}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="flex min-w-47.5 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Company
              <input
                value={companyFilter}
                onChange={(event) => {
                  setPage(1);
                  setCompanyFilter(event.target.value);
                }}
                placeholder="Search company"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="flex min-w-47.5 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Location
              <input
                value={locationFilter}
                onChange={(event) => {
                  setPage(1);
                  setLocationFilter(event.target.value);
                }}
                placeholder="Search location"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Show Discarded
              <button
                type="button"
                role="switch"
                aria-checked={showDiscardedJobs}
                onClick={() => {
                  const checked = !showDiscardedJobs;
                  setPage(1);
                  setShowDiscardedJobs(checked);

                  if (!checked) {
                    setDiscardReasonFilter("");
                    if (statusFilter === "discarded") {
                      setStatusFilter("");
                    }
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  showDiscardedJobs
                    ? "bg-cyan-600"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    showDiscardedJobs ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Page size
              <select
                value={limit}
                onChange={(event) => {
                  setPage(1);
                  setLimit(Number(event.target.value));
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {PAGE_LIMIT_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedJobIds.length >= 1 && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {selectedJobIds.length} jobs selected
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={bulkTargetStatus}
                  onChange={(event) => {
                    const nextStatus = event.target.value as JobStatus | "";
                    setBulkTargetStatus(nextStatus);
                    if (nextStatus !== "discarded") {
                      setBulkDiscardReason("");
                    }
                  }}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-medium text-slate-700 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">Set status...</option>
                  {JOB_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                {bulkTargetStatus === "discarded" && (
                  <select
                    value={bulkDiscardReason}
                    onChange={(event) => {
                      setBulkDiscardReason(event.target.value as DiscardReason);
                    }}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-medium text-slate-700 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Discard reason...</option>
                    {DISCARD_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {DISCARD_REASON_LABELS[reason]}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => {
                    void onBulkStatusUpdate();
                  }}
                  disabled={
                    bulkUpdatingStatus ||
                    !bulkTargetStatus ||
                    (bulkTargetStatus === "discarded" && !bulkDiscardReason)
                  }
                  className="h-9 rounded-lg border border-cyan-300 px-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-700 dark:text-cyan-300 dark:hover:border-cyan-500"
                >
                  {bulkUpdatingStatus ? "Updating..." : "Update Status"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-rose-200 px-3 text-sm font-semibold text-rose-700 transition hover:border-rose-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                  Delete All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJobIds([]);
                    setBulkTargetStatus("");
                    setBulkDiscardReason("");
                  }}
                  className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {jobsError && (
            <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
              {jobsError}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-slate-100/70 dark:bg-slate-800/80">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                      <div className="flex justify-center">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleAllVisibleJobSelections}
                          disabled={jobs.length === 0}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-500 dark:bg-slate-800"
                          aria-label="Select all rows"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                      Company & Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingJobs ? (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-300"
                        colSpan={6}
                      >
                        Loading jobs...
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-300"
                        colSpan={6}
                      >
                        No jobs found for the current filters.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-t border-slate-100 dark:border-slate-700/70"
                      >
                        <td className="h-full w-full px-4 py-4 align-center flex justify-center">
                          <input
                            type="checkbox"
                            checked={selectedJobIds.includes(job.id)}
                            onChange={() => toggleJobSelection(job.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-cyan-300 dark:border-slate-500 dark:bg-slate-800"
                            aria-label={`Select ${job.company_name} ${job.role_title}`}
                          />
                        </td>
                        <td className="align-top px-4 py-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {job.company_name}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {job.role_title}
                          </p>
                          {job.job_description.trim() && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                              {job.job_description}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <a
                              href={job.apply_link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => {
                                onApplyLinkClick(event, job);
                              }}
                              className="inline-block text-xs font-semibold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200"
                            >
                              Open apply link
                            </a>
                            {job.is_easy_apply && (
                              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                Easy Apply
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="align-top px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(job.status)}`}
                          >
                            {STATUS_LABELS[job.status]}
                          </span>
                          {job.status === "discarded" && job.discard_reason && (
                            <p className="mt-1 text-xs font-medium text-orange-700 dark:text-orange-300">
                              Reason:{" "}
                              {DISCARD_REASON_LABELS[job.discard_reason]}
                            </p>
                          )}
                        </td>
                        <td className="align-top px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                          {formatAppliedDate(job.applied_at)}
                        </td>
                        <td className="align-top px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                          {job.location || "-"}
                        </td>
                        <td className="align-top px-4 py-4">
                          <div className="flex gap-2">
                            {job.resume_link && (
                              <a
                                href={job.resume_link}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400"
                              >
                                <Download
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </a>
                            )}
                            {!job.resume_link && job.job_description.trim() && (
                              <button
                                type="button"
                                onClick={() => {
                                  void onGenerateResume(job);
                                }}
                                disabled={Boolean(generatingResumeById[job.id])}
                                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {generatingResumeById[job.id]
                                  ? "Generating..."
                                  : "Generate Resume"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => void openEdit(job.id)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
                            >
                              <Edit className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDelete(job.id)}
                              disabled={deletingId === job.id}
                              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === job.id ? null : (
                                <Trash2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          </div>
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
              ({total} jobs)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loadingJobs}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages || loadingJobs}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                  {isCreateMode ? "Create" : "Edit"}
                </p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {isCreateMode
                    ? "New Job Application"
                    : "Update Job Application"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={(event) => void onSubmitForm(event)}
              className="space-y-3"
            >
              {formErrors.form && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formErrors.form}
                </p>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Company Name
                  <input
                    value={form.company_name}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        company_name: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  {formErrors.company_name && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.company_name}
                    </span>
                  )}
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Role Title
                  <input
                    value={form.role_title}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        role_title: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  {formErrors.role_title && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.role_title}
                    </span>
                  )}
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Location
                  <input
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  {formErrors.location && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.location}
                    </span>
                  )}
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
                  Job Description
                  <textarea
                    value={form.job_description}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        job_description: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Optional"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => {
                        const nextStatus = event.target.value as JobStatus;
                        return {
                          ...prev,
                          status: nextStatus,
                          discard_reason: shouldResetDiscardReason(nextStatus)
                            ? ""
                            : prev.discard_reason,
                        };
                      })
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {JOB_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                  {formErrors.status && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.status}
                    </span>
                  )}
                </label>

                {form.status === "discarded" && (
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Discard Reason
                    <select
                      value={form.discard_reason}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          discard_reason: event.target.value as DiscardReason,
                        }))
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select reason</option>
                      {DISCARD_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {DISCARD_REASON_LABELS[reason]}
                        </option>
                      ))}
                    </select>
                    {formErrors.discard_reason && (
                      <span className="mt-1 block text-xs text-rose-700">
                        {formErrors.discard_reason}
                      </span>
                    )}
                  </label>
                )}

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
                  Apply Link
                  <input
                    value={form.apply_link}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        apply_link: event.target.value,
                      }))
                    }
                    onBlur={() => {
                      void (async () => {
                        const applyLinkError =
                          await validateApplyLinkUniqueness(form.apply_link);
                        setFormErrors((prev) => ({
                          ...prev,
                          apply_link:
                            applyLinkError ===
                            "Unable to verify apply link now. You can still submit."
                              ? undefined
                              : applyLinkError || undefined,
                        }));
                      })();
                    }}
                    placeholder="https://..."
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-rose-700">
                      {formErrors.apply_link}
                    </span>
                    {checkingApplyLink && (
                      <span className="text-slate-500 dark:text-slate-300">
                        Checking link...
                      </span>
                    )}
                  </div>
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  LinkedIn Job URL
                  <input
                    value={form.linkedin_job_url}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        linkedin_job_url: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Resume Link
                  <input
                    value={form.resume_link}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        resume_link: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Salary Text
                  <input
                    value={form.salary_text}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        salary_text: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Applied At
                  <input
                    type="datetime-local"
                    value={form.applied_at}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        applied_at: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  {formErrors.applied_at && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.applied_at}
                    </span>
                  )}
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={form.is_easy_apply}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      is_easy_apply: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-cyan-300 dark:border-slate-500 dark:bg-slate-800"
                />
                Easy Apply
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : isCreateMode
                      ? "Create Job"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {applyConfirmJob && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
              Confirm Application
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Did you apply to {applyConfirmJob.company_name}?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Choose Yes to set status as Applied and applied date/time as now.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setApplyConfirmJob(null)}
                disabled={markingAppliedId === applyConfirmJob.id}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  void onConfirmApplied();
                }}
                disabled={markingAppliedId === applyConfirmJob.id}
                className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingAppliedId === applyConfirmJob.id
                  ? "Updating..."
                  : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
              Confirm Bulk Delete
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Delete {selectedJobIds.length} selected job applications?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              This will remove all selected jobs from your tracker.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkDeleting}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void onConfirmBulkDelete();
                }}
                disabled={bulkDeleting}
                className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

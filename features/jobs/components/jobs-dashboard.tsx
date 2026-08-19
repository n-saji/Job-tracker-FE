"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Download,
  Edit,
  Loader2,
  MapPin,
  Sparkles,
  Trash2,
} from "lucide-react";

import { formatAppliedDate } from "@/lib/api/jobs";
import {
  DISCARD_REASONS,
  JOB_STATUSES,
  JOB_VERDICTS,
  SCORE_FIELDS,
  type DiscardReason,
  type Job,
  type JobExtractedData,
  type JobSectionScores,
  type JobVerdict,
  type JobStatus,
  type ScoreField,
} from "@/lib/types/job";
import {
  EMPLOYMENT_TYPE_LABELS,
  DISCARD_REASON_LABELS,
  SCORE_FIELD_LABELS,
  SPONSORSHIP_LABELS,
  VERDICT_LABELS,
  STATUS_LABELS,
} from "@/features/jobs/constants/labels";
import { useJobsDashboard } from "@/features/jobs/hooks/use-jobs-dashboard";
import {
  getStatusBadgeClass,
  shouldResetDiscardReason,
} from "@/features/jobs/utils/dashboard-utils";

function MatchRatingPanel({ rating }: { rating: number }) {
  const clamped = Math.min(10, Math.max(0, rating));
  const percent = Math.round(clamped * 10);
  const size = 96;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = percent / 100;
  const dashOffset = circumference * (1 - progress);

  const normalized = percent / 100;
  const hue = 4 + normalized * 144;
  const baseColor = `hsl(${hue} 88% 56%)`;
  const accentColor = `hsl(${Math.min(160, hue + 18)} 90% 62%)`;
  const glowColor = `hsl(${Math.max(0, hue - 24)} 90% 52%)`;
  const ringGradientId = `match-ring-${percent}`;
  const textGradient = `linear-gradient(155deg, ${accentColor} 0%, ${baseColor} 52%, ${glowColor} 100%)`;

  return (
    <div className="flex h-32 flex-col items-center justify-center rounded-3xl p-3">
      <div className="mx-auto relative inline-flex h-full w-full items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={ringGradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={accentColor} />
              <stop offset="58%" stopColor={baseColor} />
              <stop offset="100%" stopColor={glowColor} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-slate-300/80 dark:stroke-slate-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              stroke: `url(#${ringGradientId})`,
              // filter: `drop-shadow(0 0 8px color-mix(in srgb, ${baseColor} 55%, transparent))`,
            }}
            className="transition-all duration-500"
          />
        </svg>
        <span
          className="absolute text-3xl font-black leading-none tracking-tight text-transparent [text-shadow:0_2px_8px_rgba(2,6,23,0.18)] bg-clip-text"
          style={{ backgroundImage: textGradient }}
        >
          {percent}
          <span className="text-xl">%</span>
        </span>
      </div>
    </div>
  );
}

function formatApplyAverage(value: number): string {
  return value.toFixed(2);
}

function getVerdictBadgeClass(verdict: JobVerdict): string {
  if (verdict === "REJECT") {
    return "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700";
  }
  if (verdict === "REVIEW") {
    return "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700";
  }
  return "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700";
}

function getEmploymentTypeBadgeClass(
  value: JobExtractedData["employment_type"],
): string {
  if (value === "contract") {
    return "bg-violet-100 text-violet-800 border border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700";
  }
  if (value === "internship") {
    return "bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700";
  }
  if (value === "part_time") {
    return "bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700";
  }
  if (value === "unclear") {
    return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600";
  }
  return "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700";
}

function getScoreValue(
  scoreScores: JobSectionScores | undefined,
  field: ScoreField,
): number | undefined {
  if (!scoreScores) {
    return undefined;
  }

  if (field === "skills_match") {
    return scoreScores.skills_match;
  }
  if (field === "years_of_experience") {
    return scoreScores.years_of_experience;
  }
  if (field === "location") {
    return scoreScores.location;
  }
  if (field === "title_alignment") {
    return scoreScores.title_alignment;
  }
  if (field === "employment_type") {
    return scoreScores.employment_type;
  }
  if (field === "domain_relevance") {
    return scoreScores.domain_relevance;
  }

  return undefined;
}

function formatScoreFieldLabel(field: ScoreField): string {
  return SCORE_FIELD_LABELS[field];
}

function formatSponsorshipLabel(
  value: JobExtractedData["sponsorship_stance"],
): string {
  return SPONSORSHIP_LABELS[value];
}

function formatEmploymentTypeLabel(
  value: JobExtractedData["employment_type"],
): string {
  return EMPLOYMENT_TYPE_LABELS[value];
}

function getJobTimelineLabel(job: Job): string {
  if (job.applied_at) {
    return `Applied ${formatAppliedDate(job.applied_at)}`;
  }

  return `Added ${formatAppliedDate(job.created_at)}`;
}

export function JobsDashboard() {
  const {
    jobs,
    total,
    totalPages,
    showDiscardedJobs,
    statusFilter,
    discardReasonFilter,
    companyFilter,
    locationFilter,
    verdictFilter,
    minMatchRatingFilter,
    maxMatchRatingFilter,
    matchSort,
    scoreFieldFilter,
    scoreMinFilter,
    scoreMaxFilter,
    scoreSort,
    loadingJobs,
    jobsError,
    analytics,
    loadingAnalytics,
    applyRateStats,
    loadingApplyRateStats,
    loadingMoreJobs,
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
    quickStatusMenuJobId,
    quickTargetStatus,
    quickDiscardReason,
    quickStatusUpdatingId,
    generatingResumeById,
    jobsListRef,
    allVisibleSelected,
    selectAllRef,
    setPage,
    setShowDiscardedJobs,
    setStatusFilter,
    setDiscardReasonFilter,
    setCompanyFilter,
    setLocationFilter,
    setVerdictFilter,
    setMinMatchRatingFilter,
    setMaxMatchRatingFilter,
    setMatchSort,
    setScoreFieldFilter,
    setScoreMinFilter,
    setScoreMaxFilter,
    setScoreSort,
    setNotice,
    setForm,
    setFormErrors,
    setApplyConfirmJob,
    setSelectedJobIds,
    setShowBulkDeleteConfirm,
    setBulkTargetStatus,
    setBulkDiscardReason,
    setQuickDiscardReason,
    openCreate,
    openEdit,
    closeForm,
    onSubmitForm,
    onDelete,
    toggleJobSelection,
    toggleAllVisibleJobSelections,
    onConfirmBulkDelete,
    onBulkStatusUpdate,
    openQuickStatusMenu,
    closeQuickStatusMenu,
    onQuickStatusPick,
    onQuickStatusUpdate,
    onApplyLinkClick,
    onConfirmApplied,
    applyStatusFilter,
    onGenerateResume,
    validateApplyLinkUniqueness,
  } = useJobsDashboard();

  const quickStatusMenuRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [detailJob, setDetailJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!quickStatusMenuJobId) {
      return;
    }

    function onMouseDown(event: MouseEvent) {
      if (
        quickStatusMenuRef.current &&
        !quickStatusMenuRef.current.contains(event.target as Node)
      ) {
        closeQuickStatusMenu();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeQuickStatusMenu();
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeQuickStatusMenu, quickStatusMenuJobId]);

  useEffect(() => {
    if (
      !loadMoreRef.current ||
      !jobsListRef.current ||
      loadingJobs ||
      loadingMoreJobs ||
      totalPages <= 1
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((currentPage) => {
            if (currentPage >= totalPages) {
              return currentPage;
            }
            return currentPage + 1;
          });
        }
      },
      { root: jobsListRef.current, rootMargin: "240px" },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loadingJobs, loadingMoreJobs, setPage, totalPages]);

  return (
    <div className="relative flex h-full min-h-full flex-col overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-amber-300/35 blur-3xl" />

      <main className="relative flex h-full w-full max-w-full flex-col overflow-hidden pb-16 md:pb-0">
        <header className="z-30 border-b border-slate-200/80 bg-white/80 px-4 py-5 shadow-lg backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/80 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="min-w-0 md:flex-1 md:flex md:items-center md:gap-4">
                <p className="shrink-0 text-lg font-black uppercase tracking-[0.16em] text-slate-700 dark:text-slate-100">
                  Jobs
                </p>

                <div className="mt-2 flex min-w-0 items-center gap-2 overflow-x-auto pb-1 md:mt-0">
                  <button
                    type="button"
                    onClick={() => applyStatusFilter("", "card")}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                      statusFilter === ""
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    All jobs ({loadingAnalytics ? "..." : analytics.total})
                  </button>
                  {JOB_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => applyStatusFilter(status, "card")}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                        statusFilter === status
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {STATUS_LABELS[status]} (
                      {loadingAnalytics ? "..." : analytics.byStatus[status]})
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="h-11 shrink-0 rounded-xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                New Application
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 md:flex-nowrap">
              <input
                value={companyFilter}
                onChange={(event) => {
                  setPage(1);
                  setCompanyFilter(event.target.value);
                }}
                placeholder="Search company"
                className="h-10 min-w-56 flex-1 rounded-lg bg-slate-100/90 px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:bg-slate-800 dark:text-slate-100 md:max-w-96"
              />

              <select
                value={matchSort}
                onChange={(event) => {
                  setPage(1);
                  setMatchSort(event.target.value as "" | "asc" | "desc");
                }}
                className="h-10 w-34 rounded-lg bg-slate-100/90 px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Default</option>
                <option value="desc">Highest match first</option>
                <option value="asc">Lowest match first</option>
              </select>

              <button
                type="button"
                onClick={() => setIsAdvancedFiltersOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-100/90 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                title="More filters"
                aria-label="Open more filters"
              >
                <Edit className="h-4 w-4" aria-hidden="true" />
                More filters
              </button>
            </div>
          </div>
        </header>

        {notice?.kind === "error" && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${"border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300"}`}
          >
            {notice.message}
          </div>
        )}

        <section className="mb-4 hidden rounded-2xl border border-cyan-200/80 bg-cyan-50/80 p-4 shadow-sm dark:border-cyan-800/70 dark:bg-cyan-900/20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800 dark:text-cyan-300">
            Apply Statistics
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-cyan-200 bg-white/80 px-4 py-3 dark:border-cyan-800 dark:bg-slate-900/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Daily Count
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loadingApplyRateStats ? "..." : applyRateStats.daily_count}
              </p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-white/80 px-4 py-3 dark:border-cyan-800 dark:bg-slate-900/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Weekly Count
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loadingApplyRateStats ? "..." : applyRateStats.weekly_count}
              </p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-white/80 px-4 py-3 dark:border-cyan-800 dark:bg-slate-900/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Monthly Count
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loadingApplyRateStats ? "..." : applyRateStats.monthly_count}
              </p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-white/80 px-4 py-3 dark:border-cyan-800 dark:bg-slate-900/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Daily Average
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loadingApplyRateStats
                  ? "..."
                  : formatApplyAverage(applyRateStats.daily_average)}
              </p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-white/80 px-4 py-3 dark:border-cyan-800 dark:bg-slate-900/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Weekly Average
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loadingApplyRateStats
                  ? "..."
                  : formatApplyAverage(applyRateStats.weekly_average)}
              </p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-white/80 px-4 py-3 dark:border-cyan-800 dark:bg-slate-900/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Monthly Average
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loadingApplyRateStats
                  ? "..."
                  : formatApplyAverage(applyRateStats.monthly_average)}
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-slate-200/70 bg-slate-100/30 px-4 py-4 backdrop-blur dark:border-slate-700/60 dark:bg-slate-950/60 sm:px-6 lg:px-8">
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

          <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisibleJobSelections}
                disabled={jobs.length === 0}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-500 dark:bg-slate-800"
                aria-label="Select all job cards"
              />
              Select all visible
            </label>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
              {total} total jobs
            </p>
          </div>

          <div
            ref={jobsListRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
          >
            {loadingJobs ? (
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                No jobs found for the current filters.
              </div>
            ) : (
              jobs.map((job) => (
                <article
                  key={job.id}
                  data-job-id={job.id}
                  className={`overflow-hidden rounded-3xl border bg-white/95 shadow-sm transition hover:border-cyan-300 hover:shadow-md dark:bg-slate-900/90
                  ${selectedJobIds.includes(job.id) ? "border-cyan-400" : "border-cyan-300/60 dark:border-cyan-700/60"}`}
                >
                  <div className="grid lg:grid-cols-[1fr_280px]">
                    <div className="px-3 pb-2 pt-2 sm:px-4 sm:pb-3 sm:pt-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedJobIds.includes(job.id)}
                            onChange={() => toggleJobSelection(job.id)}
                            className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-cyan-300 dark:border-slate-500 dark:bg-slate-800"
                            aria-label={`Select ${job.company_name} ${job.role_title}`}
                          />
                          <div className="min-w-0" >
                            <p className="line-clamp-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-xl"
                            >
                              {job.role_title}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-slate-700 dark:text-slate-300 text-sm">
                              {job.company_name}
                              {job.company_size && (
                                <span className="text-slate-400 dark:text-slate-500">
                                  {" "}
                                  · {job.company_size}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {statusFilter === "" && (
                          <div
                            className="relative"
                            ref={
                              quickStatusMenuJobId === job.id
                                ? quickStatusMenuRef
                                : undefined
                            }
                          >
                            <button
                              type="button"
                              onClick={() => openQuickStatusMenu(job.id)}
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 ${getStatusBadgeClass(job.status)}`}
                              aria-haspopup="menu"
                              aria-expanded={quickStatusMenuJobId === job.id}
                              aria-controls={`quick-status-menu-${job.id}`}
                            >
                              {STATUS_LABELS[job.status]}
                            </button>

                            {quickStatusMenuJobId === job.id && (
                              <div
                                id={`quick-status-menu-${job.id}`}
                                role="menu"
                                className="absolute right-0 top-full z-40 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                              >
                                <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                                  Quick Update Status
                                </p>
                                <div className="space-y-1">
                                  {JOB_STATUSES.filter(
                                    (status) => status !== job.status,
                                  ).map((status) => (
                                    <button
                                      key={status}
                                      type="button"
                                      onClick={() => {
                                        onQuickStatusPick(status);
                                        if (status !== "discarded") {
                                          void onQuickStatusUpdate(job, status);
                                        }
                                      }}
                                      disabled={
                                        quickStatusUpdatingId === job.id
                                      }
                                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-left text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:bg-cyan-900/30"
                                    >
                                      {STATUS_LABELS[status]}
                                    </button>
                                  ))}
                                </div>

                                {quickTargetStatus === "discarded" && (
                                  <div className="mt-2 space-y-2 border-t border-slate-200 pt-2 dark:border-slate-700">
                                    <select
                                      value={quickDiscardReason}
                                      onChange={(event) => {
                                        setQuickDiscardReason(
                                          event.target.value as DiscardReason,
                                        );
                                      }}
                                      className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                    >
                                      <option value="">
                                        Discard reason...
                                      </option>
                                      {DISCARD_REASONS.map((reason) => (
                                        <option key={reason} value={reason}>
                                          {DISCARD_REASON_LABELS[reason]}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        void onQuickStatusUpdate(
                                          job,
                                          "discarded",
                                        );
                                      }}
                                      disabled={
                                        quickStatusUpdatingId === job.id ||
                                        !quickDiscardReason
                                      }
                                      className="w-full rounded-lg border border-orange-300 px-2 py-1.5 text-xs font-semibold text-orange-700 transition hover:border-orange-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-700 dark:text-orange-300"
                                    >
                                      {quickStatusUpdatingId === job.id
                                        ? "Updating..."
                                        : "Update to Discarded"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 grid gap-2 border-y border-slate-200 py-2 text-sm dark:border-slate-700 md:grid-cols-4">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          <span className="line-clamp-1">
                            {job.location || "Location TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                          <span className="line-clamp-1">
                            {STATUS_LABELS[job.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <CalendarDays
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <span className="line-clamp-1">
                            {getJobTimelineLabel(job)}
                          </span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="rounded-xl bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200">
                            Added {formatAppliedDate(job.created_at)}
                          </span>
                          {job.is_easy_apply && (
                            <span className="rounded-xl bg-cyan-100 px-2.5 py-1 font-semibold text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-200">
                              Easy Apply
                            </span>
                          )}
                        </div>
                      </div>

                      {/* {job.job_description.trim() && (
                        <p className="mt-2 line-clamp-2 overflow-hidden text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {job.job_description}
                        </p>
                      )} */}

                      {job.status === "discarded" && job.discard_reason && (
                        <p className="mt-2 text-xs font-semibold text-orange-700 dark:text-orange-300">
                          Discard reason:{" "}
                          {DISCARD_REASON_LABELS[job.discard_reason]}
                        </p>
                      )}

                      {(job.verdict ||
                        typeof job.total_score === "number" ||
                        job.reject_reason ||
                        job.flags?.length ||
                        job.extracted) && (
                        <div className="mt-1 space-y-2 rounded-2xl">
                          <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            {/* {job.verdict && (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 ${getVerdictBadgeClass(job.verdict)}`}
                              >
                                Verdict: {VERDICT_LABELS[job.verdict]}
                              </span>
                            )} */}
                            {/* {typeof job.total_score === "number" && (
                              <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-1 text-cyan-900 dark:border-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200">
                                Score: {job.total_score}/100
                              </span>
                            )} */}
                            {job.reject_reason && (
                              <span className="inline-flex rounded-full border border-orange-200 bg-orange-100 px-2.5 py-1 text-orange-900 dark:border-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                                Reject: {job.reject_reason}
                              </span>
                            )}
                          </div>

                          {job.extracted && (
                            <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                              {job.extracted.required_yoe && (
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                  YOE: {job.extracted.required_yoe}
                                </span>
                              )}
                              <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                {formatSponsorshipLabel(
                                  job.extracted.sponsorship_stance,
                                )}
                              </span>
                              <span
                                className={`rounded-full px-2 py-1 ${getEmploymentTypeBadgeClass(job.extracted.employment_type)}`}
                              >
                                {formatEmploymentTypeLabel(
                                  job.extracted.employment_type,
                                )}
                              </span>
                              <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                Location:{" "}
                                {job.extracted.work_location.toUpperCase()}
                              </span>
                            </div>
                          )}

                          {job.extracted?.primary_stack?.length ? (
                            <div className="flex flex-wrap gap-1.5">
                              {job.extracted.primary_stack
                                .slice(0, 8)
                                .map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {job.extracted.primary_stack.length > 8 && (
                                <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                                  +{job.extracted.primary_stack.length - 8} more
                                </span>
                              )}
                            </div>
                          ) : null}

                          {job.flags?.length ? (
                            <div className="flex flex-wrap gap-1.5">
                              {job.flags.map((flag) => (
                                <span
                                  key={flag}
                                  className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                                >
                                  {flag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}

                      <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-2 dark:border-slate-700">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={job.apply_link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => {
                              onApplyLinkClick(event, job);
                            }}
                            className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
                          >
                            Open apply link
                          </a>
                          {job.resume_link ? (
                            <a
                              href={job.resume_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            >
                              <Download
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              Resume
                            </a>
                          ) : job.job_description.trim() ? (
                            <button
                              type="button"
                              onClick={() => {
                                void onGenerateResume(job);
                              }}
                              disabled={Boolean(generatingResumeById[job.id])}
                              className="rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {generatingResumeById[job.id]
                                ? "Generating..."
                                : "Generate Resume"}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setDetailJob(job)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
                          >
                            Show details
                          </button>
                          <button
                            type="button"
                            onClick={() => void openEdit(job.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400"
                          >
                            <Edit className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDelete(job.id)}
                            disabled={deletingId === job.id}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === job.id ? (
                              <Loader2 className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 lg:border-l lg:border-t-0 dark:border-slate-700">
                      <div className="h-full min-h-44 p-2 flex flex-col items-center justify-center gap-2 ">
                        <MatchRatingPanel rating={job.match_rating ?? 0} />
                        <div>
                          {job.verdict && (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 ${getVerdictBadgeClass(job.verdict)} text-xs font-semibold`}
                            >
                              Verdict: {VERDICT_LABELS[job.verdict]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}

            <div
              ref={loadMoreRef}
              className="py-4 text-center text-sm text-slate-500 dark:text-slate-300"
            >
              {loadingMoreJobs
                ? "Loading more jobs..."
                : totalPages > 1 && jobs.length < total
                  ? "Scroll to load more jobs"
                  : `Showing ${jobs.length} of ${total} jobs`}
            </div>
          </div>
        </section>
      </main>

      {isAdvancedFiltersOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/55 p-4"
          onClick={() => setIsAdvancedFiltersOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                  Filters
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                  More search and sort options
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvancedFiltersOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    applyStatusFilter(
                      event.target.value as JobStatus | "",
                      "card",
                    );
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">All statuses</option>
                  {JOB_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]} (
                      {loadingAnalytics ? "..." : analytics.byStatus[status]})
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Discard reason
                <select
                  value={discardReasonFilter}
                  onChange={(event) => {
                    setPage(1);
                    setDiscardReasonFilter(
                      event.target.value as DiscardReason | "",
                    );
                  }}
                  disabled={statusFilter !== "discarded"}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">All reasons</option>
                  {DISCARD_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {DISCARD_REASON_LABELS[reason]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Location
                <input
                  value={locationFilter}
                  onChange={(event) => {
                    setPage(1);
                    setLocationFilter(event.target.value);
                  }}
                  placeholder="Any location"
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Verdict
                <select
                  value={verdictFilter}
                  onChange={(event) => {
                    setPage(1);
                    setVerdictFilter(event.target.value as JobVerdict | "");
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">All verdicts</option>
                  {JOB_VERDICTS.map((verdict) => (
                    <option key={verdict} value={verdict}>
                      {VERDICT_LABELS[verdict]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Score field
                <select
                  value={scoreFieldFilter}
                  onChange={(event) => {
                    setPage(1);
                    const nextField = event.target.value as ScoreField | "";
                    setScoreFieldFilter(nextField);
                    if (!nextField) {
                      setScoreMinFilter("");
                      setScoreMaxFilter("");
                      setScoreSort("");
                    }
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">No score filter</option>
                  {SCORE_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {formatScoreFieldLabel(field)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Score min
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={scoreMinFilter}
                  onChange={(event) => {
                    setPage(1);
                    setScoreMinFilter(event.target.value);
                  }}
                  disabled={!scoreFieldFilter}
                  placeholder="0"
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Score max
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={scoreMaxFilter}
                  onChange={(event) => {
                    setPage(1);
                    setScoreMaxFilter(event.target.value);
                  }}
                  disabled={!scoreFieldFilter}
                  placeholder="100"
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Score sort
                <select
                  value={scoreSort}
                  onChange={(event) => {
                    setPage(1);
                    setScoreSort(event.target.value as "" | "asc" | "desc");
                  }}
                  disabled={!scoreFieldFilter}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Default</option>
                  <option value="desc">Highest first</option>
                  <option value="asc">Lowest first</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Match min
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={minMatchRatingFilter}
                  onChange={(event) => {
                    setPage(1);
                    setMinMatchRatingFilter(event.target.value);
                  }}
                  placeholder="0"
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Match max
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={maxMatchRatingFilter}
                  onChange={(event) => {
                    setPage(1);
                    setMaxMatchRatingFilter(event.target.value);
                  }}
                  placeholder="10"
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 sm:col-span-2">
                Show discarded jobs
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
                        setStatusFilter("added");
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
            </div>
          </div>
        </div>
      )}

      {notice?.kind === "success" && (
        <div className="fixed right-4 top-4 z-50 w-full max-w-sm rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-2xl dark:border-emerald-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {notice.message}
            </p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {detailJob && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4 max-h-screen">
          <div className="w-full max-w-3xl h-[90%] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                  Job Details
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {detailJob.role_title}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {detailJob.company_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailJob(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500 dark:border-slate-600 dark:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-slate-100/80 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span className="font-semibold">Location:</span>{" "}
                {detailJob.location || "Location TBD"}
              </div>
              <div className="rounded-lg bg-slate-100/80 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span className="font-semibold">Status:</span>{" "}
                {STATUS_LABELS[detailJob.status]}
              </div>
              <div className="rounded-lg bg-slate-100/80 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span className="font-semibold">Company Size:</span>{" "}
                {detailJob.company_size || "Unknown"}
              </div>
              <div className="rounded-lg bg-slate-100/80 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span className="font-semibold">Added:</span>{" "}
                {formatAppliedDate(detailJob.created_at)}
              </div>
              <div className="rounded-lg bg-slate-100/80 px-3 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <span className="font-semibold">Match:</span>{" "}
                {typeof detailJob.match_rating === "number"
                  ? `${Math.round(detailJob.match_rating * 10)}%`
                  : "N/A"}
              </div>
            </div>

            {(detailJob.verdict ||
              typeof detailJob.total_score === "number" ||
              detailJob.section_scores ||
              detailJob.extracted ||
              detailJob.flags?.length) && (
              <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {detailJob.verdict && (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 ${getVerdictBadgeClass(detailJob.verdict)}`}
                    >
                      Verdict: {VERDICT_LABELS[detailJob.verdict]}
                    </span>
                  )}
                  {typeof detailJob.total_score === "number" && (
                    <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-1 text-cyan-900 dark:border-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200">
                      Total Score: {detailJob.total_score}/100
                    </span>
                  )}
                  {detailJob.reject_reason && (
                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-100 px-2.5 py-1 text-orange-900 dark:border-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                      Reject: {detailJob.reject_reason}
                    </span>
                  )}
                </div>

                {detailJob.section_scores && (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {SCORE_FIELDS.map((field) => {
                      const value = getScoreValue(
                        detailJob.section_scores,
                        field,
                      );
                      if (typeof value !== "number") {
                        return null;
                      }

                      return (
                        <div
                          key={field}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                            {formatScoreFieldLabel(field)}
                          </p>
                          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                            {value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {detailJob.extracted && (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                        Required YOE
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {detailJob.extracted.required_yoe || "Not mentioned"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                        Sponsorship
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {formatSponsorshipLabel(
                          detailJob.extracted.sponsorship_stance,
                        )}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                        Employment Type
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {formatEmploymentTypeLabel(
                          detailJob.extracted.employment_type,
                        )}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                        Work Location
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {detailJob.extracted.work_location}
                        {detailJob.extracted.location_state
                          ? ` • ${detailJob.extracted.location_state}`
                          : ""}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                        Primary Stack
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {detailJob.extracted.primary_stack.length ? (
                          detailJob.extracted.primary_stack.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-300">
                            No skills extracted.
                          </span>
                        )}
                      </div>
                    </div>
                    {detailJob.flags?.length ? (
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-900">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                          Flags
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {detailJob.flags.map((flag) => (
                            <span
                              key={flag}
                              className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                Job Description
              </p>
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                {detailJob.job_description.trim() ||
                  "No job description available."}
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Company Size
                  <input
                    value={form.company_size}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        company_size: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Match Rating (0-10)
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step="0.1"
                    value={form.match_rating}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        match_rating: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                  {formErrors.match_rating && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.match_rating}
                    </span>
                  )}
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

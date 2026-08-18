import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  API_BASE_URL,
  bulkDeleteJobs,
  bulkUpdateJobsStatus,
  createJob,
  deleteJob,
  existsApplyLink,
  getApplyRateStats,
  getJob,
  listJobs,
  normalizeApplyLink,
  subscribeToJobCreated,
  triggerResumeGenerate,
  updateJob,
} from "@/lib/api/jobs";
import {
  bulkCreateApplications,
  createApplication,
} from "@/lib/api/applications";
import {
  JOB_STATUSES,
  type JobVerdict,
  type DiscardReason,
  type Job,
  type JobFormInput,
  type JobStatus,
  type ScoreField,
} from "@/lib/types/job";
import {
  analyticsSeed,
  buildCreatePayload,
  buildEmptyForm,
  buildUpdatePayload,
  formFromJob,
  getApiMessage,
  normalizeDiscardReasonForBulk,
  validateFormInput,
  sleep,
} from "@/features/jobs/utils/dashboard-utils";
import type {
  Analytics,
  ApplyRateStats,
  FormErrors,
  Notice,
} from "@/features/jobs/types";
import { STATUS_LABELS } from "@/features/jobs/constants/labels";

const DASHBOARD_FILTERS_STORAGE_KEY = "jobDashboardFilters";
const LEGACY_STATUS_FILTER_STORAGE_KEY = "jobStatusFilter";

type PersistedDashboardFilters = {
  statusFilter: JobStatus | "";
  showDiscardedJobs: boolean;
};

type JobsListAnchor = {
  jobId: string;
  index: number;
  offsetTop: number;
  scrollLeft: number;
};

function isJobStatus(value: unknown): value is JobStatus {
  return typeof value === "string" && JOB_STATUSES.includes(value as JobStatus);
}

function readPersistedDashboardFilters(): PersistedDashboardFilters {
  const defaultFilters: PersistedDashboardFilters = {
    statusFilter: "added",
    showDiscardedJobs: false,
  };

  if (typeof window === "undefined") {
    return defaultFilters;
  }

  try {
    const raw = localStorage.getItem(DASHBOARD_FILTERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedDashboardFilters>;
      const nextStatus =
        parsed.statusFilter === "" || isJobStatus(parsed.statusFilter)
          ? parsed.statusFilter
          : defaultFilters.statusFilter;
      const nextShowDiscarded =
        typeof parsed.showDiscardedJobs === "boolean"
          ? parsed.showDiscardedJobs
          : nextStatus === "discarded";

      return {
        statusFilter: nextStatus,
        showDiscardedJobs: nextShowDiscarded,
      };
    }

    const legacyStatus = localStorage.getItem(LEGACY_STATUS_FILTER_STORAGE_KEY);
    if (legacyStatus !== null) {
      if (legacyStatus === "" || isJobStatus(legacyStatus)) {
        return {
          statusFilter: legacyStatus,
          showDiscardedJobs: legacyStatus === "discarded",
        };
      }
    }
  } catch {
    return defaultFilters;
  }

  return defaultFilters;
}

export function useJobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [showDiscardedJobs, setShowDiscardedJobs] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("added");
  const [discardReasonFilter, setDiscardReasonFilter] = useState<
    DiscardReason | ""
  >("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<JobVerdict | "">("");
  const [minMatchRatingFilter, setMinMatchRatingFilter] = useState("");
  const [maxMatchRatingFilter, setMaxMatchRatingFilter] = useState("");
  const [matchSort, setMatchSort] = useState<"" | "asc" | "desc">("");
  const [scoreFieldFilter, setScoreFieldFilter] = useState<ScoreField | "">("");
  const [scoreMinFilter, setScoreMinFilter] = useState("");
  const [scoreMaxFilter, setScoreMaxFilter] = useState("");
  const [scoreSort, setScoreSort] = useState<"" | "asc" | "desc">("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);
  const [jobsError, setJobsError] = useState("");

  const [analytics, setAnalytics] = useState<Analytics>(analyticsSeed());
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [applyRateStats, setApplyRateStats] = useState<ApplyRateStats>({
    daily_count: 0,
    weekly_count: 0,
    monthly_count: 0,
    daily_average: 0,
    weekly_average: 0,
    monthly_average: 0,
  });
  const [loadingApplyRateStats, setLoadingApplyRateStats] = useState(true);

  const [notice, setNotice] = useState<Notice | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalJob, setOriginalJob] = useState<Job | null>(null);
  const [form, setForm] = useState<JobFormInput>(buildEmptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [checkingApplyLink, setCheckingApplyLink] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [applyConfirmJob, setApplyConfirmJob] = useState<Job | null>(null);
  const [markingAppliedId, setMarkingAppliedId] = useState<string | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<JobStatus | "">("");
  const [bulkDiscardReason, setBulkDiscardReason] = useState<
    DiscardReason | ""
  >("");
  const [bulkUpdatingStatus, setBulkUpdatingStatus] = useState(false);
  const [quickStatusMenuJobId, setQuickStatusMenuJobId] = useState<
    string | null
  >(null);
  const [quickTargetStatus, setQuickTargetStatus] = useState<JobStatus | "">(
    "",
  );
  const [quickDiscardReason, setQuickDiscardReason] = useState<
    DiscardReason | ""
  >("");
  const [quickStatusUpdatingId, setQuickStatusUpdatingId] = useState<
    string | null
  >(null);
  const [generatingResumeById, setGeneratingResumeById] = useState<
    Record<string, boolean>
  >({});
  const [applyingJobIds, setApplyingJobIds] = useState<Record<string, boolean>>(
    {},
  );
  const [bulkApplying, setBulkApplying] = useState(false);

  const jobsListRef = useRef<HTMLDivElement | null>(null);
  const refreshAllRef = useRef<(() => Promise<void>) | null>(null);
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const successNoticeTimerRef = useRef<number | null>(null);
  const hasRestoredFiltersRef = useRef(false);

  const allVisibleSelected =
    jobs.length > 0 && jobs.every((job) => selectedJobIds.includes(job.id));
  const someVisibleSelected =
    !allVisibleSelected && jobs.some((job) => selectedJobIds.includes(job.id));

  const totalPages = useMemo(() => {
    if (!total) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const minMatchRatingValue = useMemo(() => {
    const trimmed = minMatchRatingFilter.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [minMatchRatingFilter]);

  const maxMatchRatingValue = useMemo(() => {
    const trimmed = maxMatchRatingFilter.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [maxMatchRatingFilter]);

  const scoreMinValue = useMemo(() => {
    const trimmed = scoreMinFilter.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [scoreMinFilter]);

  const scoreMaxValue = useMemo(() => {
    const trimmed = scoreMaxFilter.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [scoreMaxFilter]);

  function mergeJobs(existingJobs: Job[], nextJobs: Job[]): Job[] {
    if (existingJobs.length === 0) {
      return nextJobs;
    }

    const seenIds = new Set(existingJobs.map((job) => job.id));
    return [...existingJobs, ...nextJobs.filter((job) => !seenIds.has(job.id))];
  }

  const loadJobs = useCallback(async () => {
    const isAppendingPage = page > 1;
    setLoadingJobs(!isAppendingPage);
    setLoadingMoreJobs(isAppendingPage);
    setJobsError("");

    try {
      const response = await listJobs({
        page,
        limit,
        include_discarded: showDiscardedJobs,
        status: statusFilter,
        verdict: verdictFilter,
        discard_reason: statusFilter === "discarded" ? discardReasonFilter : "",
        company: companyFilter,
        location: locationFilter,
        min_match_rating: minMatchRatingValue,
        max_match_rating: maxMatchRatingValue,
        sort_match: matchSort,
        score_field: scoreFieldFilter,
        score_min: scoreMinValue,
        score_max: scoreMaxValue,
        score_sort: scoreSort,
      });
      setJobs((currentJobs) =>
        isAppendingPage ? mergeJobs(currentJobs, response.data) : response.data,
      );
      setTotal(response.total);
      if (response.page !== page) {
        setPage(response.page);
      }
      if (response.limit !== limit) {
        setLimit(response.limit);
      }
    } catch (error) {
      setJobsError(getApiMessage(error));
    } finally {
      setLoadingJobs(false);
      setLoadingMoreJobs(false);
    }
  }, [
    companyFilter,
    discardReasonFilter,
    limit,
    locationFilter,
    matchSort,
    maxMatchRatingValue,
    minMatchRatingValue,
    scoreFieldFilter,
    scoreMaxValue,
    scoreMinValue,
    scoreSort,
    page,
    verdictFilter,
    showDiscardedJobs,
    statusFilter,
  ]);

  const reloadVisibleJobs = useCallback(
    async (options?: { showLoading?: boolean }) => {
      const showLoading = options?.showLoading ?? true;

      if (showLoading) {
        setLoadingJobs(true);
        setLoadingMoreJobs(false);
      }
      setJobsError("");

      try {
        const pages = Array.from({ length: page }, (_, index) => index + 1);
        const responses = await Promise.all(
          pages.map((targetPage) =>
            listJobs({
              page: targetPage,
              limit,
              include_discarded: showDiscardedJobs,
              status: statusFilter,
              verdict: verdictFilter,
              discard_reason:
                statusFilter === "discarded" ? discardReasonFilter : "",
              company: companyFilter,
              location: locationFilter,
              min_match_rating: minMatchRatingValue,
              max_match_rating: maxMatchRatingValue,
              sort_match: matchSort,
              score_field: scoreFieldFilter,
              score_min: scoreMinValue,
              score_max: scoreMaxValue,
              score_sort: scoreSort,
            }),
          ),
        );

        const mergedJobs = responses.flatMap((response) => response.data);
        setJobs(mergedJobs);
        setTotal(responses[0]?.total ?? 0);

        const lastResponse = responses[responses.length - 1];
        if (lastResponse && lastResponse.page !== page) {
          setPage(lastResponse.page);
        }
        if (lastResponse && lastResponse.limit !== limit) {
          setLimit(lastResponse.limit);
        }
      } catch (error) {
        setJobsError(getApiMessage(error));
      } finally {
        if (showLoading) {
          setLoadingJobs(false);
        }
        setLoadingMoreJobs(false);
      }
    },
    [
      companyFilter,
      discardReasonFilter,
      limit,
      locationFilter,
      matchSort,
      maxMatchRatingValue,
      minMatchRatingValue,
      scoreFieldFilter,
      scoreMaxValue,
      scoreMinValue,
      scoreSort,
      page,
      verdictFilter,
      showDiscardedJobs,
      statusFilter,
    ],
  );

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const [overall, ...statusBreakdown] = await Promise.all([
        listJobs({ page: 1, limit: 1 }),
        ...JOB_STATUSES.map((status) =>
          listJobs({ page: 1, limit: 1, status }),
        ),
      ]);

      const byStatus = JOB_STATUSES.reduce(
        (acc, status, index) => {
          acc[status] = statusBreakdown[index]?.total ?? 0;
          return acc;
        },
        {
          added: 0,
          applied: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
          withdrawn: 0,
          discarded: 0,
        } as Record<JobStatus, number>,
      );

      setAnalytics({
        total: overall.total,
        byStatus,
      });
    } catch {
      setAnalytics(analyticsSeed());
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const loadApplyRateStats = useCallback(async () => {
    setLoadingApplyRateStats(true);
    try {
      const stats = await getApplyRateStats();
      setApplyRateStats(stats);
    } catch {
      setApplyRateStats({
        daily_count: 0,
        weekly_count: 0,
        monthly_count: 0,
        daily_average: 0,
        weekly_average: 0,
        monthly_average: 0,
      });
    } finally {
      setLoadingApplyRateStats(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      reloadVisibleJobs(),
      loadAnalytics(),
      loadApplyRateStats(),
    ]);
  }, [loadAnalytics, loadApplyRateStats, reloadVisibleJobs]);

  function captureJobsListAnchor(): JobsListAnchor | null {
    const container = jobsListRef.current;
    if (!container) {
      return null;
    }

    const rows = Array.from(
      container.querySelectorAll<HTMLElement>("[data-job-id]"),
    );
    if (rows.length === 0) {
      return null;
    }

    const containerTop = container.getBoundingClientRect().top;
    const visibleRows = rows.filter(
      (row) => row.getBoundingClientRect().bottom > containerTop,
    );
    const anchorRow = visibleRows[0] ?? rows[0];

    return {
      jobId: anchorRow.dataset.jobId || "",
      index: rows.indexOf(anchorRow),
      offsetTop: container.scrollTop - anchorRow.offsetTop,
      scrollLeft: container.scrollLeft,
    };
  }

  function restoreJobsListAnchor(anchor: JobsListAnchor | null) {
    const container = jobsListRef.current;
    if (!container || !anchor) {
      return;
    }

    const rows = Array.from(
      container.querySelectorAll<HTMLElement>("[data-job-id]"),
    );
    if (rows.length === 0) {
      return;
    }

    const exactMatch = anchor.jobId
      ? rows.find((row) => row.dataset.jobId === anchor.jobId)
      : null;
    const fallbackIndex = Math.min(Math.max(anchor.index, 0), rows.length - 1);
    const targetRow = exactMatch ?? rows[fallbackIndex] ?? rows[0];

    container.scrollTop = Math.max(0, targetRow.offsetTop + anchor.offsetTop);
    container.scrollLeft = anchor.scrollLeft;
  }

  async function preserveJobsListPositionWhile(action: () => Promise<void>) {
    const anchor = captureJobsListAnchor();
    await action();

    window.requestAnimationFrame(() => {
      restoreJobsListAnchor(anchor);
    });
  }

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasRestoredFiltersRef.current) {
      return;
    }

    localStorage.setItem(
      DASHBOARD_FILTERS_STORAGE_KEY,
      JSON.stringify({ statusFilter, showDiscardedJobs }),
    );
    localStorage.setItem(LEGACY_STATUS_FILTER_STORAGE_KEY, statusFilter);
  }, [showDiscardedJobs, statusFilter]);

  useEffect(() => {
    const persistedFilters = readPersistedDashboardFilters();
    setStatusFilter(persistedFilters.statusFilter);
    setShowDiscardedJobs(persistedFilters.showDiscardedJobs);
    hasRestoredFiltersRef.current = true;
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    void loadApplyRateStats();
  }, [loadApplyRateStats]);

  useEffect(() => {
    setSelectedJobIds((prev) =>
      prev.filter((id) => jobs.some((job) => job.id === id)),
    );
  }, [jobs]);

  useEffect(() => {
    if (selectedJobIds.length === 0) {
      setBulkTargetStatus("");
      setBulkDiscardReason("");
    }
  }, [selectedJobIds.length]);

  useEffect(() => {
    if (!quickStatusMenuJobId) {
      return;
    }

    if (!jobs.some((job) => job.id === quickStatusMenuJobId)) {
      setQuickStatusMenuJobId(null);
      setQuickTargetStatus("");
      setQuickDiscardReason("");
      setQuickStatusUpdatingId(null);
    }
  }, [jobs, quickStatusMenuJobId]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  useEffect(() => {
    refreshAllRef.current = refreshAll;
  }, [refreshAll]);

  useEffect(() => {
    const unsubscribe = subscribeToJobCreated(() => {
      if (refreshAllRef.current) {
        void refreshAllRef.current();
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (notice?.kind !== "success") {
      return;
    }

    if (successNoticeTimerRef.current !== null) {
      window.clearTimeout(successNoticeTimerRef.current);
    }

    successNoticeTimerRef.current = window.setTimeout(() => {
      setNotice((current) => (current?.kind === "success" ? null : current));
      successNoticeTimerRef.current = null;
    }, 3000);

    return () => {
      if (successNoticeTimerRef.current !== null) {
        window.clearTimeout(successNoticeTimerRef.current);
        successNoticeTimerRef.current = null;
      }
    };
  }, [notice]);

  async function preserveScrollPositionWhile(action: () => Promise<void>) {
    const currentScrollY = window.scrollY;
    await action();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: "auto" });
    });
  }

  function closeForm() {
    setIsFormOpen(false);
    setIsCreateMode(true);
    setEditingId(null);
    setOriginalJob(null);
    setForm(buildEmptyForm());
    setFormErrors({});
    setSubmitting(false);
    setCheckingApplyLink(false);
  }

  function openCreate() {
    setIsCreateMode(true);
    setEditingId(null);
    setOriginalJob(null);
    setForm(buildEmptyForm());
    setFormErrors({});
    setIsFormOpen(true);
  }

  async function openEdit(id: string) {
    setNotice(null);
    setIsCreateMode(false);
    setEditingId(id);
    setIsFormOpen(true);
    setSubmitting(true);
    setFormErrors({});

    try {
      const job = await getJob(id);
      setOriginalJob(job);
      setForm(formFromJob(job));
    } catch (error) {
      setNotice({ kind: "error", message: getApiMessage(error) });
      closeForm();
    } finally {
      setSubmitting(false);
    }
  }

  async function validateApplyLinkUniqueness(link: string): Promise<string> {
    const normalized = normalizeApplyLink(link);
    if (!normalized) {
      return "Apply link is required.";
    }

    if (!isCreateMode && originalJob) {
      const originalNormalized = normalizeApplyLink(originalJob.apply_link);
      if (normalized === originalNormalized) {
        return "";
      }
    }

    setCheckingApplyLink(true);
    try {
      const exists = await existsApplyLink(normalized);
      return exists ? "This apply link is already tracked." : "";
    } catch {
      return "Unable to verify apply link now. You can still submit.";
    } finally {
      setCheckingApplyLink(false);
    }
  }

  function setResumeGenerating(jobId: string, value: boolean) {
    setGeneratingResumeById((prev) => {
      if (value) {
        return { ...prev, [jobId]: true };
      }
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
  }

  async function waitForResumeLink(jobId: string): Promise<Job | null> {
    const maxAttempts = 25;
    const delayMs = 2500;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const latestJob = await getJob(jobId);
      if (latestJob.resume_link.trim()) {
        return latestJob;
      }

      await sleep(delayMs);
    }

    return null;
  }

  async function onGenerateResume(job: Job) {
    if (generatingResumeById[job.id]) {
      return;
    }

    setNotice(null);
    setResumeGenerating(job.id, true);
    try {
      const response = await triggerResumeGenerate(job.id);
      setNotice({
        kind: "success",
        message: response.message || "Resume generation queued.",
      });

      const updatedJob = await waitForResumeLink(job.id);
      if (!updatedJob) {
        setNotice({
          kind: "success",
          message:
            "Resume generation is in progress. The link will appear once ready.",
        });
        return;
      }

      setJobs((prev) =>
        prev.map((existing) =>
          existing.id === updatedJob.id ? updatedJob : existing,
        ),
      );
      setNotice({ kind: "success", message: "Resume link updated." });
    } catch (error) {
      setNotice({ kind: "error", message: getApiMessage(error) });
    } finally {
      setResumeGenerating(job.id, false);
    }
  }

  async function onAutoApply(job: Job) {
    if (applyingJobIds[job.id]) {
      return;
    }

    setNotice(null);
    setApplyingJobIds((prev) => ({ ...prev, [job.id]: true }));
    try {
      await createApplication(job.id, "review");
      setNotice({
        kind: "success",
        message: `Application queued for ${job.role_title} at ${job.company_name}. Check the Applications page for progress.`,
      });
    } catch (error) {
      setNotice({ kind: "error", message: getApiMessage(error) });
    } finally {
      setApplyingJobIds((prev) => {
        const next = { ...prev };
        delete next[job.id];
        return next;
      });
    }
  }

  async function onAutoApplySelected() {
    if (selectedJobIds.length === 0 || bulkApplying) {
      return;
    }

    setNotice(null);
    setBulkApplying(true);
    try {
      const response = await bulkCreateApplications(selectedJobIds, "review");
      setNotice({
        kind: "success",
        message: `Queued ${response.created} of ${selectedJobIds.length} selected job(s) for auto-apply. Check the Applications page for progress.`,
      });
      setSelectedJobIds([]);
    } catch (error) {
      setNotice({ kind: "error", message: getApiMessage(error) });
    } finally {
      setBulkApplying(false);
    }
  }

  async function onSubmitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const nextErrors = validateFormInput(form);
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    const applyLinkError = await validateApplyLinkUniqueness(form.apply_link);
    if (
      applyLinkError &&
      applyLinkError !==
        "Unable to verify apply link now. You can still submit."
    ) {
      setFormErrors((prev) => ({ ...prev, apply_link: applyLinkError }));
      return;
    }

    if (applyLinkError) {
      setNotice({ kind: "error", message: applyLinkError });
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      if (isCreateMode) {
        await createJob(buildCreatePayload(form));
        setNotice({ kind: "success", message: "Job application created." });
      } else {
        if (!editingId || !originalJob) {
          throw new Error("Unable to update. Missing job context.");
        }

        const payload = buildUpdatePayload(form, originalJob);
        if (Object.keys(payload).length === 0) {
          setFormErrors({ form: "No changes detected to update." });
          return;
        }

        await updateJob(editingId, payload);
        setNotice({ kind: "success", message: "Job application updated." });
      }

      closeForm();
      await preserveJobsListPositionWhile(() =>
        reloadVisibleJobs({ showLoading: false }),
      );
    } catch (error) {
      setFormErrors({ form: getApiMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    const confirmed = window.confirm("Delete this job application?");
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setNotice(null);
    try {
      await deleteJob(id);
      setNotice({ kind: "success", message: "Job application deleted." });
      await preserveJobsListPositionWhile(() =>
        reloadVisibleJobs({ showLoading: false }),
      );
    } catch (error) {
      setNotice({ kind: "error", message: getApiMessage(error) });
    } finally {
      setDeletingId(null);
    }
  }

  function toggleJobSelection(id: string) {
    setSelectedJobIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((existing) => existing !== id);
      }
      return [...prev, id];
    });
  }

  function toggleAllVisibleJobSelections() {
    if (allVisibleSelected) {
      setSelectedJobIds([]);
      return;
    }

    setSelectedJobIds(jobs.map((job) => job.id));
  }

  async function onConfirmBulkDelete() {
    if (selectedJobIds.length < 2) {
      return;
    }

    setBulkDeleting(true);
    setNotice(null);
    try {
      const deletedCount = await bulkDeleteJobs(selectedJobIds);
      setNotice({
        kind: "success",
        message: `${deletedCount} job application(s) deleted.`,
      });
      setSelectedJobIds([]);
      setShowBulkDeleteConfirm(false);
      await preserveScrollPositionWhile(refreshAll);
    } catch (error) {
      setNotice({ kind: "error", message: getApiMessage(error) });
    } finally {
      setBulkDeleting(false);
    }
  }

  async function onBulkStatusUpdate() {
    if (selectedJobIds.length === 0) {
      return;
    }

    if (!bulkTargetStatus) {
      setNotice({ kind: "error", message: "Select a target status first." });
      return;
    }

    if (bulkTargetStatus === "discarded" && !bulkDiscardReason) {
      setNotice({
        kind: "error",
        message: "Select a discard reason when updating to discarded.",
      });
      return;
    }

    setNotice(null);
    setBulkUpdatingStatus(true);
    try {
      const updatedCount = await bulkUpdateJobsStatus(
        selectedJobIds,
        bulkTargetStatus,
        normalizeDiscardReasonForBulk(bulkTargetStatus, bulkDiscardReason),
      );
      setNotice({
        kind: "success",
        message: `${updatedCount} job application(s) updated to ${STATUS_LABELS[bulkTargetStatus]}.`,
      });
      setSelectedJobIds([]);
      setBulkTargetStatus("");
      setBulkDiscardReason("");
      await preserveScrollPositionWhile(refreshAll);
    } catch (error) {
      setNotice({ kind: "error", message: getApiMessage(error) });
    } finally {
      setBulkUpdatingStatus(false);
    }
  }

  function openQuickStatusMenu(jobId: string) {
    setQuickStatusMenuJobId((currentId) => {
      if (currentId === jobId) {
        return null;
      }
      return jobId;
    });
    setQuickTargetStatus("");
    setQuickDiscardReason("");
  }

  function closeQuickStatusMenu() {
    setQuickStatusMenuJobId(null);
    setQuickTargetStatus("");
    setQuickDiscardReason("");
    setQuickStatusUpdatingId(null);
  }

  function onQuickStatusPick(status: JobStatus) {
    setQuickTargetStatus(status);
    if (status !== "discarded") {
      setQuickDiscardReason("");
    }
  }

  async function onQuickStatusUpdate(job: Job, status: JobStatus) {
    if (quickStatusUpdatingId === job.id) {
      return;
    }

    const nextStatus = status;
    const nextDiscardReason =
      nextStatus === "discarded" ? quickDiscardReason : "";

    if (nextStatus === "discarded" && !nextDiscardReason) {
      setNotice({
        kind: "error",
        message: "Select a discard reason when updating to discarded.",
      });
      return;
    }

    setNotice(null);
    setQuickStatusUpdatingId(job.id);
    try {
      await updateJob(job.id, {
        status: nextStatus,
        discard_reason: nextStatus === "discarded" ? nextDiscardReason : "",
      });
      setNotice({
        kind: "success",
        message: `Job updated to ${STATUS_LABELS[nextStatus]}.`,
      });
      closeQuickStatusMenu();
      await preserveJobsListPositionWhile(() =>
        reloadVisibleJobs({ showLoading: false }),
      );
    } catch (error) {
      setNotice({ kind: "error", message: getApiMessage(error) });
    } finally {
      setQuickStatusUpdatingId(null);
    }
  }

  function onApplyLinkClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    job: Job,
  ) {
    event.preventDefault();
    window.open(job.apply_link, "_blank", "noopener,noreferrer");
    setApplyConfirmJob(job);
  }

  async function onConfirmApplied() {
    if (!applyConfirmJob) {
      return;
    }

    setNotice(null);
    setMarkingAppliedId(applyConfirmJob.id);
    try {
      await updateJob(applyConfirmJob.id, {
        status: "applied",
        applied_at: new Date().toISOString(),
        discard_reason: "",
      });
      setNotice({
        kind: "success",
        message: "Job marked as applied with current date and time.",
      });
      setApplyConfirmJob(null);
      await preserveJobsListPositionWhile(() =>
        reloadVisibleJobs({ showLoading: false }),
      );
    } catch (error) {
      setNotice({ kind: "error", message: getApiMessage(error) });
    } finally {
      setMarkingAppliedId(null);
    }
  }

  function applyStatusFilter(
    nextStatus: JobStatus | "",
    source: "card" | "control" = "control",
  ) {
    if (source === "card") {
      setShowDiscardedJobs(nextStatus === "discarded");
    }

    setPage(1);
    setStatusFilter(nextStatus);
    if (nextStatus !== "discarded") {
      setDiscardReasonFilter("");
    }
  }

  function getSummaryCardClass(cardStatus: JobStatus | ""): string {
    const isActive = statusFilter === cardStatus;
    if (isActive) {
      return "rounded-2xl border border-cyan-300 bg-cyan-50 p-5 text-left shadow-sm dark:border-cyan-700/80 dark:bg-cyan-900/30";
    }
    return "rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/40 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-cyan-700 dark:hover:bg-cyan-900/20";
  }

  return {
    apiBaseUrl: API_BASE_URL,
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
    minMatchRatingFilter,
    maxMatchRatingFilter,
    matchSort,
    verdictFilter,
    scoreFieldFilter,
    scoreMinFilter,
    scoreMaxFilter,
    scoreSort,
    loadingJobs,
    loadingMoreJobs,
    jobsError,
    analytics,
    loadingAnalytics,
    applyRateStats,
    loadingApplyRateStats,
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
    applyingJobIds,
    bulkApplying,
    jobsListRef,
    allVisibleSelected,
    someVisibleSelected,
    selectAllRef,
    setPage,
    setLimit,
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
    getSummaryCardClass,
    onGenerateResume,
    onAutoApply,
    onAutoApplySelected,
    validateApplyLinkUniqueness,
  };
}

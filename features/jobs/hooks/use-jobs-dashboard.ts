import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  API_BASE_URL,
  bulkDeleteJobs,
  bulkUpdateJobsStatus,
  createJob,
  deleteJob,
  existsApplyLink,
  getJob,
  listJobs,
  normalizeApplyLink,
  subscribeToJobCreated,
  triggerResumeGenerate,
  updateJob,
} from "@/lib/api/jobs";
import {
  JOB_STATUSES,
  type DiscardReason,
  type Job,
  type JobFormInput,
  type JobStatus,
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
import type { Analytics, FormErrors, Notice } from "@/features/jobs/types";
import { STATUS_LABELS } from "@/features/jobs/constants/labels";

export function useJobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [showDiscardedJobs, setShowDiscardedJobs] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const [discardReasonFilter, setDiscardReasonFilter] = useState<
    DiscardReason | ""
  >("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minMatchRatingFilter, setMinMatchRatingFilter] = useState("");
  const [maxMatchRatingFilter, setMaxMatchRatingFilter] = useState("");
  const [matchSort, setMatchSort] = useState<"" | "asc" | "desc">("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");

  const [analytics, setAnalytics] = useState<Analytics>(analyticsSeed());
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

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

  const refreshAllRef = useRef<(() => Promise<void>) | null>(null);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

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

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    setJobsError("");

    try {
      const response = await listJobs({
        page,
        limit,
        include_discarded: showDiscardedJobs,
        status: statusFilter,
        discard_reason: statusFilter === "discarded" ? discardReasonFilter : "",
        company: companyFilter,
        location: locationFilter,
        min_match_rating: minMatchRatingValue,
        max_match_rating: maxMatchRatingValue,
        sort_match: matchSort,
      });
      setJobs(response.data);
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
    }
  }, [
    companyFilter,
    discardReasonFilter,
    limit,
    locationFilter,
    matchSort,
    maxMatchRatingValue,
    minMatchRatingValue,
    page,
    showDiscardedJobs,
    statusFilter,
  ]);

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

  const refreshAll = useCallback(async () => {
    await Promise.all([loadJobs(), loadAnalytics()]);
  }, [loadAnalytics, loadJobs]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

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
      await refreshAll();
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
      await refreshAll();
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
      await refreshAll();
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
      await refreshAll();
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
      await refreshAll();
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
      await refreshAll();
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
    const effectiveShowDiscarded =
      source === "card" ? nextStatus === "discarded" : showDiscardedJobs;

    if (source === "card") {
      setShowDiscardedJobs(effectiveShowDiscarded);
    }

    if (!effectiveShowDiscarded && nextStatus === "discarded") {
      return;
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
    quickStatusMenuJobId,
    quickTargetStatus,
    quickDiscardReason,
    quickStatusUpdatingId,
    generatingResumeById,
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
    setMinMatchRatingFilter,
    setMaxMatchRatingFilter,
    setMatchSort,
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
    validateApplyLinkUniqueness,
  };
}

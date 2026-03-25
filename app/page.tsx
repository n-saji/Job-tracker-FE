"use client";

import {
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ApiError,
  API_BASE_URL,
  bulkDeleteJobs,
  createJob,
  deleteJob,
  existsApplyLink,
  formatAppliedDate,
  getJob,
  listJobs,
  normalizeApplyLink,
  toDateTimeLocalValue,
  toIsoFromDateTimeLocal,
  updateJob,
} from "@/lib/jobs-api";
import {
  DISCARD_REASONS,
  JOB_STATUSES,
  type DiscardReason,
  type Job,
  type JobFormInput,
  type JobStatus,
} from "@/lib/job-types";

type FormErrors = Partial<Record<keyof JobFormInput | "form", string>>;

type Notice = {
  kind: "success" | "error";
  message: string;
};

type Analytics = {
  total: number;
  byStatus: Record<JobStatus, number>;
};

const STATUS_LABELS: Record<JobStatus, string> = {
  added: "Added",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  discarded: "Discarded",
};

const DISCARD_REASON_LABELS: Record<DiscardReason, string> = {
  high_applicants: "High Applicants",
  security_clearance: "Security Clearance",
  less_experience: "Less Experience",
  citizenship: "Citizenship",
  not_fit: "Not Fit",
};

const PAGE_LIMIT_OPTIONS = [20, 50, 100];

function buildEmptyForm(): JobFormInput {
  return {
    company_name: "",
    role_title: "",
    location: "",
    apply_link: "",
    linkedin_job_url: "",
    resume_link: "",
    status: "applied",
    discard_reason: "",
    salary_text: "",
    is_easy_apply: false,
    applied_at: "",
  };
}

function formFromJob(job: Job): JobFormInput {
  return {
    company_name: job.company_name,
    role_title: job.role_title,
    location: job.location,
    apply_link: job.apply_link,
    linkedin_job_url: job.linkedin_job_url,
    resume_link: job.resume_link,
    status: job.status,
    discard_reason: job.discard_reason ?? "",
    salary_text: job.salary_text,
    is_easy_apply: job.is_easy_apply,
    applied_at: toDateTimeLocalValue(job.applied_at),
  };
}

function analyticsSeed(): Analytics {
  return {
    total: 0,
    byStatus: {
      added: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
      discarded: 0,
    },
  };
}

function getApiMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

function getStatusBadgeClass(status: JobStatus): string {
  if (status === "offer") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }
  if (status === "interview") {
    return "bg-sky-100 text-sky-700 border border-sky-200";
  }
  if (status === "applied") {
    return "bg-amber-100 text-amber-800 border border-amber-200";
  }
  if (status === "rejected") {
    return "bg-rose-100 text-rose-700 border border-rose-200";
  }
  if (status === "added") {
    return "bg-green-100 text-green-800 border border-green-200";
  }
  if (status === "discarded") {
    return "bg-orange-100 text-orange-800 border border-orange-200";
  }
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export default function Home() {
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

  const totalPages = useMemo(() => {
    if (!total) {
      return 1;
    }
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

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

  const refreshAll = useCallback(async () => {
    await Promise.all([loadJobs(), loadAnalytics()]);
  }, [loadAnalytics, loadJobs]);

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

  function validateFormInput(value: JobFormInput): FormErrors {
    const nextErrors: FormErrors = {};

    if (!value.company_name.trim()) {
      nextErrors.company_name = "Company name is required.";
    }
    if (!value.role_title.trim()) {
      nextErrors.role_title = "Role title is required.";
    }
    if (!value.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    const normalizedApplyLink = normalizeApplyLink(value.apply_link);
    if (!normalizedApplyLink) {
      nextErrors.apply_link = "Apply link is required.";
    }

    if (!JOB_STATUSES.includes(value.status)) {
      nextErrors.status = "Status is invalid.";
    }

    if (value.status === "discarded") {
      if (
        !value.discard_reason ||
        !DISCARD_REASONS.includes(value.discard_reason)
      ) {
        nextErrors.discard_reason =
          "Discard reason is required for discarded jobs.";
      }
    }

    if (!value.applied_at) {
      nextErrors.applied_at = "Applied date and time is required.";
    } else if (!toIsoFromDateTimeLocal(value.applied_at)) {
      nextErrors.applied_at = "Applied date and time is invalid.";
    }

    return nextErrors;
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

  function buildCreatePayload(value: JobFormInput) {
    return {
      company_name: value.company_name.trim(),
      role_title: value.role_title.trim(),
      location: value.location.trim(),
      apply_link: normalizeApplyLink(value.apply_link),
      linkedin_job_url: value.linkedin_job_url.trim(),
      resume_link: value.resume_link.trim(),
      status: value.status,
      discard_reason: value.status === "discarded" ? value.discard_reason : "",
      salary_text: value.salary_text.trim(),
      is_easy_apply: value.is_easy_apply,
      applied_at: toIsoFromDateTimeLocal(value.applied_at),
    };
  }

  function buildUpdatePayload(value: JobFormInput, current: Job) {
    const nextAppliedAt = toIsoFromDateTimeLocal(value.applied_at);
    const payload: Record<string, unknown> = {};

    const withTrim = {
      company_name: value.company_name.trim(),
      role_title: value.role_title.trim(),
      location: value.location.trim(),
      apply_link: normalizeApplyLink(value.apply_link),
      linkedin_job_url: value.linkedin_job_url.trim(),
      resume_link: value.resume_link.trim(),
      status: value.status,
      discard_reason: value.status === "discarded" ? value.discard_reason : "",
      salary_text: value.salary_text.trim(),
      is_easy_apply: value.is_easy_apply,
      applied_at: nextAppliedAt,
    };

    if (withTrim.company_name !== current.company_name) {
      payload.company_name = withTrim.company_name;
    }
    if (withTrim.role_title !== current.role_title) {
      payload.role_title = withTrim.role_title;
    }
    if (withTrim.location !== current.location) {
      payload.location = withTrim.location;
    }
    if (withTrim.apply_link !== normalizeApplyLink(current.apply_link)) {
      payload.apply_link = withTrim.apply_link;
    }
    if (withTrim.linkedin_job_url !== current.linkedin_job_url) {
      payload.linkedin_job_url = withTrim.linkedin_job_url;
    }
    if (withTrim.resume_link !== current.resume_link) {
      payload.resume_link = withTrim.resume_link;
    }
    if (withTrim.status !== current.status) {
      payload.status = withTrim.status;
    }
    if ((withTrim.discard_reason || "") !== (current.discard_reason || "")) {
      payload.discard_reason = withTrim.discard_reason;
    }
    if (withTrim.salary_text !== current.salary_text) {
      payload.salary_text = withTrim.salary_text;
    }
    if (withTrim.is_easy_apply !== current.is_easy_apply) {
      payload.is_easy_apply = withTrim.is_easy_apply;
    }
    if (withTrim.applied_at !== current.applied_at) {
      payload.applied_at = withTrim.applied_at;
    }

    return payload;
  }

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
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
      const message = getApiMessage(error);
      setFormErrors({ form: message });
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

  function onApplyLinkClick(event: MouseEvent<HTMLAnchorElement>, job: Job) {
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
      return "rounded-2xl border border-cyan-300 bg-cyan-50 p-5 text-left shadow-sm";
    }
    return "rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/40";
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(120deg,#f8fafc_0%,#f1f5f9_38%,#e2e8f0_100%)] pb-12">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-amber-300/35 blur-3xl" />

      <main className="relative mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Job Tracker Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Track every role, interview, and offer.
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Connected API base URL:{" "}
                <span className="font-semibold text-slate-900">
                  {API_BASE_URL}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              New Application
            </button>
          </div>
        </header>

        {notice && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              notice.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {notice.message}
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            onClick={() => applyStatusFilter("", "card")}
            className={getSummaryCardClass("")}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Total Jobs
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {STATUS_LABELS[status]}
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {STATUS_LABELS[status]}
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {loadingAnalytics ? "..." : analytics.byStatus[status]}
              </p>
            </button>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur sm:p-6">
          <div className="mb-5 flex flex-wrap items-end gap-3 justify-around">
            <label className="flex min-w-[160px] flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
              <select
                value={statusFilter}
                onChange={(event) => {
                  applyStatusFilter(event.target.value as JobStatus | "");
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring"
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
              <label className="flex min-w-[180px] flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Discard Reason
                <select
                  value={discardReasonFilter}
                  onChange={(event) => {
                    setPage(1);
                    setDiscardReasonFilter(
                      event.target.value as DiscardReason | "",
                    );
                  }}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring"
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

            <label className="flex min-w-[190px] flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Company
              <input
                value={companyFilter}
                onChange={(event) => {
                  setPage(1);
                  setCompanyFilter(event.target.value);
                }}
                placeholder="Search company"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring"
              />
            </label>

            <label className="flex min-w-[190px] flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Location
              <input
                value={locationFilter}
                onChange={(event) => {
                  setPage(1);
                  setLocationFilter(event.target.value);
                }}
                placeholder="Search location"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring"
              />
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  showDiscardedJobs ? "bg-cyan-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    showDiscardedJobs ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Page size
              <select
                value={limit}
                onChange={(event) => {
                  setPage(1);
                  setLimit(Number(event.target.value));
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-cyan-300 transition focus:ring"
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
            <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-700">
                {selectedJobIds.length} jobs selected
              </p>
              <div className="flex items-center gap-2">
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
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJobIds([])}
                  className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {jobsError && (
            <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {jobsError}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-slate-100/70">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Select
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Company & Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingJobs ? (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm text-slate-500"
                        colSpan={6}
                      >
                        Loading jobs...
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm text-slate-500"
                        colSpan={6}
                      >
                        No jobs found for the current filters.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id} className="border-t border-slate-100">
                        <td className="h-full w-full px-4 py-4 flex justify-center align-center">
                          <input
                            type="checkbox"
                            checked={selectedJobIds.includes(job.id)}
                            onChange={() => toggleJobSelection(job.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-cyan-300"
                            aria-label={`Select ${job.company_name} ${job.role_title}`}
                          />
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="text-sm font-semibold text-slate-900">
                            {job.company_name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {job.role_title}
                          </p>
                          <a
                            href={job.apply_link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => {
                              onApplyLinkClick(event, job);
                            }}
                            className="mt-1 inline-block text-xs font-semibold text-cyan-700 hover:text-cyan-900"
                          >
                            Open apply link
                          </a>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(job.status)}`}
                          >
                            {STATUS_LABELS[job.status]}
                          </span>
                          {job.status === "discarded" && job.discard_reason && (
                            <p className="mt-1 text-xs font-medium text-orange-700">
                              Reason:{" "}
                              {DISCARD_REASON_LABELS[job.discard_reason]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-700">
                          {formatAppliedDate(job.applied_at)}
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-700">
                          {job.location || "-"}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex gap-2">
                            {job.resume_link && (
                              <a
                                href={job.resume_link}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400"
                              >
                                Download Resume
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => void openEdit(job.id)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDelete(job.id)}
                              disabled={deletingId === job.id}
                              className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === job.id ? "Deleting..." : "Delete"}
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
            <p className="text-sm text-slate-600">
              Page <span className="font-semibold text-slate-900">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>{" "}
              ({total} jobs)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loadingJobs}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages || loadingJobs}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {isCreateMode ? "Create" : "Edit"}
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {isCreateMode
                    ? "New Job Application"
                    : "Update Job Application"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
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
                <label className="text-sm font-medium text-slate-700">
                  Company Name
                  <input
                    value={form.company_name}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        company_name: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                  />
                  {formErrors.company_name && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.company_name}
                    </span>
                  )}
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Role Title
                  <input
                    value={form.role_title}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        role_title: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                  />
                  {formErrors.role_title && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.role_title}
                    </span>
                  )}
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Location
                  <input
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                  />
                  {formErrors.location && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.location}
                    </span>
                  )}
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => {
                        const nextStatus = event.target.value as JobStatus;
                        return {
                          ...prev,
                          status: nextStatus,
                          discard_reason:
                            nextStatus === "discarded"
                              ? prev.discard_reason
                              : "",
                        };
                      })
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
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
                  <label className="text-sm font-medium text-slate-700">
                    Discard Reason
                    <select
                      value={form.discard_reason}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          discard_reason: event.target.value as DiscardReason,
                        }))
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
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

                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
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
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                  />
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-rose-700">
                      {formErrors.apply_link}
                    </span>
                    {checkingApplyLink && (
                      <span className="text-slate-500">Checking link...</span>
                    )}
                  </div>
                </label>

                <label className="text-sm font-medium text-slate-700">
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
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
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
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
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
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
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
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-cyan-300 transition focus:ring"
                  />
                  {formErrors.applied_at && (
                    <span className="mt-1 block text-xs text-rose-700">
                      {formErrors.applied_at}
                    </span>
                  )}
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_easy_apply}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      is_easy_apply: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-cyan-300"
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
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Confirm Application
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              Did you apply to {applyConfirmJob.company_name}?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Choose Yes to set status as Applied and applied date/time as now.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setApplyConfirmJob(null)}
                disabled={markingAppliedId === applyConfirmJob.id}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Confirm Bulk Delete
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
              Delete {selectedJobIds.length} selected job applications?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              This will remove all selected jobs from your tracker.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkDeleting}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
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

import {
  ApiError,
  normalizeApplyLink,
  toDateTimeLocalValue,
  toIsoFromDateTimeLocal,
} from "@/lib/api/jobs";
import {
  CreateJobPayload,
  DISCARD_REASONS,
  JOB_STATUSES,
  type DiscardReason,
  type Job,
  type JobFormInput,
  type JobStatus,
} from "@/lib/types/job";
import type { Analytics, FormErrors } from "@/features/jobs/types";

export function buildEmptyForm(): JobFormInput {
  return {
    company_name: "",
    role_title: "",
    location: "",
    job_description: "",
    apply_link: "",
    linkedin_job_url: "",
    resume_link: "",
    status: "applied",
    discard_reason: "",
    salary_text: "",
    is_easy_apply: false,
    match_rating: "",
    applied_at: "",
  };
}

export function formFromJob(job: Job): JobFormInput {
  return {
    company_name: job.company_name,
    role_title: job.role_title,
    location: job.location,
    job_description: job.job_description,
    apply_link: job.apply_link,
    linkedin_job_url: job.linkedin_job_url,
    resume_link: job.resume_link,
    status: job.status,
    discard_reason: job.discard_reason ?? "",
    salary_text: job.salary_text,
    is_easy_apply: job.is_easy_apply,
    match_rating:
      job.match_rating === undefined ? "" : String(job.match_rating),
    applied_at: toDateTimeLocalValue(job.applied_at),
  };
}

function parseMatchRating(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

export function analyticsSeed(): Analytics {
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

export function getApiMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function validateFormInput(value: JobFormInput): FormErrors {
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

  const trimmedRating = value.match_rating.trim();
  if (trimmedRating) {
    const parsedRating = parseMatchRating(value.match_rating);
    if (parsedRating === null) {
      nextErrors.match_rating =
        "Match rating must be a number between 0 and 10.";
    } else if (parsedRating < 0 || parsedRating > 10) {
      nextErrors.match_rating = "Match rating must be between 0 and 10.";
    }
  }

  return nextErrors;
}

export function buildCreatePayload(value: JobFormInput): CreateJobPayload {
  const matchRating = parseMatchRating(value.match_rating);

  return {
    company_name: value.company_name.trim(),
    role_title: value.role_title.trim(),
    location: value.location.trim(),
    job_description: value.job_description.trim(),
    apply_link: normalizeApplyLink(value.apply_link),
    linkedin_job_url: value.linkedin_job_url.trim(),
    resume_link: value.resume_link.trim(),
    status: value.status,
    discard_reason: value.status === "discarded" ? value.discard_reason : "",
    salary_text: value.salary_text.trim(),
    is_easy_apply: value.is_easy_apply,
    match_rating: matchRating,
    applied_at: toIsoFromDateTimeLocal(value.applied_at),
  };
}

export function buildUpdatePayload(
  value: JobFormInput,
  current: Job,
): Record<string, unknown> {
  const nextAppliedAt = toIsoFromDateTimeLocal(value.applied_at);
  const nextMatchRating = parseMatchRating(value.match_rating);
  const payload: Record<string, unknown> = {};

  const withTrim = {
    company_name: value.company_name.trim(),
    role_title: value.role_title.trim(),
    location: value.location.trim(),
    job_description: value.job_description.trim(),
    apply_link: normalizeApplyLink(value.apply_link),
    linkedin_job_url: value.linkedin_job_url.trim(),
    resume_link: value.resume_link.trim(),
    status: value.status,
    discard_reason: value.status === "discarded" ? value.discard_reason : "",
    salary_text: value.salary_text.trim(),
    is_easy_apply: value.is_easy_apply,
    match_rating: nextMatchRating,
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
  if (withTrim.job_description !== current.job_description) {
    payload.job_description = withTrim.job_description;
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
  if ((withTrim.match_rating ?? null) !== (current.match_rating ?? null)) {
    payload.match_rating = withTrim.match_rating;
  }
  if (withTrim.applied_at !== current.applied_at) {
    payload.applied_at = withTrim.applied_at;
  }

  return payload;
}

export function getStatusBadgeClass(status: JobStatus): string {
  if (status === "offer") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700";
  }
  if (status === "interview") {
    return "bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700";
  }
  if (status === "applied") {
    return "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700";
  }
  if (status === "rejected") {
    return "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700";
  }
  if (status === "added") {
    return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700";
  }
  if (status === "discarded") {
    return "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700";
  }
  return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function shouldResetDiscardReason(nextStatus: JobStatus): boolean {
  return nextStatus !== "discarded";
}

export function normalizeDiscardReasonForBulk(
  status: JobStatus,
  reason: DiscardReason | "",
): DiscardReason | undefined {
  if (status === "discarded" && reason) {
    return reason;
  }
  return undefined;
}

import type {
  BackendErrorPayload,
  BulkDeleteJobsResponse,
  BulkUpdateJobsStatusResponse,
  CreateJobPayload,
  DiscardReason,
  ExistsApplyLinkResponse,
  ApplyRateStatsResponse,
  Job,
  JobCreatedSSEPayload,
  JobStatus,
  ListResumesResponse,
  ListJobsParams,
  ListJobsResponse,
  ResumeGenerateTriggerResponse,
  ResumeQueueListResponse,
  UpdateJobPayload,
} from "@/lib/types/job";

const DEFAULT_API_BASE_URL = "http://localhost:8000";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
}

function buildQuery(params: ListJobsParams): string {
  const query = new URLSearchParams();

  if (params.page) {
    query.set("page", String(params.page));
  }
  if (params.limit) {
    query.set("limit", String(params.limit));
  }
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.discard_reason) {
    query.set("discard_reason", params.discard_reason);
  }
  if (params.include_discarded) {
    query.set("include_discarded", "true");
  }
  if (params.company?.trim()) {
    query.set("company", params.company.trim());
  }
  if (params.location?.trim()) {
    query.set("location", params.location.trim());
  }
  if (typeof params.min_match_rating === "number") {
    query.set("min_match_rating", String(params.min_match_rating));
  }
  if (typeof params.max_match_rating === "number") {
    query.set("max_match_rating", String(params.max_match_rating));
  }
  if (params.sort_match) {
    query.set("sort_match", params.sort_match);
  }

  return query.toString();
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Request failed";
    let code = "UNKNOWN_ERROR";

    try {
      const payload = (await response.json()) as BackendErrorPayload;
      if (payload.error?.message) {
        message = payload.error.message;
      }
      if (payload.error?.code) {
        code = payload.error.code;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function normalizeApplyLink(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.hash = "";

    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/$/, "");
    }

    return parsed.toString();
  } catch {
    return trimmed;
  }
}

export function toIsoFromDateTimeLocal(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString();
}

export function toDateTimeLocalValue(iso: string): string {
  if (!iso) {
    return "";
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = parsed.getFullYear();
  const month = pad(parsed.getMonth() + 1);
  const day = pad(parsed.getDate());
  const hours = pad(parsed.getHours());
  const minutes = pad(parsed.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatAppliedDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export async function listJobs(
  params: ListJobsParams,
): Promise<ListJobsResponse> {
  const query = buildQuery(params);
  const path = query ? `/jobs?${query}` : "/jobs";
  return requestJson<ListJobsResponse>(path);
}

export async function getApplyRateStats(): Promise<ApplyRateStatsResponse> {
  return requestJson<ApplyRateStatsResponse>("/jobs/apply-rate");
}

export async function getJob(id: string): Promise<Job> {
  return requestJson<Job>(`/jobs/${id}`);
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  const customPayload: Record<string, unknown> = {
    ...payload,
    is_easy_apply: String(payload.is_easy_apply),
  };
  return requestJson<Job>("/jobs", {
    method: "POST",
    body: JSON.stringify(customPayload),
  });
}

export async function updateJob(
  id: string,
  payload: UpdateJobPayload,
): Promise<Job> {
  return requestJson<Job>(`/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteJob(id: string): Promise<void> {
  await requestJson<void>(`/jobs/${id}`, {
    method: "DELETE",
  });
}

export async function bulkDeleteJobs(ids: string[]): Promise<number> {
  const payload = await requestJson<BulkDeleteJobsResponse>(
    "/jobs/bulk-delete",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  );
  return payload.deleted_count;
}

export async function bulkUpdateJobsStatus(
  ids: string[],
  status: JobStatus,
  discardReason?: DiscardReason,
): Promise<number> {
  const payload = await requestJson<BulkUpdateJobsStatusResponse>(
    "/jobs/bulk-update-status",
    {
      method: "POST",
      body: JSON.stringify({
        ids,
        status,
        discard_reason: discardReason ?? "",
      }),
    },
  );
  return payload.updated_count;
}

export async function existsApplyLink(applyLink: string): Promise<boolean> {
  const normalized = normalizeApplyLink(applyLink);
  const query = new URLSearchParams({ apply_link: normalized });
  const payload = await requestJson<ExistsApplyLinkResponse>(
    `/jobs/exists?${query.toString()}`,
  );
  return payload.exists;
}

export async function triggerResumeGenerate(
  id: string,
): Promise<ResumeGenerateTriggerResponse> {
  return requestJson<ResumeGenerateTriggerResponse>(
    `/jobs/${id}/resume-generate`,
    {
      method: "POST",
    },
  );
}

export async function listResumeQueue(
  status = "added",
  limit = 100,
): Promise<ResumeQueueListResponse> {
  const query = new URLSearchParams({
    status,
    limit: String(limit),
  });
  return requestJson<ResumeQueueListResponse>(
    `/resume-queue?${query.toString()}`,
  );
}

export async function listResumes(
  page = 1,
  limit = 20,
): Promise<ListResumesResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return requestJson<ListResumesResponse>(`/resumes?${query.toString()}`);
}

export async function updateResumeLink(
  id: string,
  resumeLink: string,
): Promise<Job> {
  return requestJson<Job>(`/jobs/${id}/resume-link`, {
    method: "PATCH",
    body: JSON.stringify({ resume_link: resumeLink }),
  });
}

export async function removeResumeQueueJob(jobID: string): Promise<void> {
  await requestJson<void>(`/resume-queue/${jobID}`, {
    method: "DELETE",
  });
}

export function subscribeToJobCreated(
  onCreated: (payload: JobCreatedSSEPayload) => void,
  onConnectionError?: (event: Event) => void,
): () => void {
  const eventsUrl = new URL(`${API_BASE_URL}/jobs/events`);
  const source = new EventSource(eventsUrl.toString(), {
    withCredentials: true,
  });

  const onMessage = (event: MessageEvent<string>) => {
    try {
      const payload = JSON.parse(event.data) as JobCreatedSSEPayload;
      onCreated(payload);
    } catch {
      // Ignore malformed payloads and keep stream alive.
    }
  };

  const onError = (event: Event) => {
    if (onConnectionError) {
      onConnectionError(event);
    }
  };

  source.addEventListener("job_created", onMessage as EventListener);
  source.addEventListener("error", onError);

  return () => {
    source.removeEventListener("job_created", onMessage as EventListener);
    source.removeEventListener("error", onError);
    source.close();
  };
}

export { ApiError, API_BASE_URL };

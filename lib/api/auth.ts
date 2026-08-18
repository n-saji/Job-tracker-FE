import { API_BASE_URL, ApiError } from "@/lib/api/jobs";
import type { BackendErrorPayload } from "@/lib/types/job";
import type { AuthPreflightResponse, JobBoardAccount } from "@/lib/types/auth";

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

  return (await response.json()) as T;
}

export async function getAuthStatus(): Promise<JobBoardAccount[]> {
  return requestJson<JobBoardAccount[]>("/auth/status");
}

export async function getAuthPreflight(jobIds: string[]): Promise<AuthPreflightResponse> {
  return requestJson<AuthPreflightResponse>("/auth/preflight", {
    method: "POST",
    body: JSON.stringify({ job_ids: jobIds }),
  });
}

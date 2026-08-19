import { API_BASE_URL, ApiError } from "@/lib/api/jobs";
import type { BackendErrorPayload } from "@/lib/types/job";
import type { Application, ApplicationEvent } from "@/lib/types/application";

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

export async function listApplications(): Promise<Application[]> {
  return requestJson<Application[]>("/applications/");
}

export async function getApplication(id: string): Promise<Application> {
  return requestJson<Application>(`/applications/${id}`);
}

export async function cancelApplication(id: string): Promise<Application> {
  return requestJson<Application>(`/applications/${id}/cancel`, {
    method: "POST",
  });
}

export async function getApplicationEvents(
  id: string,
): Promise<ApplicationEvent[]> {
  return requestJson<ApplicationEvent[]>(`/applications/${id}/events`);
}

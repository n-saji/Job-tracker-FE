export const APPLICATION_STATUSES = [
  "QUEUED",
  "RUNNING",
  "AWAITING_REVIEW",
  "SUBMITTED",
  "FAILED",
  "REQUIRES_HUMAN",
  "CANCELLED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// RUNNING: the extension is actively filling the tab. AWAITING_REVIEW: the
// extension reached the final step and is waiting on the user to submit —
// still worth polling for, since the extension reports SUBMITTED itself the
// moment it detects the user did.
export const ACTIVE_APPLICATION_STATUSES: ApplicationStatus[] = [
  "QUEUED",
  "RUNNING",
  "AWAITING_REVIEW",
];

export interface Application {
  id: string;
  job_id: string;
  status: ApplicationStatus;
  mode: string;
  error?: string | null;
  screenshot_path?: string | null;
  company_name: string;
  role_title: string;
}

export interface ApplicationEvent {
  event_type: string;
  message: string;
  created_at: string;
}

export const APPLICATION_STATUSES = [
  "QUEUED",
  "RUNNING",
  "FORM_FILLED",
  "AWAITING_REVIEW",
  "SUBMITTED",
  "FAILED",
  "REQUIRES_HUMAN",
  "CANCELLED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const ACTIVE_APPLICATION_STATUSES: ApplicationStatus[] = [
  "QUEUED",
  "RUNNING",
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

export interface BulkCreateApplicationsResponse {
  created: number;
  application_ids: string[];
}

export interface ApplicationEvent {
  event_type: string;
  message: string;
  created_at: string;
}

export const JOB_STATUSES = [
  "added",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
  "discarded",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const DISCARD_REASONS = [
  "high_applicants",
  "security_clearance",
  "less_experience",
  "citizenship",
  "not_fit",
] as const;

export type DiscardReason = (typeof DISCARD_REASONS)[number];

export interface Job {
  id: string;
  company_name: string;
  role_title: string;
  location: string;
  job_description: string;
  apply_link: string;
  linkedin_job_url: string;
  resume_link: string;
  status: JobStatus;
  discard_reason?: DiscardReason;
  salary_text: string;
  is_easy_apply: boolean;
  applied_at: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ListJobsResponse {
  data: Job[];
  page: number;
  limit: number;
  total: number;
}

export interface ExistsApplyLinkResponse {
  exists: boolean;
}

export interface JobCreatedSSEPayload {
  job: Job;
}

export interface BulkDeleteJobsResponse {
  deleted_count: number;
}

export interface BulkUpdateJobsStatusResponse {
  updated_count: number;
}

export interface ListJobsParams {
  page?: number;
  limit?: number;
  status?: JobStatus | "";
  discard_reason?: DiscardReason | "";
  include_discarded?: boolean;
  company?: string;
  location?: string;
}

export interface JobFormInput {
  company_name: string;
  role_title: string;
  location: string;
  job_description: string;
  apply_link: string;
  linkedin_job_url: string;
  resume_link: string;
  status: JobStatus;
  discard_reason: DiscardReason | "";
  salary_text: string;
  is_easy_apply: boolean;
  applied_at: string;
}

export type CreateJobPayload = JobFormInput;

export type UpdateJobPayload = Partial<JobFormInput>;

export interface BackendErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

export interface ResumeQueueItem {
  job_id: string;
  apply_link: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeQueueListResponse {
  data: ResumeQueueItem[];
}

export interface ResumeGenerateTriggerResponse {
  status: string;
  message: string;
}

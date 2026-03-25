export const JOB_STATUSES = [
  "added",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export interface Job {
  id: string;
  company_name: string;
  role_title: string;
  location: string;
  apply_link: string;
  linkedin_job_url: string;
  resume_link: string;
  status: JobStatus;
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

export interface ListJobsParams {
  page?: number;
  limit?: number;
  status?: JobStatus | "";
  company?: string;
  location?: string;
}

export interface JobFormInput {
  company_name: string;
  role_title: string;
  location: string;
  apply_link: string;
  linkedin_job_url: string;
  resume_link: string;
  status: JobStatus;
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

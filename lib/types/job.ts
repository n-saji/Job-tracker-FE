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
  "sponsorship",
  "primary_stack_mismatch",
] as const;

export type DiscardReason = (typeof DISCARD_REASONS)[number];

export const JOB_VERDICTS = ["APPLY", "REVIEW", "REJECT"] as const;

export type JobVerdict = (typeof JOB_VERDICTS)[number];

export const SCORE_FIELDS = [
  "total_score",
  "skills_match",
  "years_of_experience",
  "location",
  "title_alignment",
  "employment_type",
  "domain_relevance",
] as const;

export type ScoreField = (typeof SCORE_FIELDS)[number];

export interface JobSectionScores {
  skills_match: number;
  years_of_experience: number;
  location: number;
  title_alignment: number;
  employment_type: number;
  domain_relevance: number;
}

export interface JobExtractedData {
  required_yoe: string;
  sponsorship_stance: "sponsors" | "opt_ok" | "no_sponsorship" | "unclear";
  primary_stack: string[];
  work_location: "remote" | "hybrid" | "onsite";
  location_state: string;
  employment_type:
    | "full_time"
    | "contract"
    | "part_time"
    | "internship"
    | "unclear";
  job_domain: string;
}

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
  verdict?: JobVerdict;
  total_score?: number;
  section_scores?: JobSectionScores;
  extracted?: JobExtractedData;
  reject_reason?: string;
  flags?: string[];
  salary_text: string;
  is_easy_apply: boolean;
  match_rating?: number;
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

export interface ApplyRateStatsResponse {
  daily_count: number;
  weekly_count: number;
  monthly_count: number;
  daily_average: number;
  weekly_average: number;
  monthly_average: number;
}

export interface ListJobsParams {
  page?: number;
  limit?: number;
  status?: JobStatus | "";
  discard_reason?: DiscardReason | "";
  include_discarded?: boolean;
  company?: string;
  location?: string;
  verdict?: JobVerdict | "";
  min_match_rating?: number;
  max_match_rating?: number;
  sort_match?: "asc" | "desc" | "";
  score_field?: ScoreField | "";
  score_min?: number;
  score_max?: number;
  score_sort?: "asc" | "desc" | "";
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
  verdict?: JobVerdict | "";
  total_score?: number | null;
  section_scores?: JobSectionScores | null;
  extracted?: JobExtractedData | null;
  reject_reason?: string | null;
  flags?: string[];
  salary_text: string;
  is_easy_apply: boolean;
  match_rating: string;
  applied_at: string;
}

export interface CreateJobPayload {
  company_name: string;
  role_title: string;
  location: string;
  job_description: string;
  apply_link: string;
  linkedin_job_url: string;
  resume_link: string;
  status: JobStatus;
  discard_reason: DiscardReason | "";
  verdict?: JobVerdict | "";
  total_score?: number | null;
  section_scores?: JobSectionScores | null;
  extracted?: JobExtractedData | null;
  reject_reason?: string | null;
  flags?: string[];
  salary_text: string;
  is_easy_apply: boolean;
  match_rating: number | null;
  applied_at: string;
}

export interface UpdateJobPayload {
  company_name?: string;
  role_title?: string;
  location?: string;
  job_description?: string;
  apply_link?: string;
  linkedin_job_url?: string;
  resume_link?: string;
  status?: JobStatus;
  discard_reason?: DiscardReason | "";
  verdict?: JobVerdict | "";
  total_score?: number | null;
  section_scores?: JobSectionScores | null;
  extracted?: JobExtractedData | null;
  reject_reason?: string | null;
  flags?: string[];
  salary_text?: string;
  is_easy_apply?: boolean;
  match_rating?: number | null;
  applied_at?: string;
}

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

export interface ResumeItem {
  job_id: string;
  company_name: string;
  role_title: string;
  status: JobStatus;
  resume_link: string;
  applied_at: string;
  updated_at: string;
}

export interface ListResumesResponse {
  data: ResumeItem[];
  page: number;
  limit: number;
  total: number;
}

export interface ResumeGenerateTriggerResponse {
  status: string;
  message: string;
}

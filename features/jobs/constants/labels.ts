import type { DiscardReason, JobStatus } from "@/lib/types/job";

import type { JobVerdict, JobExtractedData, ScoreField } from "@/lib/types/job";

export const STATUS_LABELS: Record<JobStatus, string> = {
  added: "Added",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  discarded: "Discarded",
};

export const DISCARD_REASON_LABELS: Record<DiscardReason, string> = {
  high_applicants: "High Applicants",
  security_clearance: "Security Clearance",
  less_experience: "Less Experience",
  citizenship: "Citizenship",
  not_fit: "Not Fit",
  sponsorship: "Sponsorship",
  primary_stack_mismatch: "Primary Stack Mismatch",
};

export const VERDICT_LABELS: Record<JobVerdict, string> = {
  APPLY: "Apply",
  REVIEW: "Review",
  REJECT: "Reject",
};

export const SCORE_FIELD_LABELS: Record<ScoreField, string> = {
  total_score: "Total Score",
  skills_match: "Skills Match",
  years_of_experience: "Years of Experience",
  location: "Location Score",
  title_alignment: "Title Alignment",
  employment_type: "Employment Type",
  domain_relevance: "Domain Relevance",
};

export const SPONSORSHIP_LABELS: Record<
  JobExtractedData["sponsorship_stance"],
  string
> = {
  sponsors: "Sponsors",
  opt_ok: "OPT OK",
  no_sponsorship: "No Sponsorship",
  unclear: "Sponsorship Unclear",
};

export const EMPLOYMENT_TYPE_LABELS: Record<
  JobExtractedData["employment_type"],
  string
> = {
  full_time: "Full Time",
  contract: "Contract",
  part_time: "Part Time",
  internship: "Internship",
  unclear: "Employment Unclear",
};

export const PAGE_LIMIT_OPTIONS = [20, 50, 100];

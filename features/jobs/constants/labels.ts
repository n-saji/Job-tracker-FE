import type { DiscardReason, JobStatus } from "@/lib/types/job";

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
};

export const PAGE_LIMIT_OPTIONS = [20, 50, 100];

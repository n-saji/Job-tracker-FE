import type { JobFormInput, JobStatus } from "@/lib/types/job";

export type FormErrors = Partial<Record<keyof JobFormInput | "form", string>>;

export type Notice = {
  kind: "success" | "error";
  message: string;
};

export type Analytics = {
  total: number;
  byStatus: Record<JobStatus, number>;
};

export type ApplyRateStats = {
  daily_count: number;
  weekly_count: number;
  monthly_count: number;
  daily_average: number;
  weekly_average: number;
  monthly_average: number;
};

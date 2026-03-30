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

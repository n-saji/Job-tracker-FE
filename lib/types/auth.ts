export const JOB_BOARD_ACCOUNT_STATUSES = [
  "NOT_CONFIGURED",
  "AUTHENTICATED",
  "SESSION_EXPIRED",
  "AUTH_REQUIRED",
  "AUTHENTICATING",
] as const;

export type JobBoardAccountStatus = (typeof JOB_BOARD_ACCOUNT_STATUSES)[number];

export interface JobBoardAccount {
  job_board: string;
  status: JobBoardAccountStatus;
  last_authenticated_at: string | null;
  last_verified_at: string | null;
}

export interface AuthPreflightJobResult {
  job_id: string;
  job_board: string;
  status: JobBoardAccountStatus;
}

export interface AuthPreflightResponse {
  job_boards: Record<string, JobBoardAccountStatus>;
  jobs: AuthPreflightJobResult[];
}

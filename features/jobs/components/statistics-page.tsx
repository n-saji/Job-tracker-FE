"use client";

import { useEffect, useMemo, useState } from "react";

import { getApplyRateStats, listJobs } from "@/lib/api/jobs";
import { JOB_STATUSES, type JobStatus } from "@/lib/types/job";
import { STATUS_LABELS } from "@/features/jobs/constants/labels";

type ApplyRateStats = {
  daily_count: number;
  weekly_count: number;
  monthly_count: number;
  daily_average: number;
  weekly_average: number;
  monthly_average: number;
};

const emptyStats: ApplyRateStats = {
  daily_count: 0,
  weekly_count: 0,
  monthly_count: 0,
  daily_average: 0,
  weekly_average: 0,
  monthly_average: 0,
};

function formatAverage(value: number): string {
  return value.toFixed(2);
}

function formatShare(part: number, whole: number): string {
  if (!whole) {
    return "0%";
  }

  return `${((part / whole) * 100).toFixed(1)}%`;
}

function formatMaybeValue(value: number, loading: boolean): string {
  return loading ? "..." : String(value);
}

function clampFlowWidth(value: number, base: number): number {
  if (base <= 0 || value <= 0) {
    return 6;
  }

  return Math.max(6, (value / base) * 92);
}

function buildRibbonPath(
  x1: number,
  y1: number,
  w1: number,
  x2: number,
  y2: number,
  w2: number,
): string {
  const c1 = x1 + (x2 - x1) * 0.38;
  const c2 = x1 + (x2 - x1) * 0.62;

  return [
    `M ${x1} ${y1 - w1 / 2}`,
    `C ${c1} ${y1 - w1 / 2}, ${c2} ${y2 - w2 / 2}, ${x2} ${y2 - w2 / 2}`,
    `L ${x2} ${y2 + w2 / 2}`,
    `C ${c2} ${y2 + w2 / 2}, ${c1} ${y1 + w1 / 2}, ${x1} ${y1 + w1 / 2}`,
    "Z",
  ].join(" ");
}

export function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [byStatus, setByStatus] = useState<Record<JobStatus, number>>({
    added: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
    discarded: 0,
  });
  const [applyRateStats, setApplyRateStats] =
    useState<ApplyRateStats>(emptyStats);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [overall, ...statusBreakdown] = await Promise.all([
          listJobs({ page: 1, limit: 1, include_discarded: true }),
          ...JOB_STATUSES.map((status) =>
            listJobs({ page: 1, limit: 1, status }),
          ),
        ]);

        const stats = await getApplyRateStats();

        if (cancelled) {
          return;
        }

        const mappedByStatus = JOB_STATUSES.reduce(
          (acc, status, index) => {
            acc[status] = statusBreakdown[index]?.total ?? 0;
            return acc;
          },
          {
            added: 0,
            applied: 0,
            interview: 0,
            offer: 0,
            rejected: 0,
            withdrawn: 0,
            discarded: 0,
          } as Record<JobStatus, number>,
        );

        setTotal(overall.total);
        setByStatus(mappedByStatus);
        setApplyRateStats(stats);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(
          err instanceof Error ? err.message : "Failed to load statistics.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusEntries = useMemo(
    () => JOB_STATUSES.map((status) => ({ status, count: byStatus[status] })),
    [byStatus],
  );

  const flow = useMemo(() => {
    const flowBase = Math.max(total, 1);

    const appliedWidth = clampFlowWidth(byStatus.applied, flowBase);
    const withdrawnWidth = clampFlowWidth(byStatus.withdrawn, flowBase);
    const discardedWidth = clampFlowWidth(byStatus.discarded, flowBase);
    const interviewWidth = clampFlowWidth(byStatus.interview, flowBase);
    const offerWidth = clampFlowWidth(byStatus.offer, flowBase);

    const points = {
      total: { x: 120, y: 208 },
      applied: { x: 350, y: 150 },
      withdrawn: { x: 350, y: 265 },
      discarded: { x: 350, y: 350 },
      interview: { x: 650, y: 150 },
      offer: { x: 910, y: 150 },
    };

    return {
      points,
      widths: {
        applied: appliedWidth,
        withdrawn: withdrawnWidth,
        discarded: discardedWidth,
        interview: interviewWidth,
        offer: offerWidth,
      },
    };
  }, [
    byStatus.applied,
    byStatus.discarded,
    byStatus.interview,
    byStatus.offer,
    byStatus.withdrawn,
    total,
  ]);

  return (
    <div className="h-full space-y-6 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-white/90 p-6 shadow-xl backdrop-blur dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Insights
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Applications overview
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              The applied flow is tracked separately from the withdrawn and
              discarded exits so each path stays clear.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                Total Jobs
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {formatMaybeValue(total, loading)}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800 dark:bg-cyan-900/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
                Applied
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {formatMaybeValue(byStatus.applied, loading)}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                Interview
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {formatMaybeValue(byStatus.interview, loading)}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                Offer
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {formatMaybeValue(byStatus.offer, loading)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                Flow Tree
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Total jobs funnel map
              </h3>
            </div>
            <p className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
              Total → Applied / Discarded / Withdrawn → Interview → Offer
            </p>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-950/70">
            <svg
              viewBox="0 0 1020 420"
              className="h-105 min-w-245 w-full"
              role="img"
              aria-label="Horizontal jobs funnel tree"
            >
              <defs>
                <linearGradient
                  id="flow-applied"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient
                  id="flow-withdrawn"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient
                  id="flow-discarded"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.62" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.42" />
                </linearGradient>
                <linearGradient
                  id="flow-interview"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.48" />
                </linearGradient>
                <linearGradient
                  id="flow-offer"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.74" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.52" />
                </linearGradient>
              </defs>

              <path
                d={buildRibbonPath(
                  flow.points.total.x,
                  flow.points.total.y,
                  flow.widths.applied,
                  flow.points.applied.x,
                  flow.points.applied.y,
                  flow.widths.applied,
                )}
                fill="url(#flow-applied)"
              />
              <path
                d={buildRibbonPath(
                  flow.points.total.x,
                  flow.points.total.y,
                  flow.widths.withdrawn,
                  flow.points.withdrawn.x,
                  flow.points.withdrawn.y,
                  flow.widths.withdrawn,
                )}
                fill="url(#flow-withdrawn)"
              />
              <path
                d={buildRibbonPath(
                  flow.points.total.x,
                  flow.points.total.y,
                  flow.widths.discarded,
                  flow.points.discarded.x,
                  flow.points.discarded.y,
                  flow.widths.discarded,
                )}
                fill="url(#flow-discarded)"
              />
              <path
                d={buildRibbonPath(
                  flow.points.applied.x,
                  flow.points.applied.y,
                  flow.widths.applied,
                  flow.points.interview.x,
                  flow.points.interview.y,
                  flow.widths.interview,
                )}
                fill="url(#flow-interview)"
              />
              <path
                d={buildRibbonPath(
                  flow.points.interview.x,
                  flow.points.interview.y,
                  flow.widths.interview,
                  flow.points.offer.x,
                  flow.points.offer.y,
                  flow.widths.offer,
                )}
                fill="url(#flow-offer)"
              />

              {[
                { key: "total", label: "Total Jobs", value: total },
                { key: "applied", label: "Applied", value: byStatus.applied },
                {
                  key: "withdrawn",
                  label: "Withdrawn",
                  value: byStatus.withdrawn,
                },
                {
                  key: "discarded",
                  label: "Discarded",
                  value: byStatus.discarded,
                },
                {
                  key: "interview",
                  label: "Interview",
                  value: byStatus.interview,
                },
                { key: "offer", label: "Offer", value: byStatus.offer },
              ].map((node) => {
                const point = flow.points[node.key as keyof typeof flow.points];

                return (
                  <g key={node.key}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="8"
                      fill="#0f172a"
                      className="dark:fill-slate-200"
                    />
                    <text
                      x={point.x - 10}
                      y={point.y - 16}
                      textAnchor="end"
                      fill="#334155"
                      className="dark:fill-slate-300"
                      fontSize="13"
                      fontWeight="700"
                    >
                      {node.label.toUpperCase()}
                    </text>
                    <text
                      x={point.x - 10}
                      y={point.y + 4}
                      textAnchor="end"
                      fill="#334155"
                      className="dark:fill-slate-400"
                      fontSize="12"
                    >
                      {loading ? "..." : node.value}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800 dark:bg-cyan-900/20">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-cyan-700 dark:text-cyan-300">
                Applied Share
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loading ? "..." : formatShare(byStatus.applied, total)}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-amber-700 dark:text-amber-300">
                Interview from Applied
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loading
                  ? "..."
                  : formatShare(byStatus.interview, byStatus.applied)}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-emerald-700 dark:text-emerald-300">
                Offer from Interview
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loading
                  ? "..."
                  : formatShare(byStatus.offer, byStatus.interview)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white/90 p-6 shadow-xl dark:bg-slate-900/80">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Status breakdown
          </h3>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
            All job types
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statusEntries.map(({ status, count }) => (
            <div
              key={status}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                {STATUS_LABELS[status]}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {loading ? "..." : count}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white/90 p-6 shadow-xl dark:bg-slate-900/80">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Apply averages
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
              Daily Average
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? "..." : formatAverage(applyRateStats.daily_average)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
              Weekly Average
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? "..." : formatAverage(applyRateStats.weekly_average)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
              Monthly Average
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? "..." : formatAverage(applyRateStats.monthly_average)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

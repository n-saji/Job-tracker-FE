"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, FileText, Settings } from "lucide-react";

const navItems = [
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-3 py-2 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/95 md:inset-y-0 md:left-0 md:right-auto md:w-24 md:border-t-0 md:border-r md:px-2 md:py-5">
      <div className="mb-0 flex items-center justify-center md:mb-5 md:w-full md:flex-col md:gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-emerald-400 text-lg font-black text-white shadow-lg shadow-cyan-500/30">
          J
        </div>
      </div>

      <nav className="grid grid-cols-4 gap-2 md:grid-cols-1 md:gap-3 md:w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/jobs" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-center text-[11px] font-semibold transition ${
                isActive
                  ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/35"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-cyan-400/70 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

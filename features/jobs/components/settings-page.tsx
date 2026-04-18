"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/features/jobs/hooks/use-theme";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/92 p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/82">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          Settings
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Appearance
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Choose how Job Hub looks. Your preference is saved in local storage.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              theme === "light"
                ? "border-cyan-400 bg-cyan-50 text-cyan-900"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-semibold">Light</span>
            </div>
            <p className="mt-2 text-xs opacity-80">
              Bright backgrounds with dark text.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              theme === "dark"
                ? "border-cyan-400 bg-cyan-50 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-semibold">Dark</span>
            </div>
            <p className="mt-2 text-xs opacity-80">
              Dark backgrounds for low-light work.
            </p>
          </button>

          <div className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-semibold">Current</span>
            </div>
            <p className="mt-2 text-xs opacity-80">Selected theme: {theme}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

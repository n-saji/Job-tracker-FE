import { useEffect, useState } from "react";

export function useTheme() {
  // Keep the first render deterministic to avoid SSR/client hydration mismatches.
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("job-tracker-theme");
    const preferredTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme((prevTheme) =>
      prevTheme === preferredTheme ? prevTheme : preferredTheme,
    );
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    window.localStorage.setItem("job-tracker-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  return { theme, toggleTheme };
}

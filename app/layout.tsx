import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Track job applications, statuses, and outcomes in one place.",
};

const themeInitScript = `
  (function () {
    try {
      var root = document.documentElement;
      var storedTheme = window.localStorage.getItem("job-tracker-theme");
      var isDark = storedTheme
        ? storedTheme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;

      root.classList.toggle("dark", isDark);
      root.style.colorScheme = isDark ? "dark" : "light";
    } catch (e) {
      // Ignore storage/matchMedia failures and keep default theme.
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

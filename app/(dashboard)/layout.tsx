import { DashboardSidebar } from "@/features/jobs/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(6,182,212,0.22),transparent_42%),linear-gradient(150deg,#f8fafc_0%,#eef2ff_40%,#f1f5f9_100%)] dark:bg-[radial-gradient(circle_at_10%_0%,rgba(6,182,212,0.22),transparent_42%),linear-gradient(150deg,#020617_0%,#0f172a_40%,#111827_100%)]">
      <div className="relative h-full w-full">
        <DashboardSidebar />
        <section className="h-full w-full min-w-0 overflow-hidden md:pl-24">
          <div className="h-full w-full">{children}</div>
        </section>
      </div>
    </div>
  );
}

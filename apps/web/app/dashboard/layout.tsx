import { DashboardGuard } from "@/components/dashboard/dashboard-guard";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div className="grid min-h-screen grid-cols-[240px_1fr] bg-surface">
        <DashboardSidebar />
        <main className="min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </DashboardGuard>
  );
}

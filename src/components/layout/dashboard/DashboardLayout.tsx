import { ReactNode } from "react";
import { DashboardSidebar } from "../DashboardSidebar";
import { DashboardTopbar } from "../topbar/DashboardTopbar";

type Props = {
  children: ReactNode;
  type: "student" | "instructor" | "admin";
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
};

export function DashboardLayout({ children, type, sidebarOpen, setSidebarOpen }: Props) {
  return (
    <div
  dir="rtl"
  className="flex items-stretch min-h-screen bg-[#f5f7fb]"
>

      {/* ── Desktop sidebar (xl+) ── */}
      <div className="hidden xl:flex shrink-0 self-stretch">
        <DashboardSidebar type={type} />
      </div>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
        />
      )}

      {/* ── Mobile sidebar ── */}
      <div
        className={`
          fixed top-0 right-0 z-50 h-screen
          transition-transform duration-300
          xl:hidden
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <DashboardSidebar
          type={type}
          mobileOpen={true}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />
        {children}
      </main>

    </div>
  );
}

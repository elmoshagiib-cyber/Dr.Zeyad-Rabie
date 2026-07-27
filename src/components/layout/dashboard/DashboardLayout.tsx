import { ReactNode } from "react";
import { DashboardSidebar } from "../DashboardSidebar";
import { DashboardTopbar } from "../topbar/DashboardTopbar";

type Props = {
  children: ReactNode;
  type: "student" | "instructor" | "admin";
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
};

export function DashboardLayout({
  children,
  type,
  sidebarOpen,
  setSidebarOpen,
}: Props) {
  return (
    <div
      dir="rtl"
      className="flex items-stretch min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200"
    >
      {/* ───────── Desktop Sidebar (Instructor & Admin only) ───────── */}
      {type !== "student" && (
        <div className="hidden xl:flex shrink-0 self-stretch p-4">
          <DashboardSidebar type={type} />
        </div>
      )}

      {/* ───────── Student Drawer Sidebar ───────── */}
      {type === "student" && sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <div
            className="
              fixed
              top-0
              right-0
              z-50
              h-screen
              w-[300px]
              transition-transform
              duration-300
              ease-out
              translate-x-0
            "
          >
            <DashboardSidebar
              type="student"
              mobileOpen
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* ───────── Mobile Sidebar (Instructor & Admin only) ───────── */}
      {type !== "student" && (
        <div
          className={`
            fixed
            top-0
            right-0
            z-50
            h-screen
            transition-transform
            duration-300
            ease-out
            xl:hidden
            ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <DashboardSidebar
            type={type}
            mobileOpen
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* ───────── Main Content ───────── */}
      <main className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
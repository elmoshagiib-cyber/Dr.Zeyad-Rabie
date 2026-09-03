import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

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
className="
  flex
  items-stretch
  min-h-screen
  bg-white
  text-slate-900
"
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
      {type !== "student" && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm xl:hidden"
        />
      )}

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

      {/* ───────── زرار فتح/قفل السيدبار على الموبايل/التابلت فقط ───────── */}
      {type !== "student" && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 right-4 z-[60] xl:hidden w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700"
          aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {sidebarOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          )}
        </button>
      )}

      {/* ───────── Main Content ───────── */}
<main
  className="
    flex-1
    overflow-y-auto
    bg-white
    p-4
    sm:px-4
    sm:py-4
    md:px-6
    md:py-5
    lg:px-8
    lg:py-6
  "
>
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
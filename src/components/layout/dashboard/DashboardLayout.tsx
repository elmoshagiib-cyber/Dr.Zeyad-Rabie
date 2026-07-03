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
      className="flex min-h-screen bg-[#f5f7fb]"
    >
      {/* Desktop */}

      <div className="hidden lg:block">
        <DashboardSidebar type={type} />
      </div>

      {/* Overlay */}

      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="
          fixed
          inset-0
          z-40
          bg-black/40
          backdrop-blur-sm
          lg:hidden
          "
        />
      )}

      {/* Mobile */}

      <div
        className={`
        fixed
        top-0
        right-0
        z-50
        h-screen
        transition-all
        duration-300
        lg:hidden
        ${
          sidebarOpen
            ? "translate-x-0"
            : "translate-x-full"
        }
      `}
      >
        <DashboardSidebar
          type={type}
          onClose={() =>
            setSidebarOpen(false)
          }
        />
      </div>

      <main
  className="
  flex-1
  overflow-y-auto
  px-4
  py-4
  sm:px-6
  lg:px-8
  "
>

  <DashboardTopbar
    onMenuClick={() =>
      setSidebarOpen(true)
    }
  />

  {children}

</main>
    </div>
  );
}
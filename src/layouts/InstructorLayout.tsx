import { ReactNode } from "react";
import { DashboardSidebar } from "../components/layout/dashboard/DashboardSidebar";

type Props = {
  children: ReactNode;
};

export default function InstructorLayout({
  children,
}: Props) {
  return (
    <div
      className="flex min-h-screen bg-slate-50"
      dir="rtl"
    >
      {/* Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar type="instructor" />
      </div>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
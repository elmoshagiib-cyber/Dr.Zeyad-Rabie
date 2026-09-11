import { ReactNode } from "react";
import { StudentDashboardSidebar } from "./StudentDashboardSidebar";
import { Navbar } from "../Navbar";

type Props = {
  children: ReactNode;
};

export default function StudentLayout({ children }: Props) {

  return (
    <div
      dir="rtl"
      className="
        flex
        h-screen
        overflow-hidden
        bg-[#FCFCFD]
        dark:bg-[#09090B]
        transition-colors
        duration-300
      "
    >
      {/* Navbar الموحّد لكل الموقع */}
      <Navbar />

      {/* Sidebar - نفس السلوك في كل المقاسات */}
      <div className="block relative z-[60] p-4 pt-[104px]">
        <StudentDashboardSidebar />
      </div>

      <main className="flex-1 overflow-y-auto pt-24">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
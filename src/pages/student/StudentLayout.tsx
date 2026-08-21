import { ReactNode, useState } from "react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Menu } from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";

type Props = {
  children: ReactNode;
};

export default function StudentLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="absolute right-0 top-0 bottom-0 w-[320px] animate-slide-in-right">
            <DashboardSidebar
              type="student"
              mobileOpen
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden xl:block p-4 pt-[104px]">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto pt-24">
        {/* زرار فتح السايدبار — موبايل/تابلت بس */}
        <div className="xl:hidden px-4 sm:px-6 pt-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="
              flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              text-[#B348FE]
              bg-[#F6EEFF]
              dark:bg-[#111111]
              border
              border-[#EAD8FF]
              dark:border-[#2A2A2A]
              hover:scale-[1.02]
              transition-all
              duration-300
              font-bold
              text-sm
            "
          >
            <Menu size={18} />
            القائمة
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
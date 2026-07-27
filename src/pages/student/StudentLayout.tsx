import { ReactNode, useState } from "react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

type Props = {
  children: ReactNode;
};

export default function StudentLayout({ children }: Props) {
  const navigate = useNavigate();
  const { user } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
 <div
  dir="rtl"
  className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 overflow-hidden"
>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
<div className="hidden xl:block p-4">
  <DashboardSidebar type="student" />
</div>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2.5 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <Menu size={22} />
                </button>

                <div>
                  <h1 className="font-black text-lg bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    لوحة التحكم
                  </h1>

                  <p className="text-slate-500 text-sm">
                    أهلاً بك، {user?.name?.split(" ")[0]}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/dashboard/announcements")}
                className="relative p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100"
              >
                <Bell size={18} />
              </button>

            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
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
<div className="hidden xl:block p-4">
  <DashboardSidebar type="student" />
</div>

      <main className="flex-1 overflow-y-auto">
        <div className="
sticky
top-0
z-40
bg-white
dark:bg-[#09090B]
border-b
border-gray-200
dark:border-[#2A2A2A]
transition-colors
duration-300
">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="
p-2.5
rounded-xl
text-gray-700
dark:text-gray-300
hover:bg-[#F6EEFF]
dark:hover:bg-[#111111]
transition-all
duration-300
"
                >
                  <Menu size={22} />
                </button>

                <div>
                  <h1 className="
font-black
text-lg
text-[#B348FE]
">
                    لوحة التحكم
                  </h1>

                  <p className="
text-sm
text-gray-500
dark:text-gray-400
">
                    أهلاً بك، {user?.name?.split(" ")[0]}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/dashboard/announcements")}
                className="
relative
p-2.5
rounded-xl
bg-[#F6EEFF]
dark:bg-[#111111]
text-[#B348FE]
hover:scale-105
transition-all
duration-300
border
border-[#EAD8FF]
dark:border-[#2A2A2A]
"
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
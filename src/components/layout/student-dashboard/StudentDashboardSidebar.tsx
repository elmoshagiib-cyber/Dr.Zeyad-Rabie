import { useNavigate, useLocation } from "react-router-dom";
import { StudentSidebarHeader } from "./StudentSidebarHeader";
import { StudentSidebarNavigation } from "./StudentSidebarNavigation";
import { cn } from "../../../utils/cn";
import { BookOpen, FileText, ClipboardList, Trophy, Bell, User, MessageCircle, Home, AlertCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const studentNavItems: NavItem[] = [
  { label: "الرئيسية", path: "/dashboard/home", icon: <Home size={20} /> },
  { label: "كورساتي", path: "/dashboard/courses", icon: <BookOpen size={20} /> },
  { label: "نتائج الواجبات", path: "/dashboard/homework", icon: <FileText size={20} /> },
  { label: "نتائج الامتحانات", path: "/dashboard/exams", icon: <ClipboardList size={20} /> },
  { label: "أخطائي", path: "/dashboard/mistakes", icon: <AlertCircle size={20} /> },
  { label: "المنتدى", path: "/dashboard/forum", icon: <MessageCircle size={20} /> },
  { label: "المتصدرون", path: "/dashboard/leaderboard", icon: <Trophy size={20} /> },
  { label: "الإشعارات", path: "/dashboard/announcements", icon: <Bell size={20} /> },
  { label: "ملفي الشخصي", path: "/profile", icon: <User size={20} /> },
];

interface StudentDashboardSidebarProps {
  onClose?: () => void;
  mobileOpen?: boolean;
}

export function StudentDashboardSidebar({
  onClose,
  mobileOpen = false,
}: StudentDashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isCollapsed = mobileOpen ? false : collapsed;

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("هل تريد تسجيل الخروج؟");
    if (!confirmed) return;

    await supabase.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("session_token");
    onClose?.();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={cn(
        "overflow-hidden",
        "flex flex-col h-full",
        "bg-white",
        "dark:bg-[#111111]",
        "border",
        "border-gray-200",
        "dark:border-[#2A2A2A]",
        "shadow-xl",
        "dark:shadow-[0_20px_50px_rgba(0,0,0,.45)]",
        "transition-[width] duration-300 ease-out",
        "transition-colors",
        mobileOpen
          ? "rounded-none w-[280px] sm:w-[300px]"
          : cn("xl:rounded-2xl", isCollapsed ? "w-[80px]" : "w-[280px] sm:w-[300px]")
      )}
    >
      <StudentSidebarHeader collapsed={isCollapsed} setCollapsed={setCollapsed} />

      <StudentSidebarNavigation
        navItems={studentNavItems}
        collapsed={isCollapsed}
        currentPath={location.pathname}
        onNavigate={handleNav}
        onLogout={handleLogout}
      />
    </aside>
  );
}
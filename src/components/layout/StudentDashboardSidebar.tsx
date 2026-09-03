import { useNavigate, useLocation } from "react-router-dom";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { StudentSidebarNavigation } from "./sidebar/StudentSidebarNavigation";
import { cn } from "../../utils/cn";
import { BookOpen, FileText, ClipboardList, Trophy, Bell, User, MessageCircle, Home } from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const studentNavGroups: NavGroup[] = [
  {
    label: "الرئيسية",
    items: [{ label: "الرئيسية", path: "/", icon: <Home size={20} /> }],
  },
  {
    label: "الأكاديمي",
    items: [
      { label: "كورساتي", path: "/dashboard/courses", icon: <BookOpen size={20} /> },
      { label: "الواجبات", path: "/dashboard/homework", icon: <FileText size={20} /> },
      { label: "الامتحانات", path: "/dashboard/exams", icon: <ClipboardList size={20} /> },
    ],
  },
  {
    label: "المجتمع",
    items: [
      { label: "المنتدى", path: "/dashboard/forum", icon: <MessageCircle size={20} /> },
      { label: "المتصدرون", path: "/dashboard/leaderboard", icon: <Trophy size={20} /> },
    ],
  },
  {
    label: "الحساب",
    items: [
      { label: "الإشعارات", path: "/dashboard/announcements", icon: <Bell size={20} /> },
      { label: "ملفي الشخصي", path: "/profile", icon: <User size={20} /> },
    ],
  },
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

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
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
        "transition-all duration-300 ease-out",
        "transition-colors",
        mobileOpen ? "rounded-none w-[280px] sm:w-[300px]" : "xl:rounded-2xl",
        "w-[280px] sm:w-[300px]"
      )}
    >
      <SidebarHeader collapsed={false} setCollapsed={setCollapsed} />

      <StudentSidebarNavigation
        navGroups={studentNavGroups}
        collapsed={false}
        currentPath={location.pathname}
        onNavigate={handleNav}
      />
    </aside>
  );
}
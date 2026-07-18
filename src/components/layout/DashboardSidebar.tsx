import { useNavigate, useLocation } from "react-router-dom";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { cn } from "../../utils/cn";
import {
  LayoutDashboard, BookOpen, FileText, ClipboardList, Trophy,
  Bell, User, BarChart2, Users, CheckCircle, Settings,
  PlusCircle, MessageSquare, LogOut, Video, QrCode,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const studentNav: NavItem[] = [
  {
    label: "لوحة التحكم",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "كورساتي",
    path: "/dashboard/courses",
    icon: <BookOpen size={20} />,
  },
  {
    label: "الواجبات",
    path: "/dashboard/homework",
    icon: <FileText size={20} />,
    badge: 2,
  },
  {
    label: "الامتحانات",
    path: "/dashboard/exams",
    icon: <ClipboardList size={20} />,
  },
  {
    label: "المتصدرون",
    path: "/dashboard/leaderboard",
    icon: <Trophy size={20} />,
  },
  {
    label: "الإعلانات",
    path: "/dashboard/announcements",
    icon: <Bell size={20} />,
    badge: 3,
  },
  {
    label: "ملفي الشخصي",
    path: "/profile",
    icon: <User size={20} />,
  },
];

const instructorNav: NavItem[] = [
  {
    label: "لوحة التحكم",
    path: "/instructor",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "كورساتي",
    path: "/instructor/courses",
    icon: <BookOpen size={20} />,
  },
  {
    label: "إنشاء كورس",
    path: "/instructor/courses/create",
    icon: <PlusCircle size={20} />,
  },
  {
    label: "أكواد الاشتراك",
    path: "/instructor/subscription-codes",
    icon: <QrCode size={20} />,
  },
  {
    label: "تسليمات الطلاب",
    path: "/instructor/submissions",
    icon: <CheckCircle size={20} />,
  },
  {
    label: "الإشعارات",
    path: "/instructor/notifications",
    icon: <Bell size={20} />,
  },
  {
    label: "الطلاب",
    path: "/instructor/students",
    icon: <Users size={20} />,
  },
  {
    label: "الحضور والانصراف",
    path: "/instructor/attendance",
    icon: <QrCode size={20} />,
  },
  {
    label: "التحليلات",
    path: "/instructor/analytics",
    icon: <BarChart2 size={20} />,
  },
];

const adminNav: NavItem[] = [
  {
    label: "لوحة التحكم",
    path: "/admin",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "المستخدمون",
    path: "/admin/users",
    icon: <Users size={20} />,
  },
  {
    label: "الموافقات",
    path: "/admin/approvals",
    icon: <CheckCircle size={20} />,
    badge: 47,
  },
  {
    label: "الكورسات",
    path: "/admin/courses",
    icon: <Video size={20} />,
  },
  {
    label: "الإعلانات",
    path: "/admin/announcements",
    icon: <MessageSquare size={20} />,
  },
  {
    label: "التحليلات",
    path: "/admin/analytics",
    icon: <BarChart2 size={20} />,
  },
  {
    label: "الإعدادات",
    path: "/admin/settings",
    icon: <Settings size={20} />,
  },
];

interface DashboardSidebarProps {
  type: "student" | "instructor" | "admin";
  onClose?: () => void;
  mobileOpen?: boolean;
}

export function DashboardSidebar({ 
  type, 
  onClose, 
  mobileOpen = false 
}: DashboardSidebarProps) {
  
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const navItems = 
    type === "student" 
      ? studentNav 
      : type === "instructor" 
      ? instructorNav 
      : adminNav;

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full",
        "bg-white",
        "border border-slate-200",
        "shadow-xl",
        "transition-all duration-300 ease-out",
        mobileOpen 
          ? "rounded-none w-[280px] sm:w-[300px]" 
          : "xl:rounded-2xl",
        collapsed && !mobileOpen ? "xl:w-[80px]" : "w-[280px] sm:w-[300px]"
      )}
    >
      <SidebarHeader 
        collapsed={collapsed && !mobileOpen} 
        setCollapsed={setCollapsed} 
      />

      <SidebarNavigation
        navItems={navItems}
        collapsed={collapsed && !mobileOpen}
        currentPath={location.pathname}
        onNavigate={handleNav}
      />

      {/* Footer (optional) */}
      <div className="border-t border-slate-200 p-3 sm:p-4 bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className={cn(
            "font-medium transition-opacity duration-200",
            collapsed && !mobileOpen ? "opacity-0" : "opacity-100"
          )}>
            متصل الآن
          </span>
        </div>
      </div>

    </aside>
  );
}
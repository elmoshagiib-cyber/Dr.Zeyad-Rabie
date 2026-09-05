import { useNavigate, useLocation } from "react-router-dom";
import { DashboardSidebarHeader } from "./DashboardSidebarHeader";
import { DashboardSidebarNavigation } from "./DashboardSidebarNavigation";
import { cn } from "../../../utils/cn";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  Trophy,
  Bell,
  User,
  BarChart2,
  BarChart3,
  Users,
  CheckCircle,
  Settings,
  PlusCircle,
  MessageSquare,
  LogOut,
  Video,
  QrCode,
  Home,
  MessageCircle,
  TrendingUp,  // ← أضفها هنا
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useState, useEffect } from "react";

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
    items: [
      { label: "الرئيسية", path: "/", icon: <Home size={20} /> },
    ],
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

const instructorNavGroups: NavGroup[] = [
  {
    label: "الرئيسية",
    items: [
      { label: "نظره عامه", path: "/instructor", icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    label: "الهيكل الأكاديمي",
    items: [
      { label: "كورساتي", path: "/instructor/courses", icon: <BookOpen size={20} /> },
      { label: "إنشاء كورس", path: "/instructor/courses/create", icon: <PlusCircle size={20} /> },
      { label: "أكواد الاشتراك", path: "/instructor/subscription-codes", icon: <QrCode size={20} /> },
    ],
  },
  {
    label: "المتابعة والتقييم",
    items: [
      { label: "تسليمات الطلاب", path: "/instructor/submissions", icon: <CheckCircle size={20} /> },
      { label: "الطلاب", path: "/instructor/students", icon: <Users size={20} /> },
      { label: "متابعة المشاهدة", path: "/instructor/watch-progress", icon: <TrendingUp size={20} /> },
      { label: "التقارير والإحصائيات", path: "/instructor/reports", icon: <BarChart3 size={20} /> },
    ],
  },
  {
    label: "التواصل",
    items: [
      { label: "الإشعارات", path: "/instructor/notifications", icon: <Bell size={20} /> },
    ],
  },
];

const adminNavGroups: NavGroup[] = [
  {
    label: "الرئيسية",
    items: [
      { label: "لوحة التحكم", path: "/admin", icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { label: "المستخدمون", path: "/admin/users", icon: <Users size={20} /> },
      { label: "الموافقات", path: "/admin/approvals", icon: <CheckCircle size={20} />, badge: 47 },
      { label: "الكورسات", path: "/admin/courses", icon: <Video size={20} /> },
    ],
  },
  {
    label: "التواصل والتحليلات",
    items: [
      { label: "الاشعارات", path: "/admin/announcements", icon: <MessageSquare size={20} /> },
      { label: "التحليلات", path: "/admin/analytics", icon: <BarChart2 size={20} /> },
    ],
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
  if (type === "student") return false;

  const saved = localStorage.getItem("sidebar-collapsed");
  return saved === "true";
});

useEffect(() => {
  if (type !== "student") {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }
}, [collapsed, type]);

  const navGroups = 
    type === "student" 
      ? studentNavGroups 
      : type === "instructor" 
      ? instructorNavGroups 
      : adminNavGroups;

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

    mobileOpen
      ? "rounded-none w-[280px] sm:w-[300px]"
      : "xl:rounded-2xl",

    collapsed && !mobileOpen
      ? "xl:w-[80px]"
      : "w-[280px] sm:w-[300px]"
  )}
>
      <DashboardSidebarHeader
        collapsed={collapsed && !mobileOpen}
        setCollapsed={setCollapsed}
      />

      <DashboardSidebarNavigation
        navGroups={navGroups}
        collapsed={collapsed && !mobileOpen}
        currentPath={location.pathname}
        onNavigate={handleNav}
      />
    </aside>
  );
}
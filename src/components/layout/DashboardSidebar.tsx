
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { cn } from "../../utils/cn";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  Trophy,
  Bell,
  User,
  BarChart2,
  Users,
  CheckCircle,
  Settings,
  PlusCircle,
  MessageSquare,
  LogOut,
  Video,
  QrCode,
  ChevronLeft,
ChevronRight,
X,
PanelRightClose,
PanelRightOpen,
LockKeyhole
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useApp } from "../../context/AppContext";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const instructorSections = [
  {
    title: "الرئيسية",
    items: [
      "/instructor",
    ],
  },

  {
    title: "إدارة المحتوى",
    items: [
      "/instructor/courses",
      "/instructor/courses/create",
      "/instructor/submissions",
    ],
  },

  {
    title: "إدارة الطلاب",
    items: [
      "/instructor/students",
      "/instructor/attendance",
    ],
  },

  {
    title: "التقارير",
    items: [
      "/instructor/analytics",
      "/instructor/notifications",
    ],
  },
];

const studentNav: NavItem[] = [
  { label: "لوحة التحكم", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "كورساتي", path: "/dashboard/courses", icon: <BookOpen size={20} /> },
  { label: "الواجبات", path: "/dashboard/homework", icon: <FileText size={20} />, badge: 2 },
  { label: "الامتحانات", path: "/dashboard/exams", icon: <ClipboardList size={20} /> },
  { label: "المتصدرون", path: "/dashboard/leaderboard", icon: <Trophy size={20} /> },
  { label: "الإعلانات", path: "/dashboard/announcements", icon: <Bell size={20} />, badge: 3 },
  { label: "ملفي الشخصي", path: "/profile", icon: <User size={20} /> },
];

const getSection = (
  path: string,
  type: "student" | "instructor" | "admin"
) => {
  if (type === "instructor") {
    if (path === "/instructor")
      return "الرئيسية";

    if (
      [
        "/instructor/courses",
        "/instructor/courses/create",
        "/instructor/submissions",
      ].includes(path)
    )
      return "إدارة المحتوى";

    if (
      [
        "/instructor/students",
        "/instructor/attendance",
      ].includes(path)
    )
      return "إدارة الطلاب";

    if (
      [
        "/instructor/analytics",
        "/instructor/notifications",
      ].includes(path)
    )
      return "التقارير";
  }

  return "";
};

const instructorNav: NavItem[] = [
  { label: "لوحة التحكم", path: "/instructor", icon: <LayoutDashboard size={20} /> },

  { label: "كورساتي", path: "/instructor/courses", icon: <BookOpen size={20} /> },

{ label: "إنشاء كورس", path: "/instructor/courses/create", icon: <PlusCircle size={20} /> },

  {
  label: "تسليمات الطلاب",
  path: "/instructor/submissions",
  icon: <CheckCircle size={20} />
},
  { label: "الإشعارات", path: "/instructor/notifications", icon: <Bell size={20} /> },

  { label: "الطلاب", path: "/instructor/students", icon: <Users size={20} /> },

  {
  label: "الحضور والانصراف",
  path: "/instructor/attendance",
  icon: <QrCode size={20} />
},

  { label: "التحليلات", path: "/instructor/analytics", icon: <BarChart2 size={20} /> },
];

const adminNav: NavItem[] = [
  { label: "لوحة التحكم", path: "/admin", icon: <LayoutDashboard size={20} /> },
  { label: "المستخدمون", path: "/admin/users", icon: <Users size={20} /> },
  { label: "الموافقات", path: "/admin/approvals", icon: <CheckCircle size={20} />, badge: 47 },
  { label: "الكورسات", path: "/admin/courses", icon: <Video size={20} /> },
  { label: "الإعلانات", path: "/admin/announcements", icon: <MessageSquare size={20} /> },
  { label: "التحليلات", path: "/admin/analytics", icon: <BarChart2 size={20} /> },
  { label: "الإعدادات", path: "/admin/settings", icon: <Settings size={20} /> },
];

interface DashboardSidebarProps {
  type: "student" | "instructor" | "admin";
  onClose?: () => void;
  mobileOpen?: boolean;
}

export function DashboardSidebar({
  type,
  onClose,
  mobileOpen = false,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
const [profileOpen, setProfileOpen] = useState(false);
useEffect(() => {
  localStorage.setItem("sidebar-collapsed", String(collapsed));
}, [collapsed]);
  const navItems = type === "student" ? studentNav : type === "instructor" ? instructorNav : adminNav;

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const groupedItems = navItems.reduce(
  (acc, item) => {

    const section = getSection(
      item.path,
      type
    );

    if (!acc[section]) {

      acc[section] = [];

    }

    acc[section].push(item);

    return acc;

  },

  {} as Record<string, NavItem[]>

);

  return (
  <aside
  className={cn(
    `
    fixed
    xl:sticky
    top-0
    xl:top-4
    right-0
    z-50
    xl:z-auto

    flex
    flex-col

    h-screen
    xl:h-[calc(100vh-2rem)]

    rounded-none
    xl:rounded-[32px]

    bg-white
    border
    border-slate-200/70

    shadow-[0_20px_60px_rgba(15,23,42,0.08)]

    overflow-hidden

    transition-all
    duration-300
    `,
    collapsed ? "xl:w-[78px] w-[300px]" : "w-[300px]",
    mobileOpen
      ? "translate-x-0"
      : "translate-x-full xl:translate-x-0"
  )}
>
  
{<SidebarHeader
  collapsed={collapsed}
  setCollapsed={setCollapsed}
/>
}
    <SidebarNavigation
  navItems={navItems}
  collapsed={collapsed}
  currentPath={location.pathname}
  onNavigate={handleNav}
/>



</aside>
);
}


import { useNavigate, useLocation } from "react-router-dom";
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

const studentNav: NavItem[] = [
  { label: "لوحة التحكم", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "كورساتي", path: "/dashboard/courses", icon: <BookOpen size={20} /> },
  { label: "الواجبات", path: "/dashboard/homework", icon: <FileText size={20} />, badge: 2 },
  { label: "الامتحانات", path: "/dashboard/exams", icon: <ClipboardList size={20} /> },
  { label: "المتصدرون", path: "/dashboard/leaderboard", icon: <Trophy size={20} /> },
  { label: "الإعلانات", path: "/dashboard/announcements", icon: <Bell size={20} />, badge: 3 },
  { label: "ملفي الشخصي", path: "/profile", icon: <User size={20} /> },
];

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
}

export function DashboardSidebar({ type, onClose }: DashboardSidebarProps) {
  const [profileOpen, setProfileOpen] =
useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);

useEffect(() => {
  localStorage.setItem("sidebar-collapsed", String(collapsed));
}, [collapsed]);
  const navItems = type === "student" ? studentNav : type === "instructor" ? instructorNav : adminNav;

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
  <aside
className={cn(
`
bg-white/95
backdrop-blur-xl
border
border-slate-200/70
shadow-xl
shadow-slate-200/70

rounded-[30px]

m-4
ml-0

h-[calc(100vh-32px)]

sticky
top-4

flex
flex-col

transition-all
duration-300
`,
    collapsed ? "w-20" : "w-[280px]"
  )}
>
  
    {/* Collapse Button */}
    <div>
<div className="px-5 py-4 border-b border-slate-200">

  {!collapsed ? (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div
          className="
          w-12
          h-12
          rounded-2xl
          bg-gradient-to-br
          from-blue-600
          to-violet-600
          flex
          items-center
          justify-center
          shadow-lg
          text-white
          "
        >
          <GraduationCap size={28} />
        </div>

        <div>

          <h2 className="font-black text-slate-900">
            منصة زياد ربيع
          </h2>

          <p className="text-xs text-slate-500">
            لوحة تحكم المدرس
          </p>

        </div>

      </div>

      <button
        onClick={() => setCollapsed(true)}
        className="
        w-10
        h-10
        rounded-xl
        bg-slate-100
        hover:bg-blue-50
        hover:text-blue-600
        transition
        flex
        items-center
        justify-center
        "
      >
        <PanelRightClose size={18} />
      </button>

    </div>

  ) : (

    <div className="flex justify-center">

      <button
        onClick={() => setCollapsed(false)}
        className="
        w-12
        h-12
        rounded-2xl
        bg-gradient-to-br
        from-blue-600
        to-violet-600
        text-white
        flex
        items-center
        justify-center
        shadow-lg
        "
      >
        <PanelRightOpen size={22} />
      </button>

    </div>

  )}

</div>


  
</div>

    {/* Nav Items */}
    <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
      
      {navItems.map((item) => {
        const active = location.pathname === item.path;

        return (
          <button
            key={item.path}
            
            onClick={() => handleNav(item.path)}
            className={cn(
  "group w-full flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
  collapsed && "justify-center",
              active
? "bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] shadow-blue-500/30 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-[1.03]"
            )}
          >
           {active && (
  <span
    className="
      absolute
      left-2
      top-1/2
      -translate-y-1/2
      w-1
      h-8
      rounded-full
      bg-white
    "
  />
)}
<div
  className={cn(
    "flex items-center gap-4 w-full",
    collapsed
  ? "justify-center"
  : "flex-row-reverse"
  )}
>
  <div
  className={cn(
    `
    relative
    flex
    items-center
    justify-center
    shrink-0
    w-10
    h-10
    rounded-2xl
    transition-all
    duration-300
    `,
    active
  ? "bg-white/15 text-white"
  : "text-slate-500 group-hover:bg-slate-100 group-hover:text-blue-600",
    collapsed && "justify-center"
  )}
>
    {item.icon}
  </div>

  {!collapsed && (
    <span
  className="
  mr-4
  text-right
  mr-4
  whitespace-nowrap
  font-semibold
  text-[15px]
  tracking-tight
  "
>
      {item.label}
    </span>
  )}

  {collapsed && (
    <div
      className="
      absolute right-20
      bg-slate-900
      text-white
      text-xs
      px-2.5
      py-1
      rounded-lg
      opacity-0
      group-hover:opacity-100
      transition
      pointer-events-none
      z-50
      "
    >
      {item.label}
    </div>
  )}
</div>

            {!collapsed && item.badge && (
              <span
                className={cn(
                  "min-w-[22px] h-[22px] flex items-center justify-center text-[11px] font-bold rounded-full shadow-sm",
                  active
                    ? "bg-[#fafafa] text-blue-600"
                    : "bg-red-500 animate-pulse text-white"
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    {/* Bottom */}
<div className="mt-auto p-5 border-t border-slate-200/70">
  <button
    onClick={() => {
      logout();
      navigate("/");
    }}
    className="
w-full flex flex-row-reverse items-center justify-between
px-2.5 py-2
rounded-xl
text-sm font-medium
text-slate-500
hover:text-red-500
hover:bg-red-50
hover:shadow-md
transition-all duration-200
"
  >
    <LogOut size={20} />

    {!collapsed && (
      <span>تسجيل الخروج</span>
    )}
  </button>
</div>

</aside>
);
}

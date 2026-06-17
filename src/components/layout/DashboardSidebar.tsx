import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { GraduationCap, LayoutDashboard, BookOpen, FileText, ClipboardList, Trophy, Bell, User, BarChart2, Users, CheckCircle, Settings, PlusCircle, MessageSquare, LogOut, Video } from "lucide-react";
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
  { label: "لوحة التحكم", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "كورساتي", path: "/dashboard/courses", icon: <BookOpen size={18} /> },
  { label: "الواجبات", path: "/dashboard/homework", icon: <FileText size={18} />, badge: 2 },
  { label: "الامتحانات", path: "/dashboard/exams", icon: <ClipboardList size={18} /> },
  { label: "المتصدرون", path: "/dashboard/leaderboard", icon: <Trophy size={18} /> },
  { label: "الإعلانات", path: "/dashboard/announcements", icon: <Bell size={18} />, badge: 3 },
  { label: "ملفي الشخصي", path: "/profile", icon: <User size={18} /> },
];

const instructorNav: NavItem[] = [
  { label: "لوحة التحكم", path: "/instructor", icon: <LayoutDashboard size={18} /> },

  { label: "كورساتي", path: "/instructor/courses", icon: <BookOpen size={18} /> },

{ label: "إنشاء كورس", path: "/instructor/courses/create", icon: <PlusCircle size={18} /> },

  { label: "الاختبارات", path: "/instructor/exams", icon: <ClipboardList size={18} /> },

  { label: "الواجبات", path: "/instructor/assignments", icon: <FileText size={18} /> },
  {
  label: "تسليمات الطلاب",
  path: "/instructor/submissions",
  icon: <CheckCircle size={18} />
},
  { label: "الإشعارات", path: "/instructor/notifications", icon: <Bell size={18} /> },

  { label: "الطلاب", path: "/instructor/students", icon: <Users size={18} /> },

  { label: "التحليلات", path: "/instructor/analytics", icon: <BarChart2 size={18} /> },
];

const adminNav: NavItem[] = [
  { label: "لوحة التحكم", path: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "المستخدمون", path: "/admin/users", icon: <Users size={18} /> },
  { label: "الموافقات", path: "/admin/approvals", icon: <CheckCircle size={18} />, badge: 47 },
  { label: "الكورسات", path: "/admin/courses", icon: <Video size={18} /> },
  { label: "الإعلانات", path: "/admin/announcements", icon: <MessageSquare size={18} /> },
  { label: "التحليلات", path: "/admin/analytics", icon: <BarChart2 size={18} /> },
  { label: "الإعدادات", path: "/admin/settings", icon: <Settings size={18} /> },
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
  const [collapsed, setCollapsed] = useState(() => {
  
  const saved = localStorage.getItem("sidebar-collapsed");
  return saved === "true";
});

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
"bg-white border-l border-slate-200 backdrop-blur-xl border-l border-slate-200/70 shadow-sm min-h-screen flex flex-col transition-all duration-200",
    collapsed ? "w-20" : "w-64"
  )}
>
    {/* Collapse Button */}
    <div>

<div className="p-3 border-b border-slate-200">

<button
  onClick={() => setProfileOpen(!profileOpen)}
  className="
w-full
flex
items-center
justify-between
rounded-2xl
px-3
py-2
hover:bg-slate-50
transition-all
"
>

<div className="flex items-center gap-3">

<div
className="
w-12
h-12
rounded-full
bg-pink-500
text-white
font-bold
flex
items-center
justify-center
"
>
ذ
</div>

<div className="text-right">
<h3 className="font-black text-slate-900">
{user?.name || "د. زياد ربيع"}
</h3>

<p className="text-xs text-slate-500">
مدرس
</p>
</div>

</div>

<svg
className={`transition-transform ${
profileOpen ? "rotate-180" : ""
}`}
width="18"
height="18"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
>
<polyline points="6 9 12 15 18 9" />
</svg>

</button>

{profileOpen && (

<div
className="
mt-1
bg-white
border
border-slate-200
rounded-2xl
shadow-md
overflow-hidden
"
>

<button
className="
w-full
text-right
px-4
py-2.5
text-sm
hover:bg-slate-50
transition-colors
"
>
الملف الشخصي
</button>

<button
className="
w-full
text-right
px-4
py-2.5
text-sm
hover:bg-slate-50
transition-colors
"
>
إعدادات الحساب
</button>

<button
className="
w-full
text-right
px-4
py-2.5
text-sm
hover:bg-slate-50
transition-colors
"
>
تغيير كلمة المرور
</button>

<div className="border-t" />

<button
onClick={() => {
logout();
navigate("/");
}}
className="
w-full
text-right
px-4
py-2.5
text-sm
text-red-600
hover:bg-red-50
transition-colors
"
>
تسجيل الخروج
</button>

</div>

)}

</div>
</div>

    {/* Nav Items */}
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const active = location.pathname === item.path;

        return (
          <button
            key={item.path}
            
            onClick={() => handleNav(item.path)}
            className={cn(
  "w-full flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
  collapsed && "justify-center",
              active
? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 rounded-2xl h-11"
                : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:translate-x-[-3px]"
            )}
          >
           
           <div className="flex items-center gap-3 flex-row-reverse">
  <div
    className={cn(
      "relative group flex items-center",
      collapsed && "justify-center w-full"
    )}
  >
    {item.icon}
  </div>
{collapsed && (
  <div
    className="
      absolute right-12 top-1/2 -translate-y-1/2
      bg-slate-900 text-white text-xs
      px-2 py-1 rounded-lg
      opacity-0 group-hover:opacity-100
      pointer-events-none
      transition-all
      whitespace-nowrap
      z-50
    "
  >
    {item.label}
  </div>
)}
</div>
{!collapsed && (
  <span className="flex-1 text-right whitespace-nowrap">
    {item.label}
  </span>
)}
            {!collapsed && item.badge && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
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
<div className="mt-auto p-3 border-t border-slate-200">
  <button
    onClick={() => {
      logout();
      navigate("/");
    }}
    className="
w-full flex items-center justify-between
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
    <LogOut size={18} />

    {!collapsed && (
      <span>تسجيل الخروج</span>
    )}
  </button>
</div>

</aside>
);
}

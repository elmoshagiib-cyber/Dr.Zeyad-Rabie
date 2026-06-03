import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { GraduationCap, LayoutDashboard, BookOpen, FileText, ClipboardList, Trophy, Bell, User, BarChart2, Users, CheckCircle, Settings, PlusCircle, MessageSquare, LogOut, Video } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useApp } from "../../context/AppContext";

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

  { label: "إنشاء كورس", path: "/instructor/create-course", icon: <PlusCircle size={18} /> },

  { label: "الاختبارات", path: "/instructor/exams", icon: <ClipboardList size={18} /> },

  { label: "الواجبات", path: "/instructor/assignments", icon: <FileText size={18} /> },

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
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();

  const navItems = type === "student" ? studentNav : type === "instructor" ? instructorNav : adminNav;

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <button onClick={() => handleNav("/")} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">د. زياد ربيع</p>
            <p className="text-[10px] text-slate-400">منصة تعليمية</p>
          </div>
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400">{type === "student" ? user.gradeLabel : type === "instructor" ? "مدرس" : "مدير النظام"}</p>
            </div>
          </div>
          {type === "student" && user.code && (
            <div className="mt-3 bg-slate-800 rounded-xl px-3 py-2">
              <p className="text-[10px] text-slate-400 mb-0.5">كود الطالب</p>
              <p className="text-xs font-bold text-blue-400 font-mono">{user.code}</p>
            </div>
          )}
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", active ? "bg-white/20 text-white" : "bg-red-500 text-white")}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

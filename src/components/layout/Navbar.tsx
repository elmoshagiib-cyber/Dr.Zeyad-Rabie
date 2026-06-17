import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell, ChevronDown, GraduationCap } from "lucide-react";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { useApp } from "../../context/AppContext";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
const [notificationsOpen, setNotificationsOpen] = useState(false);

useEffect(() => {
  loadNotifications();
}, []);

const loadNotifications = async () => {
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (data) {
    setNotifications(data);
  }
};

  const navLinks = [
    { label: "الرئيسية", path: "/" },
    { label: "الكورسات", path: "/courses" },
    { label: "من نحن", path: "/#about" },
    { label: "تواصل معنا", path: "/#contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="
fixed top-0 left-0 right-0 z-50
backdrop-blur-md
bg-white/90
dark:bg-[#0b0715]/90
border-b
border-slate-200
dark:border-white/5
">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
            <div className="
w-12 h-12
rounded-2xl
bg-gradient-to-br
from-violet-600
to-cyan-500
flex items-center justify-center
shadow-[0_0_30px_rgba(139,92,246,.35)]
">
  <GraduationCap size={20} className="text-white" />
</div>

<div className="text-right hidden sm:block">
  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
    د. زياد ربيع
  </p>
  <p className="text-[10px] text-slate-500 dark:text-slate-300 leading-tight">
    منصة تعليمية
  </p>
</div>
</button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-blue-600 bg-purple-600/20 text-cyan-300 border border-purple-500/30"
                    : "text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
           <button
  onClick={toggleTheme}
  className="
p-2
rounded-xl
border
border-slate-300
dark:border-white/20
text-slate-800
dark:text-white
hover:bg-slate-100
dark:hover:bg-white dark:bg-[#130726]/10
"
>
  {isDark ? <Sun size={18} /> : <Moon size={18} />}
</button>
            {user ? (
              <>
                
                <div className="relative">
  <button
    onClick={() => setNotificationsOpen(!notificationsOpen)}
    className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
  >
    <Bell size={20} />

    {notifications.length > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </button>
  
<button
  onClick={logout}
  className="px-4 py-2 bg-red-500 text-white rounded-xl"
>
  تسجيل الخروج
</button>
  {notificationsOpen && (
    <div
      className="
      absolute left-0 top-full mt-3
      w-[380px]
      bg-white
      rounded-3xl
      shadow-2xl
      border border-slate-200
      overflow-hidden
      z-50
      animate-in fade-in zoom-in-95
    "
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="font-black text-slate-900">
          الإشعارات
        </h3>

        <span className="text-xs text-slate-400">
          {notifications.length}
        </span>
      </div>

      <div className="max-h-[450px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            لا توجد إشعارات
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="
              p-4
              border-b border-slate-100
              hover:bg-slate-50
              transition-colors
              cursor-pointer
            "
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    {item.content}
                  </p>
                </div>

                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )}
</div>
              </>
            ) : (
             <>
  <button
    onClick={() => navigate("/login")}
    className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-all"
  >
    تسجيل الدخول
  </button>

  <button
    onClick={() => navigate("/register")}
    className="px-6 py-2.5 rounded-xl text-white font-bold bg-gradient-to-r from-purple-700 to-violet-500 hover:scale-105 transition-all shadow-lg shadow-purple-500/25"
  >
    إنشاء حساب
  </button>
</>
            )}
            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
            {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#130726] border-t border-slate-100 p-4">
          <div className="space-y-1">
            {navLinks.map(link => (
  <button
    key={link.path}
    onClick={() => {
      navigate(link.path);
      setMobileOpen(false);
    }}
  >
    {link.label}
  </button>
))}
          </div>
        </div>
      )}
    </nav>
  );
}
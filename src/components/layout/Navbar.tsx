import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell, ChevronDown, GraduationCap } from "lucide-react";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { useApp } from "../../context/AppContext";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const navLinks = [
    { label: "الرئيسية", path: "/" },
    { label: "الكورسات", path: "/courses" },
    { label: "من نحن", path: "/#about" },
    { label: "تواصل معنا", path: "/#contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">د. زياد ربيع</p>
              <p className="text-[10px] text-slate-500 leading-tight">منصة تعليمية</p>
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
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100"
>
  {isDark ? <Sun size={18} /> : <Moon size={18} />}
</button>
            {user ? (
              <>
                <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Avatar name={user.name} size="sm" />
                    <span className="text-sm font-semibold text-slate-800 hidden sm:block max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                      <div className="px-3 py-2 mb-1">
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role === "student" ? "طالب" : user.role === "instructor" ? "مدرس" : "مدير"}</p>
                      </div>
                      <hr className="border-slate-100 mb-1" />
                      <button onClick={() => { navigate(user.role === "student" ? "/dashboard" : user.role === "instructor" ? "/instructor" : "/admin"); setUserMenuOpen(false); }} className="w-full text-right px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                        لوحة التحكم
                      </button>
                      <button onClick={() => { navigate("/profile"); setUserMenuOpen(false); }} className="w-full text-right px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                        الملف الشخصي
                      </button>
                      <hr className="border-slate-100 my-1" />
                      <button onClick={() => { logout(); setUserMenuOpen(false); navigate("/"); }} className="w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
             <>
  <button
    onClick={() => navigate("/login")}
    className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 hover:text-purple-600 transition-all"
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
        <div className="md:hidden bg-white border-t border-slate-100 p-4">
          <div className="space-y-1">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMobileOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
          {!user && (
            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" fullWidth onClick={() => { navigate("/login"); setMobileOpen(false); }}>دخول</Button>
              <Button variant="primary" size="sm" fullWidth onClick={() => { navigate("/register"); setMobileOpen(false); }}>إنشاء حساب</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

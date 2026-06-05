import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff, GraduationCap, ArrowLeft } from "lucide-react";

import { useApp } from "../context/AppContext";
import { CURRENT_STUDENT } from "../data/mockData";

type LoginRole = "student" | "instructor" | "admin";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState<LoginRole>("student");

  const demoUsers = {
    student: { phone: "01012345678", password: "student123" },
    instructor: { phone: "01098765432", password: "instructor123" },
    admin: { phone: "01011112222", password: "admin123" },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 1200));

    const demo = demoUsers[activeRole];
    if (phone === demo.phone && password === demo.password) {
      if (activeRole === "student") {
        login({
          id: CURRENT_STUDENT.id,
          name: CURRENT_STUDENT.name,
          role: "student",
          grade: CURRENT_STUDENT.grade,
          gradeLabel: CURRENT_STUDENT.gradeLabel,
          code: CURRENT_STUDENT.code,
          governorate: CURRENT_STUDENT.governorate,
          phone: CURRENT_STUDENT.phone,
          status: "approved",
        });
        navigate("/dashboard");
      } else if (activeRole === "instructor") {
        login({ id: "i1", name: "د. زياد ربيع", role: "instructor" });
        navigate("/instructor");
      } else {
        login({ id: "admin1", name: "مدير النظام", role: "admin" });
        navigate("/admin");
      }
    } else {
      setError("رقم الهاتف أو كلمة المرور غير صحيحة. جرّب البيانات التجريبية.");
    }
    setLoading(false);
  };

  const fillDemo = (role: LoginRole) => {
    setActiveRole(role);
    setPhone(demoUsers[role].phone);
    setPassword(demoUsers[role].password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4" dir="rtl">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-3 mx-auto w-fit mb-8 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-900/50 group-hover:scale-105 transition-transform">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div className="text-right">
            <p className="text-white font-black text-lg leading-tight">د. زياد ربيع</p>
            <p className="text-blue-300 text-xs">المنصة التعليمية</p>
          </div>
        </button>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6">
            <h1 className="text-2xl font-black text-white mb-1">مرحباً بعودتك 👋</h1>
            <p className="text-slate-300 text-sm">سجّل دخولك للوصول إلى كورساتك</p>
          </div>

          {/* Role Tabs */}
          <div className="px-8 mb-6">
            <div className="bg-white/10 rounded-2xl p-1 flex">
              {([
                { role: "instructor" as LoginRole, label: "مدرس" },
                { role: "admin" as LoginRole, label: "مدير" },
              ]).map(tab => (
                <button
                  key={tab.role}
                  onClick={() => setActiveRole(tab.role)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeRole === tab.role
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Demo Hint */}
          <div className="px-8 mb-4">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4">
              <p className="text-blue-200 text-xs font-bold mb-1">🔑 بيانات تجريبية</p>
              <p className="text-blue-300 text-xs">رقم الهاتف: <span className="font-mono text-white">{demoUsers[activeRole].phone}</span></p>
              <p className="text-blue-300 text-xs">كلمة المرور: <span className="font-mono text-white">{demoUsers[activeRole].password}</span></p>
              <button onClick={() => fillDemo(activeRole)} className="mt-2 text-xs text-blue-300 underline hover:text-white">
                تعبئة تلقائية
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 pb-8 space-y-4">
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pr-10 pl-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white/15"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="كلمة المرور"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pr-10 pl-10 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white/15"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-400" />
                <span className="text-slate-300 text-sm">تذكرني</span>
              </label>
              <button type="button" className="text-blue-400 text-sm hover:text-blue-300">نسيت كلمة المرور؟</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>تسجيل الدخول</>
              )}
            </button>

            <p className="text-center text-slate-400 text-sm">
              ليس لديك حساب؟{" "}
              <button type="button" onClick={() => navigate("/register")} className="text-blue-400 font-bold hover:text-blue-300">
                سجل الآن
              </button>
            </p>

            <button type="button" onClick={() => navigate("/")} className="w-full flex items-center justify-center gap-2 text-slate-400 text-sm hover:text-white transition-colors">
              <ArrowLeft size={14} />
              العودة للرئيسية
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

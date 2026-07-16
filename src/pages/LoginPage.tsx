import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";
import { CURRENT_STUDENT } from "../data/mockData";

type LoginRole = "student" | "instructor" | "admin";

export function LoginPage({ staffMode = false }: { staffMode?: boolean }) {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState<LoginRole>(staffMode ? "instructor" : "student");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1200));

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }

      const { data: instructor, error: instructorError } = await supabase
        .from("instructors").select("*").eq("auth_id", data.user.id).single();

      if (instructorError || !instructor) {
        setError("هذا الحساب ليس مدرساً");
        setLoading(false);
        return;
      }
      login({ id: instructor.id, name: instructor.full_name, role: "instructor", phone: instructor.phone });
      navigate("/instructor");
    } else {
      login({ id: "admin1", name: "مدير النظام", role: "admin" });
      navigate("/admin");
    }
    setLoading(false);
  };

  const roles = staffMode
    ? [{ key: "instructor" as LoginRole, label: "مدرّس" }, { key: "admin" as LoginRole, label: "مدير" }]
    : [];

  return (
    <div dir="rtl" className="min-h-screen bg-[#07060E] flex items-center justify-center relative overflow-hidden p-4">

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#7C1DCC]/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#A52DFF]/10 blur-[120px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="relative rounded-[28px] border border-white/8 bg-white/[0.04] backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,.6)] overflow-hidden">

          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#A52DFF]/80 to-transparent" />

          {/* Inner glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#A52DFF]/10 blur-[80px] pointer-events-none" />

          <div className="px-8 pt-10 pb-8 relative z-10">

            {/* Logo area */}
            <div className="mb-8 text-center">
              <img src="/images/logo.png" alt="Logo" className="h-12 mx-auto mb-6 drop-shadow-lg" />
              <h1 className="text-[1.75rem] font-black text-white tracking-tight leading-tight">
                {staffMode ? "لوحة التحكم" : "مرحباً بعودتك"}
              </h1>
              <p className="mt-1.5 text-sm text-white/40">
                {staffMode ? "تسجيل الدخول لإدارة المنصة" : "سجّل دخولك للوصول إلى كورساتك"}
              </p>
            </div>

            {/* Role switcher (staff only) */}
            {staffMode && (
              <div className="mb-7 p-1 bg-white/5 border border-white/8 rounded-2xl flex gap-1">
                {roles.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setActiveRole(r.key)}
                    className={`relative flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                      activeRole === r.key ? "text-white" : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    {activeRole === r.key && (
                      <motion.span
                        layoutId="roleTab"
                        className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#9333EA] to-[#7C1DCC] shadow-lg shadow-purple-900/50"
                      />
                    )}
                    <span className="relative z-10">{r.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Email */}
              <div className="group">
                <label className="block mb-2 text-xs font-semibold text-white/50 tracking-wide uppercase">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-violet-400 transition-colors duration-200"
                  />
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
                      w-full h-[54px] bg-white/5 border border-white/10 rounded-2xl
                      pr-12 pl-4 text-white placeholder:text-white/20 text-sm outline-none
                      transition-all duration-200
                      focus:border-violet-500/60 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/15
                      hover:border-white/20
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block mb-2 text-xs font-semibold text-white/50 tracking-wide uppercase">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-violet-400 transition-colors duration-200"
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="
                      w-full h-[54px] bg-white/5 border border-white/10 rounded-2xl
                      pr-12 pl-12 text-white placeholder:text-white/20 text-sm outline-none
                      transition-all duration-200
                      focus:border-violet-500/60 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/15
                      hover:border-white/20
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/70 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Options row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-4 h-4 rounded border border-white/20 peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all" />
                  </div>
                  <span className="text-xs text-white/35 group-hover:text-white/55 transition-colors">تذكرني</span>
                </label>
                <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  نسيت كلمة المرور؟
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="
                  relative w-full h-[54px] mt-2 rounded-2xl font-bold text-sm text-white
                  bg-gradient-to-b from-[#9333EA] to-[#7C1DCC]
                  shadow-[0_8px_32px_rgba(124,29,204,.45)]
                  hover:shadow-[0_8px_40px_rgba(124,29,204,.65)]
                  hover:from-[#a855f7] hover:to-[#9333EA]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200 active:scale-[0.98]
                  overflow-hidden
                "
              >
                {/* Shine effect */}
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      تسجيل الدخول
                      <ArrowRight size={15} className="opacity-70" />
                    </>
                  )}
                </span>
              </button>

            </form>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-white/6 flex flex-col items-center gap-3">
              {!staffMode && (
                <p className="text-white/30 text-xs">
                  ليس لديك حساب؟{" "}
                  <button className="text-violet-400 hover:text-violet-300 transition-colors font-semibold">
                    تواصل معنا
                  </button>
                </p>
              )}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs transition-colors"
              >
                <ArrowRight size={12} className="rotate-180" />
                العودة للرئيسية
              </button>
            </div>

          </div>
        </div>

        {/* Bottom glow */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-[#7C1DCC]/20 blur-2xl rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
}
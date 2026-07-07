import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from "../components/layout/Navbar";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { Footer } from "../components/layout/Footer";
import {
  Eye, EyeOff, Phone, Lock,
  ChevronLeft, Loader2, CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import HeroSection from '../components/HeroSection';

import { useNavigate } from "react-router-dom";


const LoginPage = () => {  const navigate = useNavigate();
  const { login } = useApp();
  const { isDark } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [rememberMe, setRememberMe] = useState(false);
 const [loginForm, setLoginForm] = useState({
  email: "",
  password: "",
});

  const inputClass = `
w-full
bg-transparent
border-0
border-b
border-slate-300
rounded-none
px-0
py-4
text-lg
text-slate-700
outline-none
focus:border-purple-500
focus:ring-0
`;

  const focusShadow = { boxShadow: '0 0 0 3px rgba(139,92,246,0.18)' };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);

  try {
    // نجيب الطالب من جدول students باستخدام الإيميل
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("email", loginForm.email.trim())
      .single();

    if (studentError || !student) {
      alert("البريد الإلكتروني غير موجود");
      setLoading(false);
      return;
    }

    // تسجيل الدخول في Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: student.email,
      password: loginForm.password,
    });

    if (error) {
      alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    await supabase
      .from("students")
      .update({
        last_login: new Date().toISOString(),
      })
      .eq("id", student.id);

    login({
      id: String(student.id),
      name: student.full_name,
      role: "student",
      grade: student.grade,
      gradeLabel: student.grade,
      phone: student.phone,
      status: "approved",
    });

    navigate("/");
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء تسجيل الدخول");
  }

  setLoading(false);
};
  const cardShadow = isDark
    ? '0 20px 60px rgba(109,40,217,0.18), 0 0 0 1px rgba(255,255,255,0.05)'
    : '0 10px 50px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)';

    return (
  <>
    <Navbar />

    <div
      className="min-h-screen pt-[62px] sm:pt-16"
        style={{ background: isDark ? '#0B0715' : '#ffffff' }}
      >
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-62px)] sm:min-h-[calc(100vh-64px)]">

          {/* ────────────────────── LEFT: FORM ───────────────────── */}
          <motion.div
            className="w-full lg:w-[54%] flex flex-col justify-center px-4 sm:px-8 md:px-14 lg:px-16 xl:px-20 py-8 lg:py-10 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="max-w-[680px] mx-auto w-full">

              {/* Page heading */}
              <motion.div
                className="mb-7"
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  
                  <div>
                    <h1
                      className="text-[56px] font-black leading-none"
                      style={{ color: isDark ? '#fff' : '#0F172A' }}
                    >
                     مرحباً بعودتك
                    </h1>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.48)' : '#64748B' }}>
                 سجل الدخول للوصول إلى الدروس والواجبات ونتائج الاختبارات.
                </p>
              </motion.div>

              {/* ── Main Card ── */}
              <motion.div
  className="mb-4"
>

                


                {/* Animated Form Body */}
                <AnimatePresence mode="wait">
                  <motion.form
                    
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                  >
                   
                      <>
                        {/* Student Code */}
                        <div className="space-y-1.5">
                         <label
  className="block text-sm font-semibold"
  style={{ color: isDark ? "rgba(255,255,255,0.72)" : "#475569" }}
>
  البريد الإلكتروني
</label>

<div className="relative">
  <Phone className="absolute top-1/2 -translate-y-1/2 right-4 w-[18px] h-[18px] text-purple-500" />

  <input
    type="email"
    placeholder="example@gmail.com"
    value={loginForm.email}
    onChange={(e) =>
      setLoginForm((p) => ({
        ...p,
        email: e.target.value,
      }))
    }
    className={`${inputClass} pr-11`}
    dir="ltr"
    onFocus={(e) => Object.assign(e.target.style, focusShadow)}
    onBlur={(e) => (e.target.style.boxShadow = "")}
    required
  />
</div>
 </div>                         

                        {/* Password */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#475569' }}>
                              كلمة المرور
                            </label>
                            <button type="button" className="text-xs font-bold text-purple-500 hover:text-purple-400 transition-colors">
                              نسيت كلمة المرور؟
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute top-1/2 -translate-y-1/2 right-4 w-[18px] h-[18px] text-purple-500" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={loginForm.password}
                              onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                              className={`${inputClass} pr-11 pl-11`}
                              dir="ltr"
                              onFocus={e => Object.assign(e.target.style, focusShadow)}
                              onBlur={e => (e.target.style.boxShadow = '')}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute top-1/2 -translate-y-1/2 left-4 transition-colors"
                              style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8' }}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    

                    {/* Remember Me */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <motion.button
                        type="button"
                        onClick={() => setRememberMe(!rememberMe)}
                        className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-250"
                        style={{
                          background: rememberMe ? 'linear-gradient(135deg,#6D28D9,#8B5CF6)' : 'transparent',
                          borderColor: rememberMe ? '#8B5CF6' : isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1',
                          boxShadow: rememberMe ? '0 2px 10px rgba(109,40,217,0.4)' : 'none',
                        }}
                        whileTap={{ scale: 0.88 }}
                      >
                        <AnimatePresence>
                          {rememberMe && (
                            <motion.svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none" viewBox="0 0 24 24"
                              stroke="currentColor" strokeWidth={3.5}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </motion.button>
                      <span className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#64748B' }}>
                        تذكرني
                      </span>
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading || success}
                      className="w-full py-4 rounded-3xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-1.5 disabled:opacity-70"
                      style={{
                        background: success
                          ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                          : 'linear-gradient(135deg, #5B21B6, #7C3AED, #8B5CF6)',
                        boxShadow: success
                          ? '0 6px 24px rgba(34,197,94,0.4)'
                          : '0 6px 24px rgba(109,40,217,0.45)',
                        transition: 'all 0.4s ease',
                      }}
                      whileHover={!loading && !success ? { scale: 1.02, y: -1 } : {}}
                      whileTap={!loading && !success ? { scale: 0.98 } : {}}
                    >
                      <AnimatePresence mode="wait">
                        {loading ? (
                          <motion.div key="loading" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري تسجيل الدخول...
                          </motion.div>
                        ) : success ? (
                          <motion.div key="success" className="flex items-center gap-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                            <CheckCircle2 className="w-5 h-5" />
                            تم بنجاح!
                          </motion.div>
                        ) : (
                          <motion.div key="default" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <ChevronLeft className="w-5 h-5" />
                            تسجيل الدخول
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.form>
                </AnimatePresence>
              </motion.div>

            

              {/* Register prompt */}
              <motion.p
                className="text-center text-sm"
                style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                ليس لديك حساب؟{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-bold text-purple-500 hover:text-purple-400 transition-colors"
                >
                  أنشئ حساباً الآن
                </button>
              </motion.p>
            </div>
          </motion.div>

          {/* ────────────────────── RIGHT: HERO ─────────────────── */}
          <motion.div
            className="w-full lg:w-[46%] order-1 lg:order-2 min-h-[400px] sm:min-h-[460px] lg:min-h-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
<HeroSection image="/images/login-image.png" />
          </motion.div>
        </div>
        <Footer />
      </div>

      
    </>
  );
};

export default LoginPage;
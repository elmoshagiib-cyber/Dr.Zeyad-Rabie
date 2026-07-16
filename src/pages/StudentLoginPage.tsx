import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from "../components/layout/Navbar";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { Footer } from "../components/layout/Footer";
import {
  Eye, EyeOff, Phone, Lock,
  Loader2, CheckCircle2, LogIn
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import HeroSection from '../components/HeroSection';
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const { isDark } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const fieldIcon = "w-4 h-4 text-orange-400 flex-shrink-0";

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!loginForm.email.trim()) e.email = 'البريد الإلكتروني مطلوب';
    else if (!loginForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'البريد الإلكتروني غير صحيح';
    if (!loginForm.password) e.password = 'كلمة المرور مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("email", loginForm.email.trim())
        .single();

      if (studentError || !student) {
        setErrors({ email: 'البريد الإلكتروني غير موجود' });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: student.email,
        password: loginForm.password,
      });

      if (error) {
        setErrors({ password: 'كلمة المرور غير صحيحة' });
        setLoading(false);
        return;
      }

      await supabase
        .from("students")
        .update({ last_login: new Date().toISOString() })
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

      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تسجيل الدخول");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className={`min-h-screen pt-[62px] sm:pt-16 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>

        {/* ── outer flex wrapper ── */}
        <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-64px)]">

          {/* ══════════════════════════════════════════
              FORM COLUMN
              • phone  : full width, order 1 (top)
              • tablet : full width, order 1 (top)
              • desktop: 58 % left, order 1
          ══════════════════════════════════════════ */}
          <motion.div
            className="
              w-full lg:w-[58%]
              order-1 lg:order-1
              flex flex-col justify-center
              px-5 sm:px-10 md:px-16 lg:px-14 xl:px-20
              py-10 sm:py-12 lg:py-0
              min-h-[calc(100vh-62px)] lg:min-h-0
            "
            dir="rtl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* inner container — centres on mobile, left-aligned on desktop */}
            <div className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl">

              {/* ── Title ── */}
              <motion.div
                className="mb-8 sm:mb-10"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-teal-500 flex-shrink-0" />
                  <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    تسجيل{' '}
                    <span className="text-orange-500">الدخول</span>
                    {' '}:
                  </h1>
                </div>
                <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ادخل على حسابك بإدخال البريد الإلكتروني و كلمة المرور المسجل بهم من قبل
                </p>
              </motion.div>

              {/* ── FORM ── */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6 sm:space-y-7"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >

                {/* ── Email ── */}
                <div className="flex flex-col gap-1">
                  <div
                    className={`
                      flex items-center gap-3
                      border-b-2 py-2.5
                      transition-colors duration-200
                      ${errors.email
                        ? 'border-red-400'
                        : isDark
                          ? 'border-gray-700 focus-within:border-orange-400'
                          : 'border-gray-200 focus-within:border-orange-400'
                      }
                    `}
                  >
                    <Phone className={fieldIcon} />
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={loginForm.email}
                      onChange={e => {
                        setLoginForm(p => ({ ...p, email: e.target.value }));
                        setErrors(p => ({ ...p, email: undefined }));
                      }}
                      dir="ltr"
                      required
                      className={`
                        flex-1 min-w-0 bg-transparent border-0 outline-none
                        text-sm sm:text-base py-0.5
                        placeholder-gray-400
                        ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700'}
                      `}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 text-right">{errors.email}</p>
                  )}
                </div>

                {/* ── Password ── */}
                <div className="flex flex-col gap-1">
                  <div
                    className={`
                      flex items-center gap-3
                      border-b-2 py-2.5
                      transition-colors duration-200
                      ${errors.password
                        ? 'border-red-400'
                        : isDark
                          ? 'border-gray-700 focus-within:border-orange-400'
                          : 'border-gray-200 focus-within:border-orange-400'
                      }
                    `}
                  >
                    <Lock className={fieldIcon} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="كلمة السر"
                      value={loginForm.password}
                      onChange={e => {
                        setLoginForm(p => ({ ...p, password: e.target.value }));
                        setErrors(p => ({ ...p, password: undefined }));
                      }}
                      dir="ltr"
                      required
                      className={`
                        flex-1 min-w-0 bg-transparent border-0 outline-none
                        text-sm sm:text-base py-0.5
                        placeholder-gray-400
                        ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700'}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 text-right">{errors.password}</p>
                  )}
                </div>

                {/* ── Remember me + Forgot password ── */}
                <div className="flex items-center justify-between">

                  {/* Toggle switch */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      aria-label="تذكرني"
                      className={`
                        relative flex-shrink-0
                        w-11 h-6 rounded-full
                        transition-colors duration-300
                        ${rememberMe
                          ? 'bg-teal-500'
                          : isDark ? 'bg-gray-700' : 'bg-gray-200'
                        }
                      `}
                    >
                      <motion.span
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                        animate={{ right: rememberMe ? '2px' : 'calc(100% - 22px)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    </button>
                    <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      تذكرني
                    </span>
                  </div>

                  {/* Forgot password */}
                  <button
                    type="button"
                    className="text-xs sm:text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                {/* ── Submit ── */}
                <motion.button
                  type="submit"
                  disabled={loading || success}
                  className="
                    w-full py-3 sm:py-3.5
                    rounded-xl text-white font-bold
                    text-sm sm:text-base
                    flex items-center justify-center gap-2
                    disabled:opacity-70
                    transition-all duration-300
                  "
                  style={{
                    background: success
                      ? 'linear-gradient(135deg, #0d9488, #14b8a6)'
                      : 'linear-gradient(135deg, #e11d48, #f43f5e)',
                    boxShadow: success
                      ? '0 8px 24px rgba(13,148,136,0.30)'
                      : '0 8px 24px rgba(225,29,72,0.30)',
                  }}
                  whileHover={!loading && !success ? { scale: 1.012, y: -1 } : {}}
                  whileTap={!loading && !success ? { scale: 0.97 } : {}}
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري تسجيل الدخول...
                      </motion.div>
                    ) : success ? (
                      <motion.div
                        key="success"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        تم بنجاح!
                      </motion.div>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      >
                        تسجيل الدخول
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

              </motion.form>

              {/* ── Register prompt ── */}
              <motion.p
                className={`text-center text-xs sm:text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                لا يوجد لديك حساب؟{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-bold text-orange-500 hover:text-orange-400 transition-colors"
                >
                  أنشئ حسابك الآن !
                </button>
              </motion.p>

            </div>
          </motion.div>

          {/* ══════════════════════════════════════════
              HERO IMAGE COLUMN
              • phone  : hidden
              • tablet : hidden
              • desktop: 42 % right, sticky full height
          ══════════════════════════════════════════ */}
          <motion.div
            className="
              hidden lg:flex
              lg:w-[42%]
              order-2
              sticky top-16 self-start
              h-[calc(100vh-64px)]
              overflow-hidden
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full h-full">
              <HeroSection image="/images/login-image.png" />
            </div>
          </motion.div>

        </div>

        <Footer />
      </div>
    </>
  );
};

export default LoginPage;
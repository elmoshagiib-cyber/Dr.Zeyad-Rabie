import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from "../components/layout/Navbar";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import {
  Eye, EyeOff, Phone, Lock, KeyRound, Wifi, Building2,
  ChevronLeft, Loader2, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import HeroSection from '../components/HeroSection';
import ActivationModal from '../components/ActivationModal';
import { useNavigate } from "react-router-dom";
type LoginTab = 'online' | 'center';

const LoginPage = () => {  const navigate = useNavigate();
  const { login } = useApp();
  const { isDark } = useTheme();
  const [tab, setTab] = useState<LoginTab>('online');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activationOpen, setActivationOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [onlineForm, setOnlineForm] = useState({ phone: '', password: '' });
  const [centerForm, setCenterForm] = useState({ code: '', password: '' });

  const inputClass = `w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none border transition-all duration-300 ${
    isDark
      ? 'bg-white/[0.045] border-white/[0.09] text-white placeholder-white/25 focus:border-purple-500 focus:bg-white/[0.07]'
      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:bg-white'
  }`;

  const focusShadow = { boxShadow: '0 0 0 3px rgba(139,92,246,0.18)' };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);

  try {
    const phone =
      tab === "online"
        ? onlineForm.phone
        : centerForm.code;

    const password =
      tab === "online"
        ? onlineForm.password
        : centerForm.password;

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("phone", phone)
      .eq("password", password);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setLoading(false);
      alert("رقم الهاتف أو كلمة المرور غير صحيحة");
      return;
    }

    const student = data[0];

    login({
      id: String(student.id),
      name: student.full_name,
      role: "student",
      grade: student.grade,
      gradeLabel: student.grade,
      code: student.student_code,
      governorate: student.governorate,
      phone: student.phone,
      status: "approved",
    });

    setLoading(false);
    navigate("/dashboard");

  } catch (err) {
    console.error(err);
    setLoading(false);
    alert("حدث خطأ أثناء تسجيل الدخول");
  }
};
  const cardShadow = isDark
    ? '0 20px 60px rgba(109,40,217,0.18), 0 0 0 1px rgba(255,255,255,0.05)'
    : '0 10px 50px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)';

    return (
  <>
    <Navbar />

    <div
      className="min-h-screen pt-[62px] sm:pt-16"
        style={{ background: isDark ? '#0B0715' : '#F1F5F9' }}
      >
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-62px)] sm:min-h-[calc(100vh-64px)]">

          {/* ────────────────────── LEFT: FORM ───────────────────── */}
          <motion.div
            className="w-full lg:w-[54%] flex flex-col justify-center px-4 sm:px-8 md:px-14 lg:px-16 xl:px-20 py-8 lg:py-10 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="max-w-[420px] mx-auto w-full">

              {/* Page heading */}
              <motion.div
                className="mb-7"
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className="w-11 h-11 rounded-[15px] bg-gradient-to-br from-purple-700 to-violet-500 flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: '0 6px 20px rgba(109,40,217,0.45)' }}
                  >
                    <span className="text-xl">🔐</span>
                  </div>
                  <div>
                    <h1
                      className="text-2xl sm:text-[28px] font-black leading-tight"
                      style={{ color: isDark ? '#fff' : '#0F172A' }}
                    >
                      تسجيل الدخول
                    </h1>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.48)' : '#64748B' }}>
                  مرحباً بعودتك، سجل الدخول لمتابعة تقدمك الدراسي
                </p>
              </motion.div>

              {/* ── Main Card ── */}
              <motion.div
                className="rounded-3xl p-6 sm:p-7 mb-4"
                style={{
                  background: isDark ? 'rgba(16, 10, 35, 0.9)' : '#FFFFFF',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #E2E8F0',
                  boxShadow: cardShadow,
                }}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.65 }}
              >

                {/* Login Type Tabs */}
                <div
                  className="flex rounded-2xl p-1 mb-6"
                  style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9' }}
                >
                  {[
                    { id: 'online' as LoginTab, label: 'طالب أونلاين', icon: Wifi },
                    { id: 'center' as LoginTab, label: 'طالب سنتر', icon: Building2 },
                  ].map(({ id, label, icon: Icon }) => (
                    <motion.button
                      key={id}
                      type="button"
                      onClick={() => { setTab(id); setShowPassword(false); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
                      style={
                        tab === id
                          ? { background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)', color: '#fff', boxShadow: '0 4px 16px rgba(109,40,217,0.38)' }
                          : { color: isDark ? 'rgba(255,255,255,0.38)' : '#94A3B8' }
                      }
                      whileTap={{ scale: 0.97 }}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </motion.button>
                  ))}
                </div>

                {/* Animated Form Body */}
                <AnimatePresence mode="wait">
                  <motion.form
                    key={tab}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28 }}
                  >
                    {tab === 'online' ? (
                      <>
                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#475569' }}>
                            رقم الهاتف
                          </label>
                          <div className="relative group">
                            <Phone className="absolute top-1/2 -translate-y-1/2 right-4 w-[18px] h-[18px] text-purple-500 transition-colors" />
                            <input
                              type="tel"
                              placeholder="01XXXXXXXXX"
                              value={onlineForm.phone}
                              onChange={e => setOnlineForm(p => ({ ...p, phone: e.target.value }))}
                              className={`${inputClass} pr-11`}
                              style={{ direction: 'ltr', textAlign: 'right' }}
                              onFocus={e => Object.assign(e.target.style, focusShadow)}
                              onBlur={e => (e.target.style.boxShadow = '')}
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
                              value={onlineForm.password}
                              onChange={e => setOnlineForm(p => ({ ...p, password: e.target.value }))}
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
                    ) : (
                      <>
                        {/* Student Code */}
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#475569' }}>
                            كود الطالب
                          </label>
                          <div className="relative">
                            <KeyRound className="absolute top-1/2 -translate-y-1/2 right-4 w-[18px] h-[18px] text-purple-500" />
                            <input
                              type="text"
                              placeholder="ST-2026-0001"
                              value={centerForm.code}
                              onChange={e => setCenterForm(p => ({ ...p, code: e.target.value }))}
                              className={`${inputClass} pr-11`}
                              dir="ltr"
                              onFocus={e => Object.assign(e.target.style, focusShadow)}
                              onBlur={e => (e.target.style.boxShadow = '')}
                              required
                            />
                          </div>
                          <p className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.28)' : '#94A3B8' }}>
                            مثال: ST-2026-8547
                          </p>
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
                              value={centerForm.password}
                              onChange={e => setCenterForm(p => ({ ...p, password: e.target.value }))}
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
                    )}

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
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-1.5 disabled:opacity-70"
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

              {/* ── Center Student Activation Card ── */}
              <AnimatePresence>
                {tab === 'center' && (
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-3xl p-5 mb-4"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(109,40,217,0.12), rgba(139,92,246,0.06))'
                        : 'linear-gradient(135deg, rgba(245,243,255,1), rgba(237,233,254,0.8))',
                      border: isDark ? '1px solid rgba(109,40,217,0.28)' : '1px solid rgba(167,139,250,0.4)',
                      boxShadow: isDark ? '0 8px 30px rgba(109,40,217,0.12)' : '0 4px 20px rgba(109,40,217,0.08)',
                    }}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center flex-shrink-0"
                        style={{ boxShadow: '0 4px 16px rgba(109,40,217,0.4)' }}
                      >
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[15px] mb-1.5" style={{ color: isDark ? '#fff' : '#1E1B4B' }}>
                          هل أنت طالب سنتر؟
                        </h3>
                        <p className="text-xs leading-relaxed mb-3.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }}>
                          إذا كنت حصلت على كود الطالب من الفرع قم بتفعيل حسابك الآن لأول مرة.
                        </p>
                        <motion.button
                          type="button"
                          onClick={() => setActivationOpen(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold"
                          style={{
                            background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
                            boxShadow: '0 4px 14px rgba(109,40,217,0.4)',
                          }}
                          whileHover={{ scale: 1.04, y: -1, boxShadow: '0 8px 24px rgba(109,40,217,0.55)' } as any}
                          whileTap={{ scale: 0.97 }}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          تفعيل حساب طالب سنتر
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
            className="w-full lg:w-[46%] order-1 lg:order-2 min-h-[400px] sm:min-h-[460px] lg:min-h-0 lg:sticky lg:top-[62px] lg:h-[calc(100vh-62px)] lg:self-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
{<HeroSection />}
          </motion.div>
        </div>
      </div>

      <ActivationModal isOpen={activationOpen} onClose={() => setActivationOpen(false)} />
    </>
  );
};

export default LoginPage;
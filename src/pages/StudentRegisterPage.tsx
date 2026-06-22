import React, { useState } from 'react';
import { Footer } from "../components/layout/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { supabase } from "../lib/supabase";
import {
  Eye, EyeOff, Phone, Lock, User, Mail, BookOpen,
  Layers, ChevronLeft, Loader2, ShieldCheck, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import HeroSection from '../components/HeroSection';
import ActivationModal from '../components/ActivationModal';

const GRADES = [
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
];

const SECTIONS = ['علمي رياضة', 'علمي علوم', 'أدبي', 'تجاري', 'صناعي'];

  const RegisterPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activationOpen, setActivationOpen] = useState(false);
  const [form, setForm] = useState({
  firstName: '',
  secondName: '',
  thirdName: '',
  lastName: '',

  phone: '',
  email: '',
  grade: '',
  section: '',
  password: '',
  confirmPassword: '',
});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputClass = `
w-full
bg-transparent
border-0
border-b
border-slate-300
rounded-none
px-0
py-3
text-xl
text-slate-700
outline-none
focus:border-purple-500
focus:ring-0
`;

  const focusShadow = { boxShadow: '0 0 0 3px rgba(139,92,246,0.18)' };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'الاسم الأول مطلوب';
if (!form.secondName.trim()) e.secondName = 'الاسم الثاني مطلوب';
if (!form.thirdName.trim()) e.thirdName = 'الاسم الثالث مطلوب';
if (!form.lastName.trim()) e.lastName = 'الاسم الأخير مطلوب';
    if (!form.phone.match(/^(010|011|012|015)\d{8}$/)) e.phone = 'رقم الهاتف غير صحيح (10 أرقام)';
    if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'البريد الإلكتروني غير صحيح';
    if (!form.grade) e.grade = 'يرجى اختيار الصف الدراسي';
    if (!form.section) e.section = 'يرجى اختيار الشعبة';
    if (form.password.length < 8) e.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'كلمتا المرور غير متطابقتين';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
  ev.preventDefault();

  try {
    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          student_code: "ZR-000001",
          full_name: `${form.firstName} ${form.secondName} ${form.thirdName} ${form.lastName}`,
          phone: form.phone,
          grade: form.grade,
          password: form.password,
          status: "active",
        },
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    console.log(data);
    alert("تم حفظ الطالب بنجاح");
  } catch (err) {
    console.error(err);
  }
};

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { label: 'ضعيفة', color: '#ef4444', width: '25%' };
    if (s === 2) return { label: 'متوسطة', color: '#f59e0b', width: '55%' };
    if (s === 3) return { label: 'جيدة', color: '#3b82f6', width: '75%' };
    return { label: 'قوية جداً', color: '#22c55e', width: '100%' };
  };

  const strength = passwordStrength();

  const cardShadow = isDark
    ? '0 20px 60px rgba(109,40,217,0.18), 0 0 0 1px rgba(255,255,255,0.05)'
    : '0 10px 50px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)';

  // Success overlay
  if (success) {
  return (
    <>
      <Navbar />

      <div
        className="min-h-screen pt-16 flex items-center justify-center"
        style={{ background: '#FFFFFF' }}
      >
              </div>
    </>
  );
}
        <motion.div
          className="flex flex-col items-center gap-6 text-center px-6"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        >
          <motion.div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #5B21B6, #8B5CF6)',
              boxShadow: '0 0 0 12px rgba(109,40,217,0.15), 0 20px 50px rgba(109,40,217,0.4)',
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 0.55, repeat: 3 }}
          >
            <CheckCircle2 className="w-14 h-14 text-white" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-black mb-2" style={{ color: isDark ? '#fff' : '#0F172A' }}>
              تم إنشاء حسابك! 🎉
            </h2>
            <p className="text-base" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B' }}>
              جاري توجيهك لصفحة تسجيل الدخول...
            </p>
          </div>
        </motion.div>

  return (
  <>
    <Navbar />

    <div
      className="min-h-screen pt-[62px] sm:pt-16"
      style={{ background: '#FFFFFF' }}
    >
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-62px)] sm:min-h-[calc(100vh-64px)]">

          {/* ────────────────────── LEFT: FORM ───────────────────── */}
          <motion.div
            className="w-full lg:w-[54%] flex flex-col justify-center px-4 sm:px-8 md:px-14 lg:px-16 xl:px-20 py-8 lg:py-10 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="max-w-[900px] mx-auto w-full">

              {/* Page heading */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className="w-11 h-11 rounded-[15px] bg-gradient-to-br from-purple-700 to-violet-500 flex items-center justify-center flex-shrink-0"
                    
                  >
                    
                  </div>
                  <h1
className="text-[56px] font-black text-center leading-none">
                    أنشئ حسابك الآن
                  </h1>
                </div>
                <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.48)' : '#64748B' }}>
  ادخل بياناتك بشكل صحيح للحصول على أفضل تجربة داخل الموقع

                </p>
              </motion.div>

              {/* ── Center Student Warning ── */}
              <motion.div
                className="
rounded-3xl
p-6
mb-12
bg-amber-50
border
border-amber-200
"
                style={{
  background: '#FFFDF5',
  border: '1px solid #F4D06F'
}}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black mb-1" style={{ color: isDark ? '#FCD34D' : '#92400E' }}>
                      هل أنت طالب سنتر؟
                    </p>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: isDark ? 'rgba(252,211,77,0.6)' : '#B45309' }}>
                     إذا كنت مسجلاً داخل السنتر فلا تقم بإنشاء حساب جديد.
استلم كود الطالب من الإدارة ثم فعّل حسابك للدخول إلى المنصة.
                    </p>
                    <motion.button
                      type="button"
                      onClick={() => setActivationOpen(true)}
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)', boxShadow: '0 4px 14px rgba(109,40,217,0.35)' }}
                      whileHover={{ scale: 1.04, y: -1 } as any}
                      whileTap={{ scale: 0.97 }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      تفعيل حساب طالب سنتر
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* ── Main Form Card ── */}
              <motion.div
  className="mb-4"
                style={{
                  
                }}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.65 }}
              >
                <form onSubmit={handleSubmit} className="space-y-12 mt-10">

<div className="grid md:grid-cols-2 gap-x-12 gap-y-8">

  <div>
    <input
      type="text"
      placeholder="الاسم الأول"
      value={form.firstName}
      onChange={(e) =>
        setForm((p) => ({ ...p, firstName: e.target.value }))
      }
      className={inputClass}
    />
  </div>

  <div>
    <input
      type="text"
      placeholder="الاسم الثاني"
      value={form.secondName}
      onChange={(e) =>
        setForm((p) => ({ ...p, secondName: e.target.value }))
      }
      className={inputClass}
    />
  </div>

  <div>
    <input
      type="text"
      placeholder="الاسم الثالث"
      value={form.thirdName}
      onChange={(e) =>
        setForm((p) => ({ ...p, thirdName: e.target.value }))
      }
      className={inputClass}
    />
  </div>

  <div>
    <input
      type="text"
      placeholder="الاسم الأخير"
      value={form.lastName}
      onChange={(e) =>
        setForm((p) => ({ ...p, lastName: e.target.value }))
      }
      className={inputClass}
    />
  </div>

</div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-lg font-semibold text-slate-600 mb-3">
                        رقم الهاتف
                    </label>
                    <div className="relative">
                      <Phone className="absolute top-1/2 -translate-y-1/2 right-4 w-[18px] h-[18px] text-purple-500" />
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className={`${inputClass} pr-11`}
                        style={{ direction: 'ltr', textAlign: 'right' }}
                        onFocus={e => Object.assign(e.target.style, focusShadow)}
                        onBlur={e => (e.target.style.boxShadow = '')}
                        required
                      />
                    </div>
                    {errors.phone && <p className="text-red-400 text-[11px]">{errors.phone}</p>}
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#475569' }}>
                      البريد الإلكتروني{' '}
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.28)' : '#94A3B8', fontWeight: 400, fontSize: '12px' }}>(اختياري)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute top-1/2 -translate-y-1/2 right-4 w-[18px] h-[18px] text-purple-500" />
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className={`${inputClass} pr-11`}
                        dir="ltr"
                        onFocus={e => Object.assign(e.target.style, focusShadow)}
                        onBlur={e => (e.target.style.boxShadow = '')}
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-[11px]">{errors.email}</p>}
                  </div>

                  {/* Grade + Section */}
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#475569' }}>
                        الصف الدراسي
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute top-1/2 -translate-y-1/2 right-3 w-[17px] h-[17px] text-purple-500 pointer-events-none z-10" />
                        <select
                          value={form.grade}
                          onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                          className={`${inputClass} pr-9 cursor-pointer`}
                          style={{ appearance: 'none', WebkitAppearance: 'none' }}
                          onFocus={e => Object.assign(e.target.style, focusShadow)}
                          onBlur={e => (e.target.style.boxShadow = '')}
                          required
                        >
                          <option value="" style={{ background: isDark ? '#1a1030' : '#fff' }}>اختر الصف</option>
                          {GRADES.map(g => (
                            <option key={g} value={g} style={{ background: isDark ? '#1a1030' : '#fff' }}>{g}</option>
                          ))}
                        </select>
                      </div>
                      {errors.grade && <p className="text-red-400 text-[11px]">{errors.grade}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#475569' }}>
                        الشعبة
                      </label>
                      <div className="relative">
                        <Layers className="absolute top-1/2 -translate-y-1/2 right-3 w-[17px] h-[17px] text-purple-500 pointer-events-none z-10" />
                        <select
                          value={form.section}
                          onChange={e => setForm(p => ({ ...p, section: e.target.value }))}
                          className={`${inputClass} pr-9 cursor-pointer`}
                          style={{ appearance: 'none', WebkitAppearance: 'none' }}
                          onFocus={e => Object.assign(e.target.style, focusShadow)}
                          onBlur={e => (e.target.style.boxShadow = '')}
                          required
                        >
                          <option value="" style={{ background: isDark ? '#1a1030' : '#fff' }}>اختر الشعبة</option>
                          {SECTIONS.map(s => (
                            <option key={s} value={s} style={{ background: isDark ? '#1a1030' : '#fff' }}>{s}</option>
                          ))}
                        </select>
                      </div>
                      {errors.section && <p className="text-red-400 text-[11px]">{errors.section}</p>}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#475569' }}>
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 -translate-y-1/2 right-4 w-[18px] h-[18px] text-purple-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
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
                    {/* Strength bar */}
                    <AnimatePresence>
                      {strength && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div
                            className="h-1.5 rounded-full overflow-hidden mt-1.5"
                            style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: strength.color }}
                              initial={{ width: 0 }}
                              animate={{ width: strength.width }}
                              transition={{ duration: 0.45, ease: 'easeOut' }}
                            />
                          </div>
                          <p className="text-[11px] mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.38)' : '#94A3B8' }}>
                            قوة كلمة المرور:{' '}
                            <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {errors.password && <p className="text-red-400 text-[11px]">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.72)' : '#475569' }}>
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 -translate-y-1/2 right-4 w-[18px] h-[18px] text-purple-500" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className={`${inputClass} pr-11 pl-11`}
                        style={{
                          direction: 'ltr',
                          borderColor: form.confirmPassword && form.password === form.confirmPassword
                            ? '#22c55e' : undefined,
                        }}
                        onFocus={e => Object.assign(e.target.style, focusShadow)}
                        onBlur={e => (e.target.style.boxShadow = '')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute top-1/2 -translate-y-1/2 left-10 transition-colors"
                        style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8' }}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <AnimatePresence>
                        {form.confirmPassword && form.password === form.confirmPassword && (
                          <motion.div
                            className="absolute top-1/2 -translate-y-1/2 left-4"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-[11px]">{errors.confirmPassword}</p>}
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-1.5 disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(135deg, #5B21B6, #7C3AED, #8B5CF6)',
                      boxShadow: '0 6px 24px rgba(109,40,217,0.45)',
                    }}
                    whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري إنشاء الحساب...
                      </>
                    ) : (
                      <>
                        <ChevronLeft className="w-5 h-5" />
                        إنشاء الحساب
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>

              {/* Login prompt */}
              <motion.p
                className="text-center text-sm"
                style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                 onClick={() => navigate("/login")}
                  className="font-bold text-purple-500 hover:text-purple-400 transition-colors"
                >
                  سجل الدخول
                </button>
              </motion.p>
            </div>
          </motion.div>

          {/* ────────────────────── RIGHT: HERO ─────────────────── */}
          <motion.div
  className="w-full lg:w-[46%] order-1 lg:order-2"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  <HeroSection image="/images/register-image.png" />
</motion.div>
        </div>
        <Footer />
      </div>

      <ActivationModal isOpen={activationOpen} onClose={() => setActivationOpen(false)} />
    </>
  );
};

export default RegisterPage;

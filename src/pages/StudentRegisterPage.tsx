import React, { useState } from 'react';
import { Footer } from "../components/layout/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { supabase } from "../lib/supabase";
import {
  Eye, EyeOff, Phone, Lock, User, Mail, BookOpen,
  Layers, ChevronLeft, Loader2, CheckCircle2, MapPin, UserCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import HeroSection from '../components/HeroSection';

const GRADES = [
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
];

const STUDENT_TYPES = [
  { value: "online", label: "طالب أونلاين" },
  { value: "center", label: "طالب سنتر" },
];

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
  'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
  'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
  'شمال سيناء', 'سوهاج',
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    secondName: '',
    thirdName: '',
    lastName: '',
    phone: '',
    parentPhone: '',
    email: '',
    grade: '',
    governorate: '',
    studentType: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'الاسم الأول مطلوب';
    if (!form.secondName.trim()) e.secondName = 'الاسم الثاني مطلوب';
    if (!form.thirdName.trim()) e.thirdName = 'الاسم الثالث مطلوب';
    if (!form.lastName.trim()) e.lastName = 'الاسم الأخير مطلوب';
    if (!form.phone.match(/^(010|011|012|015)\d{8}$/)) e.phone = 'رقم الهاتف غير صحيح';
    if (form.parentPhone && !form.parentPhone.match(/^(010|011|012|015)\d{8}$/)) e.parentPhone = 'رقم هاتف ولي الأمر غير صحيح';
    if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'البريد الإلكتروني غير صحيح';
    if (!form.grade) e.grade = 'يرجى اختيار الصف الدراسي';
    if (!form.governorate) e.governorate = 'يرجى اختيار المحافظة';
    if (!form.studentType) e.studentType = 'يرجى اختيار نوع الطالب';
    if (form.password.length < 8) e.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'كلمتا المرور غير متطابقتين';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) { alert(authError.message); setLoading(false); return; }
      const { error } = await supabase.from("students").insert([{
        auth_id: authData.user?.id,
        full_name: `${form.firstName} ${form.secondName} ${form.thirdName} ${form.lastName}`,
        phone: form.phone,
        parent_phone: form.parentPhone,
        email: form.email,
        grade: form.grade,
        governorate: form.governorate,
        type: form.studentType,
        status: "نشط",
      }]);
      if (error) { console.error("Insert Error:", error); alert(error.message); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إنشاء الحساب");
    }
    setLoading(false);
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

  const fieldIcon = "w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5";

  /* ── Reusable underline input row ── */
  const InputField = ({
    icon: Icon,
    placeholder,
    value,
    onChange,
    type = 'text',
    dir,
    error,
    required = false,
    suffix,
  }: {
    icon: React.ElementType;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    dir?: string;
    error?: string;
    required?: boolean;
    suffix?: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-0.5 w-full">
      <div
        className={`flex items-center gap-2 border-b-2 py-2 transition-colors duration-200
          ${error
            ? 'border-red-400'
            : 'border-gray-200 focus-within:border-orange-400'
          }
          ${isDark ? 'border-gray-700 focus-within:border-orange-400' : ''}
        `}
      >
        <Icon className={fieldIcon} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          dir={dir}
          required={required}
          className={`
            flex-1 min-w-0 bg-transparent border-0 outline-none
            text-sm md:text-base py-0.5
            placeholder-gray-400
            ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700'}
          `}
        />
        {suffix}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-0.5 text-right">{error}</p>
      )}
    </div>
  );

  /* ── Reusable underline select row ── */
  const SelectField = ({
    icon: Icon,
    value,
    onChange,
    error,
    children,
    required = false,
  }: {
    icon: React.ElementType;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <div className="flex flex-col gap-0.5 w-full">
      <div
        className={`flex items-center gap-2 border-b-2 py-2 transition-colors duration-200
          ${error ? 'border-red-400' : 'border-gray-200 focus-within:border-orange-400'}
          ${isDark ? 'border-gray-700 focus-within:border-orange-400' : ''}
        `}
      >
        <Icon className={fieldIcon} />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          style={{ appearance: 'none', WebkitAppearance: 'none' }}
          className={`
            flex-1 min-w-0 bg-transparent border-0 outline-none
            text-sm md:text-base py-0.5 cursor-pointer
            ${isDark ? 'text-white' : value ? 'text-gray-700' : 'text-gray-400'}
          `}
        >
          {children}
        </select>
        <ChevronLeft className="w-4 h-4 text-gray-400 rotate-[-90deg] flex-shrink-0" />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-0.5 text-right">{error}</p>
      )}
    </div>
  );

  /* ══════════════════════════════════════
     SUCCESS SCREEN
  ══════════════════════════════════════ */
  if (success) {
    return (
      <>
        <Navbar />
        <div
          className={`min-h-screen pt-16 flex items-center justify-center px-4
            ${isDark ? 'bg-gray-950' : 'bg-white'}`}
        >
          <motion.div
            className="flex flex-col items-center gap-6 text-center"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          >
            <motion.div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f97316, #fb923c)',
                boxShadow: '0 0 0 12px rgba(249,115,22,0.15), 0 20px 50px rgba(249,115,22,0.4)',
              }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.55, repeat: 3 }}
            >
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
            </motion.div>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black mb-2
                ${isDark ? 'text-white' : 'text-gray-900'}`}>
                تم إنشاء حسابك! 🎉
              </h2>
              <p className={`text-sm sm:text-base
                ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                جاري توجيهك لصفحة تسجيل الدخول...
              </p>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════════
     MAIN PAGE
  ══════════════════════════════════════ */
  return (
    <>
      <Navbar />

      <div className={`min-h-screen pt-[62px] sm:pt-16 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>

        {/* ── Two-column wrapper ── */}
        <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-64px)]">

          {/* ════════════════════════════════
              LEFT — FORM
              Mobile  : full width, below image
              Tablet  : full width, below image
              Desktop : 58% width, left side
          ════════════════════════════════ */}
          <motion.div
            className={`
              w-full lg:w-[58%]
              order-2 lg:order-1
              px-4 sm:px-8 md:px-12 lg:px-14 xl:px-20
              py-6 sm:py-8 lg:py-10
              flex flex-col justify-start
              overflow-y-auto
            `}
            dir="rtl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* inner max-width container */}
            <div className="w-full max-w-xl mx-auto lg:max-w-none">

              {/* ── Title ── */}
              <motion.div
                className="mb-4 sm:mb-5"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-teal-500 flex-shrink-0" />
                  <h1 className={`text-xl sm:text-2xl font-black
                    ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    طلب{' '}
                    <span className="text-orange-500">انشاء حساب</span>
                    {' '}:
                  </h1>
                </div>
                <p className={`text-xs sm:text-sm
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ادخل بياناتك بشكل صحيح وسيتم التواصل معاك في اسرع وقت لتفعيل الحساب !
                </p>
              </motion.div>

              {/* ── "How to create account" button ── */}
              <motion.div
                className="mb-5 sm:mb-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 8 }}
                transition={{ delay: 0.18, duration: 0.45 }}
              >
                <button
                  type="button"
                  className={`
                    bg-orange-500 hover:bg-orange-600 active:scale-95
                    transition-all text-white font-bold
                    text-sm sm:text-base
                    px-5 sm:px-7 py-2.5 sm:py-3
                    rounded-xl shadow-md shadow-orange-200
                    flex items-center gap-2
                  `}
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="leading-snug text-right">
                    طريقة انشاء حساب
                    <span className="font-normal text-xs sm:text-sm opacity-90 block">
                     علي منصه مستر زياد ربيع
                    </span>
                  </span>
                </button>
              </motion.div>

              {/* ── FORM ── */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.5 }}
              >

                {/* Names — row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 lg:gap-x-10 gap-y-4">
                  <InputField
                    icon={User}
                    placeholder="الاسم الأول"
                    value={form.firstName}
                    onChange={v => setForm(p => ({ ...p, firstName: v }))}
                    error={errors.firstName}
                    required
                  />
                  <InputField
                    icon={User}
                    placeholder="الاسم الثاني"
                    value={form.secondName}
                    onChange={v => setForm(p => ({ ...p, secondName: v }))}
                    error={errors.secondName}
                    required
                  />
                </div>

                {/* Names — row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 lg:gap-x-10 gap-y-4">
                  <InputField
                    icon={User}
                    placeholder="الاسم الثالث"
                    value={form.thirdName}
                    onChange={v => setForm(p => ({ ...p, thirdName: v }))}
                    error={errors.thirdName}
                    required
                  />
                  <InputField
                    icon={User}
                    placeholder="الاسم الأخير"
                    value={form.lastName}
                    onChange={v => setForm(p => ({ ...p, lastName: v }))}
                    error={errors.lastName}
                    required
                  />
                </div>

                {/* Phone + Parent Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 lg:gap-x-10 gap-y-4">
                  {/* Student phone */}
                  <div className="flex flex-col gap-1">
                    <InputField
                      icon={Phone}
                      placeholder="رقم الهاتف"
                      value={form.phone}
                      onChange={v => setForm(p => ({ ...p, phone: v }))}
                      type="tel"
                      dir="ltr"
                      error={errors.phone}
                      required
                    />
                    <p className="text-[11px] sm:text-xs text-red-500 font-medium leading-snug mt-0.5 text-right">
                      ✦ من فضلك سجل برقم يكون جاهز لاستقبال المكالمات ورسائل{' '}
                      <strong>الواتساب</strong> والرسائل القصيرة
                    </p>
                  </div>

                  {/* Parent phone */}
                  <div className="flex flex-col gap-1">
                    <InputField
                      icon={Phone}
                      placeholder="رقم هاتف ولي الأمر"
                      value={form.parentPhone}
                      onChange={v => setForm(p => ({ ...p, parentPhone: v }))}
                      type="tel"
                      dir="ltr"
                      error={errors.parentPhone}
                    />
                    <p className="text-[11px] sm:text-xs text-red-500 font-medium leading-snug mt-0.5 text-right">
                      ✦ من فضلك سجل برقم يكون جاهز لاستقبال المكالمات ورسائل{' '}
                      <strong>الواتساب</strong> والرسائل القصيرة
                    </p>
                  </div>
                </div>

                {/* Email */}
                <InputField
                  icon={Mail}
                  placeholder="البريد الإلكتروني"
                  value={form.email}
                  onChange={v => setForm(p => ({ ...p, email: v }))}
                  type="email"
                  dir="ltr"
                  error={errors.email}
                  required
                />

                {/* Governorate */}
                <SelectField
                  icon={MapPin}
                  value={form.governorate}
                  onChange={v => setForm(p => ({ ...p, governorate: v }))}
                  error={errors.governorate}
                  required
                >
                  <option value="">اختر محافظتك</option>
                  {GOVERNORATES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </SelectField>

                {/* Grade */}
                <SelectField
                  icon={BookOpen}
                  value={form.grade}
                  onChange={v => setForm(p => ({ ...p, grade: v }))}
                  error={errors.grade}
                  required
                >
                  <option value="">اختر الصف الدراسي</option>
                  {GRADES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </SelectField>

                {/* Student Type */}
                <SelectField
                  icon={Layers}
                  value={form.studentType}
                  onChange={v => setForm(p => ({ ...p, studentType: v }))}
                  error={errors.studentType}
                  required
                >
                  <option value="">اختر نوع الطالب</option>
                  {STUDENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </SelectField>

                {/* Password + Confirm — side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 lg:gap-x-10 gap-y-4">

                  {/* Password */}
                  <div className="flex flex-col gap-0.5">
                    <div
                      className={`flex items-center gap-2 border-b-2 py-2 transition-colors duration-200
                        ${errors.password
                          ? 'border-red-400'
                          : 'border-gray-200 focus-within:border-orange-400'
                        }
                        ${isDark ? 'border-gray-700 focus-within:border-orange-400' : ''}
                      `}
                    >
                      <Lock className={fieldIcon} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="كلمة السر"
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        dir="ltr"
                        required
                        className={`
                          flex-1 min-w-0 bg-transparent border-0 outline-none
                          text-sm md:text-base py-0.5 placeholder-gray-400
                          ${isDark ? 'text-white' : 'text-gray-700'}
                        `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        {showPassword
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                    </div>

                    {/* Strength bar */}
                    <AnimatePresence>
                      {strength && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1.5"
                        >
                          <div className={`h-1 rounded-full overflow-hidden
                            ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: strength.color }}
                              initial={{ width: 0 }}
                              animate={{ width: strength.width }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            قوة كلمة المرور:{' '}
                            <span style={{ color: strength.color, fontWeight: 700 }}>
                              {strength.label}
                            </span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-0.5 text-right">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-0.5">
                    <div
                      className={`flex items-center gap-2 border-b-2 py-2 transition-colors duration-200
                        ${errors.confirmPassword
                          ? 'border-red-400'
                          : form.confirmPassword && form.password === form.confirmPassword
                            ? 'border-green-400'
                            : 'border-gray-200 focus-within:border-orange-400'
                        }
                        ${isDark ? 'border-gray-700' : ''}
                      `}
                    >
                      <Lock className={fieldIcon} />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="تأكيد كلمة السر"
                        value={form.confirmPassword}
                        onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        dir="ltr"
                        required
                        className={`
                          flex-1 min-w-0 bg-transparent border-0 outline-none
                          text-sm md:text-base py-0.5 placeholder-gray-400
                          ${isDark ? 'text-white' : 'text-gray-700'}
                        `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        {showConfirm
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                      <AnimatePresence>
                        {form.confirmPassword && form.password === form.confirmPassword && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="flex-shrink-0"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-0.5 text-right">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full py-3 sm:py-3.5
                    rounded-xl text-white font-bold
                    text-sm sm:text-base
                    flex items-center justify-center gap-2
                    mt-1 disabled:opacity-70
                    shadow-lg shadow-teal-100
                    transition-colors
                  `}
                  style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}
                  whileHover={!loading ? { scale: 1.012, y: -1 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    'طلب انشاء حساب !'
                  )}
                </motion.button>
              </motion.form>

              {/* Login prompt */}
              <motion.p
                className={`text-center text-xs sm:text-sm mt-4 sm:mt-5
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                يوجد لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-bold text-orange-500 hover:text-orange-400 transition-colors"
                >
                  ادخل إلى حسابك الآن !
                </button>
              </motion.p>

              {/* bottom breathing room */}
              <div className="h-8 sm:h-12" />
            </div>
          </motion.div>

          {/* ════════════════════════════════
              RIGHT — HERO IMAGE
              Mobile  : hidden (form is enough)
              Tablet  : hidden
              Desktop : 42% width, sticky, full height
          ════════════════════════════════ */}
          <motion.div
            className={`
              hidden lg:block
              lg:w-[42%]
              order-1 lg:order-2
              sticky top-16
              self-start
              h-[calc(100vh-64px)]
              overflow-hidden
            `}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* HeroSection fills the column completely */}
            <div className="w-full h-full">
              <HeroSection image="/images/register-image.png" />
            </div>
          </motion.div>

        </div>

        <Footer />
      </div>
    </>
  );
};

export default RegisterPage;
import React, { useState } from 'react';
import { Footer } from "../../components/layout/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { supabase } from "../../lib/supabase";
import {
  Eye, EyeOff, Phone, Lock, User, Mail, BookOpen,
  Layers, ChevronLeft, Loader2, CheckCircle2, MapPin, UserCheck, X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import HeroSection from '../../components/shared/HeroSection';

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



 /* ── Reusable underline input row ── */
  const InputField = ({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
  dir,
  error,
  required = false,
  suffix,
  isDark,
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
  isDark: boolean;
}) => {
  const [flashId, setFlashId] = useState(0);
  const [showFlash, setShowFlash] = useState(false);

  const handleFocus = () => {
    setFlashId((id) => id + 1);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);
  };

  return (
    <div className="flex flex-col gap-0.5 w-full">
      <div
        className={`relative overflow-hidden flex items-center gap-2 border-b-2 py-2 transition-colors duration-200
          ${
            error
              ? "border-red-400"
              : "border-gray-200 focus-within:border-[#B348FE]"
          }
          ${isDark ? "border-gray-700 focus-within:border-[#B348FE]" : ""}
        `}
      >
        <AnimatePresence>
          {showFlash && (
            <motion.div
              key={flashId}
              className="absolute inset-0 bg-[#B348FE]/20 pointer-events-none"
              style={{ transformOrigin: "right" }}
              initial={{ opacity: 0.6, scaleX: 0 }}
              animate={{ opacity: 0, scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <Icon className="w-4 h-4 text-[#B348FE] flex-shrink-0 relative z-10" />

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          dir={dir}
          required={required}
          className={`
            relative z-10
            flex-1 min-w-0 bg-transparent border-0 outline-none
            text-sm md:text-base py-0.5
            placeholder-gray-400
            ${isDark ? "text-white placeholder-gray-500" : "text-gray-700"}
          `}
        />

        {suffix}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-0.5 text-right">
          {error}
        </p>
      )}
    </div>
  );
};

  /* ── Reusable underline select row (custom dropdown) ── */
  const SelectField = ({
  icon: Icon,
  value,
  onChange,
  error,
  children,
  required = false,
  isDark,
}: {
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  isDark: boolean;
}) => {
    const [flashId, setFlashId] = useState(0);
    const [showFlash, setShowFlash] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    const optionList = React.Children.toArray(children).map((opt: any) => ({
      value: opt.props.value,
      label: opt.props.children,
    }));

    const filteredOptions = optionList.filter(opt =>
      String(opt.label).toLowerCase().includes(search.toLowerCase())
    );

    const selectedLabel = optionList.find(opt => opt.value === value)?.label || '';

    const handleFocus = () => {
      setFlashId((id) => id + 1);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 500);
    };

    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearch('');
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
    <div className="flex flex-col gap-0.5 w-full relative" ref={containerRef}>
      <div
        onClick={() => { setIsOpen(o => !o); handleFocus(); }}
        className={`relative overflow-hidden flex items-center gap-2 border-b-2 py-2 transition-colors duration-200 cursor-pointer
          ${error ? 'border-red-400' : 'border-gray-200 focus-within:border-[#B348FE]'}
          ${isDark ? 'border-gray-700 focus-within:border-[#B348FE]' : ''}
          ${isOpen ? 'border-[#B348FE]' : ''}
        `}
      >
        <AnimatePresence>
          {showFlash && (
            <motion.div
              key={flashId}
              className="absolute inset-0 bg-[#B348FE]/20 pointer-events-none"
              style={{ transformOrigin: "right" }}
              initial={{ opacity: 0.6, scaleX: 0 }}
              animate={{ opacity: 0, scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        <Icon className="w-4 h-4 text-[#B348FE] flex-shrink-0 relative z-10" />
        <span
          className={`
            relative z-10
            flex-1 min-w-0 text-sm md:text-base py-0.5 text-right truncate
            ${isDark ? (value ? 'text-white' : 'text-gray-500') : value ? 'text-gray-700' : 'text-gray-400'}
          `}
        >
          {selectedLabel || 'اختر من القائمة'}
        </span>
        <ChevronLeft
          className={`w-4 h-4 text-gray-400 flex-shrink-0 relative z-10 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : 'rotate-[-90deg]'
          }`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute top-full right-0 left-0 mt-2 z-50
              rounded-2xl overflow-hidden shadow-2xl border
              ${isDark ? 'bg-[#151515] border-gray-700' : 'bg-white border-gray-200'}
            `}
          >
            <div className={`px-4 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث..."
                className={`
                  w-full bg-transparent outline-none text-sm text-right
                  ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}
                `}
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredOptions.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">لا توجد نتائج</div>
              )}
              {filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`
                    px-4 py-3 text-sm md:text-base text-right cursor-pointer transition-colors duration-150
                    ${
                      opt.value === value
                        ? 'bg-[#111827] text-white font-bold'
                        : isDark
                          ? 'text-gray-200 hover:bg-gray-800'
                          : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-red-500 mt-0.5 text-right">{error}</p>
      )}
    </div>
    );
  };

  
const RegisterPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [passwordFlashId, setPasswordFlashId] = useState(0);
  const [showPasswordFlash, setShowPasswordFlash] = useState(false);
  const [confirmFlashId, setConfirmFlashId] = useState(0);
  const [showConfirmFlash, setShowConfirmFlash] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ id: Date.now(), message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };
  const [form, setForm] = useState({
    firstName: '',
    secondName: '',
    thirdName: '',
    lastName: '',
    phone: '',
    parentPhone: '',
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
 if (!form.parentPhone.trim()) {
      e.parentPhone = 'رقم هاتف ولي الأمر مطلوب';
    } else if (!form.parentPhone.match(/^(010|011|012|015)\d{8}$/)) {
            e.parentPhone = 'رقم هاتف ولي الأمر غير صحيح';
    } else if (form.parentPhone && form.parentPhone.trim() === form.phone.trim()) {
      e.parentPhone = 'رقم هاتف ولي الأمر لازم يكون مختلف عن رقم هاتفك';
    }    if (!form.grade) e.grade = 'يرجى اختيار الصف الدراسي';
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

    const phone = form.phone.trim();

   try {
      // التحقق أولاً هل مسموح بمحاولة تسجيل جديدة من نفس الرقم
      const { data: allowed, error: allowedError } = await supabase.rpc(
        "check_register_allowed",
        { p_identifier: phone }
      );

      if (allowedError) {
        console.error("REGISTER RATE LIMIT CHECK ERROR:", allowedError);
      }

      if (allowed === false) {
        showToast("تم إيقاف إنشاء الحسابات مؤقتًا من هذا الرقم بسبب محاولات كثيرة، حاول بعد 30 دقيقة");
        setLoading(false);
        return;
      }

      // نسجل المحاولة قبل ما نكمل (بغض النظر عن النتيجة، عشان نمنع السبام حتى لو فشل كل مرة)
    await supabase.rpc("record_register_attempt", { p_identifier: phone });

      // تحقق مسبق إن رقم الهاتف مش مسجل قبل كده
      const { data: existingStudent } = await supabase
        .from("students")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

      if (existingStudent) {
        showToast("رقم الهاتف ده مسجل بحساب موجود بالفعل، جرب تدخل على حسابك أو استخدم رقم تاني");
        setLoading(false);
        return;
      }

      const finalEmail = `${phone}@students.yourdomain.com`;

const { data: authData, error: authError } =
  await supabase.auth.signUp({
    email: finalEmail,
    password: form.password,
    options: {
      data: {
        full_name: `${form.firstName} ${form.secondName} ${form.thirdName} ${form.lastName}`,
      },
    },
  });

if (authError) throw authError;

if (!authData.user) {
  throw new Error("لم يتم إنشاء المستخدم");
}

      const { error: insertError } = await supabase.from("students").insert([{
        auth_id: authData.user.id,
        full_name: `${form.firstName} ${form.secondName} ${form.thirdName} ${form.lastName}`,
        phone: form.phone,
        parent_phone: form.parentPhone,
        email: finalEmail,
                grade: form.grade,
        governorate: form.governorate,
        type: form.studentType,
        status: "نشط",
        is_activated: true,

subscription_status: "غير مشترك",

attendance_percentage: 0,

watched_lessons: 0,
total_lessons: 0,

completed_homework: 0,
total_homework: 0,
      }]);
if (insertError) {
  console.error("INSERT ERROR:", insertError);

  if (insertError.message?.includes("students_phone_key")) {
    showToast("رقم الهاتف ده مسجل بحساب موجود بالفعل، جرب تدخل على حسابك أو استخدم رقم تاني");
  } else {
    showToast("حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى");
  }

  // امسح جلسة الـ Auth اللي اتعملت عشان منسيبش حساب يتيم من غير صف طالب
  await supabase.auth.signOut();
  setLoading(false);
  return;
}await supabase.auth.signOut();
      setSuccess(true);
    } catch (err: any) {
  console.error(err);

   if (err.message?.includes("already registered")) {
    showToast("رقم الهاتف ده مسجل بحساب موجود بالفعل، جرب تدخل على حسابك أو استخدم رقم تاني");
  } else {
    showToast(err.message || "حدث خطأ أثناء إنشاء الحساب");
  }
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

 
  /* ══════════════════════════════════════
     SUCCESS SCREEN
  ══════════════════════════════════════ */
  if (success) {
    return (
      <>
        <Navbar />
        {toast && (
          <div
            key={toast.id}
            className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[100] w-[92%] sm:w-full max-w-sm bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden animate-in slide-in-from-top-3 fade-in duration-300"
          >
            <div className="flex items-start justify-between gap-3 px-4 py-3">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 text-right flex-1">
                {toast.message}
              </p>
              <button
                onClick={() => setToast(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="h-1 w-full bg-gray-100 dark:bg-[#2A2A2A] overflow-hidden">
              <div
                key={toast.id}
                className="h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-pink-500"
                style={{
                  animation: "toast-shrink 4s linear forwards",
                }}
              />
            </div>
          </div>
        )}

        <style>{`
          @keyframes toast-shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>

        <div
          className={`min-h-screen pt-16 flex items-center justify-center px-4
            bg-white dark:bg-[#09090B]`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`
              w-full max-w-md rounded-[30px] p-8 text-center
              ${isDark ? "bg-[#111111] border border-[#2A2A2A]" : "bg-white border border-gray-200"}
              shadow-[0_25px_70px_rgba(15,23,42,.15)]
            `}
            dir="rtl"
          >
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#22c55e"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.path
                  d="M25 41 L35 51 L56 29"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                />
              </svg>
            </div>

            <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
              تم إنشاء حسابك بنجاح !
            </h2>
            <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              اضغط حسنًا للإستمرار
            </p>

            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="
                mt-6 w-full py-3 rounded-xl
                bg-[#B348FE] hover:bg-[#9E2FFF]
                text-white font-black
                transition-colors
              "
            >
              حسنًا
            </button>
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

      {toast && (
        <div
          key={toast.id}
          className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[100] w-[92%] sm:w-full max-w-sm bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden animate-in slide-in-from-top-3 fade-in duration-300"
        >
          <div className="flex items-start justify-between gap-3 px-4 py-3">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 text-right flex-1">
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-1 w-full bg-gray-100 dark:bg-[#2A2A2A] overflow-hidden">
            <div
              key={toast.id}
              className="h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-pink-500"
              style={{
                animation: "toast-shrink 4s linear forwards",
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div
  className={`
    min-h-screen
pt-20
sm:pt-24
lg:pt-24
xl:pt-24
    bg-white dark:bg-[#09090B]
  `}
>

        {/* ── Two-column wrapper ── */}
        <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-64px)]">


 {/* ════════════════════════════════
              RIGHT — HERO IMAGE
              Mobile  : hidden (form is enough)
              Tablet  : hidden
              Desktop : 42% width, sticky, full height
          ════════════════════════════════ */}
          <motion.div
  className="
    hidden
    lg:block
    lg:w-[42%]
    overflow-hidden
  "
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  <div className="w-full h-full">
    <HeroSection image="/images/register-image.png" />
  </div>
</motion.div>

          {/* ════════════════════════════════
              LEFT — FORM
              Mobile  : full width, below image
              Tablet  : full width, below image
              Desktop : 58% width, left side
          ════════════════════════════════ */}
          <motion.div
            className={`
              w-full lg:w-[58%]
              order-2 lg:order-2
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
                  <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#B348FE] flex-shrink-0" />
<h1
  className={`
    text-xl
    sm:text-2xl
    font-black
    ${isDark ? "text-white" : "text-gray-900"}
  `}
>
  <span className={isDark ? "text-white" : "text-gray-900"}>
    إنشاء
  </span>{" "}
  <span className="text-[#B348FE]">
    حساب
  </span>
  {" :"}
</h1>
                </div>
                <p className={`text-xs sm:text-sm
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ادخل بياناتك بشكل صحيح لسهولة التواصل معاك 
                </p>
              </motion.div>

              {/* ── زرار: شرح كيفية إنشاء حساب (فيديو يوتيوب) ── */}
              <motion.a
                href="https://youtu.be/tHmKJQjkcXI"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center justify-center gap-2
                  w-full
                  py-2.5 sm:py-3
                  rounded-xl
                  border-2 border-[#B348FE]
                  text-[#B348FE]
                  font-black
                  text-sm sm:text-base
                  hover:bg-[#B348FE] hover:text-white
                  transition-all duration-300
                  mb-4 sm:mb-5
                `}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.391.569A2.994 2.994 0 0 0 .502 6.186 31.02 31.02 0 0 0 0 12a31.02 31.02 0 0 0 .502 5.814 2.994 2.994 0 0 0 2.107 2.117C4.495 20.5 12 20.5 12 20.5s7.505 0 9.391-.569a2.994 2.994 0 0 0 2.107-2.117A31.02 31.02 0 0 0 24 12a31.02 31.02 0 0 0-.502-5.814ZM9.75 15.568V8.432L15.818 12 9.75 15.568Z" />
                </svg>
                شاهد كيفية إنشاء حساب على المنصة
              </motion.a>

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
                    isDark={isDark}
                    icon={User}
                    placeholder="الاسم الأول"
                    value={form.firstName}
                    onChange={v => setForm(p => ({ ...p, firstName: v }))}
                    error={errors.firstName}
                    required
                  />
                  <InputField
                    isDark={isDark}
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
                    isDark={isDark}
                    icon={User}
                    placeholder="الاسم الثالث"
                    value={form.thirdName}
                    onChange={v => setForm(p => ({ ...p, thirdName: v }))}
                    error={errors.thirdName}
                    required
                  />
                  <InputField
                    isDark={isDark}
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
                      isDark={isDark}
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
                      isDark={isDark}
                    required
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

                {/* Governorate */}
                <SelectField
                  isDark={isDark}
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
                  isDark={isDark}
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
                  isDark={isDark}
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
                      className={`relative overflow-hidden flex items-center gap-2 border-b-2 py-2 transition-colors duration-200
                        ${errors.password
                          ? 'border-red-400'
                          : 'border-gray-200 focus-within:border-[#B348FE]'
                        }
                        ${isDark ? 'border-gray-700 focus-within:border-[#B348FE]' : ''}
                      `}
                    >
                      <AnimatePresence>
                        {showPasswordFlash && (
                          <motion.div
                            key={passwordFlashId}
                            className="absolute inset-0 bg-[#B348FE]/20 pointer-events-none"
                            style={{ transformOrigin: "right" }}
                            initial={{ opacity: 0.6, scaleX: 0 }}
                            animate={{ opacity: 0, scaleX: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        )}
                      </AnimatePresence>
                      <Lock className="w-4 h-4 text-[#B348FE] flex-shrink-0 relative z-10" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="كلمة السر"
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        onFocus={() => {
                          setPasswordFlashId((id) => id + 1);
                          setShowPasswordFlash(true);
                          setTimeout(() => setShowPasswordFlash(false), 500);
                        }}
                        dir="ltr"
                        required
                        className={`
                          relative z-10
                          flex-1 min-w-0 bg-transparent border-0 outline-none
                          text-sm md:text-base py-0.5 placeholder-gray-400
                          ${isDark ? 'text-white' : 'text-gray-700'}
                        `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="relative z-10 text-gray-400 hover:text-gray-600 flex-shrink-0"
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
                      className={`relative overflow-hidden flex items-center gap-2 border-b-2 py-2 transition-colors duration-200
                        ${errors.confirmPassword
                          ? 'border-red-400'
                          : form.confirmPassword && form.password === form.confirmPassword
                            ? 'border-green-400'
                            : 'border-gray-200 focus-within:border-[#B348FE]'
                        }
                        ${isDark ? 'border-gray-700' : ''}
                      `}
                    >
                      <AnimatePresence>
                        {showConfirmFlash && (
                          <motion.div
                            key={confirmFlashId}
                            className="absolute inset-0 bg-[#B348FE]/20 pointer-events-none"
                            style={{ transformOrigin: "right" }}
                            initial={{ opacity: 0.6, scaleX: 0 }}
                            animate={{ opacity: 0, scaleX: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        )}
                      </AnimatePresence>
                      <Lock className="w-4 h-4 text-[#B348FE] flex-shrink-0 relative z-10" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="تأكيد كلمة السر"
                        value={form.confirmPassword}
                        onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        onFocus={() => {
                          setConfirmFlashId((id) => id + 1);
                          setShowConfirmFlash(true);
                          setTimeout(() => setShowConfirmFlash(false), 500);
                        }}
                        dir="ltr"
                        required
                        className={`
                          relative z-10
                          flex-1 min-w-0 bg-transparent border-0 outline-none
                          text-sm md:text-base py-0.5 placeholder-gray-400
                          ${isDark ? 'text-white' : 'text-gray-700'}
                        `}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="relative z-10 text-gray-400 hover:text-gray-600 flex-shrink-0"
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
                            className="relative z-10 flex-shrink-0"
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
  className="
    w-full
    py-3 sm:py-3.5
    rounded-xl
bg-[#B348FE]
hover:bg-[#9E2FFF]
    text-white
    font-black
    text-sm sm:text-base
    flex items-center justify-center gap-2
    mt-1
    disabled:opacity-70
    transition-all
    duration-300
  "
  whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
  whileTap={!loading ? { scale: 0.98 } : {}}
>
  {loading ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      جاري إنشاء الحساب...
    </>
  ) : (
    " إنشاء حساب"
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
                  className="font-bold text-[#B348FE]
hover:text-[#9E2FFF] transition-colors"
                >
                  ادخل إلى حسابك الآن !
                </button>
              </motion.p>

              {/* bottom breathing room */}
              <div className="h-8 sm:h-12" />
            </div>
          </motion.div>

         

        </div>

        <Footer />
      </div>
    </>
  );
};

export default RegisterPage;
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
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

function parseDeviceInfo() {
  const ua = navigator.userAgent;

  let deviceType = "Desktop";
  if (/Mobi|Android/i.test(ua) && !/Tablet|iPad/i.test(ua)) deviceType = "Mobile";
  else if (/Tablet|iPad/i.test(ua)) deviceType = "Tablet";

  let os = "Unknown";
  if (/Windows NT 10/i.test(ua)) os = "Windows 10/11";
  else if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) {
    const m = ua.match(/Android\s([0-9.]+)/);
    os = m ? `Android ${m[1]}` : "Android";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    const m = ua.match(/OS\s([0-9_]+)/);
    os = m ? `iOS ${m[1].replace(/_/g, ".")}` : "iOS";
  } else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Unknown";
  if (/Edg\//i.test(ua)) {
    const m = ua.match(/Edg\/([0-9.]+)/);
    browser = m ? `Edge ${m[1].split(".")[0]}` : "Edge";
  } else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
    const m = ua.match(/Chrome\/([0-9.]+)/);
    browser = m ? `Chrome ${m[1].split(".")[0]}` : "Chrome";
  } else if (/Firefox\//i.test(ua)) {
    const m = ua.match(/Firefox\/([0-9.]+)/);
    browser = m ? `Firefox ${m[1].split(".")[0]}` : "Firefox";
  } else if (/Safari\//i.test(ua) && /Version\//i.test(ua)) {
    const m = ua.match(/Version\/([0-9.]+)/);
    browser = m ? `Safari ${m[1].split(".")[0]}` : "Safari";
  }

  let deviceName = "";
  const modelMatch = ua.match(/\(([^)]+)\)/);
  if (deviceType === "Mobile" || deviceType === "Tablet") {
    const androidModel = ua.match(/;\s([A-Za-z0-9\- ]+)\sBuild\//);
    if (androidModel) deviceName = androidModel[1].trim();
    else if (/iPhone/i.test(ua)) deviceName = "iPhone";
    else if (/iPad/i.test(ua)) deviceName = "iPad";
  }

  return {
    device_type: deviceType,
    device_name: deviceName || null,
    os,
    browser,
    user_agent: ua,
  };
}


const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const { isDark } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginForm, setLoginForm] = useState({
  phone: "",
  password: "",
});
const [errors, setErrors] = useState<{
  phone?: string;
  password?: string;
}>({});

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
const fieldIcon =
"w-4 h-4 text-[#B348FE] flex-shrink-0";

  const [phoneFlashId, setPhoneFlashId] = useState(0);
  const [showPhoneFlash, setShowPhoneFlash] = useState(false);
  const [passwordFlashId, setPasswordFlashId] = useState(0);
  const [showPasswordFlash, setShowPasswordFlash] = useState(false);

  const triggerFlash = (
    setId: React.Dispatch<React.SetStateAction<number>>,
    setShow: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setId((id) => id + 1);
    setShow(true);
    setTimeout(() => setShow(false), 500);
  };

  const validate = () => {
    const e: {
  phone?: string;
  password?: string;
} = {};
    if (!loginForm.phone.trim())
  e.phone = "رقم الهاتف مطلوب";

else if (
  !/^01[0125][0-9]{8}$/.test(loginForm.phone)
)
  e.phone = "رقم الهاتف غير صحيح";
    if (!loginForm.password) e.password = 'كلمة المرور مطلوبة';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleForgotPassword = async () => {
    setForgotError("");

    if (!/^01[0125][0-9]{8}$/.test(forgotPhone.trim())) {
      setForgotError("رقم الهاتف غير صحيح");
      return;
    }

    setForgotLoading(true);

const { data: email, error: phoneError } = await supabase
      .rpc("get_email_by_phone", { p_phone: forgotPhone.trim() });

    if (phoneError || !email) {
      setForgotError("رقم الهاتف غير مسجل");
      setForgotLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: "https://www.zeyadrabie.com/reset-password",
      }
    );

    if (resetError) {
      setForgotError("حدث خطأ أثناء إرسال الرابط، حاول مرة أخرى");
      setForgotLoading(false);
      return;
    }

    setForgotSuccess(true);
    setForgotLoading(false);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
const phone = loginForm.phone.trim();

// التحقق أولاً هل الرقم محظور مؤقتًا بسبب محاولات فاشلة كتيرة
const { data: allowed, error: allowedError } = await supabase.rpc(
  "check_login_allowed",
  { p_phone: phone }
);

if (allowedError) {
  console.error("RATE LIMIT CHECK ERROR:", allowedError);
}

if (allowed === false) {
  setErrors({
    password: "تم إيقاف الدخول مؤقتًا بسبب محاولات كثيرة خاطئة، حاول بعد 15 دقيقة",
  });
  setLoading(false);
  return;
}

// البحث عن الإيميل المرتبط برقم الهاتف (عن طريق دالة آمنة)
const { data: email, error: phoneError } = await supabase
  .rpc("get_email_by_phone", { p_phone: phone });

if (phoneError || !email) {
  await supabase.rpc("record_failed_login", { p_phone: phone });

  setErrors({
    phone: "رقم الهاتف غير مسجل",
  });

  setLoading(false);
  return;
}

// تسجيل الدخول باستخدام الإيميل
const { data: authData, error: authError } =
  await supabase.auth.signInWithPassword({
    email,
    password: loginForm.password,
  });

if (authError) {

  await supabase.rpc("record_failed_login", { p_phone: phone });

  setErrors({
    password: "رقم الهاتف أو كلمة المرور غير صحيحة",
  });

  setLoading(false);
  return;
}

// دلوقتي عندنا جلسة Auth حقيقية، نقدر نجيب بيانات الطالب
const { data: student, error: studentError } = await supabase
  .from("students")
  .select("*")
  .eq("auth_id", authData.user.id)
  .single();

if (studentError || !student) {
  await supabase.auth.signOut();

  setErrors({
    phone: "بيانات الطالب غير موجودة",
  });

  setLoading(false);
  return;
}

if (student.status !== "نشط") {
  await supabase.auth.signOut();

  setErrors({
    phone: "الحساب لم يتم تفعيله بعد.",
  });

  setLoading(false);
  return;
}

// نسجل جلسة جديدة — ده هيطرد أي جهاز تاني تلقائيًا (جهاز واحد بس مسموح)
const sessionToken = crypto.randomUUID();

const { error: sessionError } = await supabase.rpc("start_single_session", {
  p_session_token: sessionToken,
});

if (sessionError) {
  console.error("START SESSION ERROR:", sessionError);
  setErrors({ password: "حدث خطأ أثناء تسجيل الدخول" });
  setLoading(false);
  return;
}

localStorage.setItem("session_token", sessionToken);

await supabase.rpc("reset_login_attempts", { p_phone: phone });

try {
  const deviceInfo = parseDeviceInfo();
  await supabase.from("student_login_sessions").insert({
    student_id: student.id,
    device_type: deviceInfo.device_type,
    device_name: deviceInfo.device_name,
    os: deviceInfo.os,
    browser: deviceInfo.browser,
    user_agent: deviceInfo.user_agent,
    last_activity_at: new Date().toISOString(),
  });

  await supabase
    .from("students")
    .update({
      last_login: new Date().toISOString(),
      device_name: `${deviceInfo.device_type} - ${deviceInfo.browser}`,
    })
    .eq("id", student.id);
} catch (sessionErr) {}

login({
  id: authData.user.id,
  studentId: student.id,
  name: student.full_name,
  role: "student",
  grade: student.grade,
  phone: student.phone,
  governorate: student.governorate,
  avatar_url: student.avatar_url,
});

setSuccess(true);
setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      console.error(err);

setErrors({
  password:
    err.message || "حدث خطأ أثناء تسجيل الدخول",
});
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div
  className={`
    min-h-screen
    pt-[62px]
    sm:pt-16
    bg-white
    dark:bg-[#09090B]
  `}
>

        {/* ── outer flex wrapper ── */}
        <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-64px)]">


  {/* ══════════════════════════════════════════
              HERO IMAGE COLUMN
              • phone  : hidden
              • tablet : hidden
              • desktop: 42 % right, sticky full height
          ══════════════════════════════════════════ */}
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
              <HeroSection image="/images/login-image.png" />
            </div>
          </motion.div>


          {/* ══════════════════════════════════════════
              FORM COLUMN
              • phone  : full width, order 1 (top)
              • tablet : full width, order 1 (top)
              • desktop: 58 % left, order 1
          ══════════════════════════════════════════ */}
          <motion.div
            className="
              w-full lg:w-[58%]
              order-2
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
                 <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-[#B348FE]" />
                  <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    تسجيل{' '}
                   <span className="text-[#B348FE]">الدخول</span>
                    {' '}:
                  </h1>
                </div>
                <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ادخل إلى حسابك باستخدام رقم الهاتف وكلمة المرور.
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

                {/* ── Phone ── */}
                <div className="flex flex-col gap-1">
                  <div
                    className={`
                      relative overflow-hidden
                      flex items-center gap-3
                      border-b-2 py-2.5
                      transition-colors duration-200
                      ${errors.phone
                        ? 'border-red-400'
                        : isDark
                          ? 'border-gray-700 focus-within:border-[#B348FE]'
                          : 'border-gray-200 focus-within:border-[#B348FE]'
                      }
                    `}
                  >
                    <AnimatePresence>
                      {showPhoneFlash && (
                        <motion.div
                          key={phoneFlashId}
                          className="absolute inset-0 bg-[#B348FE]/5 pointer-events-none"
                          style={{ transformOrigin: "right" }}
                          initial={{ opacity: 0.35, scaleX: 0 }}
                          animate={{ opacity: 0, scaleX: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.45, ease: "easeOut" }}
                        />
                      )}
                    </AnimatePresence>
                    <Phone className={`${fieldIcon} relative z-10`} />
                    <input
                     type="tel"
                      placeholder="رقم الهاتف"
                      value={loginForm.phone}
                      onChange={e => {
                        setLoginForm(p => ({ ...p, phone: e.target.value }));
                        setErrors(p => ({ ...p, phone: undefined }));
                      }}
                      onFocus={() => triggerFlash(setPhoneFlashId, setShowPhoneFlash)}
                      dir="ltr"
                      required
                      className={`
                        relative z-10
                        flex-1 min-w-0 bg-transparent border-0 outline-none
                        text-sm sm:text-base py-0.5
                        placeholder-gray-400
                        ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700'}
                      `}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 text-right">{errors.phone}</p>
                  )}
                </div>

                {/* ── Password ── */}
                <div className="flex flex-col gap-1">
                  <div
                    className={`
                      relative overflow-hidden
                      flex items-center gap-3
                      border-b-2 py-2.5
                      transition-colors duration-200
                      ${errors.password
                        ? 'border-red-400'
                        : isDark
                          ? 'border-gray-700 focus-within:border-[#B348FE]'
                          : 'border-gray-200 focus-within:border-[#B348FE]'
                      }
                    `}
                  >
                    <AnimatePresence>
                      {showPasswordFlash && (
                        <motion.div
                          key={passwordFlashId}
                          className="absolute inset-0 bg-[#B348FE]/5 pointer-events-none"
                          style={{ transformOrigin: "right" }}
                          initial={{ opacity: 0.35, scaleX: 0 }}
                          animate={{ opacity: 0, scaleX: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.45, ease: "easeOut" }}
                        />
                      )}
                    </AnimatePresence>
                    <Lock className={`${fieldIcon} relative z-10`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="كلمة السر"
                      value={loginForm.password}
                      onChange={e => {
                        setLoginForm(p => ({ ...p, password: e.target.value }));
                        setErrors(p => ({ ...p, password: undefined }));
                      }}
                      onFocus={() => triggerFlash(setPasswordFlashId, setShowPasswordFlash)}
                      dir="ltr"
                      required
                      className={`
                        relative z-10
                        flex-1 min-w-0 bg-transparent border-0 outline-none
                        text-sm sm:text-base py-0.5
                        placeholder-gray-400
                        ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700'}
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="relative z-10 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
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
                          ? 'bg-[#B348FE]'
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
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotPhone("");
                      setForgotError("");
                      setForgotSuccess(false);
                    }}
                    className="text-xs sm:text-sm font-semibold text-[#B348FE]
hover:text-[#9E2FFF] transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                {/* ── Submit ── */}
                <motion.button
                  type="submit"
                  disabled={loading || success}
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
disabled:opacity-70
transition-all
duration-300
"
                  
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
                  className="font-bold text-[#B348FE]
hover:text-[#9E2FFF]
 transition-colors"
                >
                  أنشئ حسابك الآن !
                </button>
              </motion.p>

            </div>
          </motion.div>

        
        </div>


        {/* ═══════════════ FORGOT PASSWORD MODAL ═══════════════ */}
        <AnimatePresence>
          {showForgotModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
              onClick={() => setShowForgotModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className={`
                  w-full max-w-md rounded-[30px] p-8
                  ${isDark ? "bg-[#111111] border border-[#2A2A2A]" : "bg-white border border-gray-200"}
                  shadow-[0_25px_70px_rgba(15,23,42,.15)]
                `}
                dir="rtl"
              >
<div className="text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6EEFF] dark:bg-[#2B103D]">
                    <Lock size={32} className="text-[#B348FE]" />
                  </div>
                  <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                    نسيت كلمة المرور؟
                  </h2>
                  <p className={`mt-3 text-sm leading-7 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    تواصل مع فريق الدعم الفني عبر واتساب وسنقوم بمساعدتك
                    في استعادة الدخول لحسابك في أسرع وقت.
                  </p>

                  <a
                    href="https://wa.me/201109414585?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D9%86%D8%B3%D9%8A%D8%AA%20%D9%83%D9%84%D9%85%D8%A9%20%D8%A7%D9%84%D9%85%D8%B1%D9%88%D8%B1%20%D9%88%D8%A7%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9%20%D9%81%D9%8A%20%D8%A7%D8%B3%D8%AA%D8%B9%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D8%AF%D8%AE%D9%88%D9%84"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      mt-6 w-full py-3 rounded-xl
                      bg-emerald-500 hover:bg-emerald-600
                      text-white font-black
                      flex items-center justify-center gap-2
                      transition-colors
                    "
                  >
                    <FaWhatsapp className="text-xl" />
                    تواصل عبر واتساب
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className={`mt-3 w-full py-2 text-sm font-semibold ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors`}
                  >
                    إغلاق
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </>
  );
};

export default LoginPage;
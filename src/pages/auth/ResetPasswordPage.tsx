import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [checkingSession, setCheckingSession] = useState(true);
  const [validSession, setValidSession] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    // Supabase تتعامل مع التوكن اللي في اللينك تلقائيًا
    // وتنشئ session مؤقتة لو اللينك صحيح وسليم
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setValidSession(true);
      } else {
        setValidSession(false);
      }
      setCheckingSession(false);
    });
  }, []);

  const passwordStrength = () => {
    const p = password;
    if (!p) return null;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { label: "ضعيفة", color: "#ef4444", width: "25%" };
    if (s === 2) return { label: "متوسطة", color: "#f59e0b", width: "55%" };
    if (s === 3) return { label: "جيدة", color: "#3b82f6", width: "75%" };
    return { label: "قوية جداً", color: "#22c55e", width: "100%" };
  };

  const strength = passwordStrength();

  const validate = () => {
    const e: { password?: string; confirm?: string } = {};
    if (password.length < 8) e.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    if (password !== confirmPassword) e.confirm = "كلمتا المرور غير متطابقتين";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setServerError("حدث خطأ أثناء تحديث كلمة المرور، حاول مرة أخرى");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
  };

  return (
    <>
      <Navbar />

      <div
        className={`min-h-screen pt-16 flex items-center justify-center px-4 bg-white dark:bg-[#09090B]`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`
            w-full max-w-md rounded-[30px] p-8 my-10
            ${isDark ? "bg-[#111111] border border-[#2A2A2A]" : "bg-white border border-gray-200"}
            shadow-[0_25px_70px_rgba(15,23,42,.12)]
          `}
          dir="rtl"
        >
          {/* ── جاري التحقق من اللينك ── */}
          {checkingSession && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 className="w-8 h-8 text-[#B348FE] animate-spin" />
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                جاري التحقق من الرابط...
              </p>
            </div>
          )}

          {/* ── اللينك غير صالح أو منتهي ── */}
          {!checkingSession && !validSession && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                <XCircle size={36} className="text-red-500" />
              </div>
              <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                الرابط غير صالح أو منتهي الصلاحية
              </h2>
              <p className={`mt-3 text-sm leading-7 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                يرجى طلب رابط جديد لإعادة تعيين كلمة المرور من صفحة تسجيل الدخول.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-6 w-full py-3 rounded-xl bg-[#B348FE] hover:bg-[#9E2FFF] text-white font-bold transition-colors"
              >
                الذهاب لتسجيل الدخول
              </button>
            </div>
          )}

          {/* ── تم بنجاح ── */}
          {!checkingSession && validSession && success && (
            <div className="text-center">
              <motion.div
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.55, repeat: 2 }}
              >
                <CheckCircle2 size={36} className="text-emerald-500" />
              </motion.div>
              <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                تم تغيير كلمة المرور بنجاح 🎉
              </h2>
              <p className={`mt-3 text-sm leading-7 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                جاري توجيهك لصفحة تسجيل الدخول...
              </p>
            </div>
          )}

          {/* ── فورم كلمة المرور الجديدة ── */}
          {!checkingSession && validSession && !success && (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6EEFF] dark:bg-[#2B103D]">
                  <ShieldCheck size={32} className="text-[#B348FE]" />
                </div>
                <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                  إنشاء كلمة مرور جديدة
                </h2>
                <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  اختر كلمة مرور قوية لحسابك
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Password */}
                <div className="flex flex-col gap-0.5">
                  <div
                    className={`flex items-center gap-2 border-b-2 py-2 transition-colors duration-200
                      ${
                        errors.password
                          ? "border-red-400"
                          : isDark
                          ? "border-gray-700 focus-within:border-[#B348FE]"
                          : "border-gray-200 focus-within:border-[#B348FE]"
                      }
                    `}
                  >
                    <Lock className="w-4 h-4 text-[#B348FE] flex-shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="كلمة المرور الجديدة"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((p) => ({ ...p, password: undefined }));
                      }}
                      dir="ltr"
                      required
                      className={`flex-1 min-w-0 bg-transparent border-0 outline-none text-sm sm:text-base py-0.5 placeholder-gray-400 ${
                        isDark ? "text-white" : "text-gray-700"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {strength && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5"
                      >
                        <div className={`h-1 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: strength.color }}
                            initial={{ width: 0 }}
                            animate={{ width: strength.width }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          قوة كلمة المرور:{" "}
                          <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {errors.password && <p className="text-xs text-red-500 mt-0.5 text-right">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-0.5">
                  <div
                    className={`flex items-center gap-2 border-b-2 py-2 transition-colors duration-200
                      ${
                        errors.confirm
                          ? "border-red-400"
                          : confirmPassword && password === confirmPassword
                          ? "border-green-400"
                          : isDark
                          ? "border-gray-700 focus-within:border-[#B348FE]"
                          : "border-gray-200 focus-within:border-[#B348FE]"
                      }
                    `}
                  >
                    <Lock className="w-4 h-4 text-[#B348FE] flex-shrink-0" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="تأكيد كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((p) => ({ ...p, confirm: undefined }));
                      }}
                      dir="ltr"
                      required
                      className={`flex-1 min-w-0 bg-transparent border-0 outline-none text-sm sm:text-base py-0.5 placeholder-gray-400 ${
                        isDark ? "text-white" : "text-gray-700"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <AnimatePresence>
                      {confirmPassword && password === confirmPassword && (
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
                  {errors.confirm && <p className="text-xs text-red-500 mt-0.5 text-right">{errors.confirm}</p>}
                </div>

                {serverError && (
                  <p className="text-xs text-red-500 text-center font-medium">{serverError}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-3 sm:py-3.5 rounded-xl
                    bg-[#B348FE] hover:bg-[#9E2FFF]
                    text-white font-bold text-sm sm:text-base
                    flex items-center justify-center gap-2
                    disabled:opacity-70
                    shadow-[0_12px_35px_rgba(179,72,254,.30)]
                    hover:shadow-[0_18px_45px_rgba(179,72,254,.45)]
                    transition-all duration-300
                  "
                  whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ كلمة المرور الجديدة"
                  )}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>

      <Footer />
    </>
  );
};

export default ResetPasswordPage;
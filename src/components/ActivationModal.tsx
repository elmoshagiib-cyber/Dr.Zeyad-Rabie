import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Phone, KeyRound, Lock, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from "../lib/supabase";

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActivationModal: React.FC<ActivationModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    studentCode: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
if (!form.studentCode.match(/^ZR-\d{6}$/)) {
newErrors.studentCode =
  'صيغة الكود غير صحيحة. مثال: ZR-123456';    }
    if (!form.phone.match(/^(010|011|012|015)\d{8}$/)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }
    if (form.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

try {

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq(
  "student_code",
  form.studentCode.trim().toUpperCase()
)
    .eq("phone", form.phone)
    .single();

  if (error || !data) {

    alert(
      "كود الطالب أو رقم الهاتف غير صحيح"
    );

    setLoading(false);
    return;
  }

  if (data.type !== "سنتر") {

  alert(
    "هذا الكود ليس لطالب سنتر"
  );

  setLoading(false);
  return;
}

  if (data.is_activated) {

    alert(
      "تم تفعيل هذا الحساب بالفعل"
    );

    setLoading(false);
    return;
  }

  const { error: updateError } =
    await supabase
      .from("students")
      .update({
        password: form.password,
        is_activated: true,
      })
      .eq("id", data.id);

  if (updateError) {

    alert(updateError.message);

    setLoading(false);
    return;
  }

  setLoading(false);
  setSuccess(true);

  setTimeout(() => {

    onClose();

    setSuccess(false);

    setForm({
      studentCode: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

  }, 2500);

} catch (err) {

  console.log(err);

  alert("حدث خطأ");

  setLoading(false);
}
  };

  const inputBase = `w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 outline-none border ${
    isDark
      ? 'bg-white dark:bg-[#130726]/5 border-white/10 text-white placeholder-white/30 focus:border-purple-500 focus:bg-white dark:bg-[#130726]/8'
      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:bg-white dark:bg-[#130726]'
  } focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${
              isDark
                ? 'bg-[#100d1f] border border-white/10'
                : 'bg-white dark:bg-[#130726] border border-purple-100'
            }`}
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ boxShadow: '0 30px 80px rgba(109, 40, 217, 0.4)' }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#22063D] to-[#4C1D95] p-6 pb-8">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-600/20 rounded-full translate-y-12 -translate-x-12" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-[#130726]/10 hover:bg-white dark:bg-[#130726]/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#130726]/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-purple-300" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-white">تفعيل حساب طالب سنتر</h2>
                <p className="text-white/60 text-sm mt-1">أدخل بياناتك لتفعيل حسابك</p>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    className="flex flex-col items-center justify-center py-8 gap-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/50 flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <div className="text-center">
                      <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        تم التفعيل بنجاح! 🎉
                      </p>
                      <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        يمكنك الآن تسجيل الدخول بحسابك
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Student Code */}
                    <div>
                      <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                        كود الطالب
                      </label>
                      <div className="relative">
                        <KeyRound className={`absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                        <input
                          type="text"
                          placeholder="ST-2026-0001"
                          value={form.studentCode}
                          onChange={e => setForm(p => ({ ...p, studentCode: e.target.value }))}
                          className={`${inputBase} pr-10`}
                          dir="ltr"
                        />
                      </div>
                      {errors.studentCode && (
                        <p className="text-red-400 text-xs mt-1">{errors.studentCode}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                        رقم الهاتف
                      </label>
                      <div className="relative">
                        <Phone className={`absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                        <input
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          className={`${inputBase} pr-10`}
                          dir="ltr"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                        كلمة المرور الجديدة
                      </label>
                      <div className="relative">
                        <Lock className={`absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={form.password}
                          onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                          className={`${inputBase} pr-10 pl-10`}
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute top-1/2 -translate-y-1/2 left-3.5 ${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                        تأكيد كلمة المرور
                      </label>
                      <div className="relative">
                        <Lock className={`absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={form.confirmPassword}
                          onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                          className={`${inputBase} pr-10 pl-10`}
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className={`absolute top-1/2 -translate-y-1/2 left-3.5 ${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl text-white font-bold text-sm btn-purple flex items-center justify-center gap-2 disabled:opacity-70"
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          جاري التفعيل...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          تفعيل الحساب
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActivationModal;

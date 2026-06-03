import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Lock, Eye, EyeOff, GraduationCap, CheckCircle, ChevronRight } from "lucide-react";
import { GOVERNORATES } from "../data/mockData";

const GRADES = [
  { value: "primary", label: "المرحلة الابتدائية" },
  { value: "first_sec", label: "الصف الأول الثانوي" },
  { value: "second_sec", label: "الصف الثاني الثانوي" },
  { value: "third_sec", label: "الصف الثالث الثانوي" },
];

interface FormData {
  name: string;
  phone: string;
  parentPhone: string;
  grade: string;
  governorate: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "", phone: "", parentPhone: "", grade: "", governorate: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const update = (field: keyof FormData, val: string) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validateStep1 = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim() || form.name.trim().length < 3) e.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    if (!form.phone.match(/^01[0-9]{9}$/)) e.phone = "رقم هاتف غير صحيح";
    if (!form.parentPhone.match(/^01[0-9]{9}$/)) e.parentPhone = "رقم هاتف ولي الأمر غير صحيح";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Partial<FormData> = {};
    if (!form.grade) e.grade = "اختر الصف الدراسي";
    if (!form.governorate) e.governorate = "اختر المحافظة";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Partial<FormData> = {};
    if (form.password.length < 6) e.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    if (form.password !== form.confirmPassword) e.confirmPassword = "كلمة المرور غير متطابقة";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
  };

  const inputClass = "w-full pr-10 pl-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/15";
  const errorClass = "border-red-400/60";

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">تم التسجيل بنجاح! 🎉</h2>
            <p className="text-slate-300 mb-2">تم إنشاء حسابك بنجاح.</p>
            <p className="text-slate-400 text-sm mb-6">
              حسابك الآن في انتظار موافقة الإدارة. ستتلقى إشعاراً عند تفعيل حسابك.
            </p>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4 mb-6">
              <p className="text-blue-200 text-xs font-bold mb-1">كود الطالب الخاص بك</p>
              <p className="text-white font-black text-2xl font-mono">ZR-2024-{Math.floor(1000 + Math.random() * 9000)}</p>
              <p className="text-blue-300 text-xs mt-1">احتفظ بهذا الكود — ستحتاجه للدعم الفني</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              الذهاب لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-3 mx-auto w-fit mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-900/50">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div className="text-right">
            <p className="text-white font-black text-lg leading-tight">د. زياد ربيع</p>
            <p className="text-blue-300 text-xs">المنصة التعليمية</p>
          </div>
        </button>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6">
            <h1 className="text-2xl font-black text-white mb-1">إنشاء حساب جديد</h1>
            <p className="text-slate-300 text-sm">انضم إلى أكثر من 2,400 طالب</p>
          </div>

          {/* Progress Steps */}
          <div className="px-8 mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all flex-shrink-0 ${
                    s < step ? "bg-emerald-500 text-white" : s === step ? "bg-blue-600 text-white" : "bg-white/10 text-slate-400"
                  }`}>
                    {s < step ? <CheckCircle size={14} /> : s}
                  </div>
                  <div className="text-xs text-slate-400 hidden sm:block">
                    {s === 1 ? "بياناتك" : s === 2 ? "الدراسة" : "الأمان"}
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 ${s < step ? "bg-emerald-500" : "bg-white/10"}`}></div>}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="px-8 pb-8 space-y-4">
            {/* Step 1 */}
            {step === 1 && (
              <>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="الاسم بالكامل" value={form.name} onChange={e => update("name", e.target.value)}
                    className={`${inputClass} ${errors.name ? errorClass : ""}`} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="tel" placeholder="رقم هاتف الطالب (01X...)" value={form.phone} onChange={e => update("phone", e.target.value)}
                    className={`${inputClass} ${errors.phone ? errorClass : ""}`} />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="tel" placeholder="رقم هاتف ولي الأمر (01X...)" value={form.parentPhone} onChange={e => update("parentPhone", e.target.value)}
                    className={`${inputClass} ${errors.parentPhone ? errorClass : ""}`} />
                  {errors.parentPhone && <p className="text-red-400 text-xs mt-1">{errors.parentPhone}</p>}
                </div>
                <button type="button" onClick={next}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  التالي <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <div>
                  <label className="text-slate-300 text-xs font-bold block mb-2">الصف الدراسي</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADES.map(g => (
                      <button type="button" key={g.value} onClick={() => update("grade", g.value)}
                        className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all text-right ${
                          form.grade === g.value
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white/10 border-white/20 text-slate-300 hover:bg-white/15"
                        }`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                  {errors.grade && <p className="text-red-400 text-xs mt-1">{errors.grade}</p>}
                </div>
                <div>
                  <label className="text-slate-300 text-xs font-bold block mb-2">المحافظة</label>
                  <select value={form.governorate} onChange={e => update("governorate", e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.governorate ? errorClass : ""} appearance-none`}>
                    <option value="" className="text-slate-900">اختر محافظتك</option>
                    {GOVERNORATES.map(g => <option key={g} value={g} className="text-slate-900">{g}</option>)}
                  </select>
                  {errors.governorate && <p className="text-red-400 text-xs mt-1">{errors.governorate}</p>}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium py-3.5 rounded-xl transition-all">
                    السابق
                  </button>
                  <button type="button" onClick={next}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                    التالي <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type={showPass ? "text" : "password"} placeholder="كلمة المرور" value={form.password} onChange={e => update("password", e.target.value)}
                    className={`${inputClass} pl-10 ${errors.password ? errorClass : ""}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="password" placeholder="تأكيد كلمة المرور" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)}
                    className={`${inputClass} ${errors.confirmPassword ? errorClass : ""}`} />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-300">
                  <p className="font-bold mb-1">📋 تنبيه مهم</p>
                  <p>سيتم مراجعة حسابك من قِبل الإدارة قبل التفعيل. ستتلقى إشعاراً عند قبول طلبك.</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium py-3.5 rounded-xl transition-all">
                    السابق
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>جاري...</> : "إنشاء الحساب"}
                  </button>
                </div>
              </>
            )}

            <p className="text-center text-slate-400 text-sm">
              لديك حساب بالفعل؟{" "}
              <button type="button" onClick={() => navigate("/login")} className="text-blue-400 font-bold hover:text-blue-300">سجل دخولك</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

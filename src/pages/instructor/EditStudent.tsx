import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { supabase } from "../../lib/supabase";
import { 
  User, 
  Phone, 
  GraduationCap, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Save, 
  ArrowRight,
  AlertCircle,
  Loader2,
  Calendar,
  Activity,
  BookOpen,
  FileText,
  Percent
} from "lucide-react";

export function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState<any>(null);

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [type, setType] = useState("");
  const [isActivated, setIsActivated] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const grades = [
    "الصف الأول الإعدادي",
    "الصف الثاني الإعدادي", 
    "الصف الثالث الإعدادي",
    "الصف الأول الثانوي",
    "الصف الثاني الثانوي",
    "الصف الثالث الثانوي"
  ];

  const governorates = [
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الدقهلية",
    "البحر الأحمر",
    "البحيرة",
    "الفيوم",
    "الغربية",
    "الإسماعيلية",
    "المنوفية",
    "المنيا",
    "القليوبية",
    "الوادي الجديد",
    "السويس",
    "اسوان",
    "اسيوط",
    "بني سويف",
    "بورسعيد",
    "دمياط",
    "الشرقية",
    "جنوب سيناء",
    "كفر الشيخ",
    "مطروح",
    "الأقصر",
    "قنا",
    "شمال سيناء",
    "سوهاج"
  ];

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setError("الطالب غير موجود");
      setLoading(false);
      return;
    }

    setStudent(data);
    setFullName(data.full_name || "");
    setPhone(data.phone || "");
    setParentPhone(data.parent_phone || "");
    setGrade(data.grade || "");
    setGovernorate(data.governorate || "");
    setType(data.type || "");
    setIsActivated(data.is_activated || false);
    setIsBlocked(data.is_blocked || false);
    setLoading(false);
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      alert("الاسم مطلوب");
      return false;
    }
    if (!phone.trim()) {
      alert("رقم الطالب مطلوب");
      return false;
    }
    if (!grade) {
      alert("الصف الدراسي مطلوب");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    const { error } = await supabase
      .from("students")
      .update({
        full_name: fullName,
        phone: phone,
        parent_phone: parentPhone,
        grade: grade,
        governorate: governorate,
        type: type,
        is_activated: isActivated,
        is_blocked: isBlocked
      })
      .eq("id", id);

    if (error) {
      alert("حدث خطأ أثناء الحفظ");
      setSaving(false);
      return;
    }

    alert("تم حفظ التعديلات بنجاح");
    setSaving(false);
    navigate(`/instructor/students/${id}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white dark:bg-[#09090B]" dir="rtl">
        <div className="hidden lg:block flex-shrink-0">
          <DashboardSidebar type="instructor" />
        </div>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#B348FE] animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-bold">جاري تحميل بيانات الطالب...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-white dark:bg-[#09090B]" dir="rtl">
        <div className="hidden lg:block flex-shrink-0">
          <DashboardSidebar type="instructor" />
        </div>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <p className="text-gray-900 dark:text-white font-bold text-xl mb-4">{error}</p>
            <Button onClick={() => navigate(-1)} className="bg-[#B348FE] hover:bg-[#9E2FFF]">
              العودة
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#09090B]" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#0F172A] via-[#1E1B3A] to-[#2A1B4D] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mx-4 sm:mx-6 mt-4 sm:mt-6"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-[#B348FE]/10 blur-[100px]" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-[#B348FE]/10 blur-[100px]" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
                <User className="text-amber-400" size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">تعديل بيانات الطالب</h1>
                <p className="text-white/60 text-xs sm:text-sm mt-0.5">تعديل المعلومات الشخصية والأكاديمية</p>
              </div>
            </div>

            <Button
              onClick={() => navigate(`/instructor/students/${id}`)}
              className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/10 backdrop-blur border border-white/10 text-white transition-colors hover:bg-white/20 flex-shrink-0 p-0"
            >
              <ArrowRight size={18} />
            </Button>
          </div>
        </motion.div>

        <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
          {/* Profile Header with Avatar */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {student?.avatar_url ? (
                    <img 
                      src={student.avatar_url} 
                      alt={fullName}
                      className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl object-cover border-4 border-[#F6EEFF] dark:border-[#2B103D] shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-[#B348FE] flex items-center justify-center text-white text-4xl font-black border-4 border-[#F6EEFF] dark:border-[#2B103D] shadow-lg">
                      {fullName?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{fullName || "اسم الطالب"}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${
                      isBlocked
                        ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${isBlocked ? "bg-red-500" : "bg-emerald-500"}`} />
                      {isBlocked ? "موقوف" : "نشط"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] border-[#EAD8FF] dark:border-[#2A2A2A]">
                      {type === "online" ? "أونلاين" : "سنتر"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editable Fields */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                      <User className="text-[#B348FE]" size={20} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">البيانات الأساسية</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                        الاسم الكامل <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="اسم الطالب"
                        className="bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] focus:border-[#B348FE] focus:ring-[#B348FE]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                          رقم الطالب <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="رقم الهاتف"
                            className="pr-10 bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] focus:border-[#B348FE] focus:ring-[#B348FE]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                          رقم ولي الأمر
                        </label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            value={parentPhone}
                            onChange={(e) => setParentPhone(e.target.value)}
                            placeholder="رقم ولي الأمر"
                            className="pr-10 bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] focus:border-[#B348FE] focus:ring-[#B348FE]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                          الصف الدراسي <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                          <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full h-12 border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-10 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B348FE] appearance-none"
                          >
                            <option value="">اختر الصف</option>
                            {grades.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                          المحافظة
                        </label>
                        <div className="relative">
                          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                          <select
                            value={governorate}
                            onChange={(e) => setGovernorate(e.target.value)}
                            className="w-full h-12 border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-10 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B348FE] appearance-none"
                          >
                            <option value="">اختر المحافظة</option>
                            {governorates.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                          نوع الطالب
                        </label>
                        <div className="relative">
                          <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                          <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full h-12 border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-10 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B348FE] appearance-none"
                          >
                            <option value="center">سنتر</option>
                            <option value="online">أونلاين</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                          حالة الحساب
                        </label>
                        <div className="relative">
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                          <select
                            value={isActivated ? "true" : "false"}
                            onChange={(e) => setIsActivated(e.target.value === "true")}
                            className="w-full h-12 border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-10 bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B348FE] appearance-none"
                          >
                            <option value="true">مفعل</option>
                            <option value="false">غير مفعل</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                        حالة الطالب
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!isBlocked}
                            onChange={() => setIsBlocked(false)}
                            className="w-4 h-4 text-[#B348FE] focus:ring-[#B348FE]"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">نشط</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={isBlocked}
                            onChange={() => setIsBlocked(true)}
                            className="w-4 h-4 text-red-500 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">موقوف</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Read-only Fields */}
            <div className="space-y-6">
              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-2xl font-black h-14 shadow-lg shadow-[#B348FE]/30 text-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="ml-2 animate-spin" size={20} />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2" size={20} />
                    حفظ التعديلات
                  </>
                )}
              </Button>

              <Button
                onClick={() => navigate(`/instructor/students/${id}`)}
                variant="outline"
                className="w-full border-2 border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] rounded-2xl font-black h-12"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Award,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calendar,
  ChevronDown,
  Receipt,
  User,
  Phone,
  MapPin,
  Copy,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { toPng } from "html-to-image";

export default function ParentDashboardPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const invoiceCardRef = useRef<HTMLDivElement>(null);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [idFlipped, setIdFlipped] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("parent_students");
    if (!raw) {
      navigate("/");
      return;
    }
    const parsed = JSON.parse(raw);
    setStudents(parsed);
    setSelectedId(parsed[0]?.id ?? null);
  }, [navigate]);

  const student = students.find((s) => s.id === selectedId);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#5800a9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const courses = student.courses || [];
  const totalLessons = courses.reduce((sum: number, c: any) => sum + (c.total_lessons || 0), 0);
  const completedLessons = courses.reduce((sum: number, c: any) => sum + (c.completed_lessons || 0), 0);
  const totalWatchMinutes = Math.round(
    (student.lessonProgress || []).reduce((sum: number, p: any) => sum + (p.watched_seconds || 0), 0) / 60
  );

  const subscriptionLabel =
    student.subscription_status === "active" ? "نشط" : student.subscription_status === "expired" ? "منتهي" : "-";
  const subscriptionColor =
    student.subscription_status === "active" ? "text-emerald-600" : "text-red-600";

  const daysRemaining = student.subscription_end_date
    ? Math.ceil((new Date(student.subscription_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const examScoresList = (student.examResults || []).filter((e: any) => e.percentage != null);
  const avgExamScore =
    examScoresList.length > 0
      ? Math.round(examScoresList.reduce((sum: number, e: any) => sum + e.percentage, 0) / examScoresList.length)
      : null;

  const gradedHomeworkList = (student.homeworkResults || []).filter(
    (h: any) => h.grade !== null && h.grade !== undefined
  );
  const avgHomeworkGrade =
    gradedHomeworkList.length > 0
      ? Math.round(
          gradedHomeworkList.reduce((sum: number, h: any) => sum + (h.grade / (h.total_score || 100)) * 100, 0) /
            gradedHomeworkList.length
        )
      : null;

      const paymentStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: "قيد المراجعة", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" },
      verified: { label: "تم التأكيد", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" },
      rejected: { label: "مرفوض", className: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" },
      cancelled: { label: "ملغي", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
    };
    const conf = map[status] || map.pending;
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black whitespace-nowrap ${conf.className}`}>
        {conf.label}
      </span>
    );
  };
  
  const subscriptionStatusBadge = (payment: any) => {
    if (payment.payment_status !== "verified") {
      return (
        <span className="px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          -
        </span>
      );
    }
    const isActive = new Date(payment.subscription_end_date) > new Date();
    return isActive ? (
      <span className="px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
        نشط
      </span>
    ) : (
      <span className="px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        منتهي
      </span>
    );
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadInvoiceAsImage = async () => {
    if (!invoiceCardRef.current || !selectedInvoice) return;
    setDownloadingImage(true);
    try {
      const dataUrl = await toPng(invoiceCardRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `فاتورة-${selectedInvoice.invoice_number}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إنشاء الصورة");
    } finally {
      setDownloadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] pt-28 pb-16" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {students.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  s.id === selectedId
                    ? "bg-[#5800a9] text-white"
                    : "bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#2A2A2A]"
                }`}
              >
                {s.full_name}
              </button>
            ))}
          </div>
        )}

        {/* ID Card */}
        <div className="flex justify-center mb-6">
          <div
            onClick={() => setIdFlipped((f) => !f)}
            className="relative w-full max-w-[280px] aspect-[3/4] cursor-pointer select-none"
            style={{ perspective: "1400px" }}
          >
            <div
              className="relative w-full h-full transition-transform duration-700 ease-out"
              style={{
                transformStyle: "preserve-3d",
                transform: idFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* الوش الأمامي */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] shadow-lg px-5 py-7 flex flex-col items-center text-center"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#F6EEFF] dark:border-[#2B103D] shadow-md bg-gray-50 dark:bg-[#1A1A1A] mb-4 flex items-center justify-center text-2xl font-black text-[#5800a9]">
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover" />
                  ) : (
                    student.full_name?.charAt(0)
                  )}
                </div>

                <h1 className="text-base sm:text-lg font-black text-[#5800a9] dark:text-white mb-1 px-1 break-words leading-snug">
                  {student.full_name}
                </h1>

                <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 font-bold mb-3">
                  {student.grade || "-"}
                </p>

                <span className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black ${subscriptionColor === "text-emerald-600" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-red-50 text-red-600 dark:bg-red-950/30"}`}>
                  {subscriptionLabel === "نشط" ? "اشتراك نشط" : subscriptionLabel === "منتهي" ? "اشتراك منتهي" : "-"}
                </span>

                <p className="mt-auto pt-4 text-[10px] sm:text-[11px] text-gray-300 dark:text-gray-600 font-bold">
                  اضغط لعرض باقي البيانات
                </p>
              </div>

              {/* الوش الخلفي */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] shadow-lg px-5 py-7 flex flex-col justify-center gap-4"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="text-center mb-1">
                  <User className="mx-auto text-[#5800a9] mb-2" size={22} />
                  <p className="font-black text-gray-900 dark:text-white text-sm">بيانات الطالب</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3.5 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap size={14} className="text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-400">الصف الدراسي</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs">{student.grade || "-"}</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3.5 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone size={14} className="text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-400">رقم الطالب</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs" dir="ltr">{student.phone || "-"}</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3.5 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-400">المحافظة</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs">{student.governorate || "-"}</p>
                </div>

                <p className="text-center text-[10px] text-gray-300 dark:text-gray-600 font-bold mt-1">
                  اضغط للرجوع
                </p>
              </div>
            </div>
          </div>
        </div>

        {daysRemaining !== null && daysRemaining <= 7 && (
          <div
            className={`rounded-2xl border px-5 py-4 flex items-center gap-3 mb-6 ${
              daysRemaining <= 0
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
            }`}
          >
            <Clock className={daysRemaining <= 0 ? "text-red-600" : "text-amber-600"} size={20} />
            <p className={`text-sm font-bold ${daysRemaining <= 0 ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>
              {daysRemaining <= 0
                ? "الاشتراك منتهي — برجاء التجديد لاستمرار وصول الطالب للكورسات"
                : `الاشتراك هينتهي خلال ${daysRemaining} يوم — برجاء التجديد قريبًا`}
            </p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard icon={<BookOpen size={22} />} label="محاضرات مكتملة" value={`${completedLessons} / ${totalLessons}`} />
          <StatCard icon={<CheckCircle2 size={22} />} label="واجبات مسلّمة" value={String(student.homeworkResults?.length || 0)} />
          <StatCard icon={<GraduationCap size={22} />} label="كورسات مشترك بها" value={String(courses.length)} />
          <StatCard icon={<Clock size={22} />} label="وقت المشاهدة" value={`${Math.floor(totalWatchMinutes / 60)}س ${totalWatchMinutes % 60}د`} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} className="text-[#5800a9]" />
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">متوسط درجات الامتحانات</p>
            </div>
            <p
              className={`text-2xl font-black ${
                avgExamScore === null
                  ? "text-gray-400"
                  : avgExamScore >= 80
                  ? "text-emerald-600"
                  : avgExamScore >= 50
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {avgExamScore !== null ? `${avgExamScore}%` : "-"}
            </p>
          </div>
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-[#5800a9]" />
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">متوسط درجات الواجبات</p>
            </div>
            <p
              className={`text-2xl font-black ${
                avgHomeworkGrade === null
                  ? "text-gray-400"
                  : avgHomeworkGrade >= 80
                  ? "text-emerald-600"
                  : avgHomeworkGrade >= 50
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {avgHomeworkGrade !== null ? `${avgHomeworkGrade}%` : "-"}
            </p>
          </div>
        </div>

        {/* Subscription status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-[#5800a9]" />
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">حالة الاشتراك</p>
              </div>
              <p className={`text-2xl font-black ${subscriptionColor}`}>{subscriptionLabel}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-[#5800a9]" />
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">تاريخ انتهاء الاشتراك</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-black text-gray-900 dark:text-white">
                  {student.subscription_end_date
                    ? new Date(student.subscription_end_date).toLocaleDateString("ar-EG")
                    : "-"}
                </p>
                {daysRemaining !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap ${
                      daysRemaining <= 0
                        ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                        : daysRemaining <= 7
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                    }`}
                  >
                    {daysRemaining <= 0 ? "منتهي" : `باقي ${daysRemaining} يوم`}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses with progress */}
        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="text-[#5800a9]" size={20} />
              الكورسات ونسبة التقدم
            </h2>
            {courses.length === 0 ? (
              <p className="text-center text-gray-400 py-6 font-bold">غير مشترك في أي كورس حالياً</p>
            ) : (
              <div className="space-y-3">
                {courses.map((course: any) => {
                  const total = course.total_lessons || 0;
                  const completed = course.completed_lessons || 0;
                  const percent = course.progress_percent ?? 0;
                  const isExpanded = expandedCourseId === course.course_id;

                  return (
                    <div
                      key={course.course_id}
                      className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-4"
                    >
                      <button
                        onClick={() => setExpandedCourseId(isExpanded ? null : course.course_id)}
                        className="w-full flex items-center justify-between gap-3"
                      >
                        <div className="text-right min-w-0">
                          <p className="font-black text-gray-900 dark:text-white text-sm truncate">
                            {course.course_title || "كورس"}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {course.subscribed_at &&
                              `اشترك في ${new Date(course.subscribed_at).toLocaleDateString("ar-EG")}`}
                            {" • "}
                            {course.expires_at
                              ? new Date(course.expires_at) < new Date()
                                ? "انتهى الاشتراك"
                                : `ينتهي في ${new Date(course.expires_at).toLocaleDateString("ar-EG")}`
                              : "اشتراك دائم"}
                          </p>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">نسبة الإنجاز</span>
                          <span className="text-xs font-black text-[#5800a9]">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#5800a9] to-[#9E2FFF] rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2A2A2A]">
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                            محاضرات مكتملة: {completed} / {total}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription invoices */}
        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Receipt className="text-[#5800a9]" size={20} />
              سجل الاشتراكات والفواتير
            </h2>
            {(!student.subscriptionPayments || student.subscriptionPayments.length === 0) ? (
              <p className="text-center text-gray-400 py-6 font-bold">لا توجد اشتراكات مسجلة بعد</p>
            ) : (
              <div className="space-y-3">
                {student.subscriptionPayments.map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedInvoice(p); setShowInvoiceModal(true); }}
                    className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-xl p-4 cursor-pointer hover:border-[#5800a9] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 dark:text-white text-sm truncate">
                          {p.course_title || "-"}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                          فاتورة رقم {p.invoice_number}
                        </p>
                      </div>
                      {paymentStatusBadge(p.payment_status)}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">النوع</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                          {p.student_type === "online" ? "أونلاين" : "سنتر"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">المبلغ</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">{p.amount} جنيه</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">البداية</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                          {new Date(p.subscription_start_date).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">الانتهاء</p>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                          {new Date(p.subscription_end_date).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>

                    {p.subscription_code && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 font-bold">كود الاشتراك</span>
                        <span className="font-black text-[#5800a9] text-xs tracking-widest" dir="ltr">
                          {p.subscription_code}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exams */}
        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="text-[#5800a9]" size={20} />
              نتائج الامتحانات
            </h2>
            {(!student.examResults || student.examResults.length === 0) ? (
              <p className="text-center text-gray-400 py-6 font-bold">لم يدخل أي امتحان بعد</p>
            ) : (
              <div className="space-y-2">
                {student.examResults.map((exam: any) => (
                  <div key={exam.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1A1A1A] rounded-xl px-4 py-3">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-sm block">
                        {exam.exam_title || "امتحان"}
                      </span>
                      {exam.submitted_at && (
                        <span className="text-[11px] text-gray-400">
                          {new Date(exam.submitted_at).toLocaleDateString("ar-EG")}
                        </span>
                      )}
                    </div>
                    <span className="font-black text-[#5800a9]">
                      {exam.score ?? "-"}
                      {exam.percentage != null ? ` (${exam.percentage}%)` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Homework */}
        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="text-[#5800a9]" size={20} />
              الواجبات
            </h2>
            {(!student.homeworkResults || student.homeworkResults.length === 0) ? (
              <p className="text-center text-gray-400 py-6 font-bold">لا توجد واجبات مسلّمة</p>
            ) : (
              <div className="space-y-2">
                {student.homeworkResults.map((hw: any) => (
                  <div key={hw.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1A1A1A] rounded-xl px-4 py-3">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-sm block">
                        {hw.homework_title || "واجب"}
                      </span>
                      {hw.submitted_at && (
                        <span className="text-[11px] text-gray-400">
                          {new Date(hw.submitted_at).toLocaleDateString("ar-EG")}
                        </span>
                      )}
                    </div>
                    <span className="font-black text-[#5800a9]">
                      {hw.grade !== null ? `${hw.grade} / ${hw.total_score || 100}` : "بانتظار التصحيح"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          onClick={() => {
            sessionStorage.removeItem("parent_students");
            sessionStorage.removeItem("parent_phone");
            navigate("/");
          }}
          className="mt-6 text-gray-500 dark:text-gray-400"
        >
          <ArrowRight size={16} className="ml-1" />
          خروج
        </Button>
      </div>

      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[420px] max-h-[90vh] overflow-y-auto">
            <div ref={invoiceCardRef} className="relative bg-white rounded-t-[28px] overflow-hidden">
              <div className="pt-6 pb-3 px-6 text-center">
                <p className="text-gray-900 font-black text-base">منصة مستر زياد ربيع</p>
              </div>

              <div className="px-6 pb-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="text-emerald-500" size={34} />
                </div>
                <p className="text-emerald-600 font-black text-[15px]">تمت عملية الدفع بنجاح</p>
                <p className="text-gray-400 text-[11px] font-bold mt-1" dir="ltr">
                  {new Date(selectedInvoice.created_at).toLocaleString("ar-EG")}
                </p>
              </div>

              <div className="mx-6 border-t-2 border-dashed border-gray-200" />

              <div className="px-6 py-5 text-center">
                <p className="text-gray-400 text-[11px] font-bold mb-1">قيمة الاشتراك</p>
                <p className="text-4xl font-black text-gray-900" dir="ltr">
                  {selectedInvoice.amount}
                  <span className="text-base font-bold text-gray-400 mr-1">جنيه</span>
                </p>
              </div>

              <div className="mx-6 border-t-2 border-dashed border-gray-200" />

              <div className="px-6 py-5 space-y-3">
                {[
                  { label: "اسم الطالب", value: student.full_name },
                  { label: "الكورس", value: selectedInvoice.course_title || "-" },
                  { label: "نوع الاشتراك", value: selectedInvoice.student_type === "online" ? "أونلاين" : "سنتر" },
                  { label: "طريقة الدفع", value: selectedInvoice.payment_method === "vodafone_cash" ? "Vodafone Cash" : "InstaPay" },
                  { label: "تاريخ الاشتراك", value: new Date(selectedInvoice.subscription_start_date).toLocaleDateString("ar-EG") },
                  { label: "تاريخ الانتهاء", value: new Date(selectedInvoice.subscription_end_date).toLocaleDateString("ar-EG") },
                ].map((row) => (
                  <div key={row.label} className="flex items-end justify-between gap-2 text-[13px]">
                    <span className="text-gray-400 font-bold whitespace-nowrap bg-white pl-1 relative z-10">
                      {row.label}
                    </span>
                    <span className="flex-1 border-b-2 border-dotted border-gray-300 mb-[3px]" />
                    <span className="font-black text-gray-800 whitespace-nowrap bg-white pr-1 relative z-10">
                      {row.value}
                    </span>
                  </div>
                ))}

                <div className="flex items-end justify-between gap-2 text-[13px]">
                  <span className="text-gray-400 font-bold whitespace-nowrap bg-white pl-1 relative z-10">
                    حالة الدفع
                  </span>
                  <span className="flex-1 border-b-2 border-dotted border-gray-300 mb-[3px]" />
                  <span className="bg-white pr-1 relative z-10">{paymentStatusBadge(selectedInvoice.payment_status)}</span>
                </div>

                <div className="flex items-end justify-between gap-2 text-[13px]">
                  <span className="text-gray-400 font-bold whitespace-nowrap bg-white pl-1 relative z-10">
                    حالة الاشتراك
                  </span>
                  <span className="flex-1 border-b-2 border-dotted border-gray-300 mb-[3px]" />
                  <span className="bg-white pr-1 relative z-10">{subscriptionStatusBadge(selectedInvoice)}</span>
                </div>
              </div>

              <div className="mx-6 border-t-2 border-dashed border-gray-200" />

              <div className="px-6 py-4 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-bold">رقم الفاتورة</span>
                <span className="font-black text-gray-800 text-sm tracking-widest" dir="ltr">
                  {selectedInvoice.invoice_number}
                </span>
              </div>

              {selectedInvoice.subscription_code && selectedInvoice.payment_status === "verified" && (
                <div className="px-6 pb-5">
                  <div className="rounded-2xl border-2 border-dashed border-[#5800a9]/40 bg-[#FAF5FF] px-5 py-4 text-center">
                    <p className="text-[11px] font-bold text-gray-400 mb-1.5">كود الاشتراك</p>
                    <p className="text-2xl font-black text-[#5800a9] tracking-[4px]" dir="ltr">
                      {selectedInvoice.subscription_code}
                    </p>
                  </div>
                </div>
              )}

              <div className="px-6 pb-6 flex items-center justify-center gap-[2px] h-8">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-800"
                    style={{ width: i % 3 === 0 ? "2px" : "1px", height: i % 5 === 0 ? "100%" : "70%" }}
                  />
                ))}
              </div>

              <p className="pb-6 text-center text-[10px] text-gray-300 font-bold">شكراً لثقتكم بمنصة مستر زياد ربيع</p>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-b-[28px] border-t border-gray-100 dark:border-[#2A2A2A] p-5 space-y-3 shadow-2xl">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => copyToClipboard(selectedInvoice.invoice_number, "invoice")}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                >
                  <Copy size={16} className="text-[#5800a9]" />
                  <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    {copiedField === "invoice" ? "تم النسخ ✓" : "نسخ الفاتورة"}
                  </span>
                </button>
                <button
                  onClick={() => selectedInvoice.subscription_code && copyToClipboard(selectedInvoice.subscription_code, "code")}
                  disabled={!selectedInvoice.subscription_code}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors disabled:opacity-40"
                >
                  <Copy size={16} className="text-[#5800a9]" />
                  <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    {copiedField === "code" ? "تم النسخ ✓" : "نسخ الكود"}
                  </span>
                </button>
              </div>

              <Button
                onClick={downloadInvoiceAsImage}
                disabled={downloadingImage}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 font-bold flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <ImageIcon size={16} />
                {downloadingImage ? "جاري إنشاء الصورة..." : "تحميل الفاتورة كصورة"}
              </Button>

              <Button
                variant="outline"
                onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}
                className="w-full rounded-xl h-11 font-bold"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-4">
      <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center text-[#5800a9] mb-2">
        {icon}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">{label}</p>
      <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
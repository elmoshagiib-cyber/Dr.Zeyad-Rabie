import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Database,
  Users,
  Clock3,
  Ticket,
  KeyRound,
  CheckCircle2,
  XCircle,
  Sparkles,
  PackageX,
  Wallet,
  Search,
} from "lucide-react";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import {
  Copy,
  Trash2,
  X,
  Calendar,
  Infinity as InfinityIcon,
} from "lucide-react";


const grades = [
  { value: "الصف الأول الإعدادي", label: "الصف الأول الإعدادي" },
  { value: "الصف الثاني الإعدادي", label: "الصف الثاني الإعدادي" },
  { value: "الصف الثالث الإعدادي", label: "الصف الثالث الإعدادي" },
  { value: "الصف الأول الثانوي", label: "الصف الأول الثانوي" },
  { value: "الصف الثاني الثانوي", label: "الصف الثاني الثانوي" },
  { value: "الصف الثالث الثانوي", label: "الصف الثالث الثانوي" },
];


const SubscriptionCodes = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = React.useState("");
const [selectedCourse, setSelectedCourse] = React.useState("");

const [codesCount, setCodesCount] = React.useState(10);

const [subscriptionPeriod, setSubscriptionPeriod] = React.useState("شهر");
const [codeAmount, setCodeAmount] = React.useState(220);

const [exportGrade, setExportGrade] = React.useState("");
const [exportCourse, setExportCourse] = React.useState("");
const [exportStatus, setExportStatus] = React.useState("");
const [stats, setStats] = useState({
  total: 0,
  active: 0,
  used: 0,
  expired: 0,
  cancelled: 0,
});

const activeCodesValue = codes
  .filter((item) => item.status === "active")
  .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

const [searchTerm, setSearchTerm] = useState("");
const [selectedStatus, setSelectedStatus] = useState("");
const [filterCourse, setFilterCourse] = useState("");
const [filterGrade, setFilterGrade] = useState("");
const [filterDuration, setFilterDuration] = useState("");
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


useEffect(() => {
  loadCourses();
loadCodes();
loadStats();
}, []);

const loadCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("id,title,grade")
    .order("title");

  if (error) {
    console.error(error);
    return;
  }

  setCourses(data || []);
};

const loadCodes = async () => {
  const { data, error } = await supabase
    .from("subscription_codes")
    .select(`
  *,
  courses (
    title
  ),
  students (
    full_name,
    phone
  )
`)

    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  setCodes(data || []);
};


const loadStats = async () => {
  const { data, error } = await supabase
    .from("subscription_codes")
    .select("status");

  if (error) {
    console.error(error);
    return;
  }

  setStats({
    total: data.length,
    active: data.filter((item) => item.status === "active").length,
    used: data.filter((item) => item.status === "used").length,
    expired: data.filter((item) => item.status === "expired").length,
    cancelled: data.filter((item) => item.status === "cancelled").length,
  });
};

const getDurationDays = () => {
  switch (subscriptionPeriod) {
    case "شهر":
      return 30;

    case "3 شهور":
      return 90;

    case "6 شهور":
      return 180;

    case "سنة":
      return 365;

    case "دائم":
      return 0;

    default:
      return 30;
  }
};

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
};

const generateCodes = async () => {
  if (!selectedCourse) {
    showToast("اختر الكورس أولاً");
    return;
  }

  if (codesCount <= 0) {
    showToast("عدد الأكواد غير صحيح");
    return;
  }

  if (!codeAmount || codeAmount <= 0) {
    showToast("قيمة الكود غير صحيحة");
    return;
  }

  const duration = getDurationDays();

  const codes = [];

  for (let i = 0; i < codesCount; i++) {
    codes.push({
      code: generateCode(),
      course_id: selectedCourse,
      duration_days: duration,
      status: "active",
      amount: codeAmount,
    });
  }

  const { error } = await supabase
    .from("subscription_codes")
    .insert(codes);

  if (error) {
    console.error(error);
    showToast(error.message);
    return;
  }

  await loadCodes();
await loadStats();
showToast(`تم إنشاء ${codes.length} كود بنجاح`);
};

const handleExport = (type: "excel" | "pdf") => {
  const filtered = codes.filter((item) => {
    const matchesGrade =
      !exportGrade ||
      courses.find((c) => c.id === item.course_id && c.grade === exportGrade);
    const matchesCourse = !exportCourse || item.course_id === exportCourse;
    const matchesStatus = !exportStatus || item.status === exportStatus;
    return matchesGrade && matchesCourse && matchesStatus;
  });

  if (filtered.length === 0) {
    showToast("لا توجد بيانات مطابقة للتصدير");
    return;
  }

  const rows = filtered.map((item) => ({
    الكود: item.code,
    الكورس: item.courses?.title || "-",
    المدة: item.duration_days === 0 ? "دائم" : `${item.duration_days} يوم`,
    الحالة:
      item.status === "active" ? "صالح" :
      item.status === "used" ? "مستخدم" :
      item.status === "expired" ? "منتهي" : "ملغي",
    الطالب: item.students?.full_name || "-",
    الهاتف: item.students?.phone || "-",
    "تاريخ الإنشاء": new Date(item.created_at).toLocaleDateString("ar-EG"),
  }));

  if (type === "excel") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الأكواد");
    XLSX.writeFile(workbook, "subscription-codes.xlsx");
  } else {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [Object.keys(rows[0])],
      body: rows.map((r) => Object.values(r)),
      styles: { font: "helvetica", halign: "right" },
    });
    doc.save("subscription-codes.pdf");
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-black border border-emerald-200 whitespace-nowrap">
          صالح
        </span>
      );

    case "used":
      return (
        <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 text-xs font-black border border-sky-200 whitespace-nowrap">
          مستخدم
        </span>
      );

    case "expired":
      return (
        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-black border border-amber-200 whitespace-nowrap">
          منتهي
        </span>
      );

    case "cancelled":
      return (
        <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-black border border-red-200 whitespace-nowrap">
          ملغي
        </span>
      );

    default:
      return (
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-black border border-slate-200 whitespace-nowrap">
          غير معروف
        </span>
      );
  }
};


const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    showToast("تم نسخ الكود");
  } catch (error) {
    console.error(error);
    showToast("فشل نسخ الكود");
  }
};

const deleteCode = async (id: string) => {
  const confirmDelete = window.confirm(
    "هل أنت متأكد من حذف هذا الكود؟"
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("subscription_codes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    showToast(error.message);
    return;
  }

  await loadCodes();
await loadStats();
  showToast("تم حذف الكود بنجاح");
};


const updateCodeStatus = async (
  id: string,
  newStatus: string
) => {
  const { error } = await supabase
    .from("subscription_codes")
    .update({
      status: newStatus,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    showToast(error.message);
    return;
  }

  await loadCodes();
  await loadStats();
};



const filteredCodes = codes.filter((item) => {
  const search = searchTerm.trim().toLowerCase();

  const matchesSearch =
    !search ||
    item.code?.toLowerCase().includes(search) ||
    item.courses?.title?.toLowerCase().includes(search);

  const matchesStatus =
  !selectedStatus || item.status === selectedStatus;


const matchesCourse =
  !filterCourse || item.course_id === filterCourse;

const matchesGrade =
  !filterGrade || courses.find(
    (course) =>
      course.id === item.course_id &&
      course.grade === filterGrade
  );

  const matchesDuration =
  !filterDuration ||
  item.duration_days === Number(filterDuration);

return (
  matchesSearch &&
  matchesStatus &&
  matchesCourse &&
  matchesGrade &&
  matchesDuration
);

});




return (
  <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>

    {toast && (
      <div
        key={toast.id}
        className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[100] w-[92%] sm:w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-top-3 fade-in duration-300"
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <p className="text-sm font-bold text-slate-800 text-right flex-1">
            {toast.message}
          </p>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="h-1 w-full bg-slate-100 overflow-hidden">
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

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#1547D6] to-[#3183FF] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mb-6 sm:mb-8"
      >
        <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-[100px]" />
        <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
              <KeyRound className="text-[#155DFC]" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">إدارة أكواد الوصول</h1>
              <p className="text-white/60 text-xs sm:text-sm mt-0.5">إنشاء وإدارة أكواد اشتراك الطلاب بسهولة تامة</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <button
              onClick={() => document.getElementById("generate-section")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/10 text-white text-xs sm:text-sm font-bold hover:bg-white/20 transition-colors"
            >
              + توليد أكواد جديدة
            </button>

            <button
              onClick={() => document.getElementById("export-section")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-bold hover:bg-white/90 transition-colors"
            >
              تصدير الملفات
            </button>

            <button
              onClick={() => { loadCourses(); loadCodes(); loadStats(); }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
            >
              ↻
            </button>
          </div>
        </div>
      </motion.div>

{/* Statistics */}
<div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

  <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-[#155DFC] p-5 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-bold text-slate-500">إجمالي الأكواد</span>
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Database className="text-[#155DFC]" size={16} />
      </div>
    </div>
    <div className="text-3xl font-black text-[#155DFC] mb-1">{stats.total}</div>
    <div className="text-xs text-slate-400 font-medium">كل الأكواد المولّدة</div>
  </div>

  <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 p-5 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-bold text-slate-500">أكواد صالحة</span>
      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="text-emerald-600" size={16} />
      </div>
    </div>
    <div className="text-3xl font-black text-emerald-600 mb-1">{stats.active}</div>
    <div className="text-xs text-slate-400 font-medium">جاهزة للاستخدام</div>
  </div>

  <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-sky-500 p-5 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-bold text-slate-500">أكواد مستخدمة</span>
      <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
        <Users className="text-sky-600" size={16} />
      </div>
    </div>
    <div className="text-3xl font-black text-sky-600 mb-1">{stats.used}</div>
    <div className="text-xs text-slate-400 font-medium">مفعّلة لطلاب بالفعل</div>
  </div>

  <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-amber-500 p-5 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-bold text-slate-500">أكواد منتهية</span>
      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
        <Clock3 className="text-amber-600" size={16} />
      </div>
    </div>
    <div className="text-3xl font-black text-amber-600 mb-1">{stats.expired}</div>
    <div className="text-xs text-slate-400 font-medium">انتهت صلاحيتها</div>
  </div>

  <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-red-500 p-5 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-bold text-slate-500">أكواد ملغاة</span>
      <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
        <XCircle className="text-red-600" size={16} />
      </div>
    </div>
    <div className="text-3xl font-black text-red-600 mb-1">{stats.cancelled}</div>
    <div className="text-xs text-slate-400 font-medium">تم إلغاؤها يدويًا</div>
  </div>

  <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-violet-500 p-5 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-bold text-slate-500">قيمة الأكواد الصالحة</span>
      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
        <Wallet className="text-violet-600" size={16} />
      </div>
    </div>
    <div className="text-3xl font-black text-violet-600 mb-1">{activeCodesValue} ج</div>
    <div className="text-xs text-slate-400 font-medium">فلوس لسه ما اتحصلتش</div>
  </div>

</div>


<div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">

  {/* Generate Codes */}
  <div id="generate-section" className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 p-7">

    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Sparkles className="text-[#155DFC]" size={20} />
      </div>
      <h2 className="text-2xl font-black text-slate-800">
        توليد أكواد جديدة
      </h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

      <div>
        <label className="block mb-2 text-sm font-bold">
          الصف الدراسي
        </label>

     <select
  value={selectedGrade}
  
  onChange={(e) => {
    setSelectedGrade(e.target.value);
    setSelectedCourse("");
  }}
  className="w-full h-12 rounded-xl border border-slate-300 px-4"
>
  <option value="">اختر الصف</option>

  {grades.map((grade) => (
    <option key={grade.value} value={grade.value}>
      {grade.label}
    </option>
  ))}
</select>

      </div>

      <div>
        <label className="block mb-2 text-sm font-bold">
          الكورس
        </label>

<select
  value={selectedCourse}
  onChange={(e) => setSelectedCourse(e.target.value)}
  className="w-full h-12 rounded-xl border border-slate-300 px-4"
>

  <option value="">اختر الكورس</option>

{courses
  .filter((course) => course.grade === selectedGrade)
  .map((course) => (
      <option
        key={course.id}
        value={course.id}
      >
        {course.title}
      </option>
    ))}
</select>

      </div>

      <div>
        <label className="block mb-2 text-sm font-bold">
          عدد الأكواد
        </label>

        <input
          type="number"
          value={codesCount}
          onChange={(e)=>setCodesCount(Number(e.target.value))}
          className="w-full h-12 rounded-xl border border-slate-300 px-4"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-bold">
          قيمة الكود (جنيه)
        </label>

        <input
          type="number"
          min={1}
          value={codeAmount}
          onChange={(e)=>setCodeAmount(Number(e.target.value))}
          className="w-full h-12 rounded-xl border border-slate-300 px-4"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-bold">
          مدة الاشتراك
        </label>

        <select
  value={subscriptionPeriod}
  onChange={(e) => setSubscriptionPeriod(e.target.value)}
  className="w-full h-12 rounded-xl border border-slate-300 px-4"
>
  <option>شهر</option>
  <option>3 شهور</option>
  <option>6 شهور</option>
  <option>سنة</option>
  <option>دائم</option>
</select>

      </div>

    </div>

    <div className="mt-7 flex items-center justify-between flex-wrap gap-5">


   <button
  onClick={generateCodes}
  className="flex items-center gap-2 bg-[#155DFC] hover:bg-[#1547D6] text-white font-bold rounded-xl px-8 h-12 transition"
>
  <Sparkles size={18} />
  توليد الأكواد الآن
</button>

    </div>

  </div>

  {/* Export */}

  <div id="export-section" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-7">

    <h2 className="text-xl font-black mb-6">
      تصدير البيانات
    </h2>

    <div className="space-y-4">

      <select
        value={exportGrade}
        onChange={(e)=>setExportGrade(e.target.value)}
        className="w-full h-12 rounded-xl border border-slate-300 px-4"
      >
        <option value="">كل الصفوف</option>

     {grades.map((g) => (
  <option key={g.value} value={g.value}>
    {g.label}
  </option>
))}

      </select>

<select
  value={exportCourse}
  onChange={(e) => setExportCourse(e.target.value)}
  className="w-full h-12 rounded-xl border border-slate-300 px-4"
>

  <option value="">كل الكورسات</option>

  {courses.map((course) => (
    <option key={course.id} value={course.id}>
      {course.title}
    </option>
  ))}
</select>

      <select
        value={exportStatus}
        onChange={(e)=>setExportStatus(e.target.value)}
        className="w-full h-12 rounded-xl border border-slate-300 px-4"
      >
        <option value="">كل الحالات</option>
<option value="active">صالح</option>
<option value="used">مستخدم</option>
<option value="expired">منتهي</option>
<option value="cancelled">ملغي</option>
      </select>

    </div>

    <div className="grid grid-cols-2 gap-3 mt-6">

      <button
        onClick={() => handleExport("pdf")}
        className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-bold"
      >
        PDF
      </button>

      <button
        onClick={() => handleExport("excel")}
        className="bg-[#155DFC] hover:bg-[#1547D6] text-white rounded-xl h-11 font-bold"
      >
        Excel
      </button>

    </div>

  </div>

</div>

{/* Search */}
<div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-7 mb-8">

  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
      <Search className="text-[#155DFC]" size={20} />
    </div>
    <h2 className="text-2xl font-black text-slate-800">
      البحث والفلترة
    </h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

    {/* Search */}
    <div className="lg:col-span-2">
      <label className="block mb-2 text-sm font-bold">
        بحث برقم الكود / الطالب / الهاتف
      </label>

 <input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="اكتب للبحث..."
  className="
    w-full
    h-12
    rounded-xl
    border
    border-slate-300
    px-4
    outline-none
    focus:ring-2
    focus:ring-blue-500
  "
/>
    </div>

    {/* Grade */}
    <div>
      <label className="block mb-2 text-sm font-bold">
        الصف
      </label>

 <select
  value={filterGrade}
  onChange={(e) => {
    setFilterGrade(e.target.value);
    setFilterCourse("");
  }}
  className="w-full h-12 rounded-xl border border-slate-300 px-4"
>
  <option value="">كل الصفوف</option>

  {grades.map((grade) => (
    <option key={grade.value} value={grade.value}>
      {grade.label}
    </option>
  ))}
</select>

    </div>

    {/* Status */}
    <div>
      <label className="block mb-2 text-sm font-bold">
        الحالة
      </label>

      <select
  value={selectedStatus}
  onChange={(e) => setSelectedStatus(e.target.value)}
  className="w-full h-12 rounded-xl border border-slate-300 px-4"
>
  <option value="">جميع الحالات</option>
  <option value="active">صالح</option>
  <option value="used">مستخدم</option>
  <option value="expired">منتهي</option>
  <option value="cancelled">ملغي</option>
</select>

    </div>

    {/* Course */}
    <div>
      <label className="block mb-2 text-sm font-bold">
        الكورس
      </label>

      <select
  value={filterCourse}
  onChange={(e) => setFilterCourse(e.target.value)}
  className="w-full h-12 rounded-xl border border-slate-300 px-4"
>
  <option value="">كل الكورسات</option>

  {courses
    .filter((course) => !filterGrade || course.grade === filterGrade)
    .map((course) => (
      <option key={course.id} value={course.id}>
        {course.title}
      </option>
    ))}
</select>

    </div>

    {/* Subscription */}
    <div>
      <label className="block mb-2 text-sm font-bold">
        مدة الاشتراك
      </label>

      <select
        value={filterDuration}
        onChange={(e) => setFilterDuration(e.target.value)}
        className="w-full h-12 rounded-xl border border-slate-300 px-4"
      >
        <option value="">الكل</option>
        <option value="30">شهر</option>
        <option value="90">3 شهور</option>
        <option value="180">6 شهور</option>
        <option value="365">سنة</option>
        <option value="0">دائم</option>
      </select>
    </div>

    {/* Date */}
    <div>
      <label className="block mb-2 text-sm font-bold">
        تاريخ الإنشاء
      </label>

      <input
        type="date"
        className="
          w-full
          h-12
          rounded-xl
          border
          border-slate-300
          px-4
        "
      />
    </div>



  </div>

</div>

{/* Codes Table */}

<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
    <h2 className="text-lg font-black text-slate-800">قائمة الأكواد</h2>
    <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-black">
      {filteredCodes.length} كود
    </span>
  </div>

  {filteredCodes.length === 0 ? (

    <div className="py-24 flex flex-col items-center justify-center">

      <PackageX className="text-slate-300 mb-5" size={64} />

      <h3 className="text-xl font-black text-slate-700">
        لا توجد أكواد حالياً
      </h3>

      <p className="text-slate-500 mt-2">
        قم بإنشاء أول دفعة أكواد للبدء.
      </p>

      <button
        onClick={() => document.getElementById("generate-section")?.scrollIntoView({ behavior: "smooth" })}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-bold transition"
      >
        ✨ ابدأ بتوليد الأكواد
      </button>

    </div>

  ) : (

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <th className="text-right font-bold px-6 py-3 whitespace-nowrap">الكود</th>
            <th className="text-right font-bold px-6 py-3 whitespace-nowrap">الكورس / المدة</th>
            <th className="text-center font-bold px-6 py-3 whitespace-nowrap">الحالة</th>
            <th className="text-right font-bold px-6 py-3 whitespace-nowrap">الطالب المستخدم</th>
            <th className="text-right font-bold px-6 py-3 whitespace-nowrap">تاريخ الإنشاء</th>
            <th className="text-right font-bold px-6 py-3 whitespace-nowrap">تاريخ الانتهاء</th>
            <th className="text-center font-bold px-6 py-3 whitespace-nowrap">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredCodes.map((item, idx) => {
            const isExpired =
              item.expires_at && new Date(item.expires_at) < new Date();

            return (
              <tr
                key={item.id}
                className={`border-b border-slate-100 hover:bg-[#EFF6FF] transition-colors ${
                  idx % 2 === 1 ? "bg-slate-50/60" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <button
                    onClick={() => copyCode(item.code)}
                    title="اضغط لنسخ الكود"
                    className="font-black tracking-wider text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1 transition-colors"
                    dir="ltr"
                  >
                    {item.code}
                  </button>
                </td>

                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">{item.courses?.title || "-"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.duration_days === 0 ? "اشتراك دائم" : `${item.duration_days} يوم`}
                  </p>
                </td>

                <td className="px-6 py-4 text-center">
                  {getStatusBadge(item.status)}
                </td>

                <td className="px-6 py-4">
                  {item.students ? (
                    <div>
                      <p className="font-bold text-slate-800">{item.students.full_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5" dir="ltr">{item.students.phone}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs font-bold">غير مستخدم بعد</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
                    <Calendar size={13} className="text-slate-400" />
                    {new Date(item.created_at).toLocaleDateString("ar-EG")}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {item.duration_days === 0 ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#155DFC] text-xs font-bold w-fit">
                      <InfinityIcon size={13} />
                      لا ينتهي
                    </span>
                  ) : item.expires_at ? (
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold w-fit ${
                        isExpired ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {isExpired ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                      {new Date(item.expires_at).toLocaleDateString("ar-EG")}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-bold">لم يُستخدم بعد</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <select
                      value={item.status}
                      onChange={(e) => updateCodeStatus(item.id, e.target.value)}
                      title="تغيير حالة الكود"
                      className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#155DFC] bg-white text-slate-700"
                    >
                      <option value="active">صالح</option>
                      <option value="used">مستخدم</option>
                      <option value="expired">منتهي</option>
                      <option value="cancelled">ملغي</option>
                    </select>

                    <button
                      onClick={() => deleteCode(item.id)}
                      title="حذف الكود"
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}

</div>

  </DashboardLayout>
);
};

export default SubscriptionCodes;
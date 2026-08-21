import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Database,
  Users,
  Clock3,
  Ticket,
} from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import React, { useEffect, useState } from "react";
import {
  Copy,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";


const grades = [
  { value: "prep_1", label: "الصف الأول الإعدادي" },
  { value: "prep_2", label: "الصف الثاني الإعدادي" },
  { value: "prep_3", label: "الصف الثالث الإعدادي" },
  { value: "sec_1", label: "الصف الأول الثانوي" },
  { value: "sec_2", label: "الصف الثاني الثانوي" },
  { value: "sec_3", label: "الصف الثالث الثانوي" },
];


const SubscriptionCodes = () => {

  const [courses, setCourses] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = React.useState("");
const [selectedCourse, setSelectedCourse] = React.useState("");

const [codesCount, setCodesCount] = React.useState(10);

const [subscriptionPeriod, setSubscriptionPeriod] = React.useState("شهر");

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

const [searchTerm, setSearchTerm] = useState("");
const [selectedStatus, setSelectedStatus] = useState("");
const [filterCourse, setFilterCourse] = useState("");
const [filterGrade, setFilterGrade] = useState("");
const [filterDuration, setFilterDuration] = useState("");


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
    alert("اختر الكورس أولاً");
    return;
  }

  if (codesCount <= 0) {
    alert("عدد الأكواد غير صحيح");
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
    });
  }

  const { error } = await supabase
    .from("subscription_codes")
    .insert(codes);

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  await loadCodes();
await loadStats();
alert(`تم إنشاء ${codes.length} كود بنجاح ✅`);
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
    alert("لا توجد بيانات مطابقة للتصدير");
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
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
          🟢 صالح
        </span>
      );

    case "used":
      return (
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
          🔵 مستخدم
        </span>
      );

    case "expired":
      return (
        <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
          🟠 منتهي
        </span>
      );

    case "cancelled":
      return (
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
          🔴 ملغي
        </span>
      );

    default:
      return (
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
          غير معروف
        </span>
      );
  }
};


const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    alert("✅ تم نسخ الكود");
  } catch (error) {
    console.error(error);
    alert("فشل نسخ الكود");
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
    alert(error.message);
    return;
  }

  await loadCodes();
await loadStats();
  alert("🗑️ تم حذف الكود بنجاح");
};


const toggleCodeStatus = async (
  id: string,
  currentStatus: string
) => {
  const newStatus =
    currentStatus === "active"
      ? "cancelled"
      : "active";

  const { error } = await supabase
    .from("subscription_codes")
    .update({
      status: newStatus,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert(error.message);
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
  <div className="flex min-h-screen bg-slate-100" dir="rtl">

    {/* Sidebar */}
    <div className="hidden lg:block">
      <DashboardSidebar type="instructor" />
    </div>

    {/* Content */}
    <main className="flex-1 overflow-y-auto">

      <div className="p-6">

      {/* Hero */}
      <div className="mb-8">
        <div
          className="
            rounded-3xl
            bg-gradient-to-r
from-[#C65CFF]
via-[#B348FE]
to-[#9E2FFF]
            shadow-xl
            p-8
            flex
            items-center
            justify-between
            gap-6
            flex-wrap
          "
        >
          {/* Left Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => document.getElementById("generate-section")?.scrollIntoView({ behavior: "smooth" })}
              className="
                h-11
                px-6
                rounded-xl
                bg-white
                text-slate-700
                font-bold
                shadow
                hover:bg-gray-100
                transition
              "
            >
              + توليد أكواد جديدة
            </button>

            <button
              onClick={() => document.getElementById("export-section")?.scrollIntoView({ behavior: "smooth" })}
              className="
                h-11
                px-6
                rounded-xl
                bg-white
                text-slate-700
                font-bold
                shadow
                hover:bg-gray-100
                transition
              "
            >
              تصدير الملفات
            </button>

            <button
              className="
                w-11
                h-11
                rounded-xl
                bg-white
                flex
                items-center
                justify-center
                shadow
                hover:bg-gray-100
                transition
              "
            >
              ↻
            </button>
          </div>

          {/* Right Title */}
          <div className="text-right text-white">
            <h1 className="text-4xl font-black flex items-center justify-end gap-2">
              إدارة أكواد الوصول 🔑
            </h1>

            <p className="text-white/90 mt-2 text-sm">
              إنشاء وإدارة أكواد اشتراك الطلاب بسهولة تامة
            </p>
          </div>
        </div>
      </div>

{/* Statistics */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

  {/* Total */}
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition">
    <div className="text-right">
      <p className="text-slate-500 font-medium text-sm">
        إجمالي الأكواد
      </p>

      <h2 className="text-4xl font-black mt-2 text-slate-900">
        {stats.total}
      </h2>
    </div>

    <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
      <Database className="text-violet-600" size={28} />
    </div>
  </div>

  {/* Used */}
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition">
    <div className="text-right">
      <p className="text-slate-500 font-medium text-sm">
        أكواد مستخدمة
      </p>

      <h2 className="text-4xl font-black mt-2 text-slate-900">
        {stats.used}
      </h2>
    </div>

    <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
      <Users className="text-green-600" size={28} />
    </div>
  </div>

  {/* Active */}
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition">
    <div className="text-right">
      <p className="text-slate-500 font-medium text-sm">
        أكواد صالحة
      </p>

      <h2 className="text-4xl font-black mt-2 text-slate-900">
        {stats.active}
      </h2>
    </div>

    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
      <Ticket className="text-orange-600" size={28} />
    </div>
  </div>

  {/* Expired */}
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition">
    <div className="text-right">
      <p className="text-slate-500 font-medium text-sm">
        أكواد منتهية
      </p>

      <h2 className="text-4xl font-black mt-2 text-slate-900">
        {stats.expired}
      </h2>
    </div>

    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
      <Clock3 className="text-gray-600" size={28} />
    </div>
  </div>

</div>


<div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">

  {/* Generate Codes */}
  <div id="generate-section" className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 p-7">

    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-black text-slate-800">
        ✨ توليد أكواد جديدة
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
  className="
bg-violet-600
hover:bg-violet-700
    text-white
    font-bold
    rounded-xl
    px-8
    h-12
    transition
  "
>
  ✨ توليد الأكواد الآن
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
        <option>اختر الصف</option>

     {grades.map((g) => (
  <option key={g.value} value={g.value}>
    {g.label}
  </option>
))}

      </select>

<select
  value={exportCourse}
  onChange={(e) => setExportCourse(e.target.value)}
  
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
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-bold"
      >
        Excel
      </button>

    </div>

  </div>

</div>

{/* Search */}
<div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-7 mb-8">

  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-black text-slate-800">
      🔎 البحث والفلترة
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
        className="w-full h-12 rounded-xl border border-slate-300 px-4"
      >
        <option>الكل</option>
        <option>شهر</option>
        <option>3 شهور</option>
        <option>6 شهور</option>
        <option>سنة</option>
        <option>دائم</option>
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

  {/* Header */}
  <div className="border-b border-slate-200 bg-slate-50">

    <div
      className="
        grid
        grid-cols-7
        items-center
        px-6
        py-4
        text-sm
        font-bold
        text-slate-600
      "
    >

      <div className="text-center">
        <input type="checkbox" />
      </div>

      <div className="text-right">
        الكود
      </div>

      <div className="text-right">
        التفاصيل
      </div>

      <div className="text-center">
        الحالة
      </div>

      <div className="text-center">
        المستخدم
      </div>

      <div className="text-center">
        التاريخ
      </div>

      <div className="text-center">
        الإجراءات
      </div>

    </div>

  </div>

  {/* Empty State */}

{filteredCodes.length === 0 ? (

  <div className="py-24 flex flex-col items-center justify-center">

    <div
      className="
        w-20
        h-20
        rounded-full
        bg-slate-100
        flex
        items-center
        justify-center
        text-4xl
        mb-5
      "
    >
      📦
    </div>

    <h3 className="text-xl font-black text-slate-700">
      لا توجد أكواد حالياً
    </h3>

    <p className="text-slate-500 mt-2">
      قم بإنشاء أول دفعة أكواد للبدء.
    </p>

    <button
      className="
        mt-6
bg-violet-600
hover:bg-violet-700
        text-white
        rounded-xl
        h-12
        px-8
        font-bold
        transition
      "
    >
      ✨ ابدأ بتوليد الأكواد
    </button>

  </div>

) : (

  filteredCodes.map((item) => (

    <div
      key={item.id}
      className="
        grid
        grid-cols-7
        items-center
        px-6
        py-4
        border-b
        border-slate-100
        hover:bg-slate-50
        transition
      "
    >

      <div className="text-center">
        <input type="checkbox" />
      </div>

      <div className="font-bold tracking-wider">
        {item.code}
      </div>

      <div className="text-right">
  <p className="font-bold text-slate-800">
    {item.courses?.title}
  </p>

  <p className="text-xs text-slate-500 mt-1">
    {item.duration_days === 0
      ? "اشتراك دائم"
      : `${item.duration_days} يوم`}
  </p>
</div>


     <div className="text-center">
  {getStatusBadge(item.status)}
</div>

<div className="text-center">
  {item.students ? (
    <div>
      <p className="font-bold text-slate-800">
        {item.students.full_name}
      </p>

      <p className="text-xs text-slate-500 mt-1">
        {item.students.phone}
      </p>
    </div>
  ) : (
    <span className="text-slate-400">
      غير مستخدم
    </span>
  )}
</div>
      <div className="text-center text-sm text-slate-500">
        {new Date(item.created_at).toLocaleDateString("ar-EG")}
      </div>

<div className="flex items-center justify-center gap-2">

  <button
    onClick={() => copyCode(item.code)}
    title="نسخ الكود"
    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
  >
    <Copy size={18} />
  </button>

  <button
    onClick={() => toggleCodeStatus(item.id, item.status)}
    title={
      item.status === "active"
        ? "تعطيل الكود"
        : "تفعيل الكود"
    }
    className={`p-2 rounded-lg transition ${
      item.status === "active"
        ? "text-orange-600 hover:bg-orange-50"
        : "text-green-600 hover:bg-green-50"
    }`}
  >
    {item.status === "active" ? (
      <Ban size={18} />
    ) : (
      <CheckCircle size={18} />
    )}
  </button>

  <button
    onClick={() => deleteCode(item.id)}
    title="حذف الكود"
    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
  >
    <Trash2 size={18} />
  </button>

</div>


    </div>

  ))

)}

</div>

      </div>

    </main>

    </div>
);
};

export default SubscriptionCodes;
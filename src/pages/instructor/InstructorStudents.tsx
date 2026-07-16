import {
  Search, Users, UserCheck, GraduationCap,
  Trash2, Eye, Power, UsersRound,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";

const grades = [
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
];

export function InstructorStudents() {
  const navigate = useNavigate();

  const [students, setStudents]       = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter]   = useState("");

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    const { data, error } = await supabase.from("students").select("*");
    if (!error) setStudents(data || []);
  };

  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();

  const newStudentsThisMonth = students.filter((s) => {
    if (!s.created_at) return false;
    const d = new Date(s.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const deleteStudent = async (id: number) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (!error) loadStudents();
  };

  const toggleStudentStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "نشط" ? "موقوف" : "نشط";
    await supabase.from("students").update({ status: newStatus }).eq("id", id);
    loadStudents();
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.includes(searchTerm);
    return (
      matchesSearch &&
      (!gradeFilter  || s.grade  === gradeFilter)  &&
      (!statusFilter || s.status === statusFilter) &&
      (!typeFilter   || s.type   === typeFilter)
    );
  });

  const statCards = [
    {
      label:    "إجمالي الطلاب",
      value:    students.length,
      sub:      "جميع الطلاب المسجلين",
      subColor: "text-slate-400",
      icon:     Users,
      iconBg:   "bg-violet-100",
      iconColor:"text-violet-600",
    },
    {
      label:    "الطلاب النشطون",
      value:    students.filter((s) => s.status === "نشط" || s.status === "active").length,
      sub:      "100% من إجمالي الطلاب",
      subColor: "text-emerald-500",
      icon:     UserCheck,
      iconBg:   "bg-emerald-100",
      iconColor:"text-emerald-600",
    },
    {
      label:    "طلاب هذا الشهر",
      value:    newStudentsThisMonth,
      sub:      "+100% عن الشهر الماضي",
      subColor: "text-emerald-500",
      icon:     GraduationCap,
      iconBg:   "bg-orange-100",
      iconColor:"text-orange-500",
    },
  ];

  const selectCls = `
    w-full border border-slate-200 rounded-2xl
    px-4 py-3 sm:px-5 sm:py-4 bg-white text-sm sm:text-base
    focus:outline-none focus:border-violet-400
  `;

  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[32px] bg-[#4C1D95] px-5 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10 text-white shadow-xl mb-5 sm:mb-8">
        <div className="relative z-10 flex flex-row-reverse items-center gap-4 sm:gap-6">
          <div className="text-right flex-1">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-none">الطلاب</h1>
            <p className="text-blue-100 mt-2 sm:mt-3 text-sm sm:text-lg lg:text-2xl">
              إدارة ومتابعة جميع الطلاب بالمنصة
            </p>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[28px] bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <UsersRound size={24} className="text-white sm:hidden" />
            <UsersRound size={32} className="text-white hidden sm:block" />
          </div>
        </div>
        <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-24 bottom-0 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      <div className="space-y-4 sm:space-y-6 lg:space-y-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 lg:gap-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="bg-white rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="px-4 sm:px-7 py-4 sm:py-5 flex items-center justify-between gap-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[24px] ${card.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={`sm:hidden ${card.iconColor}`} />
                    <Icon size={30} className={`hidden sm:block ${card.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-xs sm:text-sm mb-1 sm:mb-2">{card.label}</p>
                    <p className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none">{card.value}</p>
                    <p className={`text-xs sm:text-sm mt-2 sm:mt-3 ${card.subColor}`}>{card.sub}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Search & filters ── */}
        <Card className="bg-white rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
              <Button
                variant="outline"
                onClick={() => { setSearchTerm(""); setGradeFilter(""); setStatusFilter(""); setTypeFilter(""); }}
                className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-sm shrink-0"
              >
                إعادة تعيين
              </Button>
              <div className="text-right">
                <h3 className="text-lg sm:text-2xl font-black mb-0.5 sm:mb-1">البحث والفلاتر</h3>
                <p className="text-slate-500 text-xs sm:text-sm">ابحث عن طالب معين أو استخدم الفلاتر</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Input
                placeholder="اسم الطالب أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
              <select className={selectCls} value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                <option value="">كل الصفوف</option>
                {grades.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">جميع الحالات</option>
                <option value="نشط">نشط</option>
                <option value="موقوف">موقوف</option>
              </select>
              <select className={selectCls} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">جميع الأنواع</option>
                <option value="سنتر">سنتر</option>
                <option value="أونلاين">أونلاين</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* ── List header ── */}
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black">قائمة الطلاب</h2>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs sm:text-sm font-bold">
            {filteredStudents.length} طالب
          </span>
        </div>

        {/* ── Table ── */}
        <Card className="bg-white border border-slate-100 rounded-2xl sm:rounded-[32px] overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#f8f9fc] border-b border-slate-100">
                    {["الطالب","الإيميل","الصف الدراسي","النوع","الحالة","تاريخ التسجيل","الكورسات","الإجراءات"].map((h, i) => (
                      <th key={h} className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold text-slate-500 ${i === 7 ? "text-center" : "text-right"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-slate-100 hover:bg-[#f8fbff] transition-colors duration-200">

                      {/* الطالب */}
                      <td className="px-4 sm:px-8 py-3 sm:py-5">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <Avatar name={student.full_name || student.name} size="sm" />
                          <div>
                            <p className="font-semibold text-slate-900 text-sm sm:text-[17px]">
                              {student.full_name || student.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">
                              {student.phone || "لا يوجد رقم"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* الإيميل */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5 text-slate-700 font-medium text-xs sm:text-sm whitespace-nowrap">
                        {student.email}
                      </td>

                      {/* الصف */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium whitespace-nowrap">
                          {student.grade}
                        </span>
                      </td>

                      {/* النوع */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <span className={`px-2.5 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                          student.type === "أونلاين" ? "bg-violet-100 text-violet-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {student.type || "سنتر"}
                        </span>
                      </td>

                      {/* الحالة */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <span className={`px-2.5 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                          student.status === "نشط" || student.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {student.status === "نشط" || student.status === "active" ? "نشط" : "موقوف"}
                        </span>
                      </td>

                      {/* تاريخ التسجيل */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5 text-slate-700 text-xs sm:text-sm whitespace-nowrap">
                        {student.created_at ? new Date(student.created_at).toLocaleDateString("ar-EG") : "-"}
                      </td>

                      {/* الكورسات */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium">
                          {student.courses || 0} كورس
                        </span>
                      </td>

                      {/* الإجراءات */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <div className="flex justify-center gap-1.5 sm:gap-2 flex-row-reverse">
                          <Button size="sm" onClick={() => navigate(`/instructor/students/${student.id}`)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-violet-100 text-violet-600 hover:bg-violet-200 border-0 shadow-none p-0">
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" onClick={() => toggleStudentStatus(student.id, student.status)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-100 text-orange-600 hover:bg-orange-200 border-0 shadow-none p-0">
                            <Power size={14} />
                          </Button>
                          <Button size="sm"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-red-100 text-red-600 hover:bg-red-200 border-0 shadow-none p-0"
                            onClick={() => { if (confirm("هل أنت متأكد من حذف الطالب؟")) deleteStudent(student.id); }}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}

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
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        student_courses(
          id,
          active
        )
      `);
 
    console.log(data);
    console.log(error);
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
      subColor: "text-gray-400 dark:text-gray-500",
      icon:     Users,
      iconBg:   "bg-[#F6EEFF] dark:bg-[#2B103D]",
      iconColor:"text-[#B348FE]",
    },
    {
      label:    "الطلاب النشطون",
      value:    students.filter((s) => s.status === "نشط" || s.status === "active").length,
      sub:      "100% من إجمالي الطلاب",
      subColor: "text-emerald-500 dark:text-emerald-400",
      icon:     UserCheck,
      iconBg:   "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor:"text-emerald-600 dark:text-emerald-500",
    },
    {
      label:    "طلاب هذا الشهر",
      value:    newStudentsThisMonth,
      sub:      "+100% عن الشهر الماضي",
      subColor: "text-emerald-500 dark:text-emerald-400",
      icon:     GraduationCap,
      iconBg:   "bg-amber-50 dark:bg-amber-950/30",
      iconColor:"text-amber-600 dark:text-amber-500",
    },
  ];

  const selectCls = `
    w-full border-2 border-gray-200 dark:border-[#2A2A2A] rounded-2xl
    px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm sm:text-base
    focus:outline-none focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20
  `;

  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#B348FE] to-[#9E2FFF] px-5 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10 text-white shadow-xl mb-5 sm:mb-8">
        <div className="relative z-10 flex flex-row-reverse items-center gap-4 sm:gap-6">
          <div className="text-right flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">الطلاب</h1>
            <p className="text-white/90 mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg">
              إدارة ومتابعة جميع الطلاب بالمنصة
            </p>
          </div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <UsersRound size={24} className="text-white sm:hidden" />
            <UsersRound size={32} className="text-white hidden sm:block" />
          </div>
        </div>
        <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-24 bottom-0 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      <div className="space-y-4 sm:space-y-6 lg:space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm hover:shadow-lg hover:border-[#B348FE] transition-all duration-300">
                <CardContent className="px-4 sm:px-6 lg:px-7 py-4 sm:py-5 lg:py-6 flex items-center justify-between gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={`sm:hidden ${card.iconColor}`} />
                    <Icon size={24} className={`hidden sm:block lg:hidden ${card.iconColor}`} />
                    <Icon size={28} className={`hidden lg:block ${card.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold mb-1 sm:mb-2">{card.label}</p>
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-none">{card.value}</p>
                    <p className={`text-xs sm:text-sm mt-2 font-bold ${card.subColor}`}>{card.sub}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search & filters */}
        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
              <Button
                variant="outline"
                onClick={() => { setSearchTerm(""); setGradeFilter(""); setStatusFilter(""); setTypeFilter(""); }}
                className="h-10 sm:h-12 px-4 sm:px-6 rounded-2xl text-sm font-bold border-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] shrink-0"
              >
                إعادة تعيين
              </Button>
              <div className="text-right">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-0.5 sm:mb-1">البحث والفلاتر</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">ابحث عن طالب معين أو استخدم الفلاتر</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Input
                placeholder="اسم الطالب أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
                className="bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
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

        {/* List header */}
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">قائمة الطلاب</h2>
          <span className="px-3 py-1.5 rounded-full bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] text-xs sm:text-sm font-black border border-[#EAD8FF] dark:border-[#2A2A2A]">
            {filteredStudents.length} طالب
          </span>
        </div>

        {/* Table */}
        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-[#2A2A2A]">
                    {["الطالب","الإيميل","الصف الدراسي","النوع","الحالة","تاريخ التسجيل","الكورسات","الإجراءات"].map((h, i) => (
                      <th key={h} className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-xs sm:text-sm font-black text-gray-600 dark:text-gray-400 ${i === 7 ? "text-center" : "text-right"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] transition-colors duration-200">

                      {/* الطالب */}
                      <td className="px-4 sm:px-8 py-3 sm:py-5">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <Avatar name={student.full_name || student.name} size="sm" />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                              {student.full_name || student.name}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1">
                              {student.phone || "لا يوجد رقم"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* الإيميل */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm whitespace-nowrap">
                        {student.email}
                      </td>

                      {/* الصف */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold whitespace-nowrap border border-gray-200 dark:border-gray-700">
                          {student.grade}
                        </span>
                      </td>

                      {/* النوع */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-black border ${
                          student.type === "أونلاين" 
                            ? "bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] border-[#EAD8FF] dark:border-[#2A2A2A]" 
                            : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                        }`}>
                          {student.type || "سنتر"}
                        </span>
                      </td>

                      {/* الحالة */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-black border ${
                          student.status === "نشط" || student.status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                            : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                        }`}>
                          {student.status === "نشط" || student.status === "active" ? "نشط" : "موقوف"}
                        </span>
                      </td>

                      {/* تاريخ التسجيل */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5 text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap font-medium">
                        {student.created_at ? new Date(student.created_at).toLocaleDateString("ar-EG") : "-"}
                      </td>

                      {/* الكورسات */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold border border-gray-200 dark:border-gray-700">
                          {student.student_courses?.length || 0} كورس
                        </span>
                      </td>

                      {/* الإجراءات */}
                      <td className="px-4 sm:px-6 py-3 sm:py-5">
                        <div className="flex justify-center gap-1.5 sm:gap-2 flex-row-reverse">
                          <Button size="sm" onClick={() => navigate(`/instructor/students/${student.id}`)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] hover:bg-[#EAD8FF] dark:hover:bg-[#3D1952] border-0 shadow-none p-0">
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" onClick={() => toggleStudentStatus(student.id, student.status)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-0 shadow-none p-0">
                            <Power size={14} />
                          </Button>
                          <Button size="sm"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 border-0 shadow-none p-0"
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
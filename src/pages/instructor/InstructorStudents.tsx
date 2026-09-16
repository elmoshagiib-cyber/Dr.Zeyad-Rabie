import {
  Search, Users, UserCheck, GraduationCap,
  Trash2, Eye, Power, UsersRound,
  ChevronRight, ChevronLeft, Filter
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { motion } from "framer-motion";

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
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        student_courses(
          id,
          active
        )
      `);

    if (!error) setStudents(data || []);
    setLoading(false);
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
    await supabase
      .from("students")
      .update({
        status: newStatus,
        is_blocked: newStatus === "موقوف",
      })
      .eq("id", id);
    loadStudents();
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, gradeFilter, statusFilter, typeFilter]);

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

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStudentTypeLabel = (type?: string) => {
    switch (type) {
      case "center":
        return "سنتر";
      case "online":
        return "أونلاين";
      default:
        return "سنتر";
    }
  };

  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#1547D6] to-[#3183FF] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/10 blur-[100px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
              <UsersRound className="text-amber-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">الطلاب</h1>
              <p className="text-white/60 text-xs sm:text-sm mt-0.5">إدارة ومتابعة جميع الطلاب بالمنصة</p>
            </div>
          </div>
        </motion.div>

        {/* Stats - كروت مضغوطة مثل صفحة التسليمات */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6">
          {/* إجمالي الطلاب */}
          <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-[#155DFC] p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-500">إجمالي الطلاب</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users className="text-[#155DFC]" size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-[#155DFC] mb-1">{students.length}</div>
            <div className="text-xs text-slate-400 font-medium">كل الطلاب المسجلين</div>
          </div>

          {/* النشطون */}
          <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-500">النشطون</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <UserCheck className="text-emerald-600" size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600 mb-1">
              {students.filter((s) => s.status === "نشط" || s.status === "active").length}
            </div>
            <div className="text-xs text-slate-400 font-medium">طالب متاح للتعلم</div>
          </div>

          {/* هذا الشهر */}
          <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-amber-500 p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-500">هذا الشهر</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="text-amber-600" size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 mb-1">{newStudentsThisMonth}</div>
            <div className="text-xs text-slate-400 font-medium">طالب جديد انضم</div>
          </div>

          {/* الموقوفون */}
          <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-red-500 p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-500">الموقوفون</span>
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Power className="text-red-600" size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-red-600 mb-1">
              {students.filter((s) => s.status === "موقوف").length}
            </div>
            <div className="text-xs text-slate-400 font-medium">غير متاح للتعلم حاليًا</div>
          </div>
        </div>

        {/* Filters - مطابقة لتصميم صفحة التسليمات */}
        <div className="py-4 lg:py-6 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[#155DFC]" />
              <h3 className="text-base font-black text-slate-900">البحث والفلاتر</h3>
            </div>
            <button
              onClick={() => { setSearchTerm(""); setGradeFilter(""); setStatusFilter(""); setTypeFilter(""); }}
              className="text-xs font-bold text-[#155DFC] hover:text-[#1547D6] transition-colors"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="اسم الطالب أو الكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-white border-slate-200 rounded-xl h-12"
              />
            </div>

            <select 
              value={gradeFilter} 
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full h-12 border border-slate-200 rounded-xl px-4 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
            >
              <option value="">كل الصفوف</option>
              {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 border border-slate-200 rounded-xl px-4 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
            >
              <option value="">جميع الحالات</option>
              <option value="نشط">نشط</option>
              <option value="موقوف">موقوف</option>
            </select>

            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-12 border border-slate-200 rounded-xl px-4 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#155DFC]"
            >
              <option value="">جميع الأنواع</option>
              <option value="center">سنتر</option>
              <option value="online">أونلاين</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto py-4 lg:py-6 bg-white">
          {/* Header with count */}
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-black text-slate-900">قائمة الطلاب</h2>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#155DFC] text-xs font-black border border-blue-200">
              {filteredStudents.length} طالب
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-600 font-bold">لا يوجد طلاب</p>
            </div>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="hidden md:block">
                <Card className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="w-[20%] px-4 py-3 text-center text-xs font-black text-slate-600">الطالب</th>
                          <th className="w-[12%] px-4 py-3 text-center text-xs font-black text-slate-600">رقم الهاتف</th>
                          <th className="w-[18%] px-4 py-3 text-center text-xs font-black text-slate-600">الإيميل</th>
                          <th className="w-[14%] px-4 py-3 text-center text-xs font-black text-slate-600">الصف</th>
                          <th className="w-[8%] px-4 py-3 text-center text-xs font-black text-slate-600">النوع</th>
                          <th className="w-[8%] px-4 py-3 text-center text-xs font-black text-slate-600">الحالة</th>
                          <th className="w-[8%] px-4 py-3 text-center text-xs font-black text-slate-600">الكورسات</th>
                          <th className="w-[12%] px-4 py-3 text-center text-xs font-black text-slate-600">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudents.map((student) => (
                          <tr 
                            key={student.id} 
                            className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar name={student.full_name || student.name} src={student.avatar_url} size="sm" className="h-8 w-8 text-xs" />
                                <p className="font-bold text-slate-900 text-sm truncate">
                                  {student.full_name || student.name}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700 text-xs font-medium">
                              {student.phone || "لا يوجد رقم"}
                            </td>
                            <td className="px-4 py-3 text-slate-700 text-xs font-medium truncate">
                              {student.email}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 whitespace-nowrap">
                                {student.grade}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-lg text-xs font-black border whitespace-nowrap ${
                                student.type === "online" 
                              ? "bg-blue-50 text-[#155DFC] border-blue-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {getStudentTypeLabel(student.type)}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-lg text-xs font-black border whitespace-nowrap ${
                                student.status === "نشط" || student.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}>
                                {student.status === "نشط" || student.status === "active" ? "نشط" : "موقوف"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 whitespace-nowrap">
                                {student.student_courses?.length || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-1">
                                <button
                                  title="عرض بيانات الطالب"
                                  onClick={() => navigate(`/instructor/students/${student.id}`)}
                                  className="w-8 h-8 rounded-lg bg-blue-50 text-[#155DFC] hover:bg-blue-100 flex items-center justify-center transition-all duration-200"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  title={student.status === "نشط" ? "إيقاف الطالب" : "تفعيل الطالب"}
                                  onClick={() => toggleStudentStatus(student.id, student.status)}
                                  className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-all duration-200"
                                >
                                  <Power size={14} />
                                </button>
                                <button
                                  title="حذف الطالب"
                                  onClick={() => { if (confirm("هل أنت متأكد من حذف الطالب؟")) deleteStudent(student.id); }}
                                  className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all duration-200"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {paginatedStudents.map((student) => (
                  <Card 
                    key={student.id} 
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.full_name || student.name} src={student.avatar_url} size="sm" className="h-10 w-10" />
                          <div>
                            <h3 className="font-black text-slate-900 text-sm">
                              {student.full_name || student.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-black border ${
                          student.status === "نشط" || student.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {student.status === "نشط" || student.status === "active" ? "نشط" : "موقوف"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-500 mb-1">الصف</p>
                          <p className="text-xs font-bold text-slate-900">{student.grade}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-500 mb-1">النوع</p>
                          <span className={`text-xs font-black ${
                            student.type === "online" ? "text-[#155DFC]" : "text-amber-600"
                          }`}>
                            {getStudentTypeLabel(student.type)}
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-500 mb-1">الكورسات</p>
                          <p className="text-xs font-bold text-slate-900">
                            {student.student_courses?.length || 0}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <p className="text-xs text-slate-500 mb-1">الهاتف</p>
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {student.phone || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/instructor/students/${student.id}`)}
                          className="flex-1 bg-[#155DFC] hover:bg-[#1547D6] text-white rounded-xl py-2 text-xs font-black"
                        >
                          <Eye size={14} className="ml-1" />
                          عرض
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => toggleStudentStatus(student.id, student.status)}
                          className="flex-1 border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl py-2 text-xs font-black"
                        >
                          <Power size={14} className="ml-1" />
                          {student.status === "نشط" ? "تعطيل" : "تفعيل"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { if (confirm("هل أنت متأكد من حذف الطالب؟")) deleteStudent(student.id); }}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-2 text-xs font-black"
                        >
                          <Trash2 size={14} className="ml-1" />
                          حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <span className="text-xs font-bold text-slate-600 px-2">
                    صفحة {currentPage} من {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
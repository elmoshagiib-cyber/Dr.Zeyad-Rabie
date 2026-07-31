import {
  BookOpen,
  Monitor,
  Activity,
  BarChart3,
  User,
  Bell,
  Plus,
  Power,
  Trash2,
  Eye,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [homeworkResults, setHomeworkResults] = useState<any[]>([]);

  const [showCourseModal, setShowCourseModal] = useState(false);
const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

const [announcementMessage, setAnnouncementMessage] = useState("");

const [announcementPriority, setAnnouncementPriority] =
  useState("important");
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  const gradeMap: Record<string, string> = {
    "الصف الأول الثانوي": "sec_1",
    "الصف الثاني الثانوي": "sec_2",
    "الصف الثالث الثانوي": "sec_3",
    "الصف الأول الإعدادي": "prep_1",
    "الصف الثاني الإعدادي": "prep_2",
    "الصف الثالث الإعدادي": "prep_3",
  };



  const loadStudent = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

if (error) {
  console.log("Student Error:", error);
}

console.log("Student Data:", data);

if (data) {
  setStudent(data);
}
    setLoading(false);
  };

  const loadCourses = async () => {
    const { data, error } = await supabase
      .from("student_courses")
      .select("*")
      .eq("student_id", Number(id));

    if (error) {
      console.log(error);
      return;
    }

    if (!data?.length) {
      setCourses([]);
      return;
    }

    const courseIds = data.map((item: any) => item.course_id);

    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")
      .in("id", courseIds);

    const mergedData = data.map((item: any) => ({
      ...item,
      courseData: coursesData?.find((c: any) => c.id === item.course_id),
    }));

    mergedData.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
    setCourses(mergedData);
  };

  const loadAvailableCourses = async () => {
    if (!student) return;

    const gradeKey = gradeMap[student.grade] || student.grade;

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .eq("is_hidden", false)
      .eq("grade", gradeKey);

    if (error) {
      console.log(error);
      return;
    }

    setAvailableCourses(data || []);
  };

  useEffect(() => {
    if (student) {
      loadAvailableCourses();
    }
  }, [student]);

  const deleteCourse = async (courseId: number) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف الكورس؟");
    if (!confirmed) return;

    await supabase
      .from("student_courses")
      .delete()
      .eq("id", courseId);

    loadCourses();
  };

  const addCourse = async () => {
    if (!selectedCourse) return;

    const alreadyExists = courses.some(
      (c) => String(c.course_id) === String(selectedCourse)
    );

    if (alreadyExists) {
      alert("الطالب مشترك بالفعل في هذا الكورس");
      return;
    }

    const { data, error } = await supabase
      .from("student_courses")
      .insert({
        student_id: Number(id),
        course_id: selectedCourse,
        active: true,
        subscription_type: "إداري",
      })
      .select();

    console.log(data);
    console.log(error);

    if (error) {
      alert(error.message);
      return;
    }

    setShowCourseModal(false);
    setSelectedCourse("");

    await loadCourses();
  };

  const loadExamResults = async () => {
    const { data } = await supabase
      .from("exam_results")
      .select(`*, exams (title)`)
      .eq("student_id", Number(id));
    if (data) {
      setExamResults(data);
    }
  };

  const loadHomeworkResults = async () => {
    const { data } = await supabase
      .from("homework_submissions")
      .select("*")
      .eq("student_id", Number(id));

    if (data) {
      setHomeworkResults(data);
    }
  };

const sendAnnouncement = async () => {
  if (!announcementMessage.trim()) {
    alert("اكتب الرسالة أولاً");
    return;
  }

  const { error } = await supabase
    .from("student_announcements")
    .insert({
      student_id: student.id,
      message: announcementMessage,
      priority: announcementPriority,
    });

  if (error) {
    console.log(error);
    alert("حدث خطأ أثناء الإرسال");
    return;
  }

  alert("تم إرسال الرسالة بنجاح");

  setAnnouncementMessage("");
  setAnnouncementPriority("important");
  setShowAnnouncementModal(false);
};

  const toggleStudentStatus = async () => {
    const confirmed = window.confirm(
      student.is_blocked
        ? "هل تريد تفعيل هذا الطالب؟"
        : "هل تريد إيقاف هذا الطالب؟"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("students")
      .update({
        is_blocked: !student.is_blocked,
        status: !student.is_blocked ? "موقوف" : "نشط",
      })
      .eq("id", student.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadStudent();
  };

  useEffect(() => {
    loadStudent();
    loadCourses();
    loadExamResults();
    loadHomeworkResults();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen bg-white dark:bg-[#09090B]" dir="rtl">
        <div className="hidden lg:block flex-shrink-0">
          <DashboardSidebar type="instructor" />
        </div>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-bold">جاري تحميل بيانات الطالب...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-screen bg-white dark:bg-[#09090B]" dir="rtl">
        <div className="hidden lg:block flex-shrink-0">
          <DashboardSidebar type="instructor" />
        </div>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={64} />
            <p className="text-gray-600 dark:text-gray-400 font-bold text-lg">الطالب غير موجود</p>
            <Button onClick={() => navigate(-1)} className="mt-4 bg-[#B348FE] hover:bg-[#9E2FFF]">
              العودة
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const uniqueCourses = [...new Set(courses.map((c) => c.course_id))];
  const lessonsPercent = student.total_lessons > 0
    ? Math.round((student.watched_lessons / student.total_lessons) * 100)
    : 0;
  const homeworkPercent = student.total_homework > 0
    ? Math.round((student.completed_homework / student.total_homework) * 100)
    : 0;
  const overallProgress = Math.round((lessonsPercent + homeworkPercent) / 2);
  const totalScores = examResults.reduce((sum: number, exam: any) => sum + (exam.score || 0), 0);
  const averageScore = examResults.length > 0 ? Math.round(totalScores / examResults.length) : 0;
  const highestScore = examResults.length > 0 ? Math.max(...examResults.map((e: any) => e.score || 0)) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#09090B]" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
  className="
    relative
    overflow-hidden

    rounded-[36px]

    bg-gradient-to-r
    from-[#C65CFF]
    via-[#B348FE]
    to-[#9E2FFF]

    px-6
    lg:px-8

    py-6
    lg:py-7

    text-white

    shadow-[0_18px_45px_rgba(179,72,254,.22)]

    mx-6
    mt-6
  "
>
          <div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-white/10 blur-[120px]" />
          <div className="absolute -right-24 bottom-0 w-64 h-64 rounded-full bg-white/10 blur-[120px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-0 border-2 border-white/30 hover:bg-white/10 text-white font-bold rounded-xl"
              >
                <ArrowRight size={16} />
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[24px]
bg-white/15
backdrop-blur-xl
border
border-white/20">
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    student.full_name?.charAt(0)
                  )}
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl tracking-tight font-black mb-2">{student.full_name}</h1>
                  <div className="flex flex-wrap gap-2 text-white/90 text-sm">
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                      <div className={`w-2 h-2 rounded-full ${student.is_blocked ? "bg-red-400" : "bg-emerald-400"}`} />
                      {student.is_blocked ? "موقوف" : "نشط"}
                    </span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">
                      {student.type === "online" ? "أونلاين" : student.type === "center" ? "سنتر" : "نوع"}
                    </span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">{uniqueCourses.length} كورس</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">{student.watched_lessons || 0} محاضرة</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate(`/instructor/students/edit/${student.id}`)}
                className="bg-white text-[#B348FE] hover:bg-white/90 rounded-2xl font-black px-6 shadow-lg h-12 shadow-lg
hover:shadow-xl
transition-all
hover:-translate-y-0.5"
              >
                تعديل الطالب
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
          {/* Action Buttons */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowCourseModal(true)}
                  className="bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl font-bold shadow-md hover:shadow-[0_8px_20px_rgba(179,72,254,.35)] h-12"
                >
                  <Plus size={18} className="ml-2" />
                  إضافة كورس
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAnnouncementModal(true)}
                  className="border-2 border-gray-200 dark:border-[#2A2A2A] hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] rounded-xl font-bold h-12 transition-all duration-300"
                >
                  <Bell size={18} className="ml-2" />
                  إرسال إشعار
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleStudentStatus}
                  className={`border-2 rounded-xl font-bold h-12 transition-all duration-300 ${
                    student.is_blocked
                      ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                      : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                  }`}
                >
                  <Power size={18} className="ml-2" />
                  {student.is_blocked ? "تفعيل الطالب" : "إيقاف الطالب"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm hover:shadow-lg hover:border-[#B348FE] transition-all duration-300">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">محاضرة مشاهدة</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-[#B348FE]">{student.watched_lessons || 0}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                    <BookOpen className="text-[#B348FE]" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm hover:shadow-lg hover:border-[#B348FE] transition-all duration-300">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">واجب محلول</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-emerald-600">{student.completed_homework || 0}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm hover:shadow-lg hover:border-[#B348FE] transition-all duration-300">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">كورس مشترك</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-amber-500">{uniqueCourses.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                    <GraduationCap className="text-amber-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm hover:shadow-lg hover:border-[#B348FE] transition-all duration-300">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">نسبة الإنجاز</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-blue-600">{lessonsPercent}%</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <Activity className="text-blue-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Info Card */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">بيانات الطالب</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">معلومات الطالب الأساسية</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCardItem label="اسم الطالب" value={student.full_name} icon={<User size={18} />} />
                <InfoCardItem label="الصف الدراسي" value={student.grade} icon={<GraduationCap size={18} />} />
                <InfoCardItem label="رقم الطالب" value={student.phone} icon={<Phone size={18} />} />
                <InfoCardItem label="رقم ولي الأمر" value={student.parent_phone || "-"} icon={<Phone size={18} />} />
                <InfoCardItem label="المحافظة" value={student.governorate || "-"} icon={<Mail size={18} />} />
                <InfoCardItem
                  label="تاريخ التسجيل"
                  value={student.created_at ? new Date(student.created_at).toLocaleString("ar-EG") : "-"}
                  icon={<Calendar size={18} />}
                />
                <InfoCardItem
                  label="آخر دخول"
                  value={student.last_login ? new Date(student.last_login).toLocaleString("ar-EG") : "-"}
                  icon={<Calendar size={18} />}
                />
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all duration-200">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">الحالة</p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                      student.is_blocked
                        ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${student.is_blocked ? "bg-red-500" : "bg-emerald-500"}`} />
                    {student.is_blocked ? "موقوف" : "نشط"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">تقدم الطالب</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">نظرة شاملة على إنجاز ومتابعة الطالب</p>
              </div>

              <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-6 border border-gray-100 dark:border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">التقدم الكلي في جميع الكورسات</h3>
                  <span className="text-3xl font-black text-[#B348FE]">{overallProgress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B348FE] to-[#9E2FFF] rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white dark:bg-[#111111] rounded-xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">المحاضرات</p>
                    <p className="text-gray-900 dark:text-white font-black text-sm">
                      {student.watched_lessons || 0} / {student.total_lessons || 0}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#111111] rounded-xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">الواجبات</p>
                    <p className="text-gray-900 dark:text-white font-black text-sm">
                      {student.completed_homework || 0} / {student.total_homework || 0}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#111111] rounded-xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">الحضور</p>
                    <p className={`font-black text-sm ${
                      (student.attendance_percentage || 0) >= 80
                        ? "text-emerald-600"
                        : (student.attendance_percentage || 0) >= 50
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}>
                      {student.attendance_percentage || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-6">ملخص الأداء</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 text-center border border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all duration-300">
                  <h3 className="text-2xl font-black text-[#B348FE]">{examResults.length}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mt-2">عدد الاختبارات</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 text-center border border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all duration-300">
                  <h3 className="text-2xl font-black text-blue-600">{averageScore}%</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mt-2">متوسط الدرجات</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 text-center border border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all duration-300">
                  <h3 className="text-2xl font-black text-emerald-600">{highestScore}%</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mt-2">أعلى درجة</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 text-center border border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all duration-300">
                  <h3 className="text-2xl font-black text-amber-600">{totalScores}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mt-2">مجموع الدرجات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses Section */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#2A2A2A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                    <BookOpen className="text-[#B348FE]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white">الاشتراكات والكورسات</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{uniqueCourses.length} كورس</p>
                  </div>
                </div>
              </div>

              {uniqueCourses.length > 0 ? (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-100 dark:border-[#2A2A2A]">
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">الكورس</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">الصف</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">تاريخ الاشتراك</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">الحالة</th>
                          <th className="px-4 py-3 text-center text-xs font-black text-gray-600 dark:text-gray-400">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uniqueCourses.map((courseId) => {
                          const course = courses.find((c) => c.course_id === courseId);
                          if (!course) return null;
                          return (
                            <tr key={course.id} className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-[#F6EEFF]/50 dark:hover:bg-[#2B103D]/50 transition-all">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-sm">{course.courseData?.title}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID: {course.course_id}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{course.courseData?.grade || "-"}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                {course.created_at ? new Date(course.created_at).toLocaleDateString("ar-EG") : "-"}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border ${
                                    course.active
                                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                                      : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                                  }`}
                                >
                                  {course.active ? "مفعل" : "غير مفعل"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteCourse(course.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 rounded-lg text-xs font-bold h-8"
                                >
                                  <Trash2 size={14} className="ml-1" />
                                  حذف
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <BookOpen className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-bold">لا توجد اشتراكات حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exam Results */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#2A2A2A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                    <BarChart3 className="text-[#B348FE]" size={20} />
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-white">سجل الامتحانات والدرجات</h3>
                </div>
              </div>
              <div className="p-6">
                {examResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-100 dark:border-[#2A2A2A]">
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">الصف</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">الامتحان</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">الدرجة</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">الكلية</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">النسبة</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examResults.map((exam: any) => (
                          <tr key={exam.id} className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-all">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{student.grade}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{exam.exams?.title || "-"}</td>
                            <td className="px-4 py-3 text-sm font-bold text-[#B348FE]">{exam.score || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">100</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{exam.score || 0}%</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {exam.submitted_at ? new Date(exam.submitted_at).toLocaleDateString("ar-EG") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <AlertCircle className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={48} />
                    <p className="font-bold">لم يتم أداء أي امتحانات</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                      <Activity className="text-[#B348FE]" size={20} />
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-white">سجل مشاهدة المحاضرات</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <Monitor className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={48} />
                    <p className="font-bold">لا يوجد سجل مشاهدات</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                      <Monitor className="text-[#B348FE]" size={20} />
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-white">إدارة أجهزة الطالب</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-100 dark:border-[#2A2A2A]">
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">اسم الجهاز</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">النظام</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">الحالة</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-gray-600 dark:text-gray-400">آخر نشاط</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-all">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Unknown Device</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">macOS / Safari</td>
                          <td className="px-4 py-3">
                            <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full text-xs font-black border border-emerald-200 dark:border-emerald-900">
                              متصل
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">2026-05-21</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

{/* Announcement Modal */}
{showAnnouncementModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-[#111111] w-full max-w-[650px] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2A2A2A]">

      <div className="p-6 border-b border-gray-100 dark:border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
            <Bell className="text-[#B348FE]" size={24} />
          </div>

          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              رسالة خاصة للطالب
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              ستظهر هذه الرسالة لهذا الطالب فقط أسفل شريط التنقل.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">

        <div>
          <label className="font-bold text-sm mb-2 block">
            أهمية الرسالة
          </label>

          <select
            value={announcementPriority}
            onChange={(e) => setAnnouncementPriority(e.target.value)}
            className="w-full h-12 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-4"
          >
            <option value="normal">عادية</option>
            <option value="important">مهمة</option>
            <option value="urgent">عاجلة</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-sm mb-2 block">
            الرسالة
          </label>

          <textarea
            rows={6}
            value={announcementMessage}
            onChange={(e) => setAnnouncementMessage(e.target.value)}
            placeholder="اكتب الرسالة التي ستظهر لهذا الطالب..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] p-4 resize-none"
          />
        </div>

      </div>

      <div className="p-6 border-t border-gray-100 dark:border-[#2A2A2A] flex gap-3">

        <Button
          onClick={sendAnnouncement}
          className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl h-12 font-black"
        >
          إرسال الرسالة
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowAnnouncementModal(false)}
          className="flex-1 rounded-xl h-12 font-black"
        >
          إلغاء
        </Button>

      </div>

    </div>
  </div>
)}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111111] w-full max-w-[500px] rounded-3xl shadow-2xl p-6 border border-gray-200 dark:border-[#2A2A2A]">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">إضافة كورس للطالب</h3>
            <div className="space-y-4">
              <div>
                <label className="font-bold text-gray-900 dark:text-white text-sm mb-2 block">اختر الكورس</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full h-12 border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-4 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B348FE]"
                >
                  <option value="">اختر الكورس</option>
                  {availableCourses.length === 0 ? (
                    <option disabled>لا توجد كورسات منشورة لهذا الصف الدراسي</option>
                  ) : (
                    availableCourses.map((course) => {
                      const subscribed = courses.some(
                        (c) => String(c.course_id) === String(course.id)
                      );
                      return (
                        <option key={course.id} value={course.id} disabled={subscribed}>
                          {course.title}
                          {subscribed ? " (مشترك بالفعل)" : ""}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={addCourse} className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl font-black h-12">
                  إضافة
                </Button>
                <Button variant="outline" onClick={() => setShowCourseModal(false)} className="flex-1 border-2 border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] rounded-xl font-black h-12">
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCardItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all duration-200">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-gray-500 dark:text-gray-400 mt-0.5">{icon}</span>
        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">{label}</p>
      </div>
      <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2">{value}</p>
    </div>
  );
}
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
  ArrowRight,
  KeyRound,
  Copy,
  Check,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  FileText
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface Student {
  id: number;
  full_name: string;
  code: string | null;
  grade: string;
  phone: string;
  parent_phone: string | null;
  governorate: string | null;
  avatar_url: string | null;
  is_blocked: boolean;
  status: string;
  type: string;
  watched_lessons: number;
  total_lessons: number;
  completed_homework: number;
  total_homework: number;
  attendance_percentage: number;
  total_watch_minutes: number;
  last_login: string | null;
  last_activity: string | null;
  device_name: string | null;
  subscription_status: string | null;
  subscription_end_date: string | null;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  grade: string;
  is_published: boolean;
  is_hidden: boolean;
}

interface StudentCourse {
  id: number;
  student_id: number;
  course_id: number;
  active: boolean;
  subscription_type: string;
  created_at: string;
  courseData?: Course;
}

interface Exam {
  title: string;
}

interface ExamResult {
  id: number;
  student_id: number;
  exam_id: number;
  score: number;
  submitted_at: string | null;
  exams: Exam | null;
}

interface HomeworkSubmission {
  id: number;
  student_id: number;
  homework_id: number;
  score: number | null;
  submitted_at: string | null;
}

interface LessonProgress {
  id: number;
  student_id: number;
  lesson_id: number;
  course_id: number;
  watched_seconds: number;
  video_duration: number;
  progress_percent: number;
  is_completed: boolean;
  watch_count: number;
  last_position: number;
  last_watched_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CourseItem {
  id: number;
  course_id: number;
  type: string;
  title: string;
}

interface CourseWithProgress extends StudentCourse {
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  lastLesson: string;
  lastWatchedAt: string | null;
}

export function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [homeworkResults, setHomeworkResults] = useState<HomeworkSubmission[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [coursesWithProgress, setCoursesWithProgress] = useState<CourseWithProgress[]>([]);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState("important");
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [copied, setCopied] = useState(false);

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

    if (data) {
      setStudent(data as Student);
    }
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

    const courseIds = data.map((item) => item.course_id);

    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")
      .in("id", courseIds);

    const mergedData: StudentCourse[] = data.map((item) => ({
      ...item,
      courseData: coursesData?.find((c) => c.id === item.course_id),
    }));

    mergedData.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

    setAvailableCourses((data as Course[]) || []);
  };

  const loadLessonProgress = async () => {
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("student_id", Number(id));

    if (error) {
      console.log("Lesson Progress Error:", error);
      return;
    }

    setLessonProgress((data as LessonProgress[]) || []);
  };

  const loadCoursesWithProgress = async () => {
    if (!courses.length) {
      setCoursesWithProgress([]);
      return;
    }

    const courseIds = courses.map((c) => c.course_id);

    const [lessonsData, progressData] = await Promise.all([
      supabase.from("course_items").select("*").in("course_id", courseIds).eq("type", "lesson"),
      supabase.from("lesson_progress").select("*").eq("student_id", Number(id)).in("course_id", courseIds)
    ]);

    const coursesWithStats: CourseWithProgress[] = courses.map((course) => {
      const courseLessons = (lessonsData.data as CourseItem[] || []).filter((l) => l.course_id === course.course_id);
      const courseProgress = (progressData.data as LessonProgress[] || []).filter((p) => p.course_id === course.course_id);
      
      const totalLessons = courseLessons.length;
      const completedLessons = courseProgress.filter((p) => p.is_completed).length;
      const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      const lastProgress = courseProgress.sort((a, b) => 
        new Date(b.last_watched_at || 0).getTime() - new Date(a.last_watched_at || 0).getTime()
      )[0];

      const lastLesson = lastProgress ? courseLessons.find((l) => l.id === lastProgress.lesson_id) : null;

      return {
        ...course,
        totalLessons,
        completedLessons,
        completionPercent,
        lastLesson: lastLesson?.title || "-",
        lastWatchedAt: lastProgress?.last_watched_at || null
      };
    });

    setCoursesWithProgress(coursesWithStats);
  };

  const loadExamResults = async () => {
    const { data } = await supabase
      .from("exam_results")
      .select(`*, exams (title)`)
      .eq("student_id", Number(id))
      .order("submitted_at", { ascending: false });
    
    if (data) {
      setExamResults(data as ExamResult[]);
    }
  };

  const loadHomeworkResults = async () => {
    const { data } = await supabase
      .from("homework_submissions")
      .select("*")
      .eq("student_id", Number(id))
      .order("submitted_at", { ascending: false });

    if (data) {
      setHomeworkResults(data as HomeworkSubmission[]);
    }
  };

  const deleteCourse = async (courseId: number) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف الكورس؟");
    if (!confirmed) return;

    await supabase.from("student_courses").delete().eq("id", courseId);
    loadCourses();
  };

  const addCourse = async () => {
    if (!selectedCourse) return;

    const alreadyExists = courses.some((c) => String(c.course_id) === String(selectedCourse));

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

    if (error) {
      alert(error.message);
      return;
    }

    setShowCourseModal(false);
    setSelectedCourse("");
    await loadCourses();
  };

  const sendAnnouncement = async () => {
    if (!announcementMessage.trim()) {
      alert("اكتب الرسالة أولاً");
      return;
    }

    const { error } = await supabase.from("student_announcements").insert({
      student_id: student?.id,
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

  const generateNewPassword = async () => {
    if (!student) return;

    setPasswordError("");
    setPasswordLoading(true);
    setNewPassword("");
    setCopied(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        "https://ffkuhskhzmhjwrbyswjm.supabase.co/functions/v1/admin-reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ phone: student.phone }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setPasswordError(result.error || "حدث خطأ أثناء توليد كلمة المرور");
        setPasswordLoading(false);
        return;
      }

      setNewPassword(result.new_password);
      setPasswordLoading(false);
    } catch (err) {
      setPasswordError("حدث خطأ في الاتصال بالسيرفر");
      setPasswordLoading(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStudentStatus = async () => {
    if (!student) return;

    const confirmed = window.confirm(
      student.is_blocked ? "هل تريد تفعيل هذا الطالب؟" : "هل تريد إيقاف هذا الطالب؟"
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
    if (student) {
      loadAvailableCourses();
    }
  }, [student]);

  useEffect(() => {
    if (courses.length > 0) {
      loadCoursesWithProgress();
    }
  }, [courses, lessonProgress]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadStudent(),
        loadCourses(),
        loadExamResults(),
        loadHomeworkResults(),
        loadLessonProgress()
      ]);
      setLoading(false);
    };
    loadData();
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
  const lessonsPercent = student.total_lessons > 0 ? Math.round((student.watched_lessons / student.total_lessons) * 100) : 0;
  const homeworkPercent = student.total_homework > 0 ? Math.round((student.completed_homework / student.total_homework) * 100) : 0;
  const overallProgress = Math.round((lessonsPercent + homeworkPercent) / 2);
  
  const totalScores = examResults.reduce((sum, exam) => sum + (exam.score || 0), 0);
  const averageScore = examResults.length > 0 ? Math.round(totalScores / examResults.length) : 0;
  const highestScore = examResults.length > 0 ? Math.max(...examResults.map((e) => e.score || 0)) : 0;
  const lowestScore = examResults.length > 0 ? Math.min(...examResults.map((e) => e.score || 0)) : 0;
  
  const completedHomework = student.completed_homework || 0;
  const totalHomework = student.total_homework || 0;
  const remainingHomework = totalHomework - completedHomework;
  
  const homeworkScores = homeworkResults.filter((h) => h.score !== null && h.score !== undefined);
  const avgHomeworkScore = homeworkScores.length > 0 
    ? Math.round(homeworkScores.reduce((sum, h) => sum + (h.score || 0), 0) / homeworkScores.length)
    : 0;

  const totalWatchMinutes = student.total_watch_minutes || 0;
  const totalWatchHours = Math.floor(totalWatchMinutes / 60);
  const remainingMinutes = totalWatchMinutes % 60;

  const lastWatchedProgress = lessonProgress.sort((a, b) => 
    new Date(b.last_watched_at || 0).getTime() - new Date(a.last_watched_at || 0).getTime()
  )[0];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#09090B]" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-[#C65CFF] via-[#B348FE] to-[#9E2FFF] px-6 lg:px-8 py-6 lg:py-7 text-white shadow-[0_18px_45px_rgba(179,72,254,.22)] mx-6 mt-6">
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
                <div className="w-16 h-16 rounded-[24px] bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center text-2xl font-black overflow-hidden">
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover" />
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
                className="bg-white text-[#B348FE] hover:bg-white/90 rounded-2xl font-black px-6 shadow-lg h-12 hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                تعديل الطالب
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
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
                  onClick={() => {
                    setShowPasswordModal(true);
                    setNewPassword("");
                    setPasswordError("");
                  }}
                  className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/30 rounded-xl font-bold h-12 transition-all duration-300"
                >
                  <KeyRound size={18} className="ml-2" />
                  توليد باسورد جديد
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

          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">بيانات الطالب</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">معلومات الطالب الأساسية</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCardItem label="اسم الطالب" value={student.full_name} icon={<User size={18} />} />
                <InfoCardItem label="كود الطالب" value={student.code || "-"} icon={<GraduationCap size={18} />} />
                <InfoCardItem label="الصف الدراسي" value={student.grade} icon={<GraduationCap size={18} />} />
                <InfoCardItem label="رقم الطالب" value={student.phone} icon={<Phone size={18} />} />
                <InfoCardItem label="رقم ولي الأمر" value={student.parent_phone || "-"} icon={<Phone size={18} />} />
                <InfoCardItem label="المحافظة" value={student.governorate || "-"} icon={<Mail size={18} />} />
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all duration-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Calendar size={18} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">حالة الاشتراك</p>
                  </div>
                  <p className={`font-black text-sm ${
                    student.subscription_status === "active" 
                      ? "text-emerald-600" 
                      : "text-red-600"
                  }`}>
                    {student.subscription_status === "active" ? "نشط" : student.subscription_status === "expired" ? "منتهي" : "-"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all duration-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Calendar size={18} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">تاريخ انتهاء الاشتراك</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {student.subscription_end_date ? new Date(student.subscription_end_date).toLocaleDateString("ar-EG") : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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

              {coursesWithProgress.length > 0 ? (
                <div className="p-6 space-y-4">
                  {coursesWithProgress.map((course) => (
                    <div key={course.id} className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-5 border border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-black text-gray-900 dark:text-white mb-1">{course.courseData?.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {course.courseData?.grade} • اشترك في {course.created_at ? new Date(course.created_at).toLocaleDateString("ar-EG") : "-"}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCourse(course.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 rounded-lg text-xs font-bold h-8"
                        >
                          <Trash2 size={14} className="ml-1" />
                          حذف
                        </Button>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">نسبة الإنجاز</span>
                          <span className="text-sm font-black text-[#B348FE]">{course.completionPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#B348FE] to-[#9E2FFF] rounded-full transition-all duration-500"
                            style={{ width: `${course.completionPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-[#111111] rounded-xl p-3 border border-gray-100 dark:border-[#2A2A2A]">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-1">محاضرات مكتملة</p>
                          <p className="font-black text-sm text-gray-900 dark:text-white">{course.completedLessons} / {course.totalLessons}</p>
                        </div>
                        <div className="bg-white dark:bg-[#111111] rounded-xl p-3 border border-gray-100 dark:border-[#2A2A2A] col-span-2">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-1">آخر محاضرة</p>
                          <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{course.lastLesson}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <BookOpen className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-bold">لا توجد اشتراكات حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">تقدم المشاهدة</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">إحصائيات مشاهدة الفيديوهات والمحاضرات</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-2">
                    <PlayCircle className="text-[#B348FE]" size={18} />
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">محاضرات مشاهدة</p>
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{student.watched_lessons || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">من أصل {student.total_lessons || 0}</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-emerald-600" size={18} />
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">نسبة الإكمال</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">{lessonsPercent}%</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-blue-600" size={18} />
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">إجمالي وقت المشاهدة</p>
                  </div>
                  <p className="text-2xl font-black text-blue-600">{totalWatchHours}س {remainingMinutes}د</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-amber-600" size={18} />
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold">آخر مشاهدة</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {lastWatchedProgress?.last_watched_at 
                      ? new Date(lastWatchedProgress.last_watched_at).toLocaleDateString("ar-EG")
                      : "-"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">الواجبات</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">إحصائيات وسجل الواجبات</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">إجمالي الواجبات</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{totalHomework}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">واجبات محلولة</p>
                    <p className="text-2xl font-black text-emerald-600">{completedHomework}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">واجبات متبقية</p>
                    <p className="text-2xl font-black text-amber-600">{remainingHomework}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">متوسط الدرجات</p>
                    <p className="text-2xl font-black text-[#B348FE]">{avgHomeworkScore}%</p>
                  </div>
                </div>

                {homeworkResults.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-black text-gray-900 dark:text-white text-sm mb-3">آخر الواجبات</h4>
                    {homeworkResults.slice(0, 5).map((hw) => (
                      <div key={hw.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3 border border-gray-100 dark:border-[#2A2A2A]">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">واجب #{hw.homework_id}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {hw.submitted_at ? new Date(hw.submitted_at).toLocaleDateString("ar-EG") : "-"}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className={`text-lg font-black ${
                            (hw.score || 0) >= 80 ? "text-emerald-600" :
                            (hw.score || 0) >= 50 ? "text-amber-600" : "text-red-600"
                          }`}>
                            {hw.score || 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={40} />
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">لا توجد واجبات محلولة</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">الامتحانات</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">نتائج وسجل الاختبارات</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">عدد الاختبارات</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{examResults.length}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">متوسط الدرجات</p>
                    <p className="text-2xl font-black text-[#B348FE]">{averageScore}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">أعلى درجة</p>
                    <p className="text-2xl font-black text-emerald-600">{highestScore}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">أقل درجة</p>
                    <p className="text-2xl font-black text-red-600">{examResults.length > 0 ? lowestScore : 0}%</p>
                  </div>
                </div>

                {examResults.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-black text-gray-900 dark:text-white text-sm mb-3">آخر الاختبارات</h4>
                    {examResults.slice(0, 5).map((exam) => (
                      <div key={exam.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3 border border-gray-100 dark:border-[#2A2A2A]">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{exam.exams?.title || `اختبار #${exam.exam_id}`}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {exam.submitted_at ? new Date(exam.submitted_at).toLocaleDateString("ar-EG") : "-"}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className={`text-lg font-black ${
                            (exam.score || 0) >= 80 ? "text-emerald-600" :
                            (exam.score || 0) >= 50 ? "text-amber-600" : "text-red-600"
                          }`}>
                            {exam.score || 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Award className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={40} />
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">لم يتم أداء أي اختبارات</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">نشاط الطالب</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">آخر الأنشطة والتفاعلات</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-5 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                      <Calendar className="text-[#B348FE]" size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">آخر دخول</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {student.last_login ? new Date(student.last_login).toLocaleString("ar-EG") : "لم يسجل دخول بعد"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-5 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                      <Activity className="text-[#B348FE]" size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">آخر نشاط</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {student.last_activity ? new Date(student.last_activity).toLocaleString("ar-EG") : "لا يوجد"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-5 border border-gray-100 dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                      <Monitor className="text-[#B348FE]" size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">الجهاز المستخدم</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">{student.device_name || "غير محدد"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111111] w-full max-w-[650px] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2A2A2A]">
            <div className="p-6 border-b border-gray-100 dark:border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                  <Bell className="text-[#B348FE]" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">رسالة خاصة للطالب</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ستظهر هذه الرسالة لهذا الطالب فقط أسفل شريط التنقل.</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="font-bold text-sm mb-2 block">أهمية الرسالة</label>
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
                <label className="font-bold text-sm mb-2 block">الرسالة</label>
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

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111111] w-full max-w-[480px] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2A2A2A]">
            <div className="p-6 border-b border-gray-100 dark:border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <KeyRound className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">توليد كلمة مرور جديدة</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">للطالب: {student.full_name}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {!newPassword && !passwordLoading && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-7">
                  سيتم توليد كلمة مرور عشوائية جديدة لهذا الطالب وتحديثها فورًا.
                  تأكد من إرسالها للطالب مباشرة بعد النسخ (عبر واتساب مثلاً)، حيث لن تظهر هذه الكلمة مرة أخرى.
                </p>
              )}

              {passwordLoading && (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className="w-8 h-8 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">جاري توليد كلمة المرور...</p>
                </div>
              )}

              {passwordError && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4">
                  <p className="text-sm text-red-700 dark:text-red-400 font-bold">{passwordError}</p>
                </div>
              )}

              {newPassword && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-5">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">كلمة المرور الجديدة:</p>
                  <div className="flex items-center gap-2">
                    <span
                      dir="ltr"
                      className="flex-1 bg-white dark:bg-[#1A1A1A] rounded-xl px-4 py-3 font-black text-lg tracking-wider text-gray-900 dark:text-white text-center border border-gray-200 dark:border-[#2A2A2A]"
                    >
                      {newPassword}
                    </span>
                    <button
                      onClick={copyPassword}
                      className="h-12 w-12 flex-shrink-0 rounded-xl bg-[#B348FE] hover:bg-[#9E2FFF] text-white flex items-center justify-center transition-colors"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 text-center">تم النسخ بنجاح ✓</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-[#2A2A2A] flex gap-3">
              {!newPassword ? (
                <>
                  <Button
                    onClick={generateNewPassword}
                    disabled={passwordLoading}
                    className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl h-12 font-black disabled:opacity-70"
                  >
                    {passwordLoading ? "جاري التوليد..." : "توليد كلمة المرور"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 rounded-xl h-12 font-black"
                  >
                    إلغاء
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl h-12 font-black"
                >
                  تم
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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
                      const subscribed = courses.some((c) => String(c.course_id) === String(course.id));
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

function InfoCardItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
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
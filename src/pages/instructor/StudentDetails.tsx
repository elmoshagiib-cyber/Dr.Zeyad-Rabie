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
  expires_at: string | null;
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
  percentage?: number;
  passed?: boolean;
  correct_answers?: number;
  wrong_answers?: number;
  total_questions?: number;
  answered_questions?: number;
  started_at?: string | null;
  completed_at?: string | null;
  submitted_at: string | null;
  exams: Exam | null;
  courseTitle?: string;
}

interface HomeworkSubmission {
  id: number;
  student_id: number;
  homework_id: number;
  grade: number | null;
  feedback?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  status?: string | null;
  submitted_at: string | null;
  graded_at?: string | null;
  homeworks?: {
    id: number;
    title: string;
    total_score?: number;
    due_date?: string | null;
    course_sections?: {
      id: string;
      course_id: string;
      courses?: {
        id: string;
        title: string;
      } | null;
    } | null;
  };
}

interface LessonProgress {
  id: number;
  student_id: number;
  lesson_id: string;
  course_id: string;
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
  id: string;
  section_id: string;
  type: string;
  title: string;
}

interface LessonDetail {
  id: string;
  title: string;
  sortOrder: number;
  isCompleted: boolean;
  progressPercent: number;
  lastWatchedAt: string | null;
  watchedSeconds: number;
  videoDuration: number;
}

interface LoginSession {
  id: string;
  device_type: string | null;
  device_name: string | null;
  os: string | null;
  browser: string | null;
  first_login_at: string;
  last_activity_at: string;
}


interface CourseWithProgress extends StudentCourse {
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  lastLesson: string;
  lastWatchedAt: string | null;
  lessons: LessonDetail[];
  daysSinceLastWatch: number | null;
  isStalled: boolean;
  needsFollowup: boolean;
  followupNote: string | null;
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
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);
  const [sessionsPage, setSessionsPage] = useState(1);
  const sessionsPerPage = 5;
  const [examsPage, setExamsPage] = useState(1);
  const examsPerPage = 5;
  const [homeworksPage, setHomeworksPage] = useState(1);
  const homeworksPerPage = 5;
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
      
      return;
    }

    setAvailableCourses((data as Course[]) || []);
  };

    const loadLoginSessions = async () => {
    const { data, error } = await supabase
      .from("student_login_sessions")
      .select("*")
      .eq("student_id", Number(id))
      .order("last_activity_at", { ascending: false });

    if (error) {
      
      return;
    }

    setLoginSessions((data as LoginSession[]) || []);
  };

  
  const loadLessonProgress = async () => {
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("student_id", Number(id));

    if (error) {
      
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

    // الخطوة 1: هات كل الـ sections بتاعة الكورسات دي


    const { data: sectionsData, error: sectionsErr } = await supabase
      .from("course_sections")
      .select("id, course_id")
      .in("course_id", courseIds);



    const sectionIds = (sectionsData || []).map((s: any) => s.id);

    // الخطوة 2: هات كل دروس الفيديو (type = video) اللي جوه الـ sections دي
const { data: lessonsData } = await supabase
      .from("course_items")
      .select("id, section_id, title, type, sort_order")
      .in("section_id", sectionIds)
      .eq("type", "video")
      .order("sort_order", { ascending: true });

    // الخطوة 3: هات تقدم الطالب في كل الدروس دي
    const lessonIds = (lessonsData || []).map((l: any) => l.id);

const { data: progressData, error: progressErr } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("student_id", Number(id))
      .in("lesson_id", lessonIds.length ? lessonIds : ["00000000-0000-0000-0000-000000000000"]);


const coursesWithStats: CourseWithProgress[] = courses.map((course) => {
      // sections بتاعة الكورس ده تحديدًا
      const courseSectionIds = (sectionsData || [])
        .filter((s: any) => s.course_id === course.course_id)
        .map((s: any) => s.id);

      // دروس الكورس ده تحديدًا
      const courseLessons = (lessonsData || []).filter((l: any) =>
        courseSectionIds.includes(l.section_id)
      );

      const courseLessonIds = courseLessons.map((l: any) => l.id);

      // تقدم الطالب في دروس الكورس ده بس
      const courseProgress = (progressData || []).filter((p: any) =>
        courseLessonIds.includes(p.lesson_id)
      );

const totalLessons = courseLessons.length;
      const completedLessons = courseProgress.filter((p: any) => p.is_completed).length;
      const sumProgress = courseLessons.reduce((sum: number, l: any) => {
        const p = courseProgress.find((pr: any) => pr.lesson_id === l.id);
        return sum + (p?.progress_percent || 0);
      }, 0);
      const completionPercent = totalLessons > 0 ? Math.round(sumProgress / totalLessons) : 0;

      const lastProgress = [...courseProgress].sort((a: any, b: any) =>
        new Date(b.last_watched_at || 0).getTime() - new Date(a.last_watched_at || 0).getTime()
      )[0];

      const lastLesson = lastProgress
        ? courseLessons.find((l: any) => l.id === lastProgress.lesson_id)
        : null;

      // قائمة تفصيلية لكل درس
      const lessons: LessonDetail[] = courseLessons.map((l: any) => {
        const p = courseProgress.find((pr: any) => pr.lesson_id === l.id);
        return {
          id: l.id,
          title: l.title,
          sortOrder: l.sort_order || 0,
          isCompleted: p?.is_completed || false,
          progressPercent: p?.progress_percent || 0,
          lastWatchedAt: p?.last_watched_at || null,
          watchedSeconds: p?.watched_seconds || 0,
          videoDuration: p?.video_duration || 0,
        };
      });

      // حساب عدد الأيام منذ آخر مشاهدة
      const daysSinceLastWatch = lastProgress?.last_watched_at
        ? Math.floor(
            (Date.now() - new Date(lastProgress.last_watched_at).getTime()) / (1000 * 60 * 60 * 24)
          )
        : null;

      // هل الطالب متعثر؟
      // - اشترك من أكتر من 5 أيام ومفيش أي مشاهدة خالص
      // - أو آخر مشاهدة كانت من أكتر من 5 أيام والكورس لسه مش مكتمل
      const daysSinceEnrolled = course.created_at
        ? Math.floor((Date.now() - new Date(course.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const isStalled =
        completionPercent < 100 &&
        ((!lastProgress && daysSinceEnrolled >= 5) ||
          (daysSinceLastWatch !== null && daysSinceLastWatch >= 5));

      return {
        ...course,
        totalLessons,
        completedLessons,
        completionPercent,
        lastLesson: lastLesson?.title || "-",
        lastWatchedAt: lastProgress?.last_watched_at || null,
        lessons,
        daysSinceLastWatch,
        isStalled,
        needsFollowup: (course as any).needs_followup || false,
        followupNote: (course as any).followup_note || null,
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

    if (!data) return;

    // هات أسماء الكورسات بتاعة كل امتحان عن طريق course_items
    const examIds = data.map((r: any) => r.exam_id).filter(Boolean);

    let courseTitleMap: Record<string, string> = {};

    if (examIds.length > 0) {
      const { data: itemsData } = await supabase
        .from("course_items")
        .select(`
          exam_id,
          section_id,
          course_sections (
            course_id,
            courses ( title )
          )
        `)
        .in("exam_id", examIds)
        .eq("type", "quiz");

      (itemsData || []).forEach((item: any) => {
        const title = item.course_sections?.courses?.title;
        if (item.exam_id && title) {
          courseTitleMap[String(item.exam_id)] = title;
        }
      });
    }

    const merged = data.map((r: any) => ({
      ...r,
      courseTitle: courseTitleMap[String(r.exam_id)] || "-",
    }));

    setExamResults(merged as ExamResult[]);
  };

  const loadHomeworkResults = async () => {
    const { data, error } = await supabase
      .from("homework_submissions")
      .select(`
        *,
        homeworks (
          id,
          title,
          total_score,
          due_date,
          course_sections (
            id,
            course_id,
            courses ( id, title )
          )
        )
      `)
      .eq("student_id", Number(id))
      .order("submitted_at", { ascending: false });

    if (error) {
      return;
    }

    if (data) {
      setHomeworkResults(data as HomeworkSubmission[]);
    }
  };

  const toggleFollowup = async (course: CourseWithProgress) => {
    const newValue = !course.needsFollowup;
    let note = course.followupNote;

    if (newValue) {
      note = window.prompt("اكتب ملاحظة قصيرة عن سبب المتابعة (اختياري):", course.followupNote || "") || "";
    }

    const { error } = await supabase
      .from("student_courses")
      .update({
        needs_followup: newValue,
        followup_note: newValue ? note : null,
        followup_flagged_at: newValue ? new Date().toISOString() : null,
      })
      .eq("id", course.id);

    if (error) {
      alert("حصل خطأ أثناء تحديث حالة المتابعة");
      return;
    }

    loadCoursesWithProgress();
  };

  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

    const toggleCourseActive = async (course: CourseWithProgress) => {
    const newActive = !course.active;
    const confirmed = window.confirm(
      newActive ? "هل تريد تفعيل هذا الكورس للطالب؟" : "هل تريد إلغاء تفعيل هذا الكورس للطالب؟"
    );
    if (!confirmed) return;

    const { data, error } = await supabase
      .from("student_courses")
      .update({ active: newActive })
      .eq("id", course.id)
      .select();

    if (error) {
      alert("حصل خطأ أثناء تحديث حالة الكورس: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("لم يتم التحديث. غالبًا صلاحيات قاعدة البيانات (RLS) لا تسمح بتعديل هذا الجدول.");
      return;
    }

    await loadCourses();
  };


  const deleteCourse = async (courseId: number) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف الكورس؟");
    if (!confirmed) return;

    await supabase.from("student_courses").delete().eq("id", courseId);

    const { data: remainingCourses } = await supabase
      .from("student_courses")
      .select("id")
      .eq("student_id", Number(id));

    if (!remainingCourses || remainingCourses.length === 0) {
      await supabase
        .from("students")
        .update({ subscription_status: "expired" })
        .eq("id", id);
    }

    await loadCourses();
    await loadStudent();
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

    await supabase
      .from("students")
      .update({ subscription_status: "active" })
      .eq("id", id);

    setShowCourseModal(false);
    setSelectedCourse("");
    await loadCourses();
    await loadStudent();
  };

const sendAnnouncement = async () => {
  if (!student) return;

  if (!announcementMessage.trim()) {
    alert("اكتب الرسالة أولاً");
    return;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("يجب تسجيل الدخول أولاً");
      return;
    }

    // 1) إنشاء الإشعار
    const { data: notification, error: notificationError } =
      await supabase
        .from("notifications")
        .insert({
          title: "رسالة من المستر",
          content: announcementMessage,
          type: "announcement",
          target_type: "student",
          target_value: String(student.id),
          recipient_count: 1,
          created_by: user.id,
          is_sent: true,
          sent_at: new Date().toISOString(),
          is_pinned: false,
          is_active: true,
          icon: "bell",
          color: "#10B981",
        })
        .select()
        .single();

    if (notificationError) {
      
      alert("حدث خطأ أثناء إنشاء الإشعار");
      return;
    }

    // 2) ربط الإشعار بالطالب
    const { error: readError } = await supabase
      .from("notification_reads")
      .insert({
        notification_id: notification.id,
        student_id: student.id,
        read_at: null,
      });

    if (readError) {

      // حذف الإشعار لو فشل ربطه بالطالب
      await supabase
        .from("notifications")
        .delete()
        .eq("id", notification.id);

      alert("حدث خطأ أثناء إرسال الإشعار للطالب");
      return;
    }

    alert("تم إرسال الرسالة بنجاح");

    setAnnouncementMessage("");
    setAnnouncementPriority("important");
    setShowAnnouncementModal(false);
  } catch (error) {
    
    alert("حدث خطأ أثناء الإرسال");
  }
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
    loadCoursesWithProgress();
  }, [courses, lessonProgress]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadStudent(),
        loadCourses(),
        loadExamResults(),
        loadHomeworkResults(),
        loadLessonProgress(),
        loadLoginSessions()
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

  // نحسب دلوقتي من بيانات coursesWithProgress الحقيقية بدل الأعمدة المخزنة القديمة
  const realTotalLessons = coursesWithProgress.reduce((sum, c) => sum + c.totalLessons, 0);
  const realWatchedLessons = coursesWithProgress.reduce((sum, c) => sum + c.completedLessons, 0);
  const lessonsPercent = realTotalLessons > 0 ? Math.round((realWatchedLessons / realTotalLessons) * 100) : 0;

  const realTotalWatchMinutes = Math.round(
    lessonProgress.reduce((sum, p) => sum + (p.watched_seconds || 0), 0) / 60
  );

  const homeworkPercent = student.total_homework > 0 ? Math.round((student.completed_homework / student.total_homework) * 100) : 0;
  const overallProgress = Math.round((lessonsPercent + homeworkPercent) / 2);

  const totalScores = examResults.reduce((sum, exam) => sum + (exam.score || 0), 0);
  const averageScore = examResults.length > 0 ? Math.round(totalScores / examResults.length) : 0;
  const highestScore = examResults.length > 0 ? Math.max(...examResults.map((e) => e.score || 0)) : 0;
  const lowestScore = examResults.length > 0 ? Math.min(...examResults.map((e) => e.score || 0)) : 0;
  
  // الواجبات المسلّمة فعليًا (submitted_at موجود)
  const completedHomework = homeworkResults.length;
  const totalHomework = student.total_homework || completedHomework;
  const remainingHomework = Math.max(totalHomework - completedHomework, 0);

  // متوسط الدرجات كنسبة مئوية من الدرجة الكلية لكل واجب
  const homeworkScores = homeworkResults.filter(
    (h) => h.grade !== null && h.grade !== undefined
  );
  const avgHomeworkScore = homeworkScores.length > 0
    ? Math.round(
        homeworkScores.reduce((sum, h) => {
          const total = h.homeworks?.total_score || 100;
          return sum + (h.grade! / total) * 100;
        }, 0) / homeworkScores.length
      )
    : 0;

const totalWatchHours = Math.floor(realTotalWatchMinutes / 60);
  const remainingMinutes = realTotalWatchMinutes % 60;

  const lastWatchedProgress = lessonProgress.sort((a, b) => 
    new Date(b.last_watched_at || 0).getTime() - new Date(a.last_watched_at || 0).getTime()
  )[0];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#09090B] dark:via-[#111111] dark:to-[#09090B]" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section - Enhanced Premium Design */}
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#B348FE] via-[#9E2FFF] to-[#7B1FA2] mx-4 sm:mx-6 mt-4 sm:mt-6 shadow-[0_25px_60px_rgba(179,72,254,.35)]">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-[0.07]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_2px,transparent_0)] bg-[length:30px_30px] animate-pulse"></div>
          </div>

          {/* Gradient Overlays */}
          <div className="absolute -left-32 -top-32 w-80 h-80 rounded-full bg-white/15 blur-[140px] animate-pulse"></div>
          <div className="absolute -right-24 -bottom-32 w-80 h-80 rounded-full bg-black/15 blur-[130px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]"></div>

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-6 pb-0">
            {/* Top Actions Bar */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="border-2 border-white/30 hover:bg-white/15 backdrop-blur-xl text-white font-bold rounded-2xl h-11 px-4 transition-all duration-300 hover:scale-105 hover:border-white/50"
              >
                <ArrowRight size={18} />
                <span className="hidden sm:inline mr-2">رجوع</span>
              </Button>

              <Button
                onClick={() => navigate(`/instructor/students/edit/${student.id}`)}
                className="bg-white/95 backdrop-blur-xl text-[#B348FE] hover:bg-white rounded-2xl font-black px-6 shadow-[0_8px_25px_rgba(0,0,0,.15)] h-11 hover:shadow-[0_12px_35px_rgba(0,0,0,.2)] transition-all duration-300 hover:-translate-y-0.5"
              >
                تعديل البيانات
              </Button>
            </div>

            {/* Student Info Section */}
            <div className="flex flex-col items-center text-center pb-10">
              {/* Avatar with Glass Effect */}
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-[32px] blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative w-32 h-32 lg:w-36 lg:h-36 rounded-[32px] bg-white/20 backdrop-blur-2xl border-[3px] border-white/40 flex items-center justify-center text-5xl lg:text-6xl font-black overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,.2)] group-hover:scale-105 transition-all duration-500">
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white">{student.full_name?.charAt(0)}</span>
                  )}
                </div>
                {/* Status Badge */}
                <div className={`absolute -bottom-2 -left-2 w-9 h-9 rounded-2xl border-[3.5px] border-[#B348FE] shadow-lg ${student.is_blocked ? "bg-red-500" : "bg-emerald-400"} animate-pulse`}>
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-sm"></div>
                </div>
              </div>

              {/* Name & Info */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-black mb-2 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,.15)]">
                {student.full_name}
              </h1>
              <p className="text-white/80 text-base sm:text-lg font-bold mb-6 backdrop-blur-sm">
                {student.code ? `كود: ${student.code}` : student.grade}
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap justify-center gap-3 text-white/95 text-sm font-bold">
                <span className="flex items-center gap-2 bg-white/15 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl shadow-lg hover:bg-white/25 transition-all duration-300">
                  <div className={`w-2 h-2 rounded-full ${student.is_blocked ? "bg-red-400" : "bg-emerald-400"} animate-pulse`}></div>
                  {student.is_blocked ? "موقوف" : "نشط"}
                </span>
                <span className="bg-white/15 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl shadow-lg hover:bg-white/25 transition-all duration-300">
                  {student.type === "online" ? "🌐 أونلاين" : student.type === "center" ? "🏫 سنتر" : "📚 طالب"}
                </span>
                <span className={`bg-white/15 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl shadow-lg hover:bg-white/25 transition-all duration-300 ${
                  student.subscription_status === "active" ? "text-emerald-100" : "text-rose-100"
                }`}>
                  {student.subscription_status === "active" ? "✓ اشتراك نشط" : "⚠ اشتراك منتهي"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards with Glass Effect */}
          <div className="relative z-10 bg-white/98 dark:bg-[#111111]/98 backdrop-blur-2xl mx-4 sm:mx-6 lg:mx-8 mb-6 rounded-[32px] border border-white/60 dark:border-white/10 shadow-[0_-12px_35px_rgba(0,0,0,.08)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <div className="relative grid grid-cols-3 divide-x divide-x-reverse divide-gray-200 dark:divide-[#2A2A2A]">
              <div className="flex flex-col items-center py-6 px-3 group hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-[#B348FE] to-[#9E2FFF] rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-all duration-300">
                  <BookOpen className="text-white" size={24} />
                </div>
                <span className="text-2xl lg:text-3xl font-black text-[#B348FE] mb-1">{uniqueCourses.length}</span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">كورس مشترك</span>
              </div>

              <div className="flex flex-col items-center py-6 px-3 group hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-all duration-300">
                  <CheckCircle2 className="text-white" size={24} />
                </div>
                <span className="text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">{realWatchedLessons}</span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">محاضرة مشاهدة</span>
              </div>

              <div className="flex flex-col items-center py-6 px-3 group hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <span className="text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">{lessonsPercent}%</span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">نسبة الإنجاز</span>
              </div>
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
                    <h3 className="text-2xl lg:text-3xl font-black text-[#B348FE]">{realWatchedLessons}</h3>
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
                    <h3 className="text-2xl lg:text-3xl font-black text-emerald-600">{completedHomework}</h3>
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
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">نظرة عامة على الأداء</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">ملخص شامل لتقدم ونشاط الطالب</p>
              </div>

              <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-6 border border-gray-100 dark:border-[#2A2A2A] mb-4">
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
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">المحاضرات</p>
                  <p className="text-gray-900 dark:text-white font-black text-lg">
                    {realTotalLessons > 0 ? `${realWatchedLessons} / ${realTotalLessons}` : "لا يوجد دروس بعد"}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">الواجبات</p>
                  <p className="text-gray-900 dark:text-white font-black text-lg">
                    {student.completed_homework || 0} / {student.total_homework || 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">الحضور</p>
                  <p className={`font-black text-lg ${
                    (student.attendance_percentage || 0) >= 80
                      ? "text-emerald-600"
                      : (student.attendance_percentage || 0) >= 50
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}>
                    {student.attendance_percentage || 0}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">وقت المشاهدة</p>
                  <p className="text-gray-900 dark:text-white font-black text-lg">
                    {totalWatchHours}س {remainingMinutes}د
                  </p>
                </div>
              </div>

              {lastWatchedProgress?.last_watched_at && (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar size={14} />
                  آخر مشاهدة: {new Date(lastWatchedProgress.last_watched_at).toLocaleDateString("ar-EG")}
                </div>
              )}
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
                    <div
                      key={course.id}
                      className={`rounded-2xl p-5 border transition-all ${
                        course.needsFollowup
                          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                          : course.isStalled
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                          : "bg-gray-50 dark:bg-[#1A1A1A] border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-black text-gray-900 dark:text-white">{course.courseData?.title}</h4>
                            {course.needsFollowup && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                يحتاج متابعة
                              </span>
                            )}
                            {!course.needsFollowup && course.isStalled && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                متعثر
                              </span>
                            )}
                            {!course.active && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-400 text-white text-[10px] font-bold">
                                غير مفعّل
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {course.courseData?.grade} • اشترك في {course.created_at ? new Date(course.created_at).toLocaleDateString("ar-EG") : "-"}
                          </p>
                          <p className="text-xs font-bold mt-1">
                            {course.expires_at ? (
                              new Date(course.expires_at) < new Date() ? (
                                <span className="text-red-600">⛔ انتهى الاشتراك في {new Date(course.expires_at).toLocaleDateString("ar-EG")}</span>
                              ) : (
                                <span className="text-emerald-600">✅ ينتهي في {new Date(course.expires_at).toLocaleDateString("ar-EG")}</span>
                              )
                            ) : (
                              <span className="text-blue-600">♾️ اشتراك دائم</span>
                            )}
                          </p>
                          {course.needsFollowup && course.followupNote && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-1.5">
                              ملاحظة: {course.followupNote}
                            </p>
                          )}
                          {course.daysSinceLastWatch !== null && (
                            <p className="text-xs text-gray-400 mt-1">
                              آخر مشاهدة منذ {course.daysSinceLastWatch === 0 ? "اليوم" : `${course.daysSinceLastWatch} يوم`}
                            </p>
                          )}
                        </div>
<div className="flex gap-2 flex-shrink-0">
                          {(course.needsFollowup || course.isStalled) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const phone = (student.phone || "").replace(/^0/, "20");
                                const courseName = course.courseData?.title || "الكورس";
                                const reason = course.followupNote
                                  ? ` (${course.followupNote})`
                                  : "";
                                const message = `السلام عليكم ${student.full_name}، لاحظنا إنك متأخر شوية في متابعة "${courseName}"${reason}. محتاج أي مساعدة أو فيه حاجة مش واضحة؟`;
                                window.open(
                                  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                                  "_blank"
                                );
                              }}
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/30 rounded-lg text-xs font-bold h-8"
                            >
                              <Phone size={14} className="ml-1" />
                              واتساب
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleFollowup(course)}
                            className={`rounded-lg text-xs font-bold h-8 ${
                              course.needsFollowup
                                ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400"
                                : "text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400"
                            }`}
                          >
                            {course.needsFollowup ? "إلغاء المتابعة" : "تحتاج متابعة"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCourseActive(course)}
                            className={`rounded-lg text-xs font-bold h-8 ${
                              course.active
                                ? "text-gray-600 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/30"
                                : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                            }`}
                          >
                            <Power size={14} className="ml-1" />
                            {course.active ? "إلغاء التفعيل" : "تفعيل"}
                          </Button>
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

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-white dark:bg-[#111111] rounded-xl p-3 border border-gray-100 dark:border-[#2A2A2A]">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-1">محاضرات مكتملة</p>
                          <p className="font-black text-sm text-gray-900 dark:text-white">{course.completedLessons} / {course.totalLessons}</p>
                        </div>
                        <div className="bg-white dark:bg-[#111111] rounded-xl p-3 border border-gray-100 dark:border-[#2A2A2A] col-span-2">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mb-1">آخر محاضرة</p>
                          <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{course.lastLesson}</p>
                        </div>
                      </div>

                      {course.lessons.length > 0 && (
                        <button
                          onClick={() =>
                            setExpandedCourseId(expandedCourseId === course.id ? null : course.id)
                          }
                          className="text-xs font-bold text-[#B348FE] hover:text-[#9E2FFF] transition-colors"
                        >
                          {expandedCourseId === course.id ? "إخفاء تفاصيل المحاضرات ▲" : "عرض تفاصيل كل محاضرة ▼"}
                        </button>
                      )}

                      {expandedCourseId === course.id && (
                        <div className="mt-3 space-y-2">
                          {course.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between bg-white dark:bg-[#111111] rounded-xl p-3 border border-gray-100 dark:border-[#2A2A2A]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {lesson.isCompleted ? (
                                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                                ) : lesson.progressPercent > 0 ? (
                                  <Clock size={16} className="text-amber-500 flex-shrink-0" />
                                ) : (
                                  <XCircle size={16} className="text-gray-300 flex-shrink-0" />
                                )}
                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                                  {lesson.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0 min-w-[140px]">
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                  {lesson.lastWatchedAt
                                    ? new Date(lesson.lastWatchedAt).toLocaleDateString("ar-EG")
                                    : "لم يشاهد"}
                                </span>
                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[50px]">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      lesson.isCompleted
                                        ? "bg-emerald-500"
                                        : lesson.progressPercent > 0
                                        ? "bg-amber-500"
                                        : "bg-gray-300"
                                    }`}
                                    style={{ width: `${lesson.progressPercent}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-xs font-black w-9 text-left ${
                                    lesson.isCompleted
                                      ? "text-emerald-600"
                                      : lesson.progressPercent > 0
                                      ? "text-amber-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {lesson.progressPercent}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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

          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 lg:p-8 pb-4">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">الواجبات</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">إحصائيات وسجل الواجبات المسلّمة</p>

               
              </div>

              {homeworkResults.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-bold">لا توجد واجبات محلولة</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto border-t border-gray-100 dark:border-[#2A2A2A]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">#</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">اسم الواجب</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الكورس</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الدرجة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">النسبة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الحالة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">تاريخ التسليم</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">تاريخ التصحيح</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الملف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {homeworkResults
                          .slice((homeworksPage - 1) * homeworksPerPage, homeworksPage * homeworksPerPage)
                          .map((hw, idx) => {
                            const total = hw.homeworks?.total_score || 100;
                            const hasGrade = hw.grade !== null && hw.grade !== undefined;
                            const percent = hasGrade ? Math.round((hw.grade! / total) * 100) : null;
                            const courseTitle = hw.homeworks?.course_sections?.courses?.title || "-";

                            return (
                              <tr key={hw.id} className="border-t border-gray-100 dark:border-[#2A2A2A]">
                                <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                  {(homeworksPage - 1) * homeworksPerPage + idx + 1}
                                </td>
                                <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                  {hw.homeworks?.title || `واجب #${hw.homework_id}`}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {courseTitle}
                                </td>
                                <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                  {hasGrade ? `${hw.grade} / ${total}` : "-"}
                                </td>
                                <td className="px-4 py-3">
                                  {hasGrade ? (
                                    <span
                                      className={`font-black ${
                                        percent! >= 80
                                          ? "text-emerald-600"
                                          : percent! >= 50
                                          ? "text-amber-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {percent}%
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap ${
                                      hasGrade
                                        ? "bg-[#F6EEFF] text-[#B348FE] dark:bg-[#2B103D] dark:text-[#B348FE]"
                                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                                    }`}
                                  >
                                    {hasGrade ? "تم التصحيح" : "بانتظار التصحيح"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {hw.submitted_at ? new Date(hw.submitted_at).toLocaleString("ar-EG") : "-"}
                                </td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                  {hw.graded_at ? new Date(hw.graded_at).toLocaleString("ar-EG") : "-"}
                                </td>
                                <td className="px-4 py-3">
                                  {hw.file_url ? (
                                    <a
                                      href={hw.file_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[#B348FE] hover:text-[#9E2FFF] font-bold text-xs underline whitespace-nowrap"
                                    >
                                      عرض الملف
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                    <span className="text-xs font-bold text-[#B348FE]">
                      {(homeworksPage - 1) * homeworksPerPage + 1} -{" "}
                      {Math.min(homeworksPage * homeworksPerPage, homeworkResults.length)} من {homeworkResults.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHomeworksPage((p) => Math.max(1, p - 1))}
                        disabled={homeworksPage === 1}
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                      >
                        ‹
                      </button>
                      <span className="w-8 h-8 rounded-lg bg-[#B348FE] text-white flex items-center justify-center text-xs font-black">
                        {homeworksPage}
                      </span>
                      <button
                        onClick={() =>
                          setHomeworksPage((p) => (p * homeworksPerPage < homeworkResults.length ? p + 1 : p))
                        }
                        disabled={homeworksPage * homeworksPerPage >= homeworkResults.length}
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          

          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 lg:p-8 pb-4">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">الامتحانات</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">نتائج وسجل الاختبارات</p>

             
              </div>

              {examResults.length === 0 ? (
                <div className="py-16 text-center">
                  <Award className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-bold">لم يتم أداء أي اختبارات</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto border-t border-gray-100 dark:border-[#2A2A2A]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">#</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">اسم الامتحان</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الكورس</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">عدد الأسئلة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">المحلولة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الصحيحة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الدرجة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">النتيجة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">وقت البدء</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">وقت الانتهاء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examResults
                          .slice((examsPage - 1) * examsPerPage, examsPage * examsPerPage)
                          .map((exam, idx) => (
                            <tr key={exam.id} className="border-t border-gray-100 dark:border-[#2A2A2A]">
                              <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                {(examsPage - 1) * examsPerPage + idx + 1}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {exam.exams?.title || `اختبار #${exam.exam_id}`}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {exam.courseTitle || "-"}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                {exam.total_questions ?? "-"}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                {exam.answered_questions ?? "-"}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                {exam.correct_answers ?? "-"}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                {exam.score ?? "-"}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap ${
                                    exam.passed
                                      ? "bg-[#F6EEFF] text-[#B348FE] dark:bg-[#2B103D] dark:text-[#B348FE]"
                                      : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                                  }`}
                                >
                                  {exam.passed ? "ناجح" : "راسب"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {exam.started_at ? new Date(exam.started_at).toLocaleString("ar-EG") : "-"}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {exam.completed_at
                                  ? new Date(exam.completed_at).toLocaleString("ar-EG")
                                  : exam.submitted_at
                                  ? new Date(exam.submitted_at).toLocaleString("ar-EG")
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                    <span className="text-xs font-bold text-[#B348FE]">
                      {(examsPage - 1) * examsPerPage + 1} -{" "}
                      {Math.min(examsPage * examsPerPage, examResults.length)} من {examResults.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExamsPage((p) => Math.max(1, p - 1))}
                        disabled={examsPage === 1}
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                      >
                        ‹
                      </button>
                      <span className="w-8 h-8 rounded-lg bg-[#B348FE] text-white flex items-center justify-center text-xs font-black">
                        {examsPage}
                      </span>
                      <button
                        onClick={() =>
                          setExamsPage((p) => (p * examsPerPage < examResults.length ? p + 1 : p))
                        }
                        disabled={examsPage * examsPerPage >= examResults.length}
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2">نشاط الطالب</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">آخر الأنشطة والتفاعلات</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Monitor className="text-[#B348FE]" size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">آخر جهاز استخدمه</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {loginSessions[0]
                      ? `${loginSessions[0].device_type || "-"} • ${loginSessions[0].os || "-"} • ${loginSessions[0].browser || "-"}`
                      : student.device_name || "غير محدد"}
                  </p>
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
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white">سجل الأجهزة وتسجيلات الدخول</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{loginSessions.length} تسجيل</p>
                  </div>
                </div>
              </div>

              {loginSessions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                          <th className="text-right font-bold px-6 py-3 whitespace-nowrap">نوع الجهاز</th>
                          <th className="text-right font-bold px-6 py-3 whitespace-nowrap">اسم الجهاز</th>
                          <th className="text-right font-bold px-6 py-3 whitespace-nowrap">نظام التشغيل</th>
                          <th className="text-right font-bold px-6 py-3 whitespace-nowrap">المتصفح</th>
                          <th className="text-right font-bold px-6 py-3 whitespace-nowrap">آخر نشاط</th>
                          <th className="text-right font-bold px-6 py-3 whitespace-nowrap">تاريخ تسجيل الدخول</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginSessions
                          .slice((sessionsPage - 1) * sessionsPerPage, sessionsPage * sessionsPerPage)
                          .map((s) => (
                            <tr key={s.id} className="border-t border-gray-100 dark:border-[#2A2A2A]">
                              <td className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{s.device_type || "-"}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{s.device_name || "Unknown"}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{s.os || "-"}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{s.browser || "-"}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {new Date(s.last_activity_at).toLocaleString("ar-EG")}
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {new Date(s.first_login_at).toLocaleString("ar-EG")}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                    <span className="text-xs font-bold text-emerald-600">
                      {(sessionsPage - 1) * sessionsPerPage + 1} - {Math.min(sessionsPage * sessionsPerPage, loginSessions.length)} من {loginSessions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSessionsPage((p) => Math.max(1, p - 1))}
                        disabled={sessionsPage === 1}
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                      >
                        ‹
                      </button>
                      <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                        {sessionsPage}
                      </span>
                      <button
                        onClick={() =>
                          setSessionsPage((p) =>
                            p * sessionsPerPage < loginSessions.length ? p + 1 : p
                          )
                        }
                        disabled={sessionsPage * sessionsPerPage >= loginSessions.length}
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center">
                  <Monitor className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 font-bold">لا يوجد سجل تسجيل دخول بعد</p>
                </div>
              )}
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
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  ChevronRight, 
  Bell, 
  FileText, 
  Play, 
  Star, 
  ArrowUpRight, 
  Flame, 
  Target,
  Calendar,
  Award,
  Activity,
  CheckCircle2,
  AlertCircle,
  Menu,
  X
} from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Avatar } from "../../components/ui/Avatar";
import { useApp } from "../../context/AppContext";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { COURSES, LEADERBOARD, CURRENT_STUDENT } from "../../data/mockData";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import StudentLayout from "./StudentLayout";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
const [activities, setActivities] = useState<any[]>([]);
const [studentCourses, setStudentCourses] = useState<any[]>([]);
const [homeworks, setHomeworks] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [activityLoading, setActivityLoading] = useState(true);
const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Load data effects
useEffect(() => {
  if (user?.studentId) {
    loadNotifications();
    loadActivities();
  }
}, [user]);

useEffect(() => {
    if (user?.studentId) {
      loadStudentCourses();
    }
  }, [user]);

  useEffect(() => {
    loadHomeworks();
  }, []);

  // Data loading functions
const loadNotifications = async () => {
  if (!user?.studentId) return;

  try {
    setNotificationsLoading(true);

    // هات الإشعارات الخاصة بالطالب
    const { data: reads, error: readsError } = await supabase
      .from("notification_reads")
      .select("notification_id, read_at")
      .eq("student_id", user.studentId);

    if (readsError) throw readsError;

    if (!reads || reads.length === 0) {
      setNotifications([]);
      return;
    }

    const notificationIds = reads.map(
      (item: any) => item.notification_id
    );

    // هات بيانات الإشعارات نفسها
    const { data: notificationData, error: notificationsError } =
      await supabase
        .from("notifications")
        .select("*")
        .in("id", notificationIds)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);

    if (notificationsError) throw notificationsError;

    const mergedNotifications = (notificationData || []).map(
      (notification: any) => {
        const readInfo = reads.find(
          (r: any) => r.notification_id === notification.id
        );

        return {
          ...notification,
          read_at: readInfo?.read_at || null,
        };
      }
    );

    setNotifications(mergedNotifications);
  } catch (error) {
    console.error("Error loading notifications:", error);
    setNotifications([]);
  } finally {
    setNotificationsLoading(false);
  }
};

const loadActivities = async () => {
  if (!user?.studentId) return;

  try {
    setActivityLoading(true);

    // =========================
    // 1. آخر مشاهدة للدروس
    // =========================
    const { data: lessonProgress, error: lessonError } =
      await supabase
        .from("lesson_progress")
        .select(
          "lesson_id, last_watched_at, progress_percent, is_completed"
        )
        .eq("student_id", user.studentId)
        .not("last_watched_at", "is", null)
        .order("last_watched_at", { ascending: false })
        .limit(10);

    if (lessonError) throw lessonError;

    // هات أسماء الدروس
    const lessonIds = (lessonProgress || []).map(
      (item: any) => item.lesson_id
    );

    let lessonsMap: Record<string, string> = {};

    if (lessonIds.length > 0) {
      const { data: lessons } = await supabase
        .from("course_items")
        .select("id, title")
        .in("id", lessonIds);

      (lessons || []).forEach((lesson: any) => {
        lessonsMap[lesson.id] = lesson.title;
      });
    }

    // =========================
    // 2. آخر الامتحانات
    // =========================
    const { data: examResults, error: examError } =
      await supabase
        .from("exam_results")
        .select("id, exam_id, score, submitted_at, exams(title)")
        .eq("student_id", user.studentId)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(10);

    if (examError) throw examError;

    // =========================
    // 3. آخر الواجبات
    // =========================
    const { data: homeworkResults, error: homeworkError } =
      await supabase
        .from("homework_submissions")
        .select("id, homework_id, score, submitted_at")
        .eq("student_id", user.studentId)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(10);

    if (homeworkError) throw homeworkError;

    // هات أسماء الواجبات
    const homeworkIds = (homeworkResults || []).map(
      (item: any) => item.homework_id
    );

    let homeworkMap: Record<string, string> = {};

    if (homeworkIds.length > 0) {
      const { data: homeworkData } = await supabase
        .from("homeworks")
        .select("id, title")
        .in("id", homeworkIds);

      (homeworkData || []).forEach((homework: any) => {
        homeworkMap[homework.id] = homework.title;
      });
    }

    // =========================
    // تجميع النشاطات
    // =========================
    const activityList = [
      ...(lessonProgress || []).map((item: any) => ({
        id: `lesson-${item.lesson_id}-${item.last_watched_at}`,
        type: "lesson",
        title: lessonsMap[item.lesson_id] || "درس",
        description: item.is_completed
          ? "أكملت مشاهدة الدرس"
          : `شاهدت ${Math.round(item.progress_percent || 0)}% من الدرس`,
        date: item.last_watched_at,
      })),

      ...(examResults || []).map((item: any) => ({
        id: `exam-${item.id}`,
        type: "exam",
        title: item.exams?.title || "امتحان",
        description: `حصلت على ${item.score ?? 0} درجة`,
        date: item.submitted_at,
      })),

      ...(homeworkResults || []).map((item: any) => ({
        id: `homework-${item.id}`,
        type: "homework",
        title: homeworkMap[item.homework_id] || "واجب",
        description:
          item.score !== null && item.score !== undefined
            ? `تم التسليم - الدرجة ${item.score}`
            : "تم تسليم الواجب",
        date: item.submitted_at,
      })),
    ];

    // ترتيب من الأحدث للأقدم
    activityList.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    setActivities(activityList.slice(0, 6));
  } catch (error) {
    console.error("Error loading activities:", error);
    setActivities([]);
  } finally {
    setActivityLoading(false);
  }
};

  const loadHomeworks = async () => {
    try {
      const { data, error } = await supabase
        .from("homeworks")
        .select("*")
        .order("due_date", { ascending: true })
        .limit(5);

      if (!error && data) {
        setHomeworks(data);
      }
    } catch (error) {
      console.error("Error loading homeworks:", error);
    }
  };

const loadStudentCourses = async () => {
    if (!user?.studentId) return;

    try {
      setLoading(true);

      const { data: enrollments, error: enrollError } = await supabase
        .from("student_courses")
        .select("course_id")
        .eq("student_id", user.studentId)
        .eq("active", true);

      if (enrollError) throw enrollError;

      if (!enrollments?.length) {
        setStudentCourses([]);
        return;
      }

      const courseIds = enrollments.map((c: any) => c.course_id);

      const { data: courses, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds);

      if (courseError) throw courseError;

      const coursesWithStats = await Promise.all(
        (courses || []).map(async (course: any) => {
          const { data: sections } = await supabase
            .from("course_sections")
            .select("id")
            .eq("course_id", course.id);

          const sectionIds = (sections || []).map((s: any) => s.id);

          let lessons = [];

          if (sectionIds.length > 0) {
            const { data: items } = await supabase
              .from("course_items")
              .select("*")
              .in("section_id", sectionIds);

            lessons = items || [];
          }

          return {
            ...course,
            progress: 0,
            sectionsCount: sections?.length || 0,
            lessonsCount: lessons.length,
            videosCount: lessons.filter((l: any) => l.type === "video").length,
            filesCount: lessons.filter((l: any) => l.type === "file").length,
            examsCount: lessons.filter((l: any) => l.type === "exam").length,
          };
        })
      );

      setStudentCourses(coursesWithStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const topThree = LEADERBOARD.slice(0, 3);

  const getAnnouncementStyle = (type: string) => {
    switch (type) {
      case "exam":
        return {
          border: "border-rose-400",
          bg: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20",
          icon: <AlertCircle className="text-rose-500" size={16} />,
          iconBg: "bg-rose-100 dark:bg-rose-900/30",
        };
      case "lesson":
        return {
          border: "border-[#B348FE]",
          bg: "bg-gradient-to-br from-[#F6EEFF] to-purple-50 dark:from-[#2B103D] dark:to-purple-950/20",
          icon: <BookOpen className="text-[#B348FE]" size={16} />,
          iconBg: "bg-[#F6EEFF] dark:bg-[#2B103D]",
        };
      case "homework":
        return {
          border: "border-amber-400",
          bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
          icon: <FileText className="text-amber-500" size={16} />,
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
        };
      default:
        return {
          border: "border-gray-300 dark:border-[#2A2A2A]",
          bg: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#111111] dark:to-[#0a0a0a]",
          icon: <Bell className="text-gray-500 dark:text-gray-400" size={16} />,
          iconBg: "bg-gray-100 dark:bg-gray-800",
        };
    }
  };


  const getTimeAgo = (date: string) => {
  if (!date) return "";

  const now = new Date().getTime();
  const time = new Date(date).getTime();

  const diff = Math.floor((now - time) / 1000);

  if (diff < 60) return "منذ لحظات";

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) {
    return `منذ ${minutes} دقيقة`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `منذ ${hours} ساعة`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) return "أمس";
  if (days < 7) return `منذ ${days} أيام`;

  return new Date(date).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  });
};

  return (
    <StudentLayout>
      {/* Main Content */}
      <>
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Stats cards can be added here */}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Enhanced My Courses Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-gray-900 dark:text-white text-xl flex items-center gap-2">
                  <BookOpen className="text-[#B348FE]" size={24} />
                  كورساتي
                </h2>
                <button 
                  onClick={() => navigate("/dashboard/courses")} 
                  className="flex items-center gap-1 text-[#B348FE] hover:text-[#9E2FFF] text-sm font-bold hover:gap-2 transition-all group"
                >
                  عرض الكل 
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <Card 
                      key={i} 
                      className="animate-pulse bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl"
                    >
                      <CardContent className="flex gap-4 p-5">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : studentCourses.length > 0 ? (
                <>
                  {studentCourses.map((course: any) => (
                    <Card 
                      key={course.id} 
                      className="group hover:shadow-xl hover:border-[#B348FE] bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/dashboard/course/${course.id}`)}
                    >
                      <CardContent className="flex gap-4 p-5">
                        <div className="relative flex-shrink-0">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-24 h-24 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform"
                            onError={e => { 
                              (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=100&h=100&fit=crop`; 
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug group-hover:text-[#B348FE] transition-colors">
                              {course.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              📚 {course.sectionsCount} أقسام
                            </span>
                            <span className="flex items-center gap-1">
                              🎥 {course.lessonsCount} درس
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <button
                              onClick={e => { 
                                e.stopPropagation(); 
                                navigate(`/dashboard/course/${course.id}`); 
                              }}
                              className="flex items-center gap-2 text-[#B348FE] hover:text-[#9E2FFF] text-sm font-bold hover:gap-3 transition-all group"
                            >
                              <Play size={16} className="group-hover:scale-110 transition-transform" /> 
                              متابعة التعلم
                            </button>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                📄 {course.filesCount} ملفات
                              </span>
                              <span className="flex items-center gap-1">
                                📝 {course.examsCount} امتحانات
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card className="border-2 border-dashed border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl">
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F6EEFF] dark:bg-[#2B103D] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="text-[#B348FE]" size={32} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">
                      لم تشترك في أي كورس بعد
                    </p>
                    <button
                      onClick={() => navigate("/courses")}
                      className="px-6 py-2.5 bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl font-bold shadow-lg hover:shadow-[0_12px_35px_rgba(179,72,254,.35)] hover:scale-105 transition-all"
                    >
                      استكشف الكورسات
                    </button>
                  </CardContent>
                </Card>
              )}

              <button
                onClick={() => navigate("/courses")}
                className="w-full border-2 border-dashed border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl py-8 text-gray-400 dark:text-gray-500 text-sm font-bold hover:border-[#B348FE] hover:text-[#B348FE] hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] transition-all flex items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-[#F6EEFF] dark:group-hover:bg-[#2B103D] flex items-center justify-center transition-colors">
                  <BookOpen className="group-hover:scale-110 transition-transform" size={20} />
                </div>
                اشترك في كورس جديد
              </button>
            </div>

            {/* Enhanced Right Column */}
            <div className="space-y-5">
             {/* آخر النشاطات */}
<Card className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
  <CardContent className="p-5">

    <div className="flex items-center justify-between mb-5">
      <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
        <Activity className="text-[#B348FE]" size={22} />
        آخر النشاطات
      </h3>
    </div>

    {activityLoading ? (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#0B0B0B]"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />

            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    ) : activities.length === 0 ? (
      <div className="py-10 text-center">
        <Activity
          size={38}
          className="mx-auto text-gray-300 dark:text-gray-700 mb-3"
        />

        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
          مفيش نشاطات لسه
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          نشاطات مشاهدة الدروس والامتحانات والواجبات هتظهر هنا
        </p>
      </div>
    ) : (
      <div className="space-y-2">
        {activities.map((activity) => {
          const isLesson = activity.type === "lesson";
          const isExam = activity.type === "exam";

          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#0B0B0B] border border-gray-100 dark:border-[#222222]"
            >
              <div
                className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${
                  isLesson
                    ? "bg-[#F6EEFF] dark:bg-[#2B103D]"
                    : isExam
                    ? "bg-rose-50 dark:bg-rose-950/20"
                    : "bg-amber-50 dark:bg-amber-950/20"
                }`}
              >
                {isLesson ? (
                  <BookOpen
                    size={18}
                    className="text-[#B348FE]"
                  />
                ) : isExam ? (
                  <FileText
                    size={18}
                    className="text-rose-500"
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                    className="text-amber-500"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {activity.title}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {activity.description}
                </p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-1 text-[11px] text-gray-400">
                <Clock size={12} />
                {getTimeAgo(activity.date)}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </CardContent>
</Card>

              {/* Enhanced Leaderboard */}
              <Card className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-4">
                  <div className="flex items-center justify-between text-white">
                    <h3 className="font-black text-lg flex items-center gap-2">
                      <Trophy size={20} />
                      المتصدرون
                    </h3>
                    <button 
                      onClick={() => navigate("/dashboard/leaderboard")} 
                      className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all bg-white/20 rounded-lg px-2 py-1"
                    >
                      الكل <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-5xl mb-4">🏆</div>

                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                      قريبًا
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 leading-7 max-w-xs">
                      يتم العمل حاليًا على نظام المتصدرين وترتيب الطلاب حسب الأداء والدرجات.
                    </p>

                    <span className="mt-5 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-sm">
                      🚧 تحت التطوير
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Announcements Section */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm">
            <CardContent className="py-16 text-center">
              <Bell
                size={48}
                className="mx-auto text-[#B348FE] mb-4"
              />

              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                آخر الإشعارات
              </h3>

              <p className="text-gray-500 dark:text-gray-400 leading-8 mb-5">
                سيتم عرض أحدث الاشعارات
                التي ينشرها المستر مباشرة هنا.
              </p>

              <Badge variant="blue">
                🚧 سيتم تفعيلها مع لوحة تحكم المستر
              </Badge>
            </CardContent>
          </Card>
        </div>
      </>
    </StudentLayout>
  );
}
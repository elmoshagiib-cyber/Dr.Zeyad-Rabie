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
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data effects
  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadStudentCourses();
    }
  }, [user]);

  useEffect(() => {
    loadHomeworks();
  }, []);

  // Data loading functions
  const loadAnnouncements = async () => {
    try {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error loading announcements:", error);
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
  if (!user?.id) return;

  try {
    setLoading(true);

    const { data: enrollments, error: enrollError } = await supabase
      .from("student_courses")
      .select("course_id")
      .eq("student_id", Number(user.id))
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

          videosCount: lessons.filter(
            (l: any) => l.type === "video"
          ).length,

          filesCount: lessons.filter(
            (l: any) => l.type === "file"
          ).length,

          examsCount: lessons.filter(
            (l: any) => l.type === "exam"
          ).length,
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

  // Stats configuration


  const topThree = LEADERBOARD.slice(0, 3);

  // Get announcement style
  const getAnnouncementStyle = (type: string) => {
    switch (type) {
      case "exam":
        return {
          border: "border-rose-400",
          bg: "bg-gradient-to-br from-rose-50 to-pink-50",
          icon: <AlertCircle className="text-rose-500" size={16} />,
          iconBg: "bg-rose-100",
        };
      case "lesson":
        return {
          border: "border-blue-400",
          bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
          icon: <BookOpen className="text-blue-500" size={16} />,
          iconBg: "bg-blue-100",
        };
      case "homework":
        return {
          border: "border-amber-400",
          bg: "bg-gradient-to-br from-amber-50 to-orange-50",
          icon: <FileText className="text-amber-500" size={16} />,
          iconBg: "bg-amber-100",
        };
      default:
        return {
          border: "border-slate-300",
          bg: "bg-gradient-to-br from-slate-50 to-gray-50",
          icon: <Bell className="text-slate-500" size={16} />,
          iconBg: "bg-slate-100",
        };
    }
  };

return (
<StudentLayout>




      {/* Main Content */}
    <>


        <div className="p-4 sm:p-6 lg:p-8 space-y-6">


          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
       
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Enhanced My Courses Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-slate-900 text-xl flex items-center gap-2">
                  <BookOpen className="text-blue-600" size={24} />
                  كورساتي
                </h2>
                <button 
                  onClick={() => navigate("/dashboard/courses")} 
                  className="flex items-center gap-1 text-blue-600 text-sm font-bold hover:gap-2 transition-all group"
                >
                  عرض الكل 
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="flex gap-4 p-5">
                        <div className="w-24 h-24 bg-slate-200 rounded-2xl"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          <div className="h-2 bg-slate-200 rounded"></div>
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
                      className="group hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden"
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
                            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                              {course.title}
                            </h3>
                            
                          </div>

<div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
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
                              className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:text-blue-700 hover:gap-3 transition-all group"
                            >
                              <Play size={16} className="group-hover:scale-110 transition-transform" /> 
                              متابعة التعلم
                            </button>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
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
                <Card className="border-2 border-dashed border-slate-200">
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="text-slate-400" size={32} />
                    </div>
                    <p className="text-slate-500 font-medium mb-4">
                      لم تشترك في أي كورس بعد
                    </p>
                    <button
                      onClick={() => navigate("/courses")}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                    >
                      استكشف الكورسات
                    </button>
                  </CardContent>
                </Card>
              )}

              <button
                onClick={() => navigate("/courses")}
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-8 text-slate-400 text-sm font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <BookOpen className="group-hover:scale-110 transition-transform" size={20} />
                </div>
                اشترك في كورس جديد
              </button>
            </div>

            {/* Enhanced Right Column */}
            <div className="space-y-5">
              {/* Enhanced Upcoming Tasks */}
              <Card className="border-0 shadow-lg">
  <CardContent className="py-16 text-center">
    <Activity
      size={48}
      className="mx-auto text-blue-500 mb-4"
    />

    <h3 className="text-2xl font-black text-slate-900 mb-3">
      آخر النشاطات
    </h3>

    <p className="text-slate-500 leading-8 mb-5">
      سيتم عرض آخر مشاهدة للدروس
      وآخر الامتحانات والواجبات
      بعد الانتهاء من نظام تتبع النشاط.
    </p>

    <Badge variant="blue">
      🚧 تحت التطوير
    </Badge>
  </CardContent>
</Card>

              {/* Enhanced Leaderboard */}
              <Card className="border-0 shadow-lg overflow-hidden">
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

  <h3 className="text-xl font-black text-slate-800 mb-2">
    قريبًا
  </h3>

  <p className="text-slate-500 leading-7 max-w-xs">
    يتم العمل حاليًا على نظام المتصدرين وترتيب الطلاب حسب الأداء والدرجات.
  </p>

  <span className="mt-5 px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
    🚧 تحت التطوير
  </span>
</div>
                </CardContent>
              </Card>
             
            </div>
          </div>

          {/* Enhanced Announcements Section */}
         <Card className="border-0 shadow-lg">
  <CardContent className="py-16 text-center">
    <Bell
      size={48}
      className="mx-auto text-violet-500 mb-4"
    />

    <h3 className="text-2xl font-black text-slate-900 mb-3">
      آخر الإشعارات
    </h3>

    <p className="text-slate-500 leading-8 mb-5">
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
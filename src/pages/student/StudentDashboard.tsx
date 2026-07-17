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

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      const { data: enrollments } = await supabase
        .from("student_courses")
        .select("course_id")
        .eq("student_id", Number(user.id))
        .eq("active", true);

      if (!enrollments) {
        setLoading(false);
        return;
      }

      const courseIds = enrollments.map((c: any) => c.course_id);

      if (courseIds.length > 0) {
        const { data: courses } = await supabase
          .from("courses")
          .select("*")
          .in("id", courseIds);

        setStudentCourses(courses || []);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stats configuration
  const stats = [
    {
      label: "الكورسات المشترك بها",
      value: studentCourses.length.toString(),
      icon: <BookOpen size={20} />,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      iconBg: "bg-blue-500",
    },
    {
      label: "نسبة الإكمال",
      value: "0%",
      icon: <TrendingUp size={20} />,
      gradient: "from-violet-500 to-violet-600",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
      iconBg: "bg-violet-500",
    },
    {
      label: "الترتيب في الصف",
      value: "#--",
      icon: <Trophy size={20} />,
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      iconBg: "bg-amber-500",
    },
    {
      label: "النقاط المكتسبة",
      value: "0",
      icon: <Star size={20} />,
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-500",
    },
  ];

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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 overflow-hidden" dir="rtl">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] animate-slide-in-right">
            <DashboardSidebar type="student" onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Enhanced Top Bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Right Section */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileMenuOpen(true)} 
                  className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
                >
                  <Menu size={22} className="text-slate-700" />
                </button>
                <div>
                  <h1 className="font-black text-slate-900 text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    لوحة التحكم
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    أهلاً بك، {user?.name?.split(" ")[0]} 👋
                  </p>
                </div>
              </div>

              {/* Left Section */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => navigate("/dashboard/announcements")} 
                  className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 hover:from-blue-100 hover:to-violet-100 transition-all active:scale-95 group"
                >
                  <Bell size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  {announcements.some(a => a.is_new) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse">
                      <span className="absolute inset-0 bg-rose-500 rounded-full animate-ping"></span>
                    </span>
                  )}
                </button>
                <div className="hidden sm:block">
                  <Avatar name={user?.name} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Enhanced Welcome Banner */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-violet-700 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl shadow-blue-500/20">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
            
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 mb-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-white/90 text-xs font-medium">نشط الآن</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">
                    مرحباً، {user?.name?.split(" ")[0]}! 🎉
                  </h2>
                  <p className="text-blue-100 text-sm sm:text-base">
                    {user?.gradeLabel} • {user?.governorate}
                  </p>
                </div>

                {/* Rank Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Trophy className="text-amber-300" size={20} />
                      <p className="text-white font-black text-3xl">#12</p>
                    </div>
                    <p className="text-blue-100 text-xs font-medium">ترتيبك في الصف</p>
                  </div>
                </div>
              </div>

              {/* Stats Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20">
                  <Flame size={18} className="text-orange-300" />
                  <div>
                    <p className="text-white text-sm font-bold">7 أيام</p>
                    <p className="text-blue-100 text-xs">متواصلة</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20">
                  <Target size={18} className="text-emerald-300" />
                  <div>
                    <p className="text-white text-sm font-bold">90%</p>
                    <p className="text-blue-100 text-xs">هدفك</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/20">
                  <Activity size={18} className="text-cyan-300" />
                  <div>
                    <p className="text-white text-sm font-bold">نشط</p>
                    <p className="text-blue-100 text-xs">كل يوم</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <Card 
                key={i} 
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0"
              >
                <div className="p-4 sm:p-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </p>
                </div>
              </Card>
            ))}
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
                            <Badge variant="blue" className="flex-shrink-0 font-bold">
                              0%
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                            {course.description || "وصف الكورس"}
                          </p>

                          <ProgressBar value={0} size="sm" className="mb-3" />

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
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <BookOpen size={14} />
                                0 درس
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                0 ساعة
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
                <CardContent className="p-6">
                  <h3 className="font-black text-slate-900 text-lg mb-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Clock size={16} className="text-white" />
                    </div>
                    المهام القادمة
                  </h3>

                  {homeworks.length > 0 ? (
                    <div className="space-y-3">
                      {homeworks.slice(0, 5).map((hw) => (
                        <div 
                          key={hw.id} 
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <FileText size={18} className="text-amber-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate group-hover:text-amber-600 transition-colors">
                              {hw.title}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar size={12} />
                              {new Date(hw.due_date).toLocaleDateString("ar-EG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </p>
                          </div>

                          <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="text-slate-400" size={24} />
                      </div>
                      <p className="text-slate-500 text-sm">لا توجد مهام قادمة</p>
                    </div>
                  )}
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
                  <div className="space-y-3">
                    {topThree.map((s, idx) => (
                      <div 
                        key={s.rank} 
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                          idx === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50' :
                          idx === 1 ? 'bg-gradient-to-r from-slate-50 to-gray-50' :
                          'bg-gradient-to-r from-orange-50 to-amber-50'
                        } hover:shadow-md`}
                      >
                        <span className="text-2xl flex-shrink-0">
                          {s.badge || `#${s.rank}`}
                        </span>
                        <Avatar name={s.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-500">{s.grade}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                            {s.score}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Recent Activity */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-black text-slate-900 text-lg mb-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                      <Activity size={16} className="text-white" />
                    </div>
                    آخر النشاطات
                  </h3>

                  <div className="space-y-4">
                    {CURRENT_STUDENT.recentActivity.map((act, i) => (
                      <div key={i} className="flex items-start gap-3 group cursor-pointer">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${
                          act.type === "lesson" ? "bg-blue-100" :
                          act.type === "quiz" ? "bg-violet-100" :
                          "bg-emerald-100"
                        }`}>
                          {act.type === "lesson" ? (
                            <Play size={16} className="text-blue-600" />
                          ) : act.type === "quiz" ? (
                            <FileText size={16} className="text-violet-600" />
                          ) : (
                            <BookOpen size={16} className="text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900">
                            {act.text}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock size={12} />
                            {act.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Announcements Section */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-5">
              <div className="flex items-center justify-between text-white">
                <h2 className="font-black text-xl flex items-center gap-2">
                  <Bell size={22} />
                  آخر الإشعارات
                </h2>
                <button 
                  onClick={() => navigate("/dashboard/announcements")} 
                  className="text-sm font-bold bg-white/20 rounded-xl px-4 py-2 hover:bg-white/30 transition-all"
                >
                  عرض الكل
                </button>
              </div>
            </div>

            <CardContent className="p-6">
              {announcements.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {announcements.slice(0, 6).map((ann: any) => {
                    const style = getAnnouncementStyle(ann.type);
                    return (
                      <div
                        key={ann.id}
                        className={`${style.bg} rounded-2xl p-4 border-r-4 ${style.border} hover:shadow-lg transition-all cursor-pointer group`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 ${style.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            {style.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            {ann.is_new && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white px-2 py-1 rounded-full mb-2">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                جديد
                              </span>
                            )}

                            <p className="text-sm text-slate-700 leading-relaxed mb-2">
                              {ann.content}
                            </p>

                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(ann.created_at).toLocaleDateString("ar-EG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bell className="text-slate-400" size={32} />
                  </div>
                  <p className="text-slate-500">لا توجد إشعارات حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
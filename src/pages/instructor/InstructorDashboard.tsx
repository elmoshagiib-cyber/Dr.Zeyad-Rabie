import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Star,
  BarChart2,
  Bell,
  Users,
  ClipboardList,
  PlusCircle,
  GraduationCap,
  Monitor,
  Building2,
  BookOpen,
  QrCode,
  Eye,
  ArrowLeft,
} from "lucide-react";

export function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "analytics">("overview");

  const [courses, setCourses]             = useState<any[]>([]);
  const [students, setStudents]           = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
const [exams, setExams] = useState<any[]>([]);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    loadData();
    const channel = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" },      () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" },       () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "exams" },         () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "student_courses" },() => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadData = async () => {
    setLoading(true);
const [
  coursesRes,
  studentsRes,
  notificationsRes,
  studentCoursesRes,
  homeworksRes,
  examsRes,
  visitsRes,
] = await Promise.all([

  supabase
    .from("courses")
    .select("*")
    .eq("teacher_id", user?.id)
    .order("created_at", { ascending: false }),

  supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false }),

supabase
  .from("notifications")
  .select("*")
  .order("created_at", { ascending: false }),

  supabase
    .from("student_courses")
    .select("*"),

    supabase
  .from("homeworks")
  .select("title, created_at")
  .order("created_at", { ascending: false }),

supabase
  .from("exams")
  .select("title, created_at")
  .order("created_at", { ascending: false }),

  supabase
    .from("site_visits")
    .select("visitor_id, created_at"),

]);

    setCourses(coursesRes.data || []);
    setStudents(studentsRes.data || []);
    setNotifications(notificationsRes.data || []);
    setHomeworks(homeworksRes.data || []);
setExams(examsRes.data || []);
setVisits(visitsRes.data || []);
    setStudentCourses(studentCoursesRes.data || []);
    setLoading(false);


  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const activeCourses = courses.filter(
  (c) => c.is_published
);
  const totalStudents      = students.length;
  const totalCourses       = courses.length;
  const totalNotifications = notifications.length;
  const totalSubscriptions = studentCourses.length;
  const recentStudents     = students.slice(0, 10);
 const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(new Date());
  const yesterdayStart = new Date(today); yesterdayStart.setDate(today.getDate() - 1);
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const inRange = (start: Date, end?: Date) =>
    visits.filter((v) => {
      const t = new Date(v.created_at);
      return t >= start && (!end || t < end);
    });

  const uniqueCount = (arr: any[]) => new Set(arr.map((v) => v.visitor_id)).size;

  const visitStats = {
    today:     { total: inRange(today).length,          unique: uniqueCount(inRange(today)) },
    yesterday: { total: inRange(yesterdayStart, today).length, unique: uniqueCount(inRange(yesterdayStart, today)) },
    week:      { total: inRange(weekStart).length,       unique: uniqueCount(inRange(weekStart)) },
    month:     { total: inRange(monthStart).length,       unique: uniqueCount(inRange(monthStart)) },
    year:      { total: inRange(yearStart).length,        unique: uniqueCount(inRange(yearStart)) },
  };

  // الشهر والأسبوع السابقين — لحساب نسب التغيير الحقيقية
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(weekStart.getDate() - 7);

  const prevMonthTotal = inRange(prevMonthStart, monthStart).length;
  const prevWeekTotal = inRange(prevWeekStart, weekStart).length;

  const calcChange = (current: number, previous: number) => {
    if (previous > 0) return Math.round(((current - previous) / previous) * 100);
    return current > 0 ? 100 : 0;
  };

  const changeVsYesterday = calcChange(visitStats.today.total, visitStats.yesterday.total);
  const changeMonthVsPrev = calcChange(visitStats.month.total, prevMonthTotal);
  const changeWeekVsPrev = calcChange(visitStats.week.total, prevWeekTotal);

  const last7DaysVisits = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(today); day.setDate(day.getDate() - (6 - i));
    const nextDay = new Date(day); nextDay.setDate(day.getDate() + 1);
    const dayVisits = inRange(day, nextDay);
    return {
      day: day.toLocaleDateString("ar-EG", { weekday: "short", day: "2-digit", month: "2-digit" }),
      إجمالي: dayVisits.length,
      فريد: uniqueCount(dayVisits),
    };
  });
  const courseStudentsMap = new Map<string, number>();
  studentCourses.forEach((item) => {
    courseStudentsMap.set(item.course_id, (courseStudentsMap.get(item.course_id) || 0) + 1);
  });

  const performanceData = courses.map((course) => ({
    course:     course.title,
    completion: 100,
    students:   courseStudentsMap.get(course.id) || 0,
    rating:     5,
    revenue:    course.price
      ? course.price * studentCourses.filter((s) => s.course_id === course.id).length
      : 0,
  }));

const recentActivities = [
...notifications.map((n) => ({
  title: "تم إرسال إشعار",
  description: n.title,
  time: n.created_at,
  color: "bg-violet-500",
})),

  ...courses.map((c) => ({
    title: "تم إنشاء كورس",
    description: c.title,
    time: c.created_at,
    color: "bg-blue-500",
  })),

  ...homeworks.map((h) => ({
    title: "تم إضافة واجب",
    description: h.title,
    time: h.created_at,
    color: "bg-orange-500",
  })),

  ...exams.map((e) => ({
    title: "تم إنشاء امتحان",
    description: e.title,
    time: e.created_at,
    color: "bg-emerald-500",
  })),
]
  .sort(
    (a, b) =>
      new Date(b.time).getTime() -
      new Date(a.time).getTime()
  )
  .slice(0, 6)
  .map((item) => ({
    ...item,
    time: new Date(item.time).toLocaleDateString("ar-EG"),
  }));

  const analyticsData = [
    { day: "السبت",    students: 12 },
    { day: "الأحد",   students: 18 },
    { day: "الإثنين", students: 22 },
    { day: "الثلاثاء",students: 16 },
    { day: "الأربعاء",students: 28 },
    { day: "الخميس",  students: 25 },
    { day: "الجمعة",  students: 20 },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "🌤 صباح الخير";
    if (h < 18) return "☀️ مساء الخير";
    return "🌙 مساء الخير";
  })();

 const overviewCards = [
  {
    title: "إجمالي الطلاب",
    value: totalStudents,
    subtitle: "إجمالي الطلاب المسجلين",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },

  {
    title: "طلاب السنتر",
    value: students.filter((s) => s.type === "center").length,
    subtitle: "طلاب داخل السنتر",
    icon: Building2,
    color: "bg-violet-50 text-violet-600",
  },

  {
    title: "طلاب الأونلاين",
    value: students.filter((s) => s.type === "online").length,
    subtitle: "طلاب المنصة",
    icon: Monitor,
    color: "bg-cyan-50 text-cyan-600",
  },

  {
    title: "الكورسات النشطة",
    value: activeCourses.length,
    subtitle: "الكورسات المنشورة",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-600",
  },

  {
    title: "الاشعارات",
    value: totalNotifications,
    subtitle: "الاشعارات الحالية",
    icon: Bell,
    color: "bg-pink-50 text-pink-600",
  },

  {
    title: "الاشتراكات",
    value: totalSubscriptions,
    subtitle: "إجمالي التسجيلات",
    icon: GraduationCap,
    color: "bg-green-50 text-green-600",
  },
];

const quickActions = [
  {
    title: "إنشاء كورس",
    subtitle: "أضف كورس جديد",
    icon: PlusCircle,
    color: "from-blue-500 to-cyan-500",
    path: "/instructor/courses/create",
  },

  {
    title: "كورساتي",
    subtitle: "إدارة الكورسات",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-500",
    path: "/instructor/courses",
  },

  {
    title: "الطلاب",
    subtitle: "إدارة الطلاب",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    path: "/instructor/students",
  },



  {
    title: "تسليمات الطلاب",
    subtitle: "مراجعة الواجبات",
    icon: GraduationCap,
    color: "from-orange-500 to-amber-500",
    path: "/instructor/submissions",
  },

  {
    title: "الإشعارات",
    subtitle: "إرسال إشعار",
    icon: Bell,
    color: "from-indigo-500 to-violet-600",
    path: "/instructor/notifications",
  },
];

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-28 sm:h-36 rounded-2xl sm:rounded-3xl bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 sm:h-36 rounded-2xl sm:rounded-3xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>

      {/* ── Hero header ── */}
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
    sm:px-8
    lg:px-10

    py-7
    sm:py-8
    lg:py-10

    text-white

    shadow-[0_18px_45px_rgba(179,72,254,.22)]

    mb-6
  "
>
        {/* single glow — no duplicates */}
{/* Top Left Glow */}
<div
  className="
    absolute
    -top-28
    -left-20

    w-[360px]
    h-[360px]

    rounded-full

    bg-white/12

    blur-[120px]

    pointer-events-none
  "
/>

{/* Bottom Right Glow */}
<div
  className="
    absolute
    -bottom-32
    -right-20

    w-[340px]
    h-[340px]

    rounded-full

    bg-white/10

    blur-[120px]

    pointer-events-none
  "
/>




        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* icon */}
          <div className="
w-14 h-14
sm:w-16 sm:h-16
lg:w-20 lg:h-20

rounded-[26px]

flex
items-center
justify-center

bg-white/15

backdrop-blur-xl

border

border-white/20

shadow-[0_8px_30px_rgba(255,255,255,.15)]

shrink-0
">
            <BarChart2 className="text-white" size={22} />
          </div>
          {/* text — RTL so text is on the right */}
          <div className="text-right flex-1">
            <h1 className="text-2xl sm:text-4xl lg:text-4xl lg:text-5xl
tracking-tight font-black text-white leading-none">
              لوحة التحكم
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-base text-white/90
font-medium">
              {greeting}، د. {user?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">

        {/* ── Visitors stats ── */}
        <Card className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <BarChart2 className="text-indigo-600" size={18} />
              </div>
              <div className="text-right">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">إحصائيات الزوار</h2>
                <p className="text-slate-400 text-xs mt-0.5">تتبع حركة الزوار الحقيقية على المنصة</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6">
              {[
                {
                  label: "هذا العام",
                  data: visitStats.year,
                  valueColor: "text-violet-600",
                  badge: null,
                },
                {
                  label: "هذا الشهر",
                  data: visitStats.month,
                  valueColor: "text-emerald-600",
                  badge: {
                    text: `${changeMonthVsPrev >= 0 ? "+" : ""}${changeMonthVsPrev}% الشهر الماضي`,
                    color: changeMonthVsPrev >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
                    up: changeMonthVsPrev >= 0,
                  },
                },
                {
                  label: "هذا الأسبوع",
                  data: visitStats.week,
                  valueColor: "text-amber-500",
                  badge: {
                    text: `${changeWeekVsPrev >= 0 ? "+" : ""}${changeWeekVsPrev}% الأسبوع الماضي`,
                    color: changeWeekVsPrev >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
                    up: changeWeekVsPrev >= 0,
                  },
                },
                {
                  label: "أمس",
                  data: visitStats.yesterday,
                  valueColor: "text-slate-900",
                  badge: null,
                },
                {
                  label: "اليوم",
                  data: visitStats.today,
                  valueColor: "text-blue-600",
                  badge: {
                    text: `${changeVsYesterday >= 0 ? "+" : ""}${changeVsYesterday}% عن أمس`,
                    color: changeVsYesterday >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
                    up: changeVsYesterday >= 0,
                  },
                },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 p-3 sm:p-4 text-center flex flex-col items-center">
                  <p className="text-xs text-slate-500 font-bold">{item.label}</p>
                  <p className={`text-2xl sm:text-3xl font-black mt-1 ${item.valueColor}`}>
                    {item.data.total}
                  </p>
                  <p className="text-xs text-slate-400">زيارة</p>
                  <p className="text-xs text-slate-500 mt-1">{item.data.unique} فريد</p>
                  {item.badge && (
                    <span className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badge.color}`}>
                      {item.badge.up ? "▲" : "▼"} {item.badge.text}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                  إجمالي
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" />
                  فريد
                </span>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">الزوار — آخر 7 أيام</h3>
                <p className="text-xs text-slate-400">مقارنة الزيارات الكلية والزوار الفريدين يومياً</p>
              </div>
            </div>

            <div className="h-56 sm:h-64" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7DaysVisits} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#eef0f5" vertical={false} />
                  <XAxis
                    dataKey="day"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #eef0f5",
                      fontSize: 12,
                      direction: "rtl",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="إجمالي"
                    stroke="#6366f1"
                    fill="url(#colorTotal)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="فريد"
                    stroke="#c084fc"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: "#c084fc", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card className="cursor-pointer rounded-2xl sm:rounded-[24px] border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-3 sm:p-4 lg:p-5">
                    <div className="flex justify-between items-start">
                      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="text-right">
                        <h4 className="text-slate-500 text-xs sm:text-sm leading-tight">{card.title}</h4>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-1 sm:mt-2 leading-none">
                          <CountUp end={Number(card.value)} duration={1.4} />
                        </h2>
                      </div>
                    </div>
                    <p className="text-slate-400 mt-3 sm:mt-4 text-xs sm:text-sm">{card.subtitle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "overview" && (
          <div className="space-y-4 sm:space-y-6">



           

            {/* Quick actions */}
            <div>
              <div className="mb-4 sm:mb-6 text-right">
                <h2 className="text-xl sm:text-3xl font-black">الإجراءات السريعة</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">كل الأدوات في مكان واحد</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                {quickActions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={index}
                      onClick={() => navigate(item.path)}
                      className="group cursor-pointer overflow-hidden rounded-2xl sm:rounded-[28px] border-0 shadow-md sm:shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                    >
                      <CardContent className="p-0">
                        <div className={`bg-gradient-to-br ${item.color} p-4 sm:p-6 lg:p-7 text-white relative overflow-hidden`}>
                          <div className="absolute -left-8 -top-8 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/10 group-hover:scale-150 transition-all duration-500" />
                          <Icon size={24} className="relative z-10 sm:w-8 sm:h-8" />
                          <h3 className="relative z-10 mt-4 sm:mt-8 text-sm sm:text-lg lg:text-xl font-black">{item.title}</h3>
                          <p className="relative z-10 opacity-80 mt-0.5 sm:mt-2 text-xs sm:text-sm">{item.subtitle}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* أحدث الطلاب المسجلين */}
            <Card className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
                  <button
                    onClick={() => navigate("/instructor/students")}
                    className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#B348FE] hover:text-[#9E2FFF] transition-colors"
                  >
                    عرض الكل
                    <ArrowLeft size={14} />
                  </button>
                  <div className="text-right">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">أحدث الطلاب المسجلين</h2>
                    <p className="text-slate-400 text-xs mt-0.5">آخر {recentStudents.length} طالب سجلوا على المنصة</p>
                  </div>
                </div>

                {recentStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-slate-500 font-bold text-sm">لا يوجد طلاب مسجلين بعد</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-right text-xs font-black text-slate-600">الطالب</th>
                            <th className="px-4 py-3 text-right text-xs font-black text-slate-600">الصف</th>
                            <th className="px-4 py-3 text-right text-xs font-black text-slate-600">النوع</th>
                            <th className="px-4 py-3 text-right text-xs font-black text-slate-600">تاريخ التسجيل</th>
                            <th className="px-4 py-3 text-right text-xs font-black text-slate-600">الحالة</th>
                            <th className="px-4 py-3 text-center text-xs font-black text-slate-600">إجراء</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentStudents.map((student) => (
                            <tr
                              key={student.id}
                              className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar name={student.full_name} src={student.avatar_url} size="sm" className="h-8 w-8 text-xs" />
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">{student.full_name}</p>
                                    <p className="text-xs text-slate-500">{student.phone || "لا يوجد رقم"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                                  {student.grade}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-black border ${
                                  student.type === "online"
                                    ? "bg-[#F6EEFF] text-[#B348FE] border-[#EAD8FF]"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  {student.type === "online" ? "أونلاين" : "سنتر"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-bold text-slate-600">
                                  {student.created_at ? new Date(student.created_at).toLocaleDateString("ar-EG") : "-"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-black border ${
                                  student.status === "نشط" || student.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}>
                                  {student.status === "نشط" || student.status === "active" ? "نشط" : "موقوف"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <button
                                    onClick={() => navigate(`/instructor/students/${student.id}`)}
                                    className="w-8 h-8 rounded-lg bg-[#F6EEFF] text-[#B348FE] hover:bg-[#EAD8FF] flex items-center justify-center transition-all duration-200"
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3 p-4">
                      {recentStudents.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => navigate(`/instructor/students/${student.id}`)}
                          className="bg-slate-50 rounded-2xl p-4 border border-slate-100 cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded-lg text-xs font-black border ${
                              student.status === "نشط" || student.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {student.status === "نشط" || student.status === "active" ? "نشط" : "موقوف"}
                            </span>
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-bold text-slate-900 text-sm text-right">{student.full_name}</p>
                                <p className="text-xs text-slate-500 text-right">{student.grade}</p>
                              </div>
                              <Avatar name={student.full_name} src={student.avatar_url} size="sm" className="h-9 w-9" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                            <span>{student.type === "online" ? "أونلاين" : "سنتر"}</span>
                            <span>{student.created_at ? new Date(student.created_at).toLocaleDateString("ar-EG") : "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          </div>
        )}

        {activeTab === "students" && (
          <Card className="rounded-2xl sm:rounded-3xl border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-slate-500">{recentStudents.length} طالب</span>
                  <Button size="sm" variant="outline" className="text-xs sm:text-sm">تصدير</Button>
                </div>
                <h2 className="font-black text-slate-900 text-base sm:text-lg">طلابي المسجلون</h2>
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-[640px] sm:min-w-[900px] w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {["الطالب", "الصف", "المحافظة", "الكورسات", "الدرجة", "الحالة"].map((h) => (
                        <th key={h} className="text-right text-xs font-bold text-slate-500 pb-3 px-2 sm:px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar name={s.full_name} size="sm" />
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-slate-900">{s.full_name}</p>
                              <p className="text-xs text-slate-400 font-mono">{s.student_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                          <span className="text-xs sm:text-sm text-slate-600">{s.grade}</span>
                        </td>
                        <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                          <span className="text-xs sm:text-sm text-slate-600">{s.governorate}</span>
                        </td>
                        <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {studentCourses.filter((course) => course.student_id === s.id).length}
                          </span>
                        </td>
                        <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                          <span className={`text-xs sm:text-sm font-black ${s.score >= 90 ? "text-emerald-600" : s.score >= 75 ? "text-blue-600" : "text-slate-600"}`}>
                            {s.score > 0 ? `${s.score}%` : "—"}
                          </span>
                        </td>
                        <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                          <Badge variant={s.status === "active" ? "emerald" : "amber"}>
                            {s.status === "active" ? "نشط" : "موقوف"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Card className="rounded-2xl sm:rounded-3xl border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-black text-slate-900 mb-4 sm:mb-5 text-base sm:text-lg">أداء الكورسات</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {performanceData.map((data, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-xs sm:text-sm font-black text-slate-900">{data.completion}%</span>
                          <span className="text-xs sm:text-sm font-medium text-slate-700 text-right truncate">{data.course}</span>
                        </div>
                        <ProgressBar value={data.completion} size="sm" />
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 justify-end">
                          <Star size={9} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs text-slate-400">{data.rating}</span>
                          <span className="text-xs text-slate-400">{data.students} طالب</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl sm:rounded-3xl border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-black text-slate-900 mb-4 sm:mb-5 text-base sm:text-lg">الإيرادات</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {performanceData.map((data, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-black text-emerald-600 shrink-0">{data.revenue.toLocaleString("ar-EG")} ج</span>
                        <span className="text-xs sm:text-sm text-slate-600 text-right truncate">{data.course}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200 pt-3 flex items-center justify-between gap-2">
                      <span className="font-black text-lg sm:text-xl text-emerald-600">
                        {performanceData.reduce((s, d) => s + d.revenue, 0).toLocaleString("ar-EG")} ج
                      </span>
                      <span className="font-black text-slate-900 text-sm sm:text-base">الإجمالي</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

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
} from "lucide-react";

export function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "analytics">("overview");

  const [courses, setCourses]             = useState<any[]>([]);
  const [students, setStudents]           = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
const [exams, setExams] = useState<any[]>([]);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    loadData();
    const channel = supabase
      .channel("dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" },      () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" },       () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => loadData())
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
  announcementsRes,
  studentCoursesRes,
  homeworksRes,
  examsRes,
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
    .from("announcements")
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

]);

    setCourses(coursesRes.data || []);
    setStudents(studentsRes.data || []);
    setAnnouncements(announcementsRes.data || []);
    setHomeworks(homeworksRes.data || []);
setExams(examsRes.data || []);
    setStudentCourses(studentCoursesRes.data || []);
    setLoading(false);
    console.log("Courses", coursesRes.data);
console.log(
  studentsRes.data?.map((s) => ({
    name: s.full_name,
    type: s.type,
  }))
);
console.log("Student Courses", studentCoursesRes.data);
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const activeCourses = courses.filter(
  (c) => c.is_published
);
  const totalStudents      = students.length;
  const totalCourses       = courses.length;
  const totalAnnouncements = announcements.length;
  const totalSubscriptions = studentCourses.length;
  const recentStudents     = students.slice(0, 10);

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
  ...announcements.map((a) => ({
    title: "تم نشر إعلان",
    description: a.title,
    time: a.created_at,
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
    title: "الإعلانات",
    value: totalAnnouncements,
    subtitle: "الإعلانات الحالية",
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
    title: "الحضور",
    subtitle: "QR Code",
    icon: QrCode,
    color: "from-violet-500 to-fuchsia-500",
    path: "/instructor/attendance",
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
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[36px] bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-[#7C3AED] px-4 sm:px-7 lg:px-10 py-5 sm:py-7 lg:py-10 text-white shadow-[0_16px_48px_rgba(91,33,182,.35)] mb-4 sm:mb-6">
        {/* single glow — no duplicates */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
<div className="absolute -bottom-20 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* icon */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl sm:rounded-3xl bg-white/10 flex items-center justify-center shrink-0">
            <BarChart2 className="text-white" size={22} />
          </div>
          {/* text — RTL so text is on the right */}
          <div className="text-right flex-1">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-none">
              لوحة التحكم
            </h1>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-base text-white/80">
              {greeting}، د. {user?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">

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



            {/* Recent activities */}
            <Card className="rounded-2xl sm:rounded-3xl lg:rounded-[36px] border-0 shadow-lg sm:shadow-xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-5 sm:mb-8 gap-3">
                  <Button variant="outline" className="text-xs sm:text-sm shrink-0">عرض الكل</Button>
                  <div className="text-right">
                    <h2 className="text-xl sm:text-3xl font-black">آخر النشاطات</h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">كل ما يحدث داخل المنصة</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentActivities.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 sm:gap-5 group py-3 sm:py-5">
                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ring-4 ring-white rounded-full mt-1.5 sm:mt-2 shrink-0 ${item.color} group-hover:scale-125 transition-all`} />
                      <div className="flex-1 border-r-2 border-slate-100 pr-3 sm:pr-5 text-right">
                        <h3 className="font-bold text-sm sm:text-base lg:text-lg">{item.title}</h3>
                        <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">{item.description}</p>
                        <span className="text-xs text-slate-400 mt-1 sm:mt-2 block">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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

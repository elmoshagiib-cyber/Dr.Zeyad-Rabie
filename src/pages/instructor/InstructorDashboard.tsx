import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
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
  Plus,
  BarChart2,
  MessageSquare,
  FileText,
  Bell,
  Users,
  ClipboardList,
  PlusCircle,
  GraduationCap,
  Monitor,
  Trophy,
  BookOpen,
  QrCode,
} from "lucide-react";

export function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "analytics">("overview");

const [courses, setCourses] = useState<any[]>([]);
const [students, setStudents] = useState<any[]>([]);
const [announcements, setAnnouncements] = useState<any[]>([]);
const [exams, setExams] = useState<any[]>([]);
const [studentCourses, setStudentCourses] = useState<any[]>([]);

useEffect(() => {
  loadData();
}, []);
  const loadData = async () => {
  const [
    coursesRes,
    studentsRes,
    announcementsRes,
    examsRes,
    studentCoursesRes,
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("*")
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
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false }),

    supabase
      .from("student_courses")
      .select("*"),
  ]);

  setCourses(coursesRes.data || []);
  setStudents(studentsRes.data || []);
  setAnnouncements(announcementsRes.data || []);
  setExams(examsRes.data || []);
  setStudentCourses(studentCoursesRes.data || []);
};
const recentActivities = [
  ...announcements.slice(0, 4).map((a) => ({
    title: "تم نشر إعلان",
    description: a.title,
    time: "الآن",
    color: "bg-violet-500",
  })),

  ...courses.slice(0, 4).map((c) => ({
    title: "تم إنشاء كورس",
    description: c.title,
    time: "الآن",
    color: "bg-blue-500",
  })),

  ...exams.slice(0, 4).map((e) => ({
    title: "تم إنشاء اختبار",
    description: e.title,
    time: "الآن",
    color: "bg-emerald-500",
  })),
].slice(0, 6);

const performanceData = courses.map(course => ({
  course: course.title,
  completion: 100,
  students: studentCourses.filter(
    s => s.course_id === course.id
  ).length,
  rating: 5,
  revenue: course.price
    ? course.price *
      studentCourses.filter(
        s => s.course_id === course.id
      ).length
    : 0,
}));
const activeCourses = courses.filter(c => c.active);

const totalStudents = students.length;

const totalCourses = courses.length;

const totalAnnouncements = announcements.length;

const totalExams = exams.length;

const totalSubscriptions = studentCourses.length;

const averageStudents =
  totalCourses === 0
    ? 0
    : Math.round(totalSubscriptions / totalCourses);
  const stats = [
  {
    label: "إجمالي الطلاب",
    value: totalStudents,
    color: "bg-blue-500",
    icon: <Users size={20} />,
    change: ""
  },
  {
    label: "الكورسات النشطة",
    value: courses.filter(c => c.active).length,
    color: "bg-violet-500",
    icon: <BookOpen size={20} />,
    change: ""
  },
  {
    label: "الاختبارات",
    value: totalExams,
    color: "bg-amber-500",
    icon: <FileText size={20} />,
    change: ""
  },
  {
    label: "الإعلانات",
    value: announcements.length,
    color: "bg-emerald-500",
    icon: <MessageSquare size={20} />,
    change: ""
  }
];


const recentStudents = students.slice(0, 10);


const quickActions = [
  {
    title: "إنشاء كورس",
    subtitle: "أضف كورس جديد",
    icon: PlusCircle,
    color: "from-blue-500 to-cyan-500",
    path: "/instructor/courses/create",
  },
  {
    title: "إضافة اختبار",
    subtitle: "إنشاء امتحان",
    icon: ClipboardList,
    color: "from-orange-500 to-amber-500",
    path: "/instructor/exams",
  },
  {
    title: "نشر إعلان",
    subtitle: "إرسال إشعار",
    icon: Bell,
    color: "from-violet-500 to-fuchsia-500",
    path: "/instructor/announcements",
  },
  {
    title: "الحضور",
    subtitle: "QR Code",
    icon: QrCode,
    color: "from-emerald-500 to-green-500",
    path: "/instructor/attendance",
  },
  {
    title: "الطلاب",
    subtitle: "إدارة الطلاب",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    path: "/instructor/students",
  },
  {
    title: "التحليلات",
    subtitle: "عرض التقارير",
    icon: BarChart2,
    color: "from-indigo-500 to-violet-600",
    path: "/instructor/analytics",
  },
];

const overviewCards = [
  {
    title: "إجمالي الطلاب",
    value: totalStudents,
    subtitle: "طالب مسجل",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "الكورسات النشطة",
    value: courses.filter(course => course.active).length,
    subtitle: "كورس منشور",
    icon: BookOpen,
    color: "bg-violet-50 text-violet-600",
  },
  {
    title: "الاختبارات",
    value: totalExams,
    subtitle: "اختبار منشور",
    icon: ClipboardList,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "الإعلانات",
    value: totalAnnouncements,
    subtitle: "إعلان منشور",
    icon: Bell,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "اشتراكات الطلاب",
    value: totalSubscriptions,
    subtitle: "اشتراك بالكورسات",
    icon: GraduationCap,
    color: "bg-pink-50 text-pink-600",
  },
  {
    title: "متوسط الطلاب",
    value:
      courses.length > 0
        ? Math.round(studentCourses.length / courses.length)
        : 0,
    subtitle: "لكل كورس",
    icon: BarChart2,
    color: "bg-yellow-50 text-yellow-600",
  },
];
const analyticsData = [
  {
    day: "اليوم",
    students: totalStudents,
  },
];

  return (
  <div
    className="
    flex
    min-h-screen
    bg-[#f5f7fb]
    "
    dir="rtl"
  >

    <DashboardSidebar type="instructor" />

<main
  className="
  flex-1
  overflow-y-auto
  px-3
  py-4
  "
    >
      
        {/* Header */}
<div
  className="
  relative
  overflow-hidden
  rounded-[32px]
  bg-gradient-to-r
from-blue-700
via-blue-600
to-blue-500
shadow-[0_25px_60px_rgba(37,99,235,.35)]
  px-10
  py-6
  text-white
  shadow-[0_10px_40px_rgba(37,99,235,0.25)]
  mb-8
  "
>
  <div className="absolute -top-20 -left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />

<div className="absolute bottom-[-120px] right-[-80px] w-80 h-80 bg-cyan-300/10 rounded-full blur-3xl" />
  <div className="relative z-10 flex items-center justify-between">

    <Button
      onClick={() =>
        navigate("/instructor/courses/create")
      }
      className="
      bg-white
      text-blue-700
      hover:bg-blue-50
      rounded-[28px]
      px-8
      h-16
      min-w-[200px]
      font-bold
      shadow-lg
      "
    >
      <Plus size={18} />
      إنشاء كورس
    </Button>

    <div className="flex flex-row-reverse items-center gap-6">

      <div className="text-right">

        <h1 className="text-5xl font-black">
          لوحة التحكم
        </h1>

        <p className="text-blue-100 text-base mt-2">
          مرحباً {user?.name || "د. زياد ربيع"}
        </p>


      </div>

      <div
        className="
        w-16
        h-16
        rounded-[24px]
        bg-white/10
        backdrop-blur-md
        flex
        items-center
        justify-center
        "
      >
        <BarChart2
          size={30}
          className="text-white"
        />
      </div>

    </div>
<div
className="
absolute
top-0
-left-1/2
w-1/2
h-full
bg-gradient-to-r
from-transparent
via-white/10
to-transparent
rotate-12
animate-[shine_5s_linear_infinite]
"
/>
  </div>

  <div
    className="
    absolute
    -top-20
    -left-20
    w-72
    h-72
    bg-white/10
    rounded-full
    blur-3xl
    "
  />

  <div
    className="
    absolute
    -bottom-20
    right-0
    w-80
    h-80
    bg-blue-300/20
    rounded-full
    blur-3xl
    "
  />
</div>

<div className="space-y-4">
</div>
        <div className="pt-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
<Card
  key={i}
  className="
  group
  rounded-[28px]
  border-0
  bg-white
  shadow-[0_8px_30px_rgba(15,23,42,.05)]
  hover:-translate-y-2
  hover:scale-[1.02]
  hover:shadow-[0_20px_45px_rgba(37,99,235,.12)]
  transition-all
  duration-300
  overflow-hidden
  "
>

  <CardContent className="p-6">

    <div className="flex items-start justify-between mb-8">

      <div>

        <p className="text-sm font-semibold text-slate-500">
          {stat.label}
        </p>

        <h2 className="text-5xl font-black text-slate-900 mt-3">
          {stat.value}
        </h2>

      </div>

      <div
        className={`
        w-16
        h-16
        rounded-2xl
        ${stat.color}
        flex
        items-center
        justify-center
        text-white
        shadow-lg
        group-hover:rotate-6
        group-hover:scale-110
        transition-all
        duration-300
        `}
      >
        {stat.icon}
      </div>

    </div>

    <div className="flex items-center justify-between">

      <span className="text-xs text-slate-400">
        مقارنة بالشهر الماضي
      </span>

      <span className="text-emerald-600 text-sm font-bold">
        ↑ 12%
      </span>

    </div>

  </CardContent>

</Card>
            ))}
          </div>

          {/* Tabs */}
          <div className="
flex
gap-2
bg-white
border
border-slate-200
p-1.5
rounded-2xl
w-fit
shadow-sm
">
            {[
              { key: "overview", label: "نظرة عامة" },
              { key: "students", label: "الطلاب" },
              { key: "analytics", label: "التحليلات" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-white dark:bg-[#130726] text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

<div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">

  {overviewCards.map((card,index)=>{

const Icon=card.icon;

return(

<Card
key={index}
className="
group
rounded-[28px]
border
border-slate-100
hover:border-blue-200
hover:shadow-xl
transition-all
duration-300
"
>

<CardContent className="p-6">

<div className="flex justify-between items-start">

<div>

<div
className={`
w-14
h-14
rounded-2xl
flex
items-center
justify-center
${card.color}
`}
>

<Icon size={26}/>

</div>

</div>

<div className="text-right">

<h4 className="text-slate-500 text-sm">

{card.title}

</h4>

<h2 className="text-5xl font-black mt-3">

{card.value}

</h2>

</div>

</div>

<p className="text-slate-400 mt-6">

{card.subtitle}

</p>

</CardContent>

</Card>

)

})}
</div>
{activeTab === "overview" && (

<div className="space-y-8">
<section>

<div className="flex items-end justify-between mb-7">

<div className="text-right">

<h2 className="text-4xl font-black text-slate-900">
إحصائيات الأداء
</h2>

<p className="text-slate-500 mt-2">
ملخص أداء المنصة التعليمية
</p>

</div>

<div className="
px-5
py-4
rounded-2xl
bg-violet-100
text-violet-600
font-bold
">
آخر تحديث الآن
</div>

</div>

<div className="grid grid-cols-5 gap-5">



</div>

</section>
  {/* Performance */}
<Card className="rounded-[32px] border-0 shadow-xl shadow-slate-200/50">

<CardContent className="p-8">

<div className="flex items-center justify-between mb-8">

<div>

<h2 className="text-2xl font-black">
تحليل النشاط
</h2>

<p className="text-slate-500">
متابعة أداء المنصة خلال الأسبوع
</p>

</div>

<Button
variant="outline"
className="rounded-xl"
>
هذا الأسبوع
</Button>

</div>

<div className="h-[360px]">

<ResponsiveContainer width="100%" height="100%">

<AreaChart data={analyticsData}>

<CartesianGrid
strokeDasharray="5 5"
stroke="#E2E8F0"
/>

<XAxis
dataKey="day"
tick={{ fill: "#64748B" }}
axisLine={false}
tickLine={false}
/>

<Tooltip />

<Area
type="monotone"
dataKey="students"
stroke="#2563EB"
fill="#2563EB22"
strokeWidth={4}
/>

</AreaChart>

</ResponsiveContainer>

</div>

</CardContent>

</Card>
<div className="grid grid-cols-3 gap-5 mt-8">

<Card>
<CardContent className="p-6">
<p className="text-slate-500">
طلاب جدد
{students.length}
</p>

<h2 className="text-3xl font-black">
{totalStudents}
</h2>

</CardContent>
</Card>

<Card>
<CardContent className="p-6">
<p className="text-slate-500">
كورسات جديدة
</p>

<h2 className="text-3xl font-black">
{totalCourses}
</h2>

</CardContent>
</Card>

<Card>
<CardContent className="p-6">
<p className="text-slate-500">
معدل النشاط
</p>

<h2 className="text-3xl font-black text-emerald-600">
{courses.length === 0 ? "0%" : `${Math.round((activeCourses.length / totalCourses) * 100)}%`}
</h2>

</CardContent>
</Card>

</div>
  {/* Charts */}
<section>

<Card className="rounded-[32px] border-0 shadow-xl">

<CardContent className="p-8">

<div className="flex items-center justify-between mb-8">

<div>

<h2 className="text-3xl font-black">
آخر النشاطات
</h2>

<p className="text-slate-500">
كل ما يحدث داخل المنصة
</p>

</div>

<Button variant="outline">
عرض الكل
</Button>

</div>

<div className="space-y-6">

{recentActivities.map((item,index)=>(

<div
key={index}
className="
flex
items-start
gap-5
group
"
>

<div
className={`
w-4
h-4
rounded-full
mt-2
${item.color}
group-hover:scale-125
transition-all
`}
/>

<div className="flex-1 border-r-2 border-slate-100 pr-5">

<h3 className="font-bold text-lg">
{item.title}
</h3>

<p className="text-slate-500 mt-1">
{item.description}
</p>

<span className="text-xs text-slate-400 mt-2 block">
{item.time}
</span>

</div>

</div>

))}

</div>

</CardContent>

</Card>

</section>

<section>

<div className="flex items-center justify-between mb-8">

<div>

<h2 className="text-3xl font-black">
الإجراءات السريعة
</h2>

<p className="text-slate-500">
كل الأدوات في مكان واحد
</p>

</div>

</div>

<div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">

{quickActions.map((item,index)=>{

const Icon=item.icon;

return(

<Card
key={index}
onClick={()=>navigate(item.path)}
className="
group
cursor-pointer
overflow-hidden
rounded-[28px]
border-0
shadow-lg
hover:shadow-2xl
hover:-translate-y-3
transition-all
duration-300
"
>

<CardContent className="p-0">

<div
className={`
bg-gradient-to-br
${item.color}
p-7
text-white
relative
overflow-hidden
`}
>

<div
className="
absolute
-left-10
-top-10
w-36
h-36
rounded-full
bg-white/10
group-hover:scale-150
transition-all
duration-500
"
/>

<Icon
size={36}
className="relative z-10"
/>

<h3 className="relative z-10 mt-8 text-xl font-black">

{item.title}

</h3>

<p className="relative z-10 opacity-80 mt-2">

{item.subtitle}

</p>

</div>

</CardContent>

</Card>

)

})}

</div>

</section>

  {/* Bottom */}

</div>

)}


          {activeTab === "students" && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-slate-900">طلابي المسجلون</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{recentStudents.length} طالب</span>
                    <Button size="sm" variant="outline">تصدير</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {["الطالب", "الصف", "المحافظة", "الكورسات", "الدرجة", "الحالة"].map(h => (
                          <th key={h} className="text-right text-xs font-bold text-slate-500 pb-3 px-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={s.full_name} size="sm" />
                              <div>
                                <p className="text-sm font-bold text-slate-900">{s.full_name}</p>
                                <p className="text-xs text-slate-400 font-mono">{s.student_code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
  <span className="text-sm text-slate-600">
    {s.grade}
  </span>
</td>
                          <td className="py-3 px-3"><span className="text-sm text-slate-600">{s.governorate}</span></td>
                          <td className="py-3 px-3">
  <span className="text-sm font-bold text-slate-900">
    {
      studentCourses.filter(
        course => course.student_id === s.id
      ).length
    }
  </span>
</td>
                          <td className="py-3 px-3">
                            <span className={`text-sm font-black ${s.score >= 90 ? "text-emerald-600" : s.score >= 75 ? "text-blue-600" : "text-slate-600"}`}>
                              {s.score > 0 ? `${s.score}%` : "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
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
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Card>
                  <CardContent>
                    <h3 className="font-black text-slate-900 mb-5">أداء الكورسات</h3>
                    <div className="space-y-4">
                      {performanceData.map((data, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700">{data.course}</span>
                            <span className="text-sm font-black text-slate-900">{data.completion}%</span>
                          </div>
                          <ProgressBar value={data.completion} size="sm" />
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400">{data.students} طالب</span>
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs text-slate-400">{data.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <h3 className="font-black text-slate-900 mb-5">الإيرادات</h3>
                    <div className="space-y-4">
                      {performanceData.map((data, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{data.course}</span>
                          <span className="text-sm font-black text-emerald-600">{data.revenue.toLocaleString("ar-EG")} ج</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                        <span className="font-black text-slate-900">الإجمالي</span>
                        <span className="font-black text-xl text-emerald-600">
                          {performanceData.reduce((s, d) => s + d.revenue, 0).toLocaleString("ar-EG")} ج
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

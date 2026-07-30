import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
export function InstructorAnalytics() {
  const stats = [
    {
      title: "إجمالي الطلاب",
      value: "325",
      icon: <Users size={28} className="text-blue-600" />,
    },
    {
      title: "إجمالي الكورسات",
      value: "12",
      icon: <BookOpen size={28} className="text-emerald-600" />,
    },
    {
      title: "إجمالي الإيرادات",
      value: "45,000 ج",
      icon: <DollarSign size={28} className="text-orange-500" />,
    },
    {
      title: "متوسط النجاح",
      value: "87%",
      icon: <TrendingUp size={28} className="text-purple-600" />,
    },
  ];

  const topCourses = [
    {
      name: "الكيمياء العضوية",
      students: 120,
      completion: "92%",
    },
    {
      name: "الهيدروكربونات",
      students: 95,
      completion: "84%",
    },
    {
      name: "الأحماض والقواعد",
      students: 78,
      completion: "80%",
    },
  ];
const weeklyActivity = [
  { day: "السبت", views: 120 },
  { day: "الأحد", views: 180 },
  { day: "الإثنين", views: 250 },
  { day: "الثلاثاء", views: 220 },
  { day: "الأربعاء", views: 300 },
  { day: "الخميس", views: 270 },
  { day: "الجمعة", views: 350 },
];

const studentsPerCourse = [
  { name: "عضوية", students: 120 },
  { name: "هيدرو", students: 95 },
  { name: "أحماض", students: 78 },
];
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#1E244F] border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-black text-slate-900">
            التحليلات
          </h1>

          <p className="text-slate-500 text-sm">
            متابعة أداء الكورسات والطلاب
          </p>
        </div>

<div className="flex items-center justify-center h-[calc(100vh-110px)] px-6">

  <Card className="w-full max-w-3xl border border-[#E8D6FF] shadow-[0_20px_60px_rgba(179,72,254,.12)] rounded-3xl">
    <CardContent className="py-16 px-8 text-center">

      <div className="w-24 h-24 mx-auto rounded-3xl bg-[#F6EEFF] flex items-center justify-center shadow-md">
        <BarChart3
          size={46}
          className="text-[#B348FE]"
        />
      </div>

      <h2 className="mt-8 text-3xl font-black text-slate-900">
        قسم التحليلات قيد التطوير
      </h2>

      <p className="mt-5 text-slate-500 text-lg leading-9 max-w-xl mx-auto">
        نعمل حاليًا على تطوير لوحة تحليلات احترافية تمنحك رؤية كاملة حول
        أداء المنصة، وإحصائيات الطلاب، ونسب المشاهدة، والإيرادات،
        والتقارير التفصيلية في مكان واحد.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">

        <div className="px-5 py-3 rounded-2xl bg-[#F6EEFF] text-[#B348FE] font-bold">
          إحصائيات الطلاب
        </div>

        <div className="px-5 py-3 rounded-2xl bg-[#F6EEFF] text-[#B348FE] font-bold">
          أداء الكورسات
        </div>

        <div className="px-5 py-3 rounded-2xl bg-[#F6EEFF] text-[#B348FE] font-bold">
          الإيرادات
        </div>

        <div className="px-5 py-3 rounded-2xl bg-[#F6EEFF] text-[#B348FE] font-bold">
          تقارير متقدمة
        </div>

      </div>

      <div className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-[#B348FE] text-white px-6 py-3 font-bold shadow-[0_10px_35px_rgba(179,72,254,.35)]">
        🚀 قريبًا بإذن الله
      </div>

    </CardContent>
  </Card>

</div>
      </main>
    </div>
  );
}
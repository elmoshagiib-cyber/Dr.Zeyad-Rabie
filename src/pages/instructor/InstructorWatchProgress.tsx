import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import {
  UserCheck,
  UserX,
  CheckCircle,
  Users,
  Search,
  Phone,
  RefreshCw,
  Clock,
  Download,
  AlertTriangle,
  Copy,
  Check,
  ArrowUpDown,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { DashboardSidebar } from "../../components/layout/dashboard/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

interface ProgressRecord {
  enrollment_id: string;
  student_id: string;
  full_name: string;
  phone: string | null;
  course_id: string;
  course_title: string;
  enrolled_at: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  bypassed_count: number;
  last_watch_position: number | null;
  last_watched_at: string | null;
}

type TabType = "not_started" | "completed" | "partial" | "bypassed" | "stalled" | "all";
type SortType = "recent" | "lowest_completion" | "most_stalled";

interface CourseOption {
  id: string;
  title: string;
}

// ── دالة تنسيق التاريخ + الوقت بالعربي ──────────────────────
function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
  const timePart = d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} • ${timePart}`;
}

// ── حساب عدد أيام التعثر (بدون نشاط) ────────────────────────
function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function InstructorWatchProgress() {
  const [data, setData] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>("not_started");
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    loadCourses();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedCourse]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy, selectedCourse]);

  async function loadCourses() {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title");
    setCourses((coursesData as CourseOption[]) || []);
  }

  async function fetchData() {
    setLoading(true);
    setFetchError(null);
    try {
      let query = supabase.from("instructor_progress_view").select("*");

      if (selectedCourse !== "all") {
        query = query.eq("course_id", selectedCourse);
      }

      const { data: viewData, error } = await query.order("enrolled_at", {
        ascending: false,
      });

      if (error) throw error;
      setData(viewData || []);
    } catch (err: any) {
      console.error(err);
      setFetchError(err?.message || "حدث خطأ أثناء تحميل البيانات");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  function copyPhone(phone: string) {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  }

  // الإحصائيات
  const stats = useMemo(() => {
    const total = data.length;
    const notStarted = data.filter((r) => r.completion_percentage === 0).length;
    const partial = data.filter(
      (r) => r.completion_percentage > 0 && r.completion_percentage < 100
    ).length;
    const bypassed = data.filter((r) => r.bypassed_count > 0).length;
    const completed = data.filter((r) => r.completion_percentage === 100).length;
    const stalled = data.filter((r) => {
      const days = daysSince(r.last_watched_at);
      return r.completion_percentage < 100 && ((days === null && daysSince(r.enrolled_at)! >= 5) || (days !== null && days >= 5));
    }).length;

    const stalledDaysList = data
      .filter((r) => r.completion_percentage < 100)
      .map((r) => daysSince(r.last_watched_at) ?? daysSince(r.enrolled_at) ?? 0);
    const avgStalledDays = stalledDaysList.length
      ? Math.round(stalledDaysList.reduce((s, d) => s + d, 0) / stalledDaysList.length)
      : 0;

    return { total, notStarted, partial, bypassed, completed, stalled, avgStalledDays };
  }, [data]);

  const overallCompletionRate = useMemo(() => {
    if (data.length === 0) return 0;
    const avg =
      data.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) /
      data.length;
    return Math.round(avg);
  }, [data]);

  // هل الطالب متعثر؟ (نفس منطق صفحة تفاصيل الطالب)
  function isStalled(r: ProgressRecord): boolean {
    if (r.completion_percentage >= 100) return false;
    const daysSinceWatch = daysSince(r.last_watched_at);
    const daysSinceEnroll = daysSince(r.enrolled_at) ?? 0;
    return (daysSinceWatch === null && daysSinceEnroll >= 5) || (daysSinceWatch !== null && daysSinceWatch >= 5);
  }

  // الفلاتر (تاب + بحث)
  const filteredData = useMemo(() => {
    let result = data;

    if (activeTab !== "all") {
      result = result.filter((r) => {
        const pct = r.completion_percentage || 0;
        if (activeTab === "not_started") return pct === 0;
        if (activeTab === "partial") return pct > 0 && pct < 100;
        if (activeTab === "bypassed") return r.bypassed_count > 0;
        if (activeTab === "completed") return pct === 100;
        if (activeTab === "stalled") return isStalled(r);
        return true;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.phone?.includes(q) ||
          r.course_title?.toLowerCase().includes(q)
      );
    }

    // الترتيب
    result = [...result].sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime();
      }
      if (sortBy === "lowest_completion") {
        return (a.completion_percentage || 0) - (b.completion_percentage || 0);
      }
      if (sortBy === "most_stalled") {
        const da = daysSince(a.last_watched_at) ?? daysSince(a.enrolled_at) ?? 0;
        const db = daysSince(b.last_watched_at) ?? daysSince(b.enrolled_at) ?? 0;
        return db - da;
      }
      return 0;
    });

    return result;
  }, [data, searchQuery, activeTab, sortBy]);

  // الصفحات
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  function exportToCSV() {
    const headers = ["الاسم", "الهاتف", "الكورس", "نسبة الإنجاز", "الحالة", "تاريخ الاشتراك", "آخر دخول"];
    const rows = filteredData.map((r) => [
      r.full_name,
      r.phone || "",
      r.course_title,
      `${r.completion_percentage || 0}%`,
      r.bypassed_count > 0
        ? "متجاوز"
        : r.completion_percentage === 100
        ? "مكتمل"
        : r.completion_percentage > 0
        ? "جاري"
        : "لم يبدأ",
      formatDateTime(r.enrolled_at),
      formatDateTime(r.last_watched_at),
    ]);
    const csvContent =
      "\uFEFF" + [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `progress_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "not_started", label: "لم يفتحوا", count: stats.notStarted },
    { key: "completed", label: "اكتملت", count: stats.completed },
    { key: "partial", label: "مشاهدة جزئية", count: stats.partial },
    { key: "bypassed", label: "المتجاوزون", count: stats.bypassed },
    { key: "stalled", label: "متعثرون", count: stats.stalled },
    { key: "all", label: "السجل الكامل", count: stats.total },
  ];

  const statCards = [
    {
      label: "متجاوزون يدويًا",
      value: stats.bypassed,
      icon: UserCheck,
      color: "blue",
    },
    {
      label: "لم يفتحوا نهائيًا",
      value: stats.notStarted,
      icon: UserX,
      color: "red",
    },
    {
      label: "مشاهدة جزئية",
      value: stats.partial,
      icon: Clock,
      color: "orange",
    },
    {
      label: "متعثرون (+5 أيام)",
      value: stats.stalled,
      icon: AlertTriangle,
      color: "amber",
    },
    {
      label: "أكملوا المحاضرة",
      value: stats.completed,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "إجمالي المستهدفين",
      value: stats.total,
      icon: Users,
      color: "purple",
    },
  ];

const colorClasses: Record<
  string,
  { border: string; bg: string; text: string; gradient: string }
> = {
    blue: {
      border: "border-blue-200 dark:border-blue-900",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500/5 to-transparent",
    },
    red: {
      border: "border-red-200 dark:border-red-900",
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      gradient: "from-red-500/5 to-transparent",
    },
    orange: {
      border: "border-orange-200 dark:border-orange-900",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      gradient: "from-orange-500/5 to-transparent",
    },
    amber: {
      border: "border-amber-200 dark:border-amber-900",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      gradient: "from-amber-500/5 to-transparent",
    },
    green: {
      border: "border-green-200 dark:border-green-900",
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      gradient: "from-green-500/5 to-transparent",
    },
    purple: {
      border: "border-purple-200 dark:border-purple-900",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500/5 to-transparent",
    },
  };

  const circumference = 2 * Math.PI * 46;
  const dashOffset =
    circumference - (overallCompletionRate / 100) * circumference;

  return (
    <div
      className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#09090B] dark:via-[#111111] dark:to-[#09090B]"
      dir="rtl"
    >
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#0F172A] via-[#1E1B3A] to-[#2A1B4D] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mx-6 mt-6"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-[#B348FE]/10 blur-[100px]" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-[#B348FE]/10 blur-[100px]" />

          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
                <Users className="text-amber-400" size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">مركز متابعة تقدم الطلاب</h1>
                <p className="text-white/60 text-xs sm:text-sm mt-0.5">تحليل المشاهدة، متابعة الطلاب، وإدارة اجتياز المحاضرات بدقة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={filteredData.length === 0}
                className="rounded-xl font-bold flex bg-white/10 border-white/10 text-white hover:bg-white/20"
              >
                <Download size={16} className="sm:ml-1.5" />
                <span className="hidden sm:inline">تصدير Excel</span>
              </Button>
              <Button
                variant="outline"
                onClick={fetchData}
                className="rounded-xl font-bold flex bg-white/10 border-white/10 text-white hover:bg-white/20"
              >
                <RefreshCw size={16} className="sm:ml-1.5" />
                <span className="hidden sm:inline">تحديث البيانات</span>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">

          {/* الكروت الإحصائية */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((stat, i) => {
              const c = colorClasses[stat.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card
                    className={`relative overflow-hidden bg-white dark:bg-[#111111] border ${c.border} rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} pointer-events-none`} />
                    <CardContent className="p-4 relative z-10">
                      <div
                        className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}
                      >
                        <stat.icon className={`w-5 h-5 ${c.text}`} />
                      </div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* قسم اختيار الكورس + نسبة الإنجاز */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-5 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* الدائرة */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-100 dark:text-[#2A2A2A]"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="none"
                        stroke="#B348FE"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{ transition: "stroke-dashoffset 0.6s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-gray-900 dark:text-white">
                        {overallCompletionRate}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                      إجمالي نجاح الدفعة
                    </p>
                    {stats.avgStalledDays > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        متوسط التعثر: {stats.avgStalledDays} يوم
                      </p>
                    )}
                  </div>
                </div>

                {/* اختيار الكورس + الترتيب */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                      الكورس:
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
                    >
                      <option value="all">-- كل الكورسات --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <ArrowUpDown size={13} />
                      ترتيب حسب:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortType)}
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
                    >
                      <option value="recent">الأحدث اشتراكًا</option>
                      <option value="lowest_completion">الأقل إنجازًا</option>
                      <option value="most_stalled">الأكثر تعثرًا (أيام بلا نشاط)</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* التابات */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200 dark:border-[#2A2A2A]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#B348FE] text-[#B348FE]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* بحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو رقم الهاتف أو اسم الكورس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-[#2A2A2A] rounded-xl bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
            />
          </div>

          {/* الجدول */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                    جاري التحميل...
                  </p>
                </div>
              ) : fetchError ? (
                <div className="py-16 text-center">
                  <p className="text-red-600 dark:text-red-400 font-bold mb-3">{fetchError}</p>
                  <Button onClick={fetchData} className="bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl font-bold">
                    إعادة المحاولة
                  </Button>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-gray-500 dark:text-gray-400 font-bold">
                    جميع الطلاب المتوقعين قاموا بفتح المحاضرة!
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-[#161616] sticky top-0 z-10">
                        <tr className="border-b border-gray-100 dark:border-[#2A2A2A]">
                          <th className="px-4 py-3 text-right font-bold text-gray-500 dark:text-gray-400">
                            بيانات الطالب
                          </th>
                          <th className="px-4 py-3 text-right font-bold text-gray-500 dark:text-gray-400">
                            الكورس
                          </th>
                          <th className="px-4 py-3 text-right font-bold text-gray-500 dark:text-gray-400">
                            تاريخ الاشتراك
                          </th>
                          <th className="px-4 py-3 text-right font-bold text-gray-500 dark:text-gray-400">
                            آخر دخول للمنصة
                          </th>
                          <th className="px-4 py-3 text-right font-bold text-gray-500 dark:text-gray-400">
                            نسبة الإنجاز
                          </th>
                          <th className="px-4 py-3 text-right font-bold text-gray-500 dark:text-gray-400">
                            الحالة
                          </th>
                          <th className="px-4 py-3 text-right font-bold text-gray-500 dark:text-gray-400">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                        {paginatedData.map((row, idx) => {
                          const pct = row.completion_percentage || 0;
                          const stalled = isStalled(row);
                          const daysInactive = daysSince(row.last_watched_at) ?? daysSince(row.enrolled_at);
                          let statusColor = "bg-gray-100 text-gray-700";
                          let statusLabel = "جديد";

                          if (pct === 100) {
                            statusColor =
                              "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                            statusLabel = "مكتمل";
                          } else if (row.bypassed_count > 0) {
                            statusColor =
                              "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
                            statusLabel = "متجاوز";
                          } else if (stalled) {
                            statusColor =
                              "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
                            statusLabel = "متعثر";
                          } else if (pct > 0) {
                            statusColor =
                              "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
                            statusLabel = "جاري";
                          } else {
                            statusColor =
                              "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
                            statusLabel = "لم يبدأ";
                          }

                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors ${
                                stalled ? "bg-amber-50/40 dark:bg-amber-950/10" : ""
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-[#B348FE]/10 text-[#B348FE] flex items-center justify-center font-black text-sm flex-shrink-0">
                                    {row.full_name?.trim()?.charAt(0) || "؟"}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                      {row.full_name}
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">
                                        {row.phone || "—"}
                                      </p>
                                      {row.phone && (
                                        <button
                                          onClick={() => copyPhone(row.phone!)}
                                          className="text-gray-300 hover:text-[#B348FE] transition-colors"
                                        >
                                          {copiedPhone === row.phone ? (
                                            <Check size={11} className="text-emerald-500" />
                                          ) : (
                                            <Copy size={11} />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                {row.course_title || "—"}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                                {formatDateTime(row.enrolled_at)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs">
                                <span className={stalled ? "text-amber-600 dark:text-amber-400 font-bold" : "text-gray-600 dark:text-gray-400"}>
                                  {formatDateTime(row.last_watched_at)}
                                </span>
                                {stalled && daysInactive !== null && (
                                  <p className="text-[10px] text-amber-500 dark:text-amber-500 font-bold mt-0.5">
                                    منذ {daysInactive} يوم
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2 min-w-[90px]">
                                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        pct === 100 ? "bg-emerald-500" : stalled ? "bg-amber-500" : "bg-[#B348FE]"
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-black text-gray-700 dark:text-gray-300 w-9 text-left">
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}
                                >
                                  {stalled && <AlertTriangle size={11} />}
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  {row.phone && (
                                    <a
                                      href={`https://wa.me/${row.phone.replace(
                                        /^0/,
                                        "20"
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                                    >
                                      <FaWhatsapp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </a>
                                  )}
                                  {row.phone && (
                                     <a
                                      href={`tel:${row.phone}`}
                                      className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                    >
                                      <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                      <span className="text-xs font-bold text-[#B348FE]">
                        {(currentPage - 1) * rowsPerPage + 1} -{" "}
                        {Math.min(currentPage * rowsPerPage, filteredData.length)} من {filteredData.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                        >
                          ‹
                        </button>
                        <span className="w-8 h-8 rounded-lg bg-[#B348FE] text-white flex items-center justify-center text-xs font-black">
                          {currentPage}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
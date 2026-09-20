import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import {
  CheckCircle,
  Users,
  Search,
  Phone,
  RefreshCw,
  Download,
  AlertTriangle,
  Copy,
  Check,
  ArrowUpDown,
  TrendingUp,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
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

type TabType = "not_started" | "completed" | "partial" | "bypassed" | "stalled" | "near_completion" | "all";
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

function isNearCompletion(r: ProgressRecord): boolean {
  const pct = r.completion_percentage || 0;
  return pct >= 70 && pct < 100;
}

// هل الطالب متعثر؟ (5 أيام أو أكتر بدون مشاهدة ولسه ما خلصش)
function isStalled(r: ProgressRecord): boolean {
  if ((r.completion_percentage || 0) >= 100) return false;
  const days = daysSince(r.last_watched_at) ?? daysSince(r.enrolled_at) ?? 0;
  return days >= 5;
}

// حالة الطالب + لون البادج (مكان واحد بدل ما كانت متكررة في الجدول)
function getStatus(r: ProgressRecord) {
  const pct = r.completion_percentage || 0;
  if (pct === 100)
    return { label: "مكتمل", cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" };
  if (r.bypassed_count > 0)
    return { label: "متجاوز", cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" };
  if (isStalled(r))
    return { label: "متعثر", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" };
  if (pct > 0)
    return { label: "جاري", cls: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" };
  return { label: "لم يبدأ", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function relativeDays(dateStr: string | null): string {
  const d = daysSince(dateStr);
  if (d === null) return "لم يشاهد بعد";
  if (d <= 0) return "اليوم";
  if (d === 1) return "أمس";
  return `منذ ${d} يوم`;
}

// رابط واتساب برسالة جاهزة حسب حالة الطالب
function buildWhatsAppLink(r: ProgressRecord): string {
  const status = getStatus(r).label;
  const pct = r.completion_percentage || 0;
  const name = r.full_name?.trim().split(" ")[0] || "";
  const course = r.course_title || "الكورس";

  const messages: Record<string, string> = {
    "لم يبدأ": `أهلاً ${name} 👋 لاحظت إنك اشتركت في "${course}" ولسه ما بدأتش المشاهدة. لو واجهتك أي مشكلة أنا معاك، وابدأ من أول فيديو 🌟`,
    "متعثر": `أهلاً ${name} 👋 بقالك فترة ما دخلتش على "${course}". كمّل معانا عشان الدروس ما تتراكمش عليك 💪`,
    "جاري": `أهلاً ${name} 👋 ماشي كويس في "${course}" وتقدمك وصل ${pct}%. كمّل لحد ما تخلص 🔥`,
    "مكتمل": `مبروك يا ${name} 🎉 خلصت "${course}" بنجاح!`,
  };

  const phone = (r.phone || "").replace(/\D/g, "").replace(/^0/, "20");
  const text = messages[status] ?? messages["جاري"];
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function InstructorWatchProgress() {
  const [data, setData] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    loadCourses();
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
    const stalled = data.filter(isStalled).length;

    const stalledDaysList = data
      .filter((r) => r.completion_percentage < 100)
      .map((r) => daysSince(r.last_watched_at) ?? daysSince(r.enrolled_at) ?? 0);
    const avgStalledDays = stalledDaysList.length
      ? Math.round(stalledDaysList.reduce((s, d) => s + d, 0) / stalledDaysList.length)
      : 0;

    const nearCompletion = data.filter((r) => isNearCompletion(r)).length;

    return { total, notStarted, partial, bypassed, completed, stalled, avgStalledDays, nearCompletion };
  }, [data]);

  const overallCompletionRate = useMemo(() => {
    if (data.length === 0) return 0;
    const avg =
      data.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) /
      data.length;
    return Math.round(avg);
  }, [data]);

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
        if (activeTab === "near_completion") return isNearCompletion(r);
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
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

    const headers = [
      "الاسم",
      "الهاتف",
      "الكورس",
      "الدروس المكتملة",
      "إجمالي الدروس",
      "نسبة الإنجاز",
      "الحالة",
      "تاريخ الاشتراك",
      "آخر مشاهدة",
    ].map(esc);
    const rows = filteredData.map((r) =>
      [
        esc(r.full_name),
        r.phone ? `="${r.phone}"` : "", // عشان الإكسيل ما يشيلش الصفر
        esc(r.course_title || ""),
        r.completed_lessons || 0,
        r.total_lessons || 0,
        esc(`${r.completion_percentage || 0}%`),
        esc(getStatus(r).label),
        esc(formatDateTime(r.enrolled_at)),
        esc(formatDateTime(r.last_watched_at)),
      ].join(",")
    );
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `progress_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function copyAllPhones() {
    const phones = filteredData
      .map((r) => r.phone)
      .filter(Boolean)
      .join("\n");
    if (!phones) return;
    navigator.clipboard.writeText(phones);
    setCopiedPhone("all");
    setTimeout(() => setCopiedPhone(null), 2000);
  }
  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "not_started", label: "لم يفتحوا", count: stats.notStarted },
    { key: "completed", label: "اكتملت", count: stats.completed },
    { key: "near_completion", label: "قربوا الإكمال", count: stats.nearCompletion },
    { key: "partial", label: "مشاهدة جزئية", count: stats.partial },
    { key: "bypassed", label: "المتجاوزون", count: stats.bypassed },
    { key: "stalled", label: "متعثرون", count: stats.stalled },
    { key: "all", label: "السجل الكامل", count: stats.total },
  ];

  const completedPct = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const kpiCards = [
    {
      label: "إجمالي الطلاب",
      value: stats.total,
      sub: selectedCourse === "all" ? "في كل الكورسات" : "في الكورس المختار",
      icon: Users,
      color: "purple",
      tab: "all" as TabType,
    },
    {
      label: "متوسط الإنجاز",
      value: `${overallCompletionRate}%`,
      sub: `${stats.nearCompletion} طالب قربوا يخلصوا`,
      icon: TrendingUp,
      color: "teal",
      tab: "near_completion" as TabType,
    },
    {
      label: "أكملوا الكورس",
      value: stats.completed,
      sub: `${completedPct}% من الطلاب`,
      icon: CheckCircle,
      color: "green",
      tab: "completed" as TabType,
    },
    {
      label: "متعثرون",
      value: stats.stalled,
      sub: stats.avgStalledDays > 0 ? `متوسط ${stats.avgStalledDays} يوم بدون مشاهدة` : "الكل ماشي كويس",
      icon: AlertTriangle,
      color: "amber",
      tab: "stalled" as TabType,
    },
  ];

  const emptyMessages: Record<TabType, string> = {
    not_started: "🎉 كل الطلاب فتحوا الكورس وبدأوا المشاهدة",
    completed: "لسه محدش أكمل الكورس",
    near_completion: "مفيش طلاب قربوا يخلصوا حاليًا",
    partial: "مفيش طلاب في مرحلة المشاهدة الجزئية",
    bypassed: "مفيش طلاب متجاوزين",
    stalled: "🎉 مفيش طلاب متعثرين، الكل ماشي كويس",
    all: "مفيش طلاب مشتركين لسه",
  };

const colorClasses: Record<
  string,
  { border: string; bg: string; text: string; gradient: string }
> = {
    teal: {
      border: "border-teal-200 dark:border-teal-900",
      bg: "bg-teal-50 dark:bg-teal-900/20",
      text: "text-teal-600 dark:text-teal-400",
      gradient: "from-teal-500/5 to-transparent",
    },
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
      border: "border-blue-200 dark:border-blue-900",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-[#155DFC] dark:text-blue-400",
      gradient: "from-blue-500/5 to-transparent",
    },
  };


  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#1547D6] to-[#3183FF] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mb-6"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/10 blur-[100px]" />

          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
                <Users className="text-amber-400" size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">مركز متابعة تقدم الطلاب</h1>
                <p className="text-white/70 text-xs sm:text-sm mt-0.5">تابع تقدم طلابك، واعرف مين متعثر وتواصل معاه بضغطة واحدة</p>
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
                <RefreshCw size={16} className={`sm:ml-1.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">تحديث البيانات</span>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6 max-w-7xl mx-auto">

          {/* الكروت الإحصائية (بتشتغل كفلتر برضو) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {kpiCards.map((card, i) => {
              const c = colorClasses[card.color];
              const active = activeTab === card.tab;
              return (
                <motion.button
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => setActiveTab(card.tab)}
                  className={`relative overflow-hidden text-right rounded-2xl border bg-white dark:bg-[#111111] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow ${c.border} ${
                    active ? "ring-2 ring-[#155DFC]/30" : ""
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} pointer-events-none`} />
                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {card.label}
                      </p>
                      <p className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                        {card.value}
                      </p>
                    </div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                      <card.icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                  </div>
                  <p className="relative z-10 mt-3 text-[11px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 truncate">
                    {card.sub}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* قسم اختيار الكورس + نسبة الإنجاز */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-5 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                {/* اختيار الكورس + الترتيب */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                      الكورس:
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
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
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
                    >
                      <option value="recent">الأحدث اشتراكًا</option>
                      <option value="lowest_completion">الأقل إنجازًا</option>
                      <option value="most_stalled">الأكثر تعثرًا (أيام بلا نشاط)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                      بحث:
                    </label>
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="الاسم أو رقم الهاتف أو الكورس..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pr-10 pl-9 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
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
                    ? "border-[#155DFC] text-[#155DFC]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* الجدول */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-[#155DFC] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                    جاري التحميل...
                  </p>
                </div>
              ) : fetchError ? (
                <div className="py-16 text-center">
                  <p className="text-red-600 dark:text-red-400 font-bold mb-3">{fetchError}</p>
                  <Button onClick={fetchData} className="bg-[#155DFC] hover:bg-[#1547D6] text-white rounded-xl font-bold">
                    إعادة المحاولة
                  </Button>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="py-16 text-center px-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                    {searchQuery ? (
                      <Search className="w-7 h-7 text-gray-400" />
                    ) : (
                      <Users className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-bold">
                    {searchQuery
                      ? `مفيش نتايج للبحث عن "${searchQuery}"`
                      : emptyMessages[activeTab]}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-sm font-bold text-[#155DFC] hover:underline"
                    >
                      مسح البحث
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {tabs.find((t) => t.key === activeTab)?.label}
                      <span className="text-gray-400 font-medium"> • {filteredData.length} طالب</span>
                    </p>
                    <button
                      onClick={copyAllPhones}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#155DFC] hover:bg-[#155DFC]/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copiedPhone === "all" ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copiedPhone === "all" ? "تم النسخ" : "نسخ كل الأرقام"}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-[#161616]">
                        <tr className="border-b border-gray-100 dark:border-[#2A2A2A]">
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الطالب</th>
                          {selectedCourse === "all" && (
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكورس</th>
                          )}
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الاشتراك</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">آخر مشاهدة</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التقدم</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">تواصل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                        {paginatedData.map((row) => {
                          const pct = row.completion_percentage || 0;
                          const stalled = isStalled(row);
                          const status = getStatus(row);

                          return (
                            <tr
                              key={`${row.student_id}-${row.course_id}`}
                              className={`hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors ${
                                stalled ? "bg-amber-50/40 dark:bg-amber-950/10" : ""
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#155DFC]/10 dark:bg-[#155DFC]/20 text-[#155DFC] dark:text-blue-400 flex items-center justify-center font-black text-sm flex-shrink-0">
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
                                          className="text-gray-300 hover:text-[#155DFC] transition-colors"
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
                              {selectedCourse === "all" && (
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs font-bold max-w-[180px] truncate">
                                  {row.course_title || "—"}
                                </td>
                              )}
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                                {formatDate(row.enrolled_at)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p
                                  className={`text-xs font-bold ${
                                    stalled
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {relativeDays(row.last_watched_at)}
                                </p>
                                {row.last_watched_at && (
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                    {formatDateTime(row.last_watched_at)}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="min-w-[140px]">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                      {row.completed_lessons || 0} / {row.total_lessons || 0} درس
                                    </span>
                                    <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                                      {pct}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        pct === 100 ? "bg-emerald-500" : stalled ? "bg-amber-500" : "bg-[#155DFC]"
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${status.cls}`}
                                >
                                  {stalled && <AlertTriangle size={11} />}
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  {row.phone && (
                                    <a
                                      href={buildWhatsAppLink(row)}
                                      title="رسالة واتساب جاهزة"
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
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
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
                        <span className="px-3 h-8 rounded-lg bg-[#155DFC] text-white flex items-center justify-center text-xs font-black">
                          {currentPage} / {totalPages}
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
    </DashboardLayout>
  );
}
import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { Trophy, Search } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { LeaderboardCard } from "../../components/leaderboard/LeaderboardCard";

const GRADE_TABS = [
  { key: "all", label: "الكل" },
  { key: "الصف الثالث الثانوي", label: "الثالث الثانوي" },
  { key: "الصف الثاني الثانوي", label: "الثاني الثانوي" },
  { key: "الصف الأول الثانوي", label: "الأول الثانوي" },
];

const BADGE_TABS = [
  { key: "all", label: "الكل" },
  { key: "diamond", label: "ماسي" },
  { key: "gold", label: "ذهبي" },
  { key: "silver", label: "فضي" },
];

export function InstructorLeaderboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("leaderboard_view").select("*");
    if (!error) setEntries(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (gradeFilter !== "all" && e.grade !== gradeFilter) return false;
      if (badgeFilter !== "all" && e.badge !== badgeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = e.full_name?.toLowerCase().includes(q);
        const matchSchool = e.school_name?.toLowerCase().includes(q);
        const matchPhone = e.phone?.includes(q);
        if (!matchName && !matchSchool && !matchPhone) return false;
      }
      return true;
    });
  }, [entries, gradeFilter, badgeFilter, search]);

  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div dir="rtl" className="min-h-screen bg-white dark:bg-[#09090B]">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#1547D6] to-[#3183FF] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mx-4 sm:mx-6 mt-4 sm:mt-6"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-[100px] pointer-events-none" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="text-amber-400" size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black truncate">أبطال المنصة</h1>
              </div>
            </div>

            {!loading && (
              <span className="text-sm font-bold bg-white/10 border border-white/10 rounded-full px-4 py-1.5">
                {filtered.length} طالب
              </span>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white dark:bg-[#151515] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-[#262626] shadow-sm p-4 sm:p-5 mb-8 flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 order-3 lg:order-1">
              {BADGE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setBadgeFilter(tab.key)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                    badgeFilter === tab.key
                      ? "bg-[#1547D6] text-white"
                      : "bg-gray-100 dark:bg-[#1c1c1c] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#252525]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 order-2">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو رقم الهاتف أو المدرسة..."
                className="w-full rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0b0b0b] text-slate-700 dark:text-gray-200 placeholder-gray-400 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-[#1547D6] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto order-1 lg:order-3">
              {GRADE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setGradeFilter(tab.key)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                    gradeFilter === tab.key
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : "bg-gray-100 dark:bg-[#1c1c1c] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#252525]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid / Empty / Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-[#1547D6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 sm:py-28">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 sm:mb-5">
                <Trophy className="text-[#1547D6]" size={32} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-800 dark:text-white">
                مفيش نتائج مطابقة للفلتر ده
              </h2>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-10">
              {filtered.map((student, index) => (
                <motion.div
                  key={`${student.student_id}-${student.badge}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
                >
                  <LeaderboardCard student={student} showPhone />
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
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

export function LeaderboardFullPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState("الصف الثالث الثانوي");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
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
    <div className="min-h-screen bg-white dark:bg-[#09090B]" dir="rtl">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-full bg-[#5800a9] hover:bg-[#4a0089] dark:bg-[#b600d7] dark:hover:bg-[#9a00b5] text-white font-bold text-sm sm:text-base px-5 py-2.5 shadow-lg transition-all duration-300 mb-8"
        >
          <span>العودة</span>
          <ChevronRight size={18} />
        </button>

        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#5800a9] dark:text-white">
            لوحة الشرف
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            أوائل طلابنا المتفوقون — {gradeFilter === "all" ? "كل الصفوف" : gradeFilter}
          </p>
        </div>

        <div className="bg-white dark:bg-[#151515] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-[#262626] shadow-sm p-4 sm:p-5 mb-8 sm:mb-10 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2 order-3 lg:order-1">
            {BADGE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setBadgeFilter(tab.key)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  badgeFilter === tab.key
                    ? "bg-[#5800a9] dark:bg-[#b600d7] text-white"
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
              className="w-full rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0b0b0b] text-slate-700 dark:text-gray-200 placeholder-gray-400 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-[#5800a9] dark:focus:border-[#b600d7] transition-colors"
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

        {!loading && (
          <p className="text-sm font-bold text-slate-700 dark:text-gray-300 mb-5 sm:mb-6">
            {filtered.length} نتيجة {gradeFilter !== "all" && `في ${gradeFilter}`}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#5800a9] dark:border-[#b600d7] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
            {filtered.map((student, index) => (
              <motion.div
                key={`${student.student_id}-${student.badge}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
              >
                <LeaderboardCard student={student} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[24px] sm:rounded-[30px] bg-[#5800a9] dark:bg-[#b600d7] p-6 sm:p-10 text-center">
      <div className="flex justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
        <img src="/images/frames/silver-frame.png" alt="" className="w-16 sm:w-20 h-auto object-contain opacity-90" />
        <img src="/images/frames/gold-frame.png" alt="" className="w-20 sm:w-24 h-auto object-contain" />
        <img src="/images/frames/silver-frame.png" alt="" className="w-16 sm:w-20 h-auto object-contain opacity-90" />
      </div>

      <span className="inline-block mb-3 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black bg-white/15 text-white border border-white/20">
        لوحة الشرف لسه فاضية
      </span>

      <h2 className="text-xl sm:text-2xl font-black text-white mb-3">
        تخيّل صورتك أول صورة على اللوحة
      </h2>

      <p className="text-white/90 text-sm sm:text-base leading-7 max-w-xl mx-auto mb-5 sm:mb-6">
        مفيش حد اتكرم لحد الآن — يعني الأماكن الماسية والذهبية والفضية كلها لسه مفتوحة. ابدأ
        مذاكرة من النهاردة، حل امتحاناتك بجدية، وخلّي أول اسم يظهر هنا اسمك.
      </p>
    </div>
  );
}
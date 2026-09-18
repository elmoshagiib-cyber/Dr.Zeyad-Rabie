import { useState, useEffect, useMemo, useRef } from "react";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import {
  Trophy,
  Search,
  X,
  Loader2,
  Upload,
  Gem,
  Medal,
  Award,
  Users,
  CheckCircle2,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import { LeaderboardCard } from "../../components/leaderboard/LeaderboardCard";

// ثانوي بس، مفيش إعدادي هنا
const GRADE_TABS = [
  { key: "all", label: "الكل" },
  { key: "الصف الثالث الثانوي", label: "الثالث الثانوي" },
  { key: "الصف الثاني الثانوي", label: "الثاني الثانوي" },
  { key: "الصف الأول الثانوي", label: "الأول الثانوي" },
];

const SECONDARY_GRADES = [
  "الصف الثالث الثانوي",
  "الصف الثاني الثانوي",
  "الصف الأول الثانوي",
];

const BADGE_TABS = [
  { key: "all", label: "الكل" },
  { key: "diamond", label: "ماسي" },
  { key: "gold", label: "ذهبي" },
  { key: "silver", label: "فضي" },
  { key: "none", label: "لسه مأهلش" },
];

const SORT_OPTIONS: { key: "rank" | "points" | "name"; label: string }[] = [
  { key: "rank", label: "الترتيب" },
  { key: "points", label: "النقاط" },
  { key: "name", label: "الاسم" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3">
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}1A` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold truncate">{label}</p>
        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export function InstructorLeaderboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "points" | "name">("rank");

  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editNote, setEditNote] = useState("");
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_leaderboard_admin");    // فلترة إضافية للتأكيد إننا ثانوي بس، حتى لو الـ view مبنية صح من الأساس
    const secondaryOnly = (data || []).filter((e) => SECONDARY_GRADES.includes(e.grade));
    if (!error) setEntries(secondaryOnly);
    setLoading(false);
  };

  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: entries.length };
    SECONDARY_GRADES.forEach((g) => {
      counts[g] = entries.filter((e) => e.grade === g).length;
    });
    return counts;
  }, [entries]);

  const gradeFilteredEntries = useMemo(() => {
    return gradeFilter === "all" ? entries : entries.filter((e) => e.grade === gradeFilter);
  }, [entries, gradeFilter]);

  const badgeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: gradeFilteredEntries.length };
    ["diamond", "gold", "silver", "none"].forEach((b) => {
      counts[b] = gradeFilteredEntries.filter((e) => e.badge === b).length;
    });
    return counts;
  }, [gradeFilteredEntries]);

  const stats = useMemo(() => {
    return {
      total: gradeFilteredEntries.length,
      diamond: gradeFilteredEntries.filter((e) => e.badge === "diamond").length,
      gold: gradeFilteredEntries.filter((e) => e.badge === "gold").length,
      silver: gradeFilteredEntries.filter((e) => e.badge === "silver").length,
      published: gradeFilteredEntries.filter((e) => e.leaderboard_published).length,
    };
  }, [gradeFilteredEntries]);

  const filtered = useMemo(() => {
    let list = gradeFilteredEntries.filter((e) => {
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

    list = [...list].sort((a, b) => {
      if (sortBy === "points") return (b.points || 0) - (a.points || 0);
      if (sortBy === "name") return (a.full_name || "").localeCompare(b.full_name || "", "ar");
      const ra = a.rank_in_grade ?? Infinity;
      const rb = b.rank_in_grade ?? Infinity;
      return ra - rb;
    });

    return list;
  }, [gradeFilteredEntries, badgeFilter, search, sortBy]);

  const hasActiveFilters =
    gradeFilter !== "all" || badgeFilter !== "all" || search.trim() !== "" || sortBy !== "rank";

  const clearFilters = () => {
    setGradeFilter("all");
    setBadgeFilter("all");
    setSearch("");
    setSortBy("rank");
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setEditNote(student.leaderboard_note || "");
    setEditAvatarPreview(student.avatar_url || null);
    setEditAvatarFile(null);
  };

  const closeEditModal = () => {
    setEditingStudent(null);
    setEditNote("");
    setEditAvatarPreview(null);
    setEditAvatarFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAvatarFile(file);
    setEditAvatarPreview(URL.createObjectURL(file));
  };

  const saveEdit = async () => {
    if (!editingStudent) return;
    setSaving(true);

    try {
      let avatarUrl = editingStudent.avatar_url;

      if (editAvatarFile) {
        const ext = editAvatarFile.name.split(".").pop();
        const path = `student-${editingStudent.student_id}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("student-avatars")
          .upload(path, editAvatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("student-avatars")
          .getPublicUrl(path);

        avatarUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("students")
        .update({
          avatar_url: avatarUrl,
          leaderboard_note: editNote.trim() || null,
        })
        .eq("id", editingStudent.student_id);

      if (updateError) throw updateError;

      setEntries((prev) =>
        prev.map((e) =>
          e.student_id === editingStudent.student_id
            ? { ...e, avatar_url: avatarUrl, leaderboard_note: editNote.trim() || null }
            : e
        )
      );

      toast.success("تم حفظ التعديلات بنجاح");
      closeEditModal();
    } catch (err) {
      console.error(err);
      toast.error("حصل خطأ أثناء الحفظ، حاول تاني");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (student: any) => {
    const newValue = !student.leaderboard_published;

    // تحديث فوري في الواجهة (optimistic update)
    setEntries((prev) =>
      prev.map((e) =>
        e.student_id === student.student_id ? { ...e, leaderboard_published: newValue } : e
      )
    );

    const { error } = await supabase
      .from("students")
      .update({ leaderboard_published: newValue })
      .eq("id", student.student_id);

    if (error) {
      // رجّع الحالة القديمة لو فشل
      setEntries((prev) =>
        prev.map((e) =>
          e.student_id === student.student_id ? { ...e, leaderboard_published: !newValue } : e
        )
      );
      toast.error("حصل خطأ أثناء تحديث حالة النشر");
      return;
    }

    toast.success(newValue ? "تم نشر الطالب في اللوحة العامة" : "تم إلغاء نشر الطالب");
  };

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
                <p className="text-white/70 text-xs sm:text-sm mt-0.5">
                  التصنيف بيتحسب أوتوماتيك — إنت بس ضيف صورة ووصف واضغط نشر عشان تظهر للطلاب
                </p>
              </div>
            </div>

            {!loading && (
              <span className="text-sm font-bold bg-white/10 border border-white/10 rounded-full px-4 py-1.5">
                {filtered.length} طالب
              </span>
            )}
          </div>
        </motion.div>

        {/* Stats Overview */}
        {!loading && entries.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 mt-5 sm:mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <StatCard icon={Users} label="إجمالي الطلاب" value={stats.total} color="#1547D6" />
              <StatCard icon={Gem} label="الشارة الماسية" value={stats.diamond} color="#22d3ee" />
              <StatCard icon={Medal} label="الشارة الذهبية" value={stats.gold} color="#f59e0b" />
              <StatCard icon={Award} label="الشارة الفضية" value={stats.silver} color="#64748b" />
              <StatCard icon={CheckCircle2} label="منشورين حالياً" value={stats.published} color="#10b981" />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-4 sm:px-6 lg:px-8 mt-5 sm:mt-6">
          <div className="bg-white dark:bg-[#151515] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-[#262626] shadow-sm p-4 sm:p-5 mb-5 flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 order-3 lg:order-1 flex-wrap">
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
                  <span className={`mr-1.5 ${badgeFilter === tab.key ? "text-white/70" : "text-gray-400"}`}>
                    ({badgeCounts[tab.key] ?? 0})
                  </span>
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
                  <span className={`mr-1.5 ${gradeFilter === tab.key ? "opacity-70" : "text-gray-400"}`}>
                    ({gradeCounts[tab.key] ?? 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort + Clear filters */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={15} className="text-gray-400" />
              <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">ترتيب حسب:</span>
              <div className="flex items-center gap-1.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                      sortBy === opt.key
                        ? "bg-[#1547D6]/10 text-[#1547D6] dark:bg-[#1547D6]/20"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
              >
                <RotateCcw size={14} />
                مسح الفلاتر
              </button>
            )}
          </div>

          {/* Grid / Empty / Loading */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                  <div className="w-full max-w-[200px] aspect-[3/3.6] rounded-2xl bg-gray-100 dark:bg-[#1c1c1c]" />
                  <div className="h-3 w-24 rounded-full bg-gray-100 dark:bg-[#1c1c1c]" />
                  <div className="h-2.5 w-16 rounded-full bg-gray-100 dark:bg-[#1c1c1c]" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 sm:py-28">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 sm:mb-5">
                <Trophy className="text-[#1547D6]" size={32} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-gray-800 dark:text-white mb-2">
                مفيش نتائج مطابقة للفلتر ده
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 flex items-center gap-1.5 text-sm font-bold text-[#1547D6] hover:underline"
                >
                  <RotateCcw size={14} />
                  مسح كل الفلاتر
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 pb-10">
              {filtered.map((student, index) => (
                <motion.div
                  key={student.student_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
                >
                  <LeaderboardCard
                    student={student}
                    showPhone
                    onEdit={() => openEditModal(student)}
                    onTogglePublish={() => togglePublish(student)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeEditModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
              className="w-full max-w-md rounded-[24px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#262626] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  تعديل بيانات الطالب
                </h3>
                <button
                  onClick={closeEditModal}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[#232323] hover:text-red-500 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center mb-5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group border-2 border-dashed border-gray-300 dark:border-gray-700"
                >
                  <img
                    src={editAvatarPreview || "/images/default-avatar.png"}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="text-white" size={20} />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs font-bold text-[#1547D6] hover:underline"
                >
                  تغيير الصورة
                </button>
              </div>

              <div className="rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] px-4 py-3 mb-4 text-center">
                <p className="font-black text-slate-900 dark:text-white">{editingStudent.full_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{editingStudent.grade}</p>
                {typeof editingStudent.points === "number" && (
                  <p className="text-xs text-gray-400 mt-1">
                    {editingStudent.points} نقطة
                    {editingStudent.rank_in_grade ? ` — الترتيب #${editingStudent.rank_in_grade}` : ""}
                  </p>
                )}
              </div>

              <label className="block text-sm font-bold text-slate-700 dark:text-gray-200 mb-2">
                وصف / ملاحظة عن الطالب
              </label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="مثال: متفوق في الكيمياء العضوية ومتزم في الحضور"
                className="w-full min-h-[90px] resize-none rounded-2xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0b0b0b] text-slate-800 dark:text-white placeholder-gray-400 p-3.5 text-sm outline-none focus:border-[#1547D6] transition-colors"
              />

              <button
                onClick={saveEdit}
                disabled={saving}
                className="w-full mt-5 py-3 rounded-xl bg-[#1547D6] hover:bg-[#0f38ad] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ التعديلات"
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
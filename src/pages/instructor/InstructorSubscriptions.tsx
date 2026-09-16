import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Receipt,
  Users,
  Ban,
  CheckCircle2,
  Layers,
  Search,
  RotateCcw,
  Eye,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { supabase } from "../../lib/supabase";

interface StudentLite {
  id: number;
  full_name: string;
  phone: string;
  grade: string;
  governorate: string | null;
  is_blocked: boolean;
  avatar_url: string | null;
}

interface CourseLite {
  id: string;
  title: string;
  grade: string;
}

interface SubscriptionRow {
  id: number;
  student_id: number;
  course_id: string;
  subscription_start_date: string;
  subscription_end_date: string;
  payment_status: "pending" | "verified" | "rejected" | "cancelled";
  subscription_code: string | null;
  created_at: string;
  student?: StudentLite;
  course?: CourseLite;
}

const gradeLabels: Record<string, string> = {
  prep_1: "الصف الأول الإعدادي",
  prep_2: "الصف الثاني الإعدادي",
  prep_3: "الصف الثالث الإعدادي",
  sec_1: "الصف الأول الثانوي",
  sec_2: "الصف الثاني الثانوي",
  sec_3: "الصف الثالث الثانوي",
};

type StatusFilter = "all" | "active" | "expired";

export function InstructorSubscriptions() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [governorates, setGovernorates] = useState<string[]>([]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [governorateFilter, setGovernorateFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 15;

  const loadData = async () => {
    setLoading(true);

    const { data: paymentsData, error } = await supabase
      .from("subscription_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !paymentsData) {
      setRows([]);
      setLoading(false);
      return;
    }

    const studentIds = [...new Set(paymentsData.map((p: any) => p.student_id))];
    const courseIds = [...new Set(paymentsData.map((p: any) => p.course_id))];

    const [{ data: studentsData }, { data: coursesData }] = await Promise.all([
      studentIds.length
        ? supabase
            .from("students")
            .select("id, full_name, phone, grade, governorate, is_blocked, avatar_url")
            .in("id", studentIds)
        : Promise.resolve({ data: [] as any[] }),
      courseIds.length
        ? supabase.from("courses").select("id, title, grade").in("id", courseIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const merged: SubscriptionRow[] = paymentsData.map((p: any) => ({
      ...p,
      student: studentsData?.find((s: any) => s.id === p.student_id),
      course: coursesData?.find((c: any) => c.id === p.course_id),
    }));

    setRows(merged);

    const govs = [
      ...new Set((studentsData || []).map((s: any) => s.governorate).filter(Boolean)),
    ] as string[];
    setGovernorates(govs);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const now = new Date();

  const isRowActive = (r: SubscriptionRow) =>
    r.payment_status === "verified" && new Date(r.subscription_end_date) > now;

  // ── الإحصائيات ────────────────────────────────────────
  const verifiedRows = rows.filter((r) => r.payment_status === "verified");
  const uniqueSubscribedStudents = new Set(verifiedRows.map((r) => r.student_id)).size;
  const blockedSubscriptionsCount = rows.filter((r) => r.student?.is_blocked).length;
  const activeSubscriptionsCount = rows.filter(isRowActive).length;
  const totalSubscriptionsCount = rows.length;
  const pendingSubscriptionsCount = rows.filter((r) => r.payment_status === "pending").length;

  // ── الفلاتر ──────────────────────────────────────────
  const filteredRows = rows.filter((r) => {
    if (statusFilter === "active" && !isRowActive(r)) return false;
    if (statusFilter === "expired" && (isRowActive(r) || r.payment_status !== "verified"))
      return false;

    if (governorateFilter !== "all" && r.student?.governorate !== governorateFilter) return false;
    if (gradeFilter !== "all" && r.student?.grade !== gradeFilter) return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchesName = r.student?.full_name?.toLowerCase().includes(q);
      const matchesPhone = r.student?.phone?.includes(q);
      const matchesCode = r.subscription_code?.toLowerCase().includes(q);
      if (!matchesName && !matchesPhone && !matchesCode) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setStatusFilter("all");
    setGovernorateFilter("all");
    setGradeFilter("all");
    setSearch("");
    setPage(1);
  };

  const statusBadge = (r: SubscriptionRow) => {
    if (r.payment_status !== "verified") {
      return (
        <span className="px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {r.payment_status === "pending"
            ? "قيد المراجعة"
            : r.payment_status === "rejected"
            ? "مرفوض"
            : "ملغي"}
        </span>
      );
    }
    return isRowActive(r) ? (
      <span className="px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
        نشط
      </span>
    ) : (
      <span className="px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        منتهي
      </span>
    );
  };

  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#1547D6] to-[#3183FF] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mb-6"
      >
        <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-[100px]" />
        <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/10 blur-[100px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
            <Receipt className="text-[#155DFC]" size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">إدارة الاشتراكات</h1>
            <p className="text-white/60 text-xs sm:text-sm mt-0.5">
              إدارة اشتراكات الطلاب ومتابعة الوصول للكورسات والشهور
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] border-t-4 border-t-[#155DFC] p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">الطلاب المشتركين</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                <Users className="text-[#155DFC]" size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-[#155DFC] mb-1">{uniqueSubscribedStudents}</div>
            <div className="text-xs text-gray-400 font-medium">طالب لديه اشتراك مؤكد</div>
          </div>

          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] border-t-4 border-t-emerald-500 p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">اشتراكات نشطة</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="text-emerald-600" size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600 mb-1">{activeSubscriptionsCount}</div>
            <div className="text-xs text-gray-400 font-medium">مؤكدة ولسه سارية</div>
          </div>

          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] border-t-4 border-t-amber-500 p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">قيد المراجعة</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                <Clock className="text-amber-600" size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 mb-1">{pendingSubscriptionsCount}</div>
            <div className="text-xs text-gray-400 font-medium">محتاجة تأكيد دفع</div>
          </div>

          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] border-t-4 border-t-red-500 p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">اشتراكات محظورة</span>
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                <Ban className="text-red-600" size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-red-600 mb-1">{blockedSubscriptionsCount}</div>
            <div className="text-xs text-gray-400 font-medium">لطلاب موقوفين حاليًا</div>
          </div>

          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] border-t-4 border-t-gray-300 dark:border-t-gray-600 p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">إجمالي الاشتراكات</span>
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Layers className="text-gray-500" size={16} />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{totalSubscriptionsCount}</div>
            <div className="text-xs text-gray-400 font-medium">كل العمليات المسجلة</div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  حالة الاشتراك
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(1);
                  }}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
                >
                  <option value="all">كل الطلاب</option>
                  <option value="active">نشط</option>
                  <option value="expired">منتهي</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  المحافظة
                </label>
                <select
                  value={governorateFilter}
                  onChange={(e) => {
                    setGovernorateFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
                >
                  <option value="all">كل المحافظات</option>
                  {governorates.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  الصف الدراسي
                </label>
                <select
                  value={gradeFilter}
                  onChange={(e) => {
                    setGradeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
                >
                  <option value="all">كل الصفوف</option>
                  {Object.entries(gradeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  بحث باسم الطالب / الهاتف / الكود
                </label>
                <div className="relative">
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="ابحث..."
                    className="w-full h-11 pr-9 pl-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
                  />
                </div>
              </div>

              <Button variant="outline" onClick={resetFilters} className="h-11 rounded-xl font-bold">
                <RotateCcw size={16} className="ml-1.5" />
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Receipt className="text-[#155DFC]" size={20} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white">قائمة الاشتراكات</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {filteredRows.length} من {rows.length}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-[#155DFC] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">جاري تحميل الاشتراكات...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-16 text-center">
                <Receipt className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400 font-bold">لا توجد اشتراكات مطابقة</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                        <th className="text-right font-bold px-4 py-3 whitespace-nowrap">#</th>
                        <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الطالب</th>
                        <th className="text-right font-bold px-4 py-3 whitespace-nowrap">رقم الهاتف</th>
                        <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الصف الدراسي</th>
                        <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الكورس / الشهر</th>
                        <th className="text-right font-bold px-4 py-3 whitespace-nowrap">تاريخ الاشتراك</th>
                        <th className="text-right font-bold px-4 py-3 whitespace-nowrap">تاريخ الانتهاء</th>
                        <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الحالة</th>
                        <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.slice((page - 1) * perPage, page * perPage).map((r, idx) => (
                        <tr
                          key={r.id}
                          className={`border-t border-gray-100 dark:border-[#2A2A2A] hover:bg-[#EFF6FF] dark:hover:bg-[#171717] transition-colors ${
                            idx % 2 === 1 ? "bg-gray-50/60 dark:bg-white/[0.02]" : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                            {(page - 1) * perPage + idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar
                                name={r.student?.full_name}
                                src={r.student?.avatar_url}
                                size="sm"
                                className="h-8 w-8 text-xs flex-shrink-0"
                              />
                              <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {r.student?.full_name || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap" dir="ltr">
                            {r.student?.phone || "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {gradeLabels[r.student?.grade || ""] || r.student?.grade || "-"}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {r.course?.title || "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {new Date(r.subscription_start_date).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {new Date(r.subscription_end_date).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="px-4 py-3">{statusBadge(r)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/instructor/students/${r.student_id}`)}
                              className="w-8 h-8 rounded-lg border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center transition-colors"
                              title="عرض الطالب"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                  <span className="text-xs font-bold text-[#155DFC]">
                    {(page - 1) * perPage + 1} -{" "}
                    {Math.min(page * perPage, filteredRows.length)} من {filteredRows.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                    >
                      ‹
                    </button>
                    <span className="w-8 h-8 rounded-lg bg-[#155DFC] text-white flex items-center justify-center text-xs font-black">
                      {page}
                    </span>
                    <button
                      onClick={() => setPage((p) => (p * perPage < filteredRows.length ? p + 1 : p))}
                      disabled={page * perPage >= filteredRows.length}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
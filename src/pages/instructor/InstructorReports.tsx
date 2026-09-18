import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  RotateCcw,
  ShoppingCart,
  Wallet,
  TrendingUp,
  ClipboardList,
  CreditCard,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { supabase } from "../../lib/supabase";

interface CourseOption {
  id: string;
  title: string;
}

interface PaymentRow {
  id: number;
  student_id: number;
  course_id: string;
  amount: number;
  payment_status: string;
  student_type: string;
  payment_method: string;
  created_at: string;
  courseTitle?: string;
}

interface CourseSalesRow {
  course_id: string;
  title: string;
  price: number;
  subscriptions: number;
}


export function InstructorReports() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseFilter, setCourseFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [bestSelling, setBestSelling] = useState<CourseSalesRow[]>([]);
  const [pendingPayments, setPendingPayments] = useState<{ count: number; total: number }>({
    count: 0,
    total: 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadCourses = async () => {
    const { data } = await supabase.from("courses").select("id, title");
    setCourses((data as CourseOption[]) || []);
  };

  const loadReportData = async () => {
    setLoading(true);

    let query = supabase
      .from("subscription_payments")
      .select("*")
      .eq("payment_status", "verified");

    if (courseFilter !== "all") query = query.eq("course_id", courseFilter);
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");

    const { data: paymentsData, error } = await query;

    if (error || !paymentsData) {
      setPayments([]);
      setBestSelling([]);
      setPendingPayments({ count: 0, total: 0 });
      setLoading(false);
      return;
    }

    const courseIds = [...new Set(paymentsData.map((p: any) => p.course_id))];
    const { data: coursesData } = courseIds.length
      ? await supabase.from("courses").select("id, title").in("id", courseIds)
      : { data: [] as any[] };

    const mergedPayments: PaymentRow[] = paymentsData.map((p: any) => ({
      ...p,
      courseTitle: coursesData?.find((c: any) => c.id === p.course_id)?.title || "-",
    }));
    setPayments(mergedPayments);

    // أكثر الكورسات مبيعاً
    const salesMap: Record<string, CourseSalesRow> = {};
    mergedPayments.forEach((p) => {
      if (!salesMap[p.course_id]) {
        salesMap[p.course_id] = {
          course_id: p.course_id,
          title: p.courseTitle || "-",
          price: p.amount,
          subscriptions: 0,
        };
      }
      salesMap[p.course_id].subscriptions += 1;
    });
    setBestSelling(Object.values(salesMap).sort((a, b) => b.subscriptions - a.subscriptions));

    // مدفوعات قيد المراجعة (نفس الفلاتر المطبقة، لكن حالتها pending)
    let pendingQuery = supabase
      .from("subscription_payments")
      .select("amount")
      .eq("payment_status", "pending");

    if (courseFilter !== "all") pendingQuery = pendingQuery.eq("course_id", courseFilter);
    if (dateFrom) pendingQuery = pendingQuery.gte("created_at", dateFrom);
    if (dateTo) pendingQuery = pendingQuery.lte("created_at", dateTo + "T23:59:59");

    const { data: pendingData } = await pendingQuery;

    setPendingPayments({
      count: pendingData?.length || 0,
      total: (pendingData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    });

    setLoading(false);
  };

  useEffect(() => {
    loadCourses();
    loadReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFilters = () => {
    setCourseFilter("all");
    setDateFrom("");
    setDateTo("");
    setTimeout(loadReportData, 0);
  };

  const paidSubscriptionsCount = payments.length;
  const totalSalesAndProfit = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const avgSubscriptionValue =
    paidSubscriptionsCount > 0 ? Math.round(totalSalesAndProfit / paidSubscriptionsCount) : 0;

  const paymentMethodBreakdown = payments.reduce((acc, p) => {
    const key = p.payment_method === "vodafone_cash" ? "Vodafone Cash" : "InstaPay";
    if (!acc[key]) acc[key] = { count: 0, total: 0 };
    acc[key].count += 1;
    acc[key].total += p.amount || 0;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const studentTypeBreakdown = payments.reduce((acc, p) => {
    const key = p.student_type === "online" ? "أونلاين" : "سنتر";
    if (!acc[key]) acc[key] = { count: 0, total: 0 };
    acc[key].count += 1;
    acc[key].total += p.amount || 0;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

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

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
              <ClipboardList className="text-[#155DFC]" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">التقارير والإحصائيات</h1>
              <p className="text-white/60 text-xs sm:text-sm mt-0.5">نظرة شاملة على أداء المنصة وتفاعل الطلاب</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6 max-w-7xl mx-auto">
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                    الكورس / الشهر:
                  </label>
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
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
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                    الفترة من:
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                    الفترة إلى:
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#155DFC]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={loadReportData}
                    disabled={loading || (Boolean(dateFrom) && Boolean(dateTo) && dateFrom > dateTo)}
                    className="flex-1 bg-[#155DFC] hover:bg-[#1547D6] text-white rounded-xl font-bold h-11 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1.5" />
                    ) : (
                      <Filter size={16} className="ml-1.5" />
                    )}
                    تطبيق الفلاتر
                  </Button>
                  <Button variant="outline" onClick={resetFilters} className="rounded-xl font-bold h-11 px-3">
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>
              {Boolean(dateFrom) && Boolean(dateTo) && dateFrom > dateTo && (
                <p className="text-xs font-bold text-red-500 mt-3">
                  تاريخ "من" لازم يكون قبل تاريخ "إلى"
                </p>
              )}
            </CardContent>
          </Card>

          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-[#155DFC] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">جاري تحميل التقرير...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "عدد الاشتراكات المدفوعة",
                    value: paidSubscriptionsCount.toLocaleString("ar-EG"),
                    icon: ShoppingCart,
                    accent: "#155DFC",
                    bg: "bg-blue-50 dark:bg-blue-950/30",
                  },
                  {
                    title: "إجمالي المبيعات والأرباح",
                    value: `${totalSalesAndProfit.toLocaleString("ar-EG")} ج.م`,
                    icon: Wallet,
                    accent: "#10B981",
                    bg: "bg-emerald-50 dark:bg-emerald-950/30",
                  },
                  {
                    title: "متوسط قيمة الاشتراك",
                    value: `${avgSubscriptionValue.toLocaleString("ar-EG")} ج.م`,
                    icon: TrendingUp,
                    accent: "#F59E0B",
                    bg: "bg-amber-50 dark:bg-amber-950/30",
                  },
                  {
                    title: "مدفوعات قيد المراجعة",
                    value: pendingPayments.count.toLocaleString("ar-EG"),
                    hint: pendingPayments.count > 0 ? `بقيمة ${pendingPayments.total.toLocaleString("ar-EG")} ج.م` : undefined,
                    icon: AlertCircle,
                    accent: "#EF4444",
                    bg: "bg-red-50 dark:bg-red-950/30",
                  },
                ].map((stat) => (
                  <Card
                    key={stat.title}
                    className="relative overflow-hidden bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm"
                  >
                    <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: stat.accent }} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-gray-600 dark:text-gray-300 text-xs font-bold">{stat.title}</p>
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                          <stat.icon size={18} style={{ color: stat.accent }} />
                        </div>
                      </div>
                      <h3 className="mt-3 text-3xl font-black" style={{ color: stat.accent }}>
                        {stat.value}
                      </h3>
                      {stat.hint && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-1">{stat.hint}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
                      <CreditCard className="text-[#155DFC]" size={20} />
                      <h3 className="font-black text-gray-900 dark:text-white">طرق الدفع</h3>
                    </div>
                    {Object.keys(paymentMethodBreakdown).length === 0 ? (
                      <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">
                        لا توجد مدفوعات في هذه الفترة
                      </div>
                    ) : (
                      <div className="p-5 space-y-4">
                        {Object.entries(paymentMethodBreakdown)
                          .sort((a, b) => b[1].count - a[1].count)
                          .map(([method, stats], index) => {
                          const percent = paidSubscriptionsCount > 0 ? Math.round((stats.count / paidSubscriptionsCount) * 100) : 0;
                          return (
                            <div key={method}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                  {method}
                                  {index === 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-[#155DFC] text-[10px] font-black">
                                      الأكثر استخدامًا
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                  {stats.count} عملية • {stats.total.toLocaleString("ar-EG")} ج.م
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#155DFC] rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
                      <Layers className="text-[#155DFC]" size={20} />
                      <h3 className="font-black text-gray-900 dark:text-white">الإيرادات حسب نوع الطالب</h3>
                    </div>
                    {Object.keys(studentTypeBreakdown).length === 0 ? (
                      <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">
                        لا توجد مدفوعات في هذه الفترة
                      </div>
                    ) : (
                      <div className="p-5 space-y-4">
                        {Object.entries(studentTypeBreakdown).map(([type, stats]) => {
                          const percent = paidSubscriptionsCount > 0 ? Math.round((stats.count / paidSubscriptionsCount) * 100) : 0;
                          return (
                            <div key={type}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{type}</span>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                  {stats.count} طالب • {stats.total.toLocaleString("ar-EG")} ج.م
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
                    <TrendingUp className="text-[#155DFC]" size={20} />
                    <h3 className="font-black text-gray-900 dark:text-white">الكورسات الأكثر مبيعاً</h3>
                  </div>
                  {bestSelling.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">
                      لا توجد مبيعات في هذه الفترة
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                            <th className="text-right font-bold px-4 py-2.5">الكورس / الشهر</th>
                            <th className="text-right font-bold px-4 py-2.5">السعر</th>
                            <th className="text-right font-bold px-4 py-2.5">الاشتراكات</th>
                            <th className="text-right font-bold px-4 py-2.5">إجمالي الإيراد</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bestSelling.map((c) => (
                            <tr key={c.course_id} className="border-t border-gray-100 dark:border-[#2A2A2A]">
                              <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">{c.title}</td>
                              <td className="px-4 py-2.5 text-emerald-600 font-bold">
                                {c.price.toFixed(2)} ج.م
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 text-[#155DFC] font-black text-xs">
                                  {c.subscriptions}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">
                                {(c.price * c.subscriptions).toLocaleString("ar-EG")} ج.م
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
                            <td className="px-4 py-3 font-black text-gray-900 dark:text-white">الإجمالي</td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 font-black text-[#155DFC]">
                              {bestSelling.reduce((sum, c) => sum + c.subscriptions, 0)}
                            </td>
                            <td className="px-4 py-3 font-black text-emerald-600">
                              {bestSelling
                                .reduce((sum, c) => sum + c.price * c.subscriptions, 0)
                                .toLocaleString("ar-EG")}{" "}
                              ج.م
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
    </DashboardLayout>
  );
}
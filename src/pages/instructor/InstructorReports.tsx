import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  RotateCcw,
  ShoppingCart,
  Wallet,
  Users,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
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
  created_at: string;
  courseTitle?: string;
}

interface CourseSalesRow {
  course_id: string;
  title: string;
  price: number;
  subscriptions: number;
}

interface TopStudentRow {
  student_id: number;
  name: string;
  watchedMinutes: number;
  examsCount: number;
}

interface ExamAnalysisRow {
  exam_id: number;
  title: string;
  attempts: number;
  avgScore: number;
  avgPercent: number;
}

export function InstructorReports() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseFilter, setCourseFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudentRow[]>([]);
  const [bestSelling, setBestSelling] = useState<CourseSalesRow[]>([]);
  const [examAnalysis, setExamAnalysis] = useState<ExamAnalysisRow[]>([]);

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
      setTopStudents([]);
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

    // أكثر الطلاب تفاعلاً
    const studentIds = [...new Set(mergedPayments.map((p) => p.student_id))];

    if (studentIds.length > 0) {
      const { data: studentsData } = await supabase
        .from("students")
        .select("id, full_name")
        .in("id", studentIds);

      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("student_id, watched_seconds")
        .in("student_id", studentIds);

      const { data: examsData } = await supabase
        .from("exam_results")
        .select("student_id")
        .in("student_id", studentIds);

      const topStudentsList: TopStudentRow[] = (studentsData || [])
        .map((s: any) => {
          const watchedSeconds = (progressData || [])
            .filter((p: any) => p.student_id === s.id)
            .reduce((sum: number, p: any) => sum + (p.watched_seconds || 0), 0);
          const examsCount = (examsData || []).filter((e: any) => e.student_id === s.id).length;

          return {
            student_id: s.id,
            name: s.full_name,
            watchedMinutes: Math.round(watchedSeconds / 60),
            examsCount,
          };
        })
        .sort(
          (a, b) =>
            b.watchedMinutes + b.examsCount * 10 - (a.watchedMinutes + a.examsCount * 10)
        )
        .slice(0, 10);

      setTopStudents(topStudentsList);
    } else {
      setTopStudents([]);
    }

    // تحليل الامتحانات
    let examResultsQuery = supabase
      .from("exam_results")
      .select("exam_id, score, percentage, exams(title)");

    if (dateFrom) examResultsQuery = examResultsQuery.gte("submitted_at", dateFrom);
    if (dateTo) examResultsQuery = examResultsQuery.lte("submitted_at", dateTo + "T23:59:59");

    const { data: examResultsData } = await examResultsQuery;

    const examMap: Record<string, { title: string; scores: number[]; percents: number[] }> = {};
    (examResultsData || []).forEach((r: any) => {
      const key = String(r.exam_id);
      if (!examMap[key]) {
        examMap[key] = { title: r.exams?.title || `اختبار #${r.exam_id}`, scores: [], percents: [] };
      }
      if (r.score !== null && r.score !== undefined) examMap[key].scores.push(r.score);
      if (r.percentage !== null && r.percentage !== undefined) examMap[key].percents.push(r.percentage);
    });

    const examAnalysisList: ExamAnalysisRow[] = Object.entries(examMap).map(([examId, v]) => ({
      exam_id: Number(examId),
      title: v.title,
      attempts: v.scores.length,
      avgScore: v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : 0,
      avgPercent: v.percents.length
        ? Math.round(v.percents.reduce((a, b) => a + b, 0) / v.percents.length)
        : 0,
    }));

    setExamAnalysis(examAnalysisList);
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

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="text-amber-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">التقارير والإحصائيات</h1>
              <p className="text-white/60 text-xs sm:text-sm mt-0.5">نظرة شاملة على أداء المنصة وتفاعل الطلاب</p>
            </div>
          </div>
        </motion.div>

        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
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
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
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
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
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
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={loadReportData}
                    className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl font-bold h-11"
                  >
                    <Filter size={16} className="ml-1.5" />
                    تطبيق الفلاتر
                  </Button>
                  <Button variant="outline" onClick={resetFilters} className="rounded-xl font-bold h-11 px-3">
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">جاري تحميل التقرير...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#EAD8FF] dark:border-[#2A2A2A] rounded-3xl shadow-sm">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-xs font-bold mb-1">
                        عدد الاشتراكات المدفوعة
                      </p>
                      <h3 className="text-3xl font-black text-[#B348FE]">{paidSubscriptionsCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111111] flex items-center justify-center">
                      <ShoppingCart className="text-[#B348FE]" size={24} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-3xl shadow-sm">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300 text-xs font-bold mb-1">
                        إجمالي المبيعات والأرباح
                      </p>
                      <h3 className="text-3xl font-black text-emerald-600">
                        {totalSalesAndProfit.toLocaleString("ar-EG")} ج.م
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111111] flex items-center justify-center">
                      <Wallet className="text-emerald-600" size={24} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
                      <Users className="text-[#B348FE]" size={20} />
                      <h3 className="font-black text-gray-900 dark:text-white">أكثر الطلاب تفاعلاً</h3>
                    </div>
                    {topStudents.length === 0 ? (
                      <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">
                        لا يوجد تفاعل في هذه الفترة
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                              <th className="text-right font-bold px-4 py-2.5">الطالب</th>
                              <th className="text-right font-bold px-4 py-2.5">المشاهدات</th>
                              <th className="text-right font-bold px-4 py-2.5">الامتحانات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topStudents.map((s) => (
                              <tr key={s.student_id} className="border-t border-gray-100 dark:border-[#2A2A2A]">
                                <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">{s.name}</td>
                                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{s.watchedMinutes} د</td>
                                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{s.examsCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
                      <TrendingUp className="text-[#B348FE]" size={20} />
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
                                  <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] font-black text-xs">
                                    {c.subscriptions}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
                    <ClipboardList className="text-[#B348FE]" size={20} />
                    <h3 className="font-black text-gray-900 dark:text-white">تحليل الامتحانات (متوسط الدرجات)</h3>
                  </div>
                  {examAnalysis.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400 font-bold">
                      لا توجد امتحانات تم أداؤها في هذه الفترة
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                            <th className="text-right font-bold px-4 py-2.5">الامتحان</th>
                            <th className="text-right font-bold px-4 py-2.5">عدد المحاولات</th>
                            <th className="text-right font-bold px-4 py-2.5">متوسط الدرجة</th>
                            <th className="text-right font-bold px-4 py-2.5">متوسط النسبة المئوية</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examAnalysis.map((e) => (
                            <tr key={e.exam_id} className="border-t border-gray-100 dark:border-[#2A2A2A]">
                              <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">{e.title}</td>
                              <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{e.attempts}</td>
                              <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{e.avgScore}</td>
                              <td className="px-4 py-2.5 font-bold text-[#B348FE]">{e.avgPercent}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
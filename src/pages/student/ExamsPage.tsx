import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import StudentLayout from "./StudentLayout";

export function ExamsPage() {
  const navigate = useNavigate();

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [attemptsPage, setAttemptsPage] = useState(1);
  const attemptsPerPage = 5;

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);

      // المستخدم الحالي
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // ==========================================
      // 1. جلب id الطالب الحقيقي من جدول students
      //    (ملاحظة: exam_results.student_id بيخزن
      //     students.id مش students.auth_id)
      // ==========================================
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (studentError || !student) {
        console.error("Error loading student:", studentError);
        setLoading(false);
        return;
      }

      // ==========================================
      // 2. جلب كل الامتحانات
      // ==========================================
      const { data: examsData, error: examsError } = await supabase
        .from("course_items")
        .select(`
          id,
          title,
          exams(
            id,
            title,
            duration,
            passing_grade,
            exam_questions(id)
          )
        `)
        .eq("type", "quiz");

      if (examsError) {
        console.error("Error loading exams:", examsError);
        setLoading(false);
        return;
      }

      // ==========================================
      // 3. جلب نتائج الطالب (بالـ id الصح)
      // ==========================================
      const { data: results, error: resultsError } = await supabase
        .from("exam_results")
        .select("*")
        .eq("student_id", student.id);

      if (resultsError) {
        console.error("Error loading results:", resultsError);
      }

      // ==========================================
      // 4. دمج الامتحانات مع نتائج الطالب
      // ==========================================
      const finalData = (examsData || [])
        .map((item: any) => {
          const exam = Array.isArray(item.exams) ? item.exams[0] : item.exams;

          if (!exam) return null;

          const result =
            results?.find((r: any) => String(r.exam_id) === String(exam.id)) || null;

          return {
            ...exam,
            lessonTitle: item.title,
            result,
          };
        })
        .filter(Boolean);

      setExams(finalData);

      // سجل كل محاولات الامتحانات للطالب مع اسم الامتحان
      const attemptsWithTitles = (results || []).map((r: any) => {
        const examMatch = finalData.find((e: any) => String(e.id) === String(r.exam_id));
        return {
          ...r,
          examTitle: examMatch?.title || `امتحان #${r.exam_id}`,
          totalQ: examMatch?.exam_questions?.length ?? r.total_questions ?? 0,
        };
      });

      attemptsWithTitles.sort(
        (a: any, b: any) =>
          new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime()
      );

      setAttempts(attemptsWithTitles);
    } catch (error) {
      console.error("Unexpected error loading exams:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2">
              الامتحانات
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base">
              جميع الاختبارات والنتائج الخاصة بك
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#B348FE]/20 border-t-[#B348FE] rounded-full animate-spin" />
            </div>
          ) : exams.length === 0 ? (
            /* No Exams */
            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl p-10 text-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                لا توجد امتحانات
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                لا توجد امتحانات متاحة حالياً.
              </p>
            </div>
          ) : (
            /* Exams */
            <div className="space-y-5 lg:space-y-6">
              {exams.map((exam: any) => {
                const hasResult = !!exam.result;
                const passed = exam.result?.passed;

                return (
                  <div
                    key={exam.id}
                    className={`bg-white dark:bg-[#111111] border rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 ${
                      hasResult
                        ? passed
                          ? "border-emerald-200 dark:border-emerald-900 hover:border-emerald-400"
                          : "border-rose-200 dark:border-rose-900 hover:border-rose-400"
                        : "border-gray-100 dark:border-[#2A2A2A] hover:border-[#B348FE]"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Exam Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
                            {exam.title}
                          </h2>
                          {hasResult && (
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                                passed
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                              }`}
                            >
                              {passed ? "✓ ناجح" : "✕ راسب"}
                            </span>
                          )}
                        </div>

                        <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                          {exam.lessonTitle}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500 dark:text-gray-400">
                          <span>📝 {exam.exam_questions?.length || 0} أسئلة</span>
                          <span>⏱️ {exam.duration} دقيقة</span>
                        </div>

                        {hasResult && (
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                              عدد الإجابات الصحيحة: {exam.result.correct_answers ?? "-"} / {exam.result.total_questions ?? exam.exam_questions?.length ?? "-"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action / Score */}
                      <div className="flex-shrink-0 flex items-center gap-4">
                        {hasResult ? (
                          <>
                            {/* Score Circle */}
                            <div
                              className={`w-20 h-20 rounded-2xl border-4 flex flex-col items-center justify-center flex-shrink-0 ${
                                passed
                                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                                  : "border-rose-400 bg-rose-50 dark:bg-rose-950/20"
                              }`}
                            >
                              <span
                                className={`text-xl font-black ${
                                  passed
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {exam.result.percentage}%
                              </span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                                {exam.result.score} درجة
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              onClick={() => navigate(`/dashboard/exams/${exam.id}`)}
                              className="w-full lg:w-auto border-2 border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-all duration-300"
                            >
                              التفاصيل
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => navigate(`/dashboard/exams/${exam.id}`)}
                            className="w-full lg:w-auto bg-[#B348FE] hover:bg-[#9E2FFF] text-white shadow-md hover:shadow-[0_8px_20px_rgba(179,72,254,.35)] font-bold transition-all duration-300"
                          >
                            ابدأ الامتحان
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* سجل محاولات الامتحانات */}
          <div className="mt-10">
            <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-4">
              سجل نتائج الامتحانات
            </h2>

            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl overflow-hidden">
              {attempts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-gray-500 dark:text-gray-400 font-bold">لا توجد بيانات</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">#</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">اسم الامتحان</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">عدد الأسئلة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">المحلولة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الصحيحة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">الدرجة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">النتيجة</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">وقت البدء</th>
                          <th className="text-right font-bold px-4 py-3 whitespace-nowrap">وقت الانتهاء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts
                          .slice((attemptsPage - 1) * attemptsPerPage, attemptsPage * attemptsPerPage)
                          .map((a, idx) => (
                            <tr key={a.id} className="border-t border-gray-100 dark:border-[#2A2A2A]">
                              <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                {(attemptsPage - 1) * attemptsPerPage + idx + 1}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {a.examTitle}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.totalQ}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                {a.answered_questions ?? "-"}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                {a.correct_answers ?? "-"}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{a.score ?? "-"}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-lg text-xs font-black ${
                                    a.passed
                                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                      : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                                  }`}
                                >
                                  {a.passed ? "ناجح" : "راسب"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {a.started_at ? new Date(a.started_at).toLocaleString("ar-EG") : "-"}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {a.completed_at
                                  ? new Date(a.completed_at).toLocaleString("ar-EG")
                                  : a.submitted_at
                                  ? new Date(a.submitted_at).toLocaleString("ar-EG")
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                    <span className="text-xs font-bold text-emerald-600">
                      {(attemptsPage - 1) * attemptsPerPage + 1} -{" "}
                      {Math.min(attemptsPage * attemptsPerPage, attempts.length)} من {attempts.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAttemptsPage((p) => Math.max(1, p - 1))}
                        disabled={attemptsPage === 1}
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40"
                      >
                        ‹
                      </button>
                      <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                        {attemptsPage}
                      </span>
                      <button
                        onClick={() =>
                          setAttemptsPage((p) => (p * attemptsPerPage < attempts.length ? p + 1 : p))
                        }
                        disabled={attemptsPage * attemptsPerPage >= attempts.length}
                        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}

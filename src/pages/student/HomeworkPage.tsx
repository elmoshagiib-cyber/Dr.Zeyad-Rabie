import { FileText, CheckCircle, Clock, Award } from "lucide-react";
import StudentLayout from "./StudentLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export function HomeworkPage() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);
  const tablePerPage = 5;

  useEffect(() => {
    if (user?.studentId) {
      loadHomeworks();
    }
  }, [user]);

  const getHomeworkStatus = (hw: any) => {
    const hasSubmission = hw.submitted;
    const hasGrade = hw.submission?.grade !== null && hw.submission?.grade !== undefined;

    if (!hasSubmission) return "not_submitted";
    if (hasGrade) return "corrected";
    return "submitted";
  };

  const submitted = homeworks.filter((h) => h.submitted).length;
  const pending = homeworks.filter((h) => !h.submitted).length;

  const gradedHomeworks = homeworks.filter(
    (h) => h.submission?.grade !== null && h.submission?.grade !== undefined
  );

  const averageGrade =
    gradedHomeworks.length > 0
      ? Math.round(
          gradedHomeworks.reduce((sum, h) => {
            const total = h.total_score || 100;
            return sum + (h.submission.grade / total) * 100;
          }, 0) / gradedHomeworks.length
        )
      : null;

  const loadHomeworks = async () => {
    if (!user?.studentId) return;

    setLoading(true);

    const { data: enrollments } = await supabase
      .from("student_courses")
      .select("course_id")
      .eq("student_id", user.studentId);

    if (!enrollments || enrollments.length === 0) {
      setHomeworks([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map((c) => c.course_id);

    const { data: homeworksData } = await supabase
      .from("homeworks")
      .select(`
        *,
        course_sections (
          id,
          course_id,
          courses ( id, title )
        )
      `)
      .in("course_id", courseIds);

    if (!homeworksData || homeworksData.length === 0) {
      setHomeworks([]);
      setLoading(false);
      return;
    }

    const itemIds = homeworksData.map((hw: any) => hw.course_item_id).filter(Boolean);

    let validItemIds = new Set<string>();

    if (itemIds.length > 0) {
      const { data: validItems } = await supabase
        .from("course_items")
        .select("id")
        .in("id", itemIds)
        .eq("type", "homework");

      validItemIds = new Set((validItems || []).map((i: any) => i.id));
    }

    const validHomeworks = homeworksData.filter((hw: any) => validItemIds.has(hw.course_item_id));

    const { data: submissions } = await supabase
      .from("homework_submissions")
      .select("*")
      .eq("student_id", user.studentId);

    const submissionsMap =
      submissions?.reduce((acc, item) => {
        acc[item.homework_id] = item;
        return acc;
      }, {} as any) || {};

    const finalHomeworks = validHomeworks.map((hw) => ({
      ...hw,
      submitted: !!submissionsMap[hw.id],
      submission: submissionsMap[hw.id],
      courseTitle: hw.course_sections?.courses?.title || "-",
    }));

    finalHomeworks.sort(
      (a, b) =>
        new Date(b.submission?.submitted_at || b.created_at || 0).getTime() -
        new Date(a.submission?.submitted_at || a.created_at || 0).getTime()
    );

    setHomeworks(finalHomeworks);
    setLoading(false);
  };

  return (
    <StudentLayout>
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-1.5 sm:mb-2">
              الواجبات
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm lg:text-base">
              متابعة وتسليم جميع الواجبات الدراسية
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-20">
              <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-[#B348FE]/20 border-t-[#B348FE] rounded-full animate-spin" />
            </div>
          ) : homeworks.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center">
              <FileText className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={40} />
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-2">لا توجد واجبات</h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">لا توجد واجبات متاحة حالياً.</p>
            </div>
          ) : null}

          {/* سجل الواجبات - جدول تفصيلي زي صفحة تفاصيل الطالب */}
          {!loading && homeworks.length > 0 && (
            <div className="mt-8 sm:mt-10">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-3.5 sm:mb-4">
                سجل الواجبات
              </h2>

              <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                        <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">#</th>
                        <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">اسم الواجب</th>
                        <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">الكورس</th>
                        <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">الدرجة</th>
                        <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">النسبة</th>
                        <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">الحالة</th>
                        <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">تاريخ التسليم</th>
                        <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">الملف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {homeworks
                        .slice((tablePage - 1) * tablePerPage, tablePage * tablePerPage)
                        .map((hw, idx) => {
                          const status = getHomeworkStatus(hw);
                          const hasGrade = hw.submission?.grade !== null && hw.submission?.grade !== undefined;
                          const total = hw.total_score || 100;
                          const percent = hasGrade ? Math.round((hw.submission.grade / total) * 100) : null;

                          return (
                            <tr key={hw.id} className="border-t border-gray-100 dark:border-[#2A2A2A]">
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-gray-900 dark:text-white">
                                {(tablePage - 1) * tablePerPage + idx + 1}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {hw.title}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {hw.courseTitle}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-gray-900 dark:text-white">
                                {hasGrade ? `${hw.submission.grade} / ${total}` : "-"}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                                {hasGrade ? (
                                  <span className="font-black text-[#B348FE]">{percent}%</span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                                <span
                                  className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-black whitespace-nowrap border ${
                                    status === "not_submitted"
                                      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                                      : status === "submitted"
                                      ? "bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] border-[#EAD8FF] dark:border-[#2A2A2A]"
                                      : "bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] border-[#EAD8FF] dark:border-[#2A2A2A]"
                                  }`}
                                >
                                  {status === "not_submitted" && "لم يتم التسليم"}
                                  {status === "submitted" && "تم التسليم"}
                                  {status === "corrected" && "تم التصحيح"}
                                </span>
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {hw.submission?.submitted_at
                                  ? new Date(hw.submission.submitted_at).toLocaleString("ar-EG")
                                  : "-"}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                                <div className="flex flex-col items-start gap-1.5">
                                  {hw.submission?.answer ? (
                                    <a
                                      href={hw.submission.answer}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[#B348FE] hover:text-[#9E2FFF] font-bold text-xs underline whitespace-nowrap"
                                    >
                                      عرض الملف
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3.5 sm:py-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                  <span className="text-[11px] sm:text-xs font-bold text-[#B348FE]">
                    {(tablePage - 1) * tablePerPage + 1} -{" "}
                    {Math.min(tablePage * tablePerPage, homeworks.length)} من {homeworks.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                      disabled={tablePage === 1}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40"
                    >
                      ‹
                    </button>
                    <span className="w-8 h-8 rounded-lg bg-[#B348FE] text-white flex items-center justify-center text-xs font-black">
                      {tablePage}
                    </span>
                    <button
                      onClick={() =>
                        setTablePage((p) => (p * tablePerPage < homeworks.length ? p + 1 : p))
                      }
                      disabled={tablePage * tablePerPage >= homeworks.length}
                      className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center disabled:opacity-40"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </StudentLayout>
  );
}
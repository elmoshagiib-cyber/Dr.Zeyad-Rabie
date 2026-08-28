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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

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

      const { data: examsData, error: examsError } = await supabase
        .from("course_items")
        .select(`
          id,
          title,
          section_id,
          course_sections (
            id,
            course_id,
            courses ( id, title )
          ),
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

      const { data: results, error: resultsError } = await supabase
        .from("exam_results")
        .select("*")
        .eq("student_id", student.id);

      if (resultsError) {
        console.error("Error loading results:", resultsError);
      }

      const finalData = (examsData || [])
        .map((item: any) => {
          const exam = Array.isArray(item.exams) ? item.exams[0] : item.exams;
          if (!exam) return null;

          const result =
            results?.find((r: any) => String(r.exam_id) === String(exam.id)) || null;

          return {
            ...exam,
            lessonTitle: item.title,
            courseTitle: item.course_sections?.courses?.title || "-",
            result,
          };
        })
        .filter(Boolean);

      setExams(finalData);

      const attemptsWithTitles = (results || []).map((r: any) => {
        const examMatch = finalData.find((e: any) => String(e.id) === String(r.exam_id));
        return {
          ...r,
          examTitle: examMatch?.title || `امتحان #${r.exam_id}`,
          courseTitle: examMatch?.courseTitle || "-",
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
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-1.5 sm:mb-2">
              الامتحانات
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm lg:text-base">
              جميع الاختبارات والنتائج الخاصة بك
            </p>
          </div>


          {/* سجل محاولات الامتحانات */}
          <div className="mt-8 sm:mt-10">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-3.5 sm:mb-4">
              سجل نتائج الامتحانات
            </h2>

            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl overflow-hidden">
              {attempts.length === 0 ? (
                <div className="py-12 sm:py-16 text-center">
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-bold">لا توجد بيانات</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400">
                          <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">#</th>
                          <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">اسم الامتحان</th>
                          <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">الكورس</th>
                          <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">عدد الأسئلة</th>
                          <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">المحلولة</th>
                          <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">الصحيحة</th>
                          <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">الدرجة</th>
                          <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">وقت البدء</th>
                          <th className="text-right font-bold px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">وقت الانتهاء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts
                          .slice((attemptsPage - 1) * attemptsPerPage, attemptsPage * attemptsPerPage)
                          .map((a, idx) => (
                            <tr key={a.id} className="border-t border-gray-100 dark:border-[#2A2A2A]">
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-gray-900 dark:text-white">
                                {(attemptsPage - 1) * attemptsPerPage + idx + 1}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {a.examTitle}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {a.courseTitle}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 dark:text-gray-300">{a.totalQ}</td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 dark:text-gray-300">
                                {a.answered_questions ?? "-"}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 dark:text-gray-300">
                                {a.correct_answers ?? "-"}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-bold text-gray-900 dark:text-white">{a.score ?? "-"}</td>
                              
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {a.started_at ? new Date(a.started_at).toLocaleString("ar-EG") : "-"}
                              </td>
                              <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
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

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3.5 sm:py-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                    <span className="text-[11px] sm:text-xs font-bold text-[#B348FE]">
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
                      <span className="w-8 h-8 rounded-lg bg-[#B348FE] text-white flex items-center justify-center text-xs font-black">
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
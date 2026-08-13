import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import StudentLayout from "./StudentLayout";

export function ExamsPage() {
  const navigate = useNavigate();

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      // 1. جلب الطالب الحقيقي من جدول students
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
      // 3. جلب نتائج الطالب باستخدام students.id
      // ==========================================
      const { data: results, error: resultsError } = await supabase
        .from("exam_results")
        .select("*")
        .eq("student_id", student.id);

      if (resultsError) {
        console.error("Error loading exam results:", resultsError);
      }

      // ==========================================
      // 4. دمج الامتحانات مع نتائج الطالب
      // ==========================================
      const finalData = (examsData || [])
        .map((item: any) => {
          const exam = Array.isArray(item.exams)
            ? item.exams[0]
            : item.exams;

          if (!exam) return null;

          const result =
            results?.find(
              (r: any) => String(r.exam_id) === String(exam.id)
            ) || null;

          return {
            ...exam,
            lessonTitle: item.title,
            result,
          };
        })
        .filter(Boolean);

      setExams(finalData);
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

                return (
                  <div
                    key={exam.id}
                    className="
                      bg-white
                      dark:bg-[#111111]
                      border
                      border-gray-100
                      dark:border-[#2A2A2A]
                      rounded-3xl
                      p-6
                      lg:p-8
                      shadow-sm
                      hover:shadow-xl
                      hover:border-[#B348FE]
                      transition-all
                      duration-300
                    "
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                      {/* Exam Info */}
                      <div className="flex-1 space-y-3">

                        <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
                          {exam.title}
                        </h2>

                        <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                          {exam.lessonTitle}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500 dark:text-gray-400">
                          <span>
                            📝 {exam.exam_questions?.length || 0} أسئلة
                          </span>

                          <span>
                            ⏱️ {exam.duration} دقيقة
                          </span>
                        </div>

                        {/* Result */}
                        {hasResult && (
                          <div className="flex flex-wrap items-center gap-3 pt-2">

                            <div
                              className={`
                                inline-flex
                                items-center
                                gap-2
                                px-4
                                py-2
                                rounded-xl
                                font-black
                                ${
                                  exam.result.passed
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                                }
                              `}
                            >
                              {exam.result.passed
                                ? "✓ ناجح"
                                : "✕ راسب"}

                              <span>
                                {exam.result.percentage}%
                              </span>
                            </div>

                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                              الدرجة: {exam.result.score}
                            </span>

                          </div>
                        )}

                      </div>

                      {/* Action */}
                      <div className="flex-shrink-0">

                        {hasResult ? (
                          <Button
                            variant="outline"
                            onClick={() =>
                              navigate(`/dashboard/exams/${exam.id}`)
                            }
                            className="
                              w-full
                              lg:w-auto
                              border-2
                              border-[#B348FE]
                              text-[#B348FE]
                              font-bold
                              hover:bg-[#F6EEFF]
                              dark:hover:bg-[#2B103D]
                              hover:border-[#B348FE]
                              transition-all
                              duration-300
                            "
                          >
                            عرض النتيجة
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              navigate(`/dashboard/exams/${exam.id}`)
                            }
                            className="
                              w-full
                              lg:w-auto
                              bg-[#B348FE]
                              hover:bg-[#9E2FFF]
                              text-white
                              shadow-md
                              hover:shadow-[0_8px_20px_rgba(179,72,254,.35)]
                              font-bold
                              transition-all
                              duration-300
                            "
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

        </div>
      </main>
    </StudentLayout>
  );
}
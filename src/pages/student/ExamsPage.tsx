
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import StudentLayout from "./StudentLayout";
export function ExamsPage() {
  const navigate = useNavigate();

  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // كل الامتحانات
    const { data: examsData, error } = await supabase
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

    if (error) {
      console.error(error);
      return;
    }

    // نتائج الطالب الحالي
    const { data: results } = await supabase
      .from("exam_results")
      .select("*")
      .eq("student_id", user.id);

    const finalData = (examsData || [])
      .map((item: any) => {
        const exam = item.exams?.[0];

        if (!exam) return null;

        return {
          ...exam,
          lessonTitle: item.title,
          result: results?.find((r) => r.exam_id === exam.id) || null,
        };
      })
      .filter(Boolean);

    setExams(finalData);
  };

return (
  <StudentLayout>

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2">
              الامتحانات
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base">
              جميع الاختبارات المتاحة لك
            </p>
          </div>

          <div className="space-y-5 lg:space-y-6">
            {exams.map((exam: any) => (
              <div
                key={exam.id}
                className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-xl hover:border-[#B348FE] transition-all duration-300"
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
                      <span>📝 {exam.exam_questions?.length || 0} أسئلة</span>
                      <span>⏱️ {exam.duration} دقيقة</span>
                    </div>

                    {exam.result && (
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        الدرجة: {exam.result.score}%
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {exam.result ? (
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/dashboard/exams/${exam.id}`)
                        }
                        className="border-2 font-bold hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] transition-all duration-300"
                      >
                        عرض النتيجة
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          navigate(`/dashboard/exams/${exam.id}`)
                        }
                        className="bg-[#B348FE] hover:bg-[#9E2FFF] text-white shadow-md hover:shadow-[0_8px_20px_rgba(179,72,254,.35)] font-bold transition-all duration-300"
                      >
                        ابدأ الامتحان
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </main>
  </StudentLayout>

  );
}

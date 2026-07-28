import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
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

  const finalData = (examsData || []).map((item: any) => {
    const exam = item.exams?.[0];

    if (!exam) return null;

    return {
      ...exam,
      lessonTitle: item.title,
      result:
        results?.find((r) => r.exam_id === exam.id) || null,
    };
  }).filter(Boolean);

  setExams(finalData);
};

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">
            الامتحانات
          </h1>
          <p className="text-slate-500 dark:text-slate-300">
            جميع الاختبارات المتاحة لك
          </p>
        </div>

        <div className="space-y-4">

          
          {exams.map((exam: any) => (
  <div
    key={exam.id}
    className="bg-white dark:bg-[#1E244F] rounded-2xl border border-slate-200 p-6 shadow-sm"
  >
    <div className="flex justify-between items-center">

      <div>
        <h2 className="font-black text-lg">
          {exam.title}
        </h2>

        <p className="text-slate-500 mt-1">
          {exam.lessonTitle}
        </p>

        <p className="text-slate-500 mt-2">
          عدد الأسئلة: {exam.exam_questions?.length || 0}
        </p>

        <p className="text-slate-500">
          المدة: {exam.duration} دقيقة
        </p>

        {exam.result && (
          <p className="text-green-600 font-bold mt-2">
            الدرجة: {exam.result.score}%
          </p>
        )}
      </div>

      <div>
        {exam.result ? (
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/dashboard/exams/${exam.id}`)
            }
          >
            عرض النتيجة
          </Button>
        ) : (
          <Button
            onClick={() =>
              navigate(`/dashboard/exams/${exam.id}`)
            }
          >
            ابدأ الامتحان
          </Button>
        )}
      </div>

    </div>
  </div>
))}

        </div>
      </main>
    </div>
  );
}
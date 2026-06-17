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
  const { data, error } = await supabase
    .from("exams")
    .select(`
      *,
      exam_questions (*)
    `);

  if (error) {
    console.error(error);
    return;
  }

  setExams(data || []);
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
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white dark:bg-[#130726] rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-black text-lg">
                    {exam.title}
                  </h2>

                  <p className="text-slate-500 mt-2">
                   عدد الأسئلة: {exam.exam_questions?.length || 0}
                  </p>

                  <p className="text-slate-500 dark:text-slate-300">
                    المدة: {exam.duration} دقيقة
                  </p>
                </div>

                <div>
                  <Button
  onClick={() =>
    navigate(`/dashboard/exams/${exam.id}`)
  }
>
  ابدأ الامتحان
</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
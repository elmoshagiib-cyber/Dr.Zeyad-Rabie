import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Button } from "../../components/ui/Button";

export function ExamsPage() {
  const navigate = useNavigate();

  const exams = [
    {
      id: 1,
      title: "اختبار الكيمياء العضوية",
      questions: 10,
      duration: 20,
      status: "available",
    },
    {
      id: 2,
      title: "اختبار الهيدروكربونات",
      questions: 15,
      duration: 30,
      status: "completed",
    },
  ];

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
          <p className="text-slate-500">
            جميع الاختبارات المتاحة لك
          </p>
        </div>

        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-black text-lg">
                    {exam.title}
                  </h2>

                  <p className="text-slate-500 mt-2">
                    عدد الأسئلة: {exam.questions}
                  </p>

                  <p className="text-slate-500">
                    المدة: {exam.duration} دقيقة
                  </p>
                </div>

                <div>
                  {exam.status === "available" ? (
                    <Button
                      onClick={() =>
                        navigate("/dashboard/quiz")
                      }
                    >
                      ابدأ الامتحان
                    </Button>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl">
                      تم الحل
                    </span>
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
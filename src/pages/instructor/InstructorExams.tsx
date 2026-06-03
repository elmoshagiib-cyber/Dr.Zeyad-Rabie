import { useNavigate } from "react-router-dom";
import { Plus, Clock, FileText, Edit, Trash2 } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export function InstructorExams() {
  const navigate = useNavigate();

  const exams = [
    {
      id: 1,
      title: "اختبار الكيمياء العضوية",
      questions: 10,
      duration: 20,
      passMark: 60,
      status: "published",
    },
    {
      id: 2,
      title: "اختبار الهيدروكربونات",
      questions: 15,
      duration: 30,
      passMark: 70,
      status: "draft",
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              الاختبارات
            </h1>
            <p className="text-slate-500 text-sm">
              إدارة جميع الاختبارات الخاصة بك
            </p>
          </div>

          <Button>
            <Plus size={16} />
            إنشاء اختبار
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardContent>
                <div className="flex justify-between items-start">

                  <div>
                    <h2 className="font-black text-lg mb-2">
                      {exam.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">

                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {exam.questions} سؤال
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {exam.duration} دقيقة
                      </span>

                      <span>
                        النجاح: {exam.passMark}%
                      </span>

                    </div>
                  </div>

                  <Badge
                    variant={
                      exam.status === "published"
                        ? "emerald"
                        : "blue"
                    }
                  >
                    {exam.status === "published"
                      ? "منشور"
                      : "مسودة"}
                  </Badge>
                </div>

                <div className="flex gap-2 mt-5">

                  <Button size="sm" variant="outline">
                    <Edit size={14} />
                    تعديل
                  </Button>

                  <Button size="sm" variant="danger">
                    <Trash2 size={14} />
                    حذف
                  </Button>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
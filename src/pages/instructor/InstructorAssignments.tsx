import { Plus, Calendar, FileText, Image, Edit, Trash2 } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

export function InstructorAssignments() {
  const assignments = [
    {
      id: 1,
      title: "واجب الكيمياء العضوية",
      type: "pdf",
      dueDate: "2026-06-15",
      grade: 20,
      status: "published",
    },
    {
      id: 2,
      title: "واجب الهيدروكربونات",
      type: "image",
      dueDate: "2026-06-20",
      grade: 15,
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
              الواجبات
            </h1>
            <p className="text-slate-500 text-sm">
              إدارة جميع الواجبات الخاصة بالكورسات
            </p>
          </div>

          <Button>
            <Plus size={16} />
            إنشاء واجب
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent>
                <div className="flex justify-between items-start">

                  <div>
                    <h2 className="font-black text-lg mb-2">
                      {assignment.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">

                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {assignment.dueDate}
                      </span>

                      <span>
                        الدرجة: {assignment.grade}
                      </span>

                      <span className="flex items-center gap-1">
                        {assignment.type === "pdf" ? (
                          <FileText size={14} />
                        ) : (
                          <Image size={14} />
                        )}
                        {assignment.type === "pdf"
                          ? "PDF"
                          : "صورة"}
                      </span>

                    </div>
                  </div>

                  <Badge
                    variant={
                      assignment.status === "published"
                        ? "emerald"
                        : "blue"
                    }
                  >
                    {assignment.status === "published"
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
import { Upload, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { HOMEWORKS } from "../../data/mockData";

export function HomeworkPage() {
  const submitted = HOMEWORKS.filter(h => h.status === "submitted").length;
  const pending = HOMEWORKS.filter(h => h.status === "pending").length;
  const interactive = HOMEWORKS.filter(h => h.status === "interactive").length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-black text-slate-900">الواجبات</h1>
          <p className="text-slate-500 text-sm">
            متابعة وتسليم جميع الواجبات الدراسية
          </p>
        </div>

        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">تم التسليم</p>
                    <p className="text-3xl font-black text-emerald-600">
                      {submitted}
                    </p>
                  </div>
                  <CheckCircle className="text-emerald-500" size={30} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">قيد الانتظار</p>
                    <p className="text-3xl font-black text-amber-600">
                      {pending}
                    </p>
                  </div>
                  <Clock className="text-amber-500" size={30} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">واجبات تفاعلية</p>
                    <p className="text-3xl font-black text-blue-600">
                      {interactive}
                    </p>
                  </div>
                  <AlertCircle className="text-blue-500" size={30} />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Homework List */}
          <div className="space-y-4">

            {HOMEWORKS.map(hw => (
              <Card key={hw.id} hover>
                <CardContent className="p-5">

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                      <h3 className="font-black text-slate-900">
                        {hw.title}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {hw.courseTitle}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        موعد التسليم: {hw.dueDate}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">

                      {hw.status === "submitted" && (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                          تم التسليم
                        </span>
                      )}

                      {hw.status === "pending" && (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                          لم يتم التسليم
                        </span>
                      )}

                      {hw.status === "interactive" && (
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          واجب تفاعلي
                        </span>
                      )}

                    </div>
                  </div>

                  {hw.grade && (
                    <div className="mt-4 text-sm">
                      <span className="font-bold text-slate-700">
                        الدرجة:
                      </span>{" "}
                      {hw.grade}/{hw.totalGrade}
                      {" • "}
                      <span className="text-emerald-600 font-bold">
                        {hw.successRate}%
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-5">

                    <Button size="sm">
                      <Upload size={14} />
                      رفع PDF
                    </Button>

                    <Button variant="outline" size="sm">
                      <Upload size={14} />
                      رفع صورة
                    </Button>

                    {hw.status === "interactive" && (
                      <Button variant="success" size="sm">
                        <FileText size={14} />
                        ابدأ الحل
                      </Button>
                    )}

                  </div>

                </CardContent>
              </Card>
            ))}

          </div>
        </div>
      </main>
    </div>
  );
}
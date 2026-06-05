import { useNavigate } from "react-router-dom";
import { BookOpen, Play, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { COURSES, CURRENT_STUDENT } from "../../data/mockData";

export function MyCoursesPage() {
  const navigate = useNavigate();
  const studentCourses = JSON.parse(
  localStorage.getItem("student-courses-1") || "[]"
);

const enrolledCourses = studentCourses
  .filter((course: any) => course.active)
  .map((course: any, index: number) => ({
    id: index,
    title: course.name,
    progress: 0,
    lastLesson: "لم يبدأ بعد",
    lastAccessedAt: "لا يوجد",
  }));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-black text-slate-900">كورساتي</h1>
          <p className="text-slate-500 text-sm">{enrolledCourses.length} كورسات مشترك بها</p>
        </div>
        <div className="p-6 space-y-4">
         {enrolledCourses.map(
  (
    {
      id,
      title,
      progress,
      lastLesson,
      lastAccessedAt,
    }: any
  ) => (
            <Card key={id} hover>
              <CardContent className="flex flex-col sm:flex-row gap-5">
                <img
                  src="https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400"
                  alt={title}
                  className="w-full sm:w-40 h-32 sm:h-24 rounded-xl object-cover flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=160&h=96&fit=crop`; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-black text-slate-900">{title}</h3>
                    <Badge variant={progress === 100 ? "emerald" : "blue"} className="flex-shrink-0">
                      {progress === 100 ? "مكتمل ✓" : `${progress}%`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><BookOpen size={12} />0 درس</span>
                    <span className="flex items-center gap-1"><Clock size={12} />آخر نشاط: {lastAccessedAt}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    <span className="font-medium text-slate-700">آخر درس:</span> {lastLesson}
                  </p>
                  <div className="flex items-center gap-4">
                    <ProgressBar value={progress} className="flex-1" size="sm" />
                    <Button size="sm" onClick={() => navigate("/dashboard/lesson/l1")}>
                      <Play size={13} />
                      {progress === 0 ? "ابدأ" : progress === 100 ? "مراجعة" : "متابعة"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
)}

          {/* Browse more */}
          <div
            onClick={() => navigate("/courses")}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
          >
            <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
              <ChevronRight size={22} className="text-blue-500" />
            </div>
            <p className="font-bold text-slate-700 mb-1">اكتشف كورسات جديدة</p>
            <p className="text-sm text-slate-400">تصفح جميع الكورسات المتاحة وأضف ما يناسبك</p>
          </div>
        </div>
      </main>
    </div>
  );
}

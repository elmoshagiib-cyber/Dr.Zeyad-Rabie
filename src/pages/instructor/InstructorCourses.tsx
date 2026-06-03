import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Star, Plus, Edit, Trash2 } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { COURSES } from "../../data/mockData";

export function InstructorCourses() {
  const navigate = useNavigate();

  const myCourses = COURSES.slice(0, 4);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              كورساتي
            </h1>
            <p className="text-slate-500 text-sm">
              إدارة جميع الكورسات الخاصة بك
            </p>
          </div>

          <Button
            onClick={() => navigate("/instructor/courses/create")}
          >
            <Plus size={16} />
            إنشاء كورس
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {myCourses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex flex-col md:flex-row gap-4">

                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full md:w-40 h-28 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-black text-slate-900">
                      {course.title}
                    </h2>

                    <Badge
                      variant={
                        course.status === "published"
                          ? "emerald"
                          : "slate"
                      }
                    >
                      {course.status === "published"
                        ? "منشور"
                        : "مسودة"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">

                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {course.studentsCount} طالب
                    </span>

                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {course.lessonsCount} درس
                    </span>

                    <span className="flex items-center gap-1">
                      <Star size={14} />
                      {course.rating}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="font-black text-emerald-600">
                      {course.price} ج
                    </span>

                    <div className="flex gap-2">

                      <Button size="sm" variant="outline">
                        <Edit size={14} />
                        تعديل
                      </Button>

                      <Button size="sm" variant="danger">
                        <Trash2 size={14} />
                        حذف
                      </Button>

                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
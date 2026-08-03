import { useNavigate } from "react-router-dom";
import { BookOpen, Play, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";

export function MyCoursesPage() {
  const navigate = useNavigate();
const { user } = useApp();

const [loading, setLoading] = useState(true);
const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);


  useEffect(() => {
  loadCourses();
}, []);

const loadCourses = async () => {
  if (!user?.studentId) return;

  setLoading(true);

  const { data: enrollments } = await supabase
    .from("student_courses")
    .select("course_id")
    .eq("student_id", user.studentId)
    .eq("active", true);

  if (!enrollments || enrollments.length === 0) {
    setEnrolledCourses([]);
    setLoading(false);
    return;
  }

  const ids = enrollments.map((c) => c.course_id);

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .in("id", ids);

  setEnrolledCourses(courses || []);
  setLoading(false);
};

  return (
    <div
  className="
    flex
    h-screen
    overflow-hidden
    bg-[#FCFCFD]
    dark:bg-[#09090B]
    transition-colors
  "
  dir="rtl"
>
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div
  className="
    bg-white
    dark:bg-[#09090B]
    border-b
    border-gray-200
    dark:border-[#2A2A2A]
    px-6
    py-5
  "
>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">كورساتي</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{enrolledCourses.length} كورسات مشترك بها</p>
        </div>
        <div className="p-6 space-y-4">
{enrolledCourses.map((course: any) => (

<Card
  hover
  className="
    bg-white
    dark:bg-[#111111]
    border
    border-gray-200
    dark:border-[#2A2A2A]
  "
>
  <CardContent className="flex flex-col sm:flex-row gap-5">
    <img
      src={
        course.thumbnail ||
        "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400"
      }
      alt={course.title}
      className="w-full sm:w-40 h-32 sm:h-24 rounded-xl object-cover flex-shrink-0"
      onError={(e) => {
        (e.target as HTMLImageElement).src =
          "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=160&h=96&fit=crop";
      }}
    />

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-black text-gray-900 dark:text-white">
          {course.title}
        </h3>

        <Badge variant="blue" className="flex-shrink-0">
          0%
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <BookOpen size={12} />
          0 درس
        </span>

        <span className="flex items-center gap-1">
          <Clock size={12} />
          آخر نشاط: لا يوجد
        </span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span className="font-medium text-slate-700">
          آخر درس:
        </span>{" "}
        لم يبدأ بعد
      </p>

      <div className="flex items-center gap-4">
        <ProgressBar
          value={0}
          className="flex-1"
          size="sm"
        />

        <Button
          size="sm"
          onClick={() => navigate(`/courses/${course.id}`)}
        >
          <Play size={13} />
          ابدأ
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
            className="border-2 border-dashed border-[#EAD8FF]
dark:border-[#2A2A2A] rounded-2xl p-8 text-center cursor-pointer hover:border-[#B348FE] hover:bg-[#F6EEFF]
dark:hover:bg-[#111111] transition-all group"
          >
            <div className="w-14 h-14 bg-[#F6EEFF]
dark:bg-[#1F1F1F] group-hover:bg-[#EEDBFF] rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
              <ChevronRight size={22} className="text-[#B348FE]" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white mb-1">اكتشف كورسات جديدة</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">تصفح جميع الكورسات المتاحة وأضف ما يناسبك</p>
          </div>
        </div>
      </main>
    </div>
  );
}

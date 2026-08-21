import { useNavigate } from "react-router-dom";
import { BookOpen, Play, CheckCircle, Clock, ChevronRight } from "lucide-react";
import StudentLayout from "./StudentLayout";
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
  <StudentLayout>
     
     <>
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
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
{enrolledCourses.map((course: any) => (

<div
  key={course.id}
  className="
    bg-white
    dark:bg-[#111111]
    border
    border-[#EAD8FF]
    dark:border-[#2A2A2A]
    rounded-2xl
    overflow-hidden
    hover:border-[#B348FE]
    hover:shadow-lg
    transition-all
    duration-300
  "
>
  <img
    src={
      course.thumbnail ||
      "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400"
    }
    alt={course.title}
    className="w-full h-44 object-cover"
    onError={(e) => {
      (e.target as HTMLImageElement).src =
        "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400&h=220&fit=crop";
    }}
  />

  <div className="p-4">
    <h3 className="font-black text-gray-900 dark:text-white mb-3 line-clamp-2">
      {course.title}
    </h3>

    <div className="space-y-1.5 mb-4">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <BookOpen size={13} className="text-[#B348FE] flex-shrink-0" />
        <span>{course.grade || "-"}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Clock size={13} className="text-[#B348FE] flex-shrink-0" />
        <span>
          {course.created_at
            ? new Date(course.created_at).toLocaleDateString("ar-EG")
            : "-"}
        </span>
      </div>
    </div>

    <button
      onClick={() => navigate(`/courses/${course.id}`)}
      className="w-full py-2.5 rounded-xl bg-[#B348FE] hover:bg-[#9E2FFF] text-white font-black text-sm transition-colors"
    >
      الدخول للكورس
    </button>
  </div>
</div>
          )
)}
</div>

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
      </>
  </StudentLayout>
);
}

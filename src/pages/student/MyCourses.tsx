import { useNavigate } from "react-router-dom";
import { BookOpen, Play, CheckCircle, Clock, ChevronRight, ArrowLeft } from "lucide-react";
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
      <div className="p-4 sm:p-6 space-y-6">

        {/* Header */}
        <div className="text-right">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            كورساتي
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {enrolledCourses.length} كورس مشترك فيه
          </p>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[340px] rounded-3xl bg-slate-100 dark:bg-[#1a1a1a] animate-pulse"
              />
            ))}
          </div>
        ) : enrolledCourses.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#F6EEFF] dark:bg-[#B348FE]/10 flex items-center justify-center mb-5">
              <BookOpen className="text-[#B348FE]" size={36} />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white">
              لسه مشتركتش في أي كورس
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs">
              تصفح الكورسات المتاحة وابدأ رحلتك التعليمية دلوقتي
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {enrolledCourses.map((course: any) => {
              const progress = course.progress ?? 0;

              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="
                    group
                    cursor-pointer
                    bg-white
                    dark:bg-[#111111]
                    border
                    border-slate-100
                    dark:border-[#262626]
                    rounded-3xl
                    overflow-hidden
                    shadow-[0_4px_20px_rgba(15,23,42,.06)]
                    dark:shadow-[0_4px_20px_rgba(0,0,0,.3)]
                    hover:shadow-[0_20px_45px_rgba(179,72,254,.18)]
                    hover:-translate-y-1.5
                    hover:border-[#EAD8FF]
                    dark:hover:border-[#B348FE]/40
                    transition-all
                    duration-300
                  "
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-44">
                    <img
                      src={
                        course.thumbnail ||
                        "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400"
                      }
                      alt={course.title}
                      className="
                        w-full h-full object-cover
                        transition-transform duration-700
                        group-hover:scale-110
                      "
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400&h=220&fit=crop";
                      }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

                    {/* Grade badge */}
                    {course.grade && (
                      <span
                        className="
                          absolute top-3 right-3
                          bg-white/95 backdrop-blur-sm
                          text-[#B348FE]
                          text-[11px] font-black
                          px-3 py-1.5
                          rounded-full
                          shadow-md
                        "
                      >
                        {course.grade}
                      </span>
                    )}

                    {/* Play icon overlay */}
                    <div
                      className="
                        absolute inset-0
                        flex items-center justify-center
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-300
                      "
                    >
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play className="text-[#B348FE] mr-[-2px]" size={22} fill="currentColor" />
                      </div>
                    </div>

                    {/* Progress bar overlay on image bottom */}
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30">
                        <div
                          className="h-full bg-[#B348FE]"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-black text-slate-900 dark:text-white text-[15px] sm:text-base leading-snug line-clamp-2 min-h-[44px] group-hover:text-[#B348FE] transition-colors">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-3 mt-3 mb-4 text-xs text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#B348FE]" />
                        <span>
                          {course.created_at
                            ? new Date(course.created_at).toLocaleDateString("ar-EG", {
                                day: "numeric",
                                month: "short",
                              })
                            : "-"}
                        </span>
                      </div>

                      {progress > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <div className="flex items-center gap-1.5">
                            <CheckCircle size={13} className="text-emerald-500" />
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {progress}% مكتمل
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/${course.id}`);
                      }}
                      className="
                        w-full
                        py-3
                        rounded-2xl
                        bg-gradient-to-l
                        from-[#B348FE]
                        to-[#9E2FFF]
                        hover:shadow-[0_8px_20px_rgba(179,72,254,.35)]
                        text-white
                        font-black
                        text-sm
                        flex items-center justify-center gap-2
                        transition-all
                        duration-300
                        hover:scale-[1.02]
                      "
                    >
                      {progress > 0 ? "متابعة الكورس" : "بدء الكورس"}
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  </StudentLayout>
);
}
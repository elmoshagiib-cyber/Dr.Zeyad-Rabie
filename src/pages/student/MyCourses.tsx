import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, ChevronDown, ChevronUp, Play } from "lucide-react";
import StudentLayout from "./StudentLayout";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { HiOutlineCalendarDays, HiOutlineFolder } from "react-icons/hi2";

export function MyCoursesPage() {
  const navigate = useNavigate();
  const { user } = useApp();

  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      .select(`
        *,
        course_sections(
          *,
          course_items(*)
        )
      `)
      .in("id", ids);

    setEnrolledCourses(courses || []);
    setLoading(false);
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <StudentLayout>
      <>
        <div className="p-4 sm:p-6 space-y-6 bg-white min-h-screen">

          {/* Header */}
          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              كورساتي
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {enrolledCourses.length} كورس مشترك فيه
            </p>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[420px] rounded-3xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-[#F6EEFF] flex items-center justify-center mb-5">
                <BookOpen className="text-[#B348FE]" size={36} />
              </div>
              <h3 className="text-lg font-black text-slate-800">
                لسه مشتركتش في أي كورس
              </h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">
                تصفح الكورسات المتاحة وابدأ رحلتك التعليمية دلوقتي
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {enrolledCourses.map((course: any) => {
                const sections = course.course_sections || [];
                const lectures = sections.reduce(
                  (sum: number, section: any) =>
                    sum +
                    (section.course_items?.filter((i: any) => i.type === "video").length || 0),
                  0
                );

                const isExpanded = expandedId === course.id;
                const description: string = course.description || "";
                const isLongDescription = description.length > 90;

                return (
                  <div
                    key={course.id}
                    className="
                      bg-white
                      border
                      border-[#EAD8FF]
                      rounded-[26px]
                      overflow-hidden
                      shadow-[0_4px_20px_rgba(15,23,42,.06)]
                      hover:shadow-[0_18px_40px_rgba(179,72,254,.15)]
                      transition-all
                      duration-300
                    "
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      <img
                        src={
                          course.thumbnail ||
                          "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=600"
                        }
                        alt={course.title}
                        className="w-full h-44 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=600&h=250&fit=crop";
                        }}
                      />

                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-colors" />

                      {/* عدد المحاضرات */}
                      <span
                        className="
                          absolute top-3 right-3
                          bg-black/60 backdrop-blur-sm
                          text-white
                          text-[11px] font-bold
                          px-2.5 py-1
                          rounded-lg
                          flex items-center gap-1
                        "
                      >
                        {lectures} محاضرة
                      </span>

                      {/* زرار تشغيل */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
                          <Play className="text-[#B348FE] mr-[-2px]" size={18} fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      <h3
                        className="
                          font-black text-slate-900
                          text-[16px] sm:text-[18px] leading-snug
                          cursor-pointer hover:text-[#B348FE] transition-colors
                          mb-2
                        "
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        🎓 {course.title}
                      </h3>

                      {/* الوصف مع عرض تفاصيل / أقل */}
                      {description && (
                        <div className="mb-3">
                          <p
                            className={`
                              text-[13px] sm:text-sm leading-6
                              text-slate-500
                              whitespace-pre-line
                              ${!isExpanded && isLongDescription ? "line-clamp-3" : ""}
                            `}
                          >
                            {description}
                          </p>

                          {isLongDescription && (
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : course.id)
                              }
                              className="
                                mt-1 inline-flex items-center gap-1
                                text-[13px] font-bold text-[#B348FE]
                                hover:text-[#9E2FFF]
                                transition-colors
                              "
                            >
                              {isExpanded ? (
                                <>
                                  أقل <ChevronUp size={14} />
                                </>
                              ) : (
                                <>
                                  عرض تفاصيل <ChevronDown size={14} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* التواريخ */}
                      <div className="flex flex-col gap-1.5 mb-4">
                        <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400">
                          <span>{formatDate(course.created_at)}</span>
                          <HiOutlineCalendarDays size={15} />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400">
                          <span>{formatDate(course.updated_at || course.created_at)}</span>
                          <HiOutlineFolder size={15} />
                        </div>
                      </div>

                      {/* زرار الدخول */}
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="
                          w-full
                          py-3
                          rounded-2xl
                          bg-[#B348FE]
                          hover:bg-[#9E2FFF]
                          text-white
                          font-black
                          text-sm
                          transition-colors
                          duration-300
                        "
                      >
                        الدخول للكورس
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
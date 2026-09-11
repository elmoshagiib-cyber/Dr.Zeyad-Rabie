import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, ChevronDown, ChevronUp, Play } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";
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
        <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B]">

          {/* Header */}
          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              كورساتي
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
              {enrolledCourses.length} كورس مشترك فيه
            </p>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[420px] rounded-3xl bg-slate-100 dark:bg-[#1A1A1A] animate-pulse"
                />
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center mb-5">
                <BookOpen className="text-[#B348FE]" size={36} />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                لسه مشتركتش في أي كورس
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-2 max-w-xs">
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
                      group
                      bg-white
                      dark:bg-[#151515]
                      border
                      border-gray-200
                      dark:border-[#262626]
                      shadow-[0_4px_20px_rgba(0,0,0,.06)]
                      hover:shadow-[0_10px_35px_rgba(0,0,0,.1)]
                      rounded-[26px]
                      overflow-hidden
                      cursor-pointer
                      transition-all
                      duration-300
                    "
                  >
                    {/* Thumbnail */}
                    <div className="p-3 sm:p-3.5 pb-0">
                      <div
                        className="relative aspect-[1000/563] overflow-hidden rounded-2xl"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        <img
                          src={
                            course.thumbnail ||
                            "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=600"
                          }
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=600&h=250&fit=crop";
                          }}
                        />

                        {/* عدد المحاضرات */}
                        <span
                          className="
                            absolute top-3 left-3
                            bg-black/70 backdrop-blur-sm
                            text-white
                            text-xs font-semibold
                            px-2.5 py-1
                            rounded-full
                          "
                        >
                          {lectures} محاضرة
                        </span>

                        <div className="
                          absolute inset-0 opacity-0 group-hover:opacity-100
                          transition-opacity duration-700
                          bg-gradient-to-r from-transparent via-white/15 to-transparent
                          -translate-x-full group-hover:translate-x-full
                          transition-transform duration-500
                        " />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 lg:p-6 flex flex-col gap-3">
                      <h3
                        className="
                          text-[21px] sm:text-[24px] leading-tight
                          font-black text-slate-900 dark:text-white
                          line-clamp-2
                          group-hover:text-[#5800a9] dark:group-hover:text-[#b600d7]
                          transition-colors duration-300
                          cursor-pointer
                        "
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        {course.title}
                      </h3>

                      {/* الوصف مع عرض تفاصيل / أقل */}
                      {description && (
                        <div>
                          <p
                            className={`
                              text-sm sm:text-base leading-7 sm:leading-8
                              text-slate-500 dark:text-slate-300
                              whitespace-pre-line break-words
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
                                mt-2 inline-flex items-center gap-1
                                text-[13px] sm:text-sm font-bold text-[#5800a9]
                                dark:text-[#c9a6ff]
                                hover:text-[#b600d7]
                                dark:hover:text-[#b600d7]
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

                      <div className="border-t border-slate-200 dark:border-[#262626] pt-5">
                        <button
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="
                            w-full h-12
                            rounded-xl
                            font-black text-[15px]
                            text-white
                            bg-[#b600d7]
                            border-2 border-[#b600d7]
                            hover:bg-transparent
                            hover:text-[#b600d7]
                            !shadow-none
                            cursor-pointer
                            transition-all duration-300
                          "
                        >
                          الدخول للكورس
                        </button>
                      </div>

                      {/* بادچ الاشتراك + التواريخ */}
                      <div className="mt-2 pt-5 border-t border-gray-200 dark:border-[#262626]">
                        <div className="flex items-end justify-between gap-6">
                          <span
                            className="
                              flex items-center gap-1.5
                              bg-emerald-50 dark:bg-emerald-500/10
                              text-emerald-600 dark:text-emerald-400
                              rounded-md px-4 py-[6px]
                              text-[13px] font-black
                              whitespace-nowrap
                              cursor-default select-none
                              shrink-0
                            "
                          >
                            <svg
                              className="w-4 h-4 shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            مشترك
                          </span>

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <span className="text-[13px] font-medium">
                                {formatDate(course.updated_at || course.created_at)}
                              </span>
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700">
                                <HiOutlineFolder className="text-[13px]" />
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <span className="text-[13px] font-medium">
                                {formatDate(course.created_at)}
                              </span>
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700">
                                <HiOutlineCalendarDays className="text-[13px]" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
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
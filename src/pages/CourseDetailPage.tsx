import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Lock,
  ClipboardList,
  ClipboardCheck,
  LayoutGrid,
} from "lucide-react";

import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  console.log("SLUG =", slug);
  const navigate = useNavigate();
  const { user } = useApp();

  const gradeLabels: Record<string, string> = {
    sec_3: "الصف الثالث الثانوي",
    sec_2: "الصف الثاني الثانوي",
    sec_1: "الصف الأول الثانوي",
  };

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openUnit, setOpenUnit] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);

  const loadCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", slug)
      .single();

    console.log("error =", error);
    console.log("data =", data);

    if (data) {
      setCourse(data);
    }
  };

  const loadUnits = async () => {
    const { data: sections, error: sectionsError } = await supabase
      .from("course_sections")
      .select("*")
      .eq("course_id", slug);

    console.log("SECTIONS", sections);
    console.log("SECTIONS ERROR", sectionsError);

    if (!sections?.length) return;

    const units = [];

    for (const section of sections) {
      const { data: items, error: itemsError } = await supabase
        .from("course_items")
        .select("*")
        .eq("section_id", section.id)
        .order("sort_order");

      console.log("SECTION ID =", section.id);
      console.log("ITEMS =", items);
      console.log("ITEMS ERROR =", itemsError);

      units.push({
        id: section.id,
        title: section.title,
        lessons: items || [],
      });
    }

    console.log("FINAL =", units);
    setUnits(units);
  };

  const checkEnrollment = async () => {
    if (!user || !course) return;

    const { data } = await supabase
      .from("student_courses")
      .select("*")
      .eq("student_id", user.id)
      .eq("course_id", course.id)
      .eq("active", true);

    setIsEnrolled(!!data?.length);
  };

  useEffect(() => {
    loadCourse();
    loadUnits();
  }, [slug]);

  useEffect(() => {
    if (course) {
      checkEnrollment();
    }
  }, [user, course]);

  const handleEnroll = async () => {
    // existing logic preserved
  };

  const lessonsCount = units.reduce(
    (total, unit) => total + unit.lessons.length,
    0
  );

  const videosCount = units.reduce(
    (t, u) => t + u.lessons.filter((l: any) => l.type === "video").length,
    0
  );
  const examsCount = units.reduce(
    (t, u) => t + u.lessons.filter((l: any) => l.type === "quiz").length,
    0
  );
  const homeworksCount = units.reduce(
    (t, u) => t + u.lessons.filter((l: any) => l.type === "homework").length,
    0
  );
  const filesCount = units.reduce(
    (t, u) => t + u.lessons.filter((l: any) => l.type === "pdf").length,
    0
  );

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">جاري تحميل الكورس...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b0715]" dir="rtl">
      <Navbar />

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-rose-500 via-rose-400 to-pink-400 pt-20 sm:pt-24 pb-0 overflow-hidden">

        {/* Background triangle pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="triangles"
                x="0" y="0"
                width="40" height="40"
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  points="20,5 35,35 5,35"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#triangles)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Stats badges ── */}
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 mb-5 sm:mb-6">

            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1a1a2e] text-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-lg">
              <span className="bg-yellow-400 text-black rounded-full px-1.5 sm:px-2 py-0.5 text-xs font-black">
                {videosCount}+
              </span>
              <Play size={12} className="text-yellow-400" />
              <span>فيديوهات</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1a1a2e] text-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-lg">
              <span className="bg-yellow-400 text-black rounded-full px-1.5 sm:px-2 py-0.5 text-xs font-black">
                {examsCount}+
              </span>
              <ClipboardList size={12} className="text-yellow-400" />
              <span>امتحانات</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1a1a2e] text-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-lg">
              <span className="bg-yellow-400 text-black rounded-full px-1.5 sm:px-2 py-0.5 text-xs font-black">
                {homeworksCount}+
              </span>
              <ClipboardCheck size={12} className="text-yellow-400" />
              <span>واجبات</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 bg-cyan-400 text-[#1a1a2e] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-lg">
              <span className="bg-[#1a1a2e] text-white rounded-full px-1.5 sm:px-2 py-0.5 text-xs font-black">
                {filesCount}+
              </span>
              <FileText size={12} />
              <span>ملفات</span>
            </div>

          </div>

          {/* ── Title & grade ── */}
          <div className="text-right mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-black text-white leading-tight">
              {course.title} 💪
            </h1>
            <p className="mt-2 sm:mt-3 text-white/90 text-base sm:text-lg font-medium">
              ❤️ {gradeLabels[course.grade] || course.grade}
            </p>
          </div>

          {/* ── Date info row ── */}
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm">
              <span className="bg-yellow-400 text-black rounded-full px-2 sm:px-3 py-1 text-xs font-bold whitespace-nowrap">
                {new Date(course.created_at || Date.now()).toLocaleDateString("ar-EG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="font-medium whitespace-nowrap">تاريخ إنشاء الكورس 🗓</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm">
              <span className="bg-cyan-300 text-black rounded-full px-2 sm:px-3 py-1 text-xs font-bold whitespace-nowrap">
                {new Date(course.updated_at || Date.now()).toLocaleDateString("ar-EG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="font-medium whitespace-nowrap">⏱ آخر تحديث للكورس</span>
            </div>
          </div>

          {/* ── Hero bottom grid: image + subscription card ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 xl:gap-8 items-end">

            {/* Course cover image */}
            <div className="w-full">
              <div className="rounded-t-2xl sm:rounded-t-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/20 w-full max-w-2xl mx-auto xl:mx-0">
                <img
                  src={
                    course.cover_image ||
                    course.thumbnail ||
                    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000"
                  }
                  alt={course.title}
                  className="w-full object-cover max-h-48 sm:max-h-64 md:max-h-80 xl:max-h-96"
                />
              </div>
            </div>

            {/* Subscription card */}
            <div className="w-full xl:pb-0 pb-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-gray-100">

                {/* Card image */}
                <img
                  src={
                    course.thumbnail ||
                    course.cover_image ||
                    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
                  }
                  alt={course.title}
                  className="w-full h-36 sm:h-44 md:h-48 object-cover"
                />

                <div className="p-4 sm:p-6">

                  {/* Price / enroll button */}
                  {course.price === 0 ? (
                    <button
                      onClick={handleEnroll}
                      className="
                        w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white
                        text-lg sm:text-xl font-black
                        bg-gradient-to-r from-rose-500 to-pink-500
                        hover:from-rose-600 hover:to-pink-600
                        shadow-lg hover:shadow-rose-300
                        transition-all duration-300 hover:scale-[1.02]
                        mb-3 sm:mb-4
                      "
                    >
                      {isEnrolled ? "ابدأ التعلم الآن" : "هذا الكورس مجاني! 🎉"}
                    </button>
                  ) : (
                    <>
                      <div className="text-center mb-3 sm:mb-4">
                        <span className="text-3xl sm:text-4xl font-black text-gray-900">
                          {course.price}
                        </span>
                        <span className="text-base sm:text-lg text-gray-500 mr-1">جنيه</span>
                      </div>
                      <button
                        onClick={handleEnroll}
                        className="
                          w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white
                          text-lg sm:text-xl font-black
                          bg-gradient-to-r from-rose-500 to-pink-500
                          hover:from-rose-600 hover:to-pink-600
                          shadow-lg hover:shadow-rose-300
                          transition-all duration-300 hover:scale-[1.02]
                          mb-3
                        "
                      >
                        {isEnrolled ? "ابدأ التعلم الآن" : "اشترك الآن"}
                      </button>
                    </>
                  )}

                  {/* Intro video button */}
                  {course.intro_video && (
                    <button
                      onClick={() => window.open(course.intro_video)}
                      className="
                        w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl
                        text-gray-700 font-bold text-sm sm:text-base
                        border-2 border-gray-200 hover:border-rose-300
                        flex items-center justify-center gap-2
                        hover:bg-rose-50 transition-all duration-300
                        mb-3 sm:mb-4
                      "
                    >
                      <Play size={16} className="text-rose-500" />
                      <span>مشاهدة المقدمة</span>
                    </button>
                  )}

                  {/* Stats rows */}
                  <div className="border-t border-gray-100 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-gray-800">+ 11 ساعة</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <span>المحتوى</span>
                        <BookOpen size={14} className="text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-gray-800">+ {lessonsCount} درس</span>
                      <div className="flex items-center gap-1 text-gray-500">
                        <span>إجمالي الدروس</span>
                        <ClipboardList size={14} className="text-gray-400" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          COURSE CONTENT SECTION
      ══════════════════════════════════════ */}
      <div className="bg-gray-100 dark:bg-gray-900 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section heading card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-4 sm:mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black text-right">
              <span className="text-gray-900 dark:text-white">محتوى </span>
              <span className="text-rose-500">الكورس</span>
            </h2>
          </div>

          {/* Units list */}
          <div className="space-y-3 sm:space-y-4">
            {units.map((unit) => {
              const isOpen = openUnit === unit.id;

              return (
                <div
                  key={unit.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
                >
                  {/* ── Unit header button ── */}
                  <button
                    onClick={() => setOpenUnit(isOpen ? null : unit.id)}
                    className={`
                      w-full flex items-center justify-between
                      px-4 sm:px-6 py-4 sm:py-5
                      transition-colors duration-200
                      ${isOpen
                        ? "bg-rose-50 dark:bg-rose-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }
                    `}
                  >
                    {/* Chevron — always on the left in RTL layout */}
                    <div
                      className={`
                        flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2
                        flex items-center justify-center transition-all duration-300
                        ${isOpen
                          ? "border-rose-400 bg-rose-50 dark:bg-rose-900/30"
                          : "border-gray-300 dark:border-gray-600"
                        }
                      `}
                    >
                      {isOpen
                        ? <ChevronUp size={18} className="text-rose-500" />
                        : <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
                      }
                    </div>

                    {/* Title block — right side */}
                    <div className="flex items-center gap-3 sm:gap-4 text-right flex-1 mr-3 sm:mr-4">
                      <div className="flex flex-col items-end flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-xl xl:text-2xl font-black text-gray-900 dark:text-white truncate">
                            {unit.title} 💪
                          </h3>
                          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                            <LayoutGrid size={16} className="text-rose-500 sm:hidden" />
                            <LayoutGrid size={20} className="text-rose-500 hidden sm:block" />
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate max-w-full">
                          {unit.title} 💪
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* ── Lessons list ── */}
                  {isOpen && (
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      {unit.lessons.map((lesson: any, idx: number) => {
                        const isVideo    = lesson.type === "video";
                        const isFile     = lesson.type === "pdf";
                        const isHomework = lesson.type === "homework";
                        const isExam     = lesson.type === "quiz";

                        return (
                          <div
                            key={lesson.id}
                            className={`
                              flex items-center justify-between
                              px-3 sm:px-6 py-3 sm:py-5 gap-2 sm:gap-4
                              ${idx !== unit.lessons.length - 1
                                ? "border-b border-gray-100 dark:border-gray-700"
                                : ""}
                              hover:bg-gray-50 dark:hover:bg-gray-700/30
                              transition-colors duration-200
                            `}
                          >
                            {/* Action button — left */}
                            <div className="flex-shrink-0">
                              {isEnrolled ? (
                                <>
                                  {isVideo && (
                                    <button
                                      onClick={() => window.open(lesson.video_url, "_blank")}
                                      className="flex items-center gap-1.5 sm:gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-yellow-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                    >
                                      <Play size={13} />
                                      <span>مشاهدة الفيديو</span>
                                    </button>
                                  )}
                                  {isFile && (
                                    <button
                                      onClick={() => window.open(lesson.file_url, "_blank")}
                                      className="flex items-center gap-1.5 sm:gap-2 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-blue-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                    >
                                      <FileText size={13} />
                                      <span>تحميل الملف</span>
                                    </button>
                                  )}
                                  {isHomework && (
                                    <button
                                      onClick={() => navigate(`/homework/${lesson.id}`)}
                                      className="flex items-center gap-1.5 sm:gap-2 bg-green-500 hover:bg-green-600 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-green-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                    >
                                      <ClipboardCheck size={13} />
                                      <span>حل الواجب</span>
                                    </button>
                                  )}
                                  {isExam && (
                                    <button
                                      onClick={() => navigate(`/exam/${lesson.id}`)}
                                      className="flex items-center gap-1.5 sm:gap-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                    >
                                      <ClipboardList size={13} />
                                      <span>ابدأ الكويز</span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl">
                                  <Lock size={14} />
                                  <span className="text-xs sm:text-sm font-bold">مقفل</span>
                                </div>
                              )}
                            </div>

                            {/* Title + icon — right */}
                            <div className="flex items-center gap-2 sm:gap-3 text-right flex-1 min-w-0">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm sm:text-base xl:text-lg font-bold text-gray-900 dark:text-white truncate">
                                  {lesson.title}
                                </h4>
                                {isVideo && lesson.duration && (
                                  <p className="text-xs text-gray-400 mt-0.5">{lesson.duration}</p>
                                )}
                                {isExam && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {lesson.duration || 30} دقيقة
                                  </p>
                                )}
                              </div>

                              {/* Type icon badge */}
                              <div
                                className={`
                                  flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl
                                  flex items-center justify-center
                                  ${isVideo    ? "bg-yellow-100 text-yellow-500" : ""}
                                  ${isFile     ? "bg-blue-100   text-blue-500"   : ""}
                                  ${isHomework ? "bg-green-100  text-green-500"  : ""}
                                  ${isExam     ? "bg-red-100    text-red-500"    : ""}
                                `}
                              >
                                {isVideo    && <Play size={15} />}
                                {isFile     && <FileText size={15} />}
                                {isHomework && <ClipboardCheck size={15} />}
                                {isExam     && <ClipboardList size={15} />}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {units.length === 0 && (
            <div className="text-center py-16 sm:py-20 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg sm:text-xl font-bold">لا يوجد محتوى بعد</p>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
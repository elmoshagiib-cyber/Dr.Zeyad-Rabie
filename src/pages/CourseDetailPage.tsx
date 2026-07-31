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
import {
  HiOutlineCalendarDays,
  HiOutlineFolder,
} from "react-icons/hi2";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { FaWhatsapp } from "react-icons/fa";

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
const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const [subscriptionCode, setSubscriptionCode] = useState("");

  const loadCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", slug)
      .single();

    console.log(error);
    console.log(error?.message);
    console.log(error?.details);
    console.log(error?.hint);
    console.log(error?.code);
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

  // ✅ Always resolves the numeric student id from auth_id
const getStudentId = (): number | null => {
  if (!user) return null;

  return Number(user.id);
};

  // ✅ Fixed: uses getStudentId() instead of Number(user.id)
  const checkEnrollment = async () => {
    if (!user || !course) return;

    const studentId = getStudentId();

    if (!studentId) {
      console.warn("checkEnrollment: studentId is null, skipping");
      return;
    }

    console.log("checkEnrollment → studentId:", studentId, "course.id:", course.id);

const { data, error } = await supabase
  .from("student_courses")
  .select("*")
  .eq("student_id", studentId)
  .eq("course_id", course.id)
  .eq("active", true);

console.log("CHECK DATA =", data);
console.log("CHECK ERROR =", error);
console.log("COURSE ID =", course.id);
console.log("STUDENT ID =", studentId);

setIsEnrolled((data?.length ?? 0) > 0);
console.log("IS ENROLLED SHOULD BE =", (data?.length ?? 0) > 0);
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

  // ✅ Fixed: checks existing enrollment before insert to avoid duplicates
  const handleEnroll = async () => {


    if (!user) {
      navigate("/login");
      return;
    }

    if (!course) return;

    if (course.is_free) {
      const studentId = getStudentId();

      if (!studentId) {
        console.error("handleEnroll: could not resolve studentId");
        return;
      }

      // Check if already enrolled before inserting
      const { data: existing } = await supabase
        .from("student_courses")
        .select("id")
        .eq("student_id", studentId)
        .eq("course_id", course.id)
        .eq("active", true)
        .maybeSingle();

      if (existing) {
        console.log("Already enrolled, skipping insert");
        setIsEnrolled(true);
        return;
      }

      const { data, error } = await supabase
  .from("student_courses")
  .insert({
    student_id: studentId,
    course_id: course.id,
    active: true,
    subscription_type: "مجاني",
  })
  .select();

console.log("INSERT DATA =", data);
console.log("INSERT ERROR =", error);
      console.log("INSERT DATA =", data);
      console.log("INSERT ERROR =", error);
      console.log("ERROR CODE =", error?.code);
      console.log("ERROR MESSAGE =", error?.message);
      console.log("ERROR DETAILS =", error?.details);
      console.log("ERROR HINT =", error?.hint);

      if (error && error.code !== "23505") {
        console.error("Insert failed:", error);
        return;
      }

      setIsEnrolled(true);
      return;
    }

    setShowSubscriptionModal(true);
return;
  };

  const lessonsCount = units.reduce(
    (total, unit) => total + unit.lessons.length,
    0
  );

  const activateSubscription = async () => {
  if (!course) return;

  const { data, error } = await supabase
    .from("subscription_codes")
    .select("*")
    .eq("code", subscriptionCode)
    .single();

  if (error || !data) {
    alert("كود الاشتراك غير صحيح");
    return;
  }

  if (data.status !== "active") {
    alert("هذا الكود غير صالح أو تم استخدامه");
    return;
  }

  if (data.course_id !== course.id) {
    alert("هذا الكود لا يخص هذا الكورس");
    return;
  }

  const studentId = getStudentId();

  if (!studentId) {
    alert("يجب تسجيل الدخول أولاً");
    return;
  }

  const { data: existingSubscription } = await supabase
    .from("student_courses")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", course.id)
    .eq("active", true)
    .maybeSingle();

  if (existingSubscription) {
    alert("أنت مشترك بالفعل في هذا الكورس.");
    return;
  }

  const { error: enrollError } = await supabase
    .from("student_courses")
    .insert({
      student_id: studentId,
      course_id: course.id,
      active: true,
      subscription_type: "كود اشتراك",
      expires_at: new Date(
        Date.now() + data.duration_days * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

  if (enrollError) {
    alert("حدث خطأ أثناء إضافة الاشتراك");
    return;
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + data.duration_days);

  const { error: codeError } = await supabase
    .from("subscription_codes")
    .update({
      status: "used",
      student_id: studentId,
      used_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", data.id);

  if (codeError) {
    alert("تم الاشتراك لكن حدث خطأ أثناء تحديث الكود");
    return;
  }

  setIsEnrolled(true);
  setShowSubscriptionModal(false);
  setSubscriptionCode("");

  alert("تم تفعيل الاشتراك بنجاح ✅");
};

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0715]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            جاري تحميل الكورس...
          </p>
        </div>
      </div>
    );
  }



  const formatDate = (date: string) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B]" dir="rtl">
      <Navbar />

 {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
<div
  className="
    relative
    overflow-hidden
    pt-32
    lg:pt-32
    pb-56
  "
>

  {/* Hero Background */}
  <img
    src={
      course.thumbnail ||
      course.cover_image ||
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600"
    }
    alt={course.title}
    className="
      absolute
      inset-0
      w-full
      h-full
      object-cover
      object-center
      select-none
      pointer-events-none
    "
  />

  {/* Dark Overlay */}
  <div
    className="
      absolute
      inset-0
      bg-black/65
    "
  />

{/* Dark Overlay */}
<div
  className="
    absolute
    inset-0
    bg-black/55
  "
/>


       

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start">

{/* ── Stats badges ── */}
<div className="flex flex-wrap justify-start gap-3 mb-8">

  {[
    {
      label: "فيديوهات",
      value: videosCount,
      icon: <Play size={14} />,
    },
    {
      label: "امتحانات",
      value: examsCount,
      icon: <ClipboardList size={14} />,
    },
    {
      label: "واجبات",
      value: homeworksCount,
      icon: <ClipboardCheck size={14} />,
    },
    {
      label: "ملفات",
      value: filesCount,
      icon: <FileText size={14} />,
    },
  ].map((item) => (
    <div
      key={item.label}
      className="
        flex
        items-center
        gap-2
        rounded-full
        bg-white/10
        backdrop-blur-md
        border
        border-white/10
        px-4
        py-2
        text-white
        shadow-lg
      "
    >
      <span className="text-sm font-bold">
        {item.label}
      </span>

      <span className="text-[#FFD54A]">
        {item.icon}
      </span>

      <span
        className="
          rounded-full
          bg-[#B348FE]
          text-white
          px-2.5
          py-1
          text-[11px]
          font-black
        "
      >
        +{item.value}
      </span>
    </div>
  ))}

</div>

{/* ── Title & grade ── */}
<div className="text-left mb-7">

<h1
  className="
text-[2rem]
sm:text-[2.8rem]
lg:text-[3.8rem]
xl:text-[4.5rem]

font-extrabold
      leading-[1]
      tracking-tight
      text-white
      drop-shadow-[0_6px_20px_rgba(0,0,0,.35)]
    "
  >
    {course.title}
  </h1>

  <p
    className="
      mt-6
      text-lg
      sm:text-xl
      font-bold
      text-right
      text-white
    "
  >
    {gradeLabels[course.grade] || course.grade}
  </p>

</div>

{/* ── Dates ── */}
<div className="flex flex-wrap justify-start gap-5">

  <div className="flex items-center gap-3">

    <span className="text-white font-bold">
      تاريخ الإنشاء
    </span>

    <span
      className="
        rounded-full
        bg-[#B348FE]
        text-white
        px-4
        py-1.5
        text-sm
        font-black
      "
    >
      {new Date(course.created_at || Date.now()).toLocaleDateString(
        "ar-EG",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )}
    </span>

  </div>

  <div className="flex items-center gap-3">

    <span className="text-white font-bold">
      آخر تحديث
    </span>

    <span
      className="
        rounded-full
        bg-white/15
        backdrop-blur-md
        text-white
        border
        border-white/15
        px-4
        py-1.5
        text-sm
        font-black
      "
    >
      {new Date(course.updated_at || Date.now()).toLocaleDateString(
        "ar-EG",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )}
    </span>

  </div>

</div>


          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          OVERLAP AREA: Course Image + Subscription Card
      ══════════════════════════════════════ */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-8 lg:px-10 -mt-56">
        <div className="flex justify-between items-start">

          {/* Subscription Card */}
          <div className="max-w-[430px] w-full ml-0 mr-auto">
            <div className="bg-white dark:bg-[#151515] rounded-2xl sm:rounded-3xl overflow-hidden
            shadow-[0_20px_60px_rgba(15,23,42,.12)]
dark:shadow-[0_25px_70px_rgba(0,0,0,.75)]
 border border-gray-100 dark:border-[#2A2A2A]">

              {/* Card image */}
              <img
                src={
                  course.thumbnail ||
                  course.cover_image ||
                  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
                }
                alt={course.title}
                className="w-full h-[240px] sm:h-[270px] object-cover"
              />

              <div className="p-6 bg-white dark:bg-[#1A1A1A]">

{/* Price / enroll button */}
{course.is_free ? (
  <button
    onClick={() => {
      alert("BUTTON CLICKED");
      console.log("BUTTON CLICKED");
      handleEnroll();
    }}
    className="
      w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white
      text-lg sm:text-xl font-black
bg-[#B348FE]
hover:bg-[#9E2FFF]
shadow-lg hover:shadow-[0_12px_35px_rgba(179,72,254,.35)]
      transition-all duration-300 hover:scale-[1.015]
      mb-3 sm:mb-4
    "
  >
    {isEnrolled ? "الدخول للكورس 🎉" : "اشترك مجانًا"}
  </button>
) : (
  <>
    {isEnrolled ? (
      <div className="text-center mb-4">
        
      </div>
    ) : (
      <div className="text-center mb-3 sm:mb-4">
        <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
          {course.price}
        </span>
        <span className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mr-1">
          جنيه
        </span>
      </div>
    )}

   <button
  onClick={() => {
    if (isEnrolled) {
      const firstLesson = units[0]?.lessons[0];

      if (firstLesson?.video_url) {
        window.open(firstLesson.video_url, "_blank");
      }

      return;
    }

    handleEnroll();
  }}
  className="
    w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white
    text-lg sm:text-xl font-black
    bg-[#B348FE]
hover:bg-[#9E2FFF]
shadow-lg hover:shadow-[0_12px_35px_rgba(179,72,254,.35)]
    transition-all duration-300 hover:scale-[1.015]
    mb-3
  "
>
  {isEnrolled ? "مشترك" : "اشترك الآن"}
</button>

  </>
)}

                {/* Intro video button */}
                {course.intro_video && (
                  <button
                    onClick={() => window.open(course.intro_video)}
                    className="
                      w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl
                      text-gray-700 dark:text-gray-200 font-bold text-sm sm:text-base
                      border-2 border-gray-200 dark:border-gray-600 hover:border-rose-300
                      flex items-center justify-center gap-2
                      hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300
                      mb-3 sm:mb-4
                    "
                  >
                    <Play size={16} className="text-[#B348FE]" />
                    <span>مشاهدة المقدمة</span>
                  </button>
                )}





              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════
          COURSE CONTENT SECTION
      ══════════════════════════════════════ */}
      <div className="bg-white dark:bg-[#09090B] pt-10 pb-8 sm:pt-14 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section heading card */}
          <div className="bg-[#FCFCFD] dark:bg-[#111111] rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-4 sm:mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black text-right">
              <span className="text-gray-900 dark:text-white">محتوى </span>
              <span className="text-[#B348FE] dark:text-[#B348FE]">
  الكورس
</span>
            </h2>
          </div>

          {/* Units list */}
          <div className="space-y-3 sm:space-y-4">
            {units.map((unit) => {
              const isOpen = openUnit === unit.id;

              return (
                <div
                  key={unit.id}
                  className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
                >
                  {/* ── Unit header button ── */}
<button
  onClick={() => setOpenUnit(isOpen ? null : unit.id)}
className={`
    group
    w-full
    flex
    flex-row-reverse
    items-center
    justify-between
    px-4 sm:px-6
    py-4 sm:py-5
transition-all
duration-300
group-hover:scale-110
    hover:scale-[1.01]

    ${
      isOpen
        ? "bg-[#F6EEFF] dark:bg-[#2B103D]"
        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
    }
  `}
>

  {/* السهم - شمال */}
  <div
className={`
group
relative
overflow-hidden
w-full
flex
flex-row-reverse
items-center
justify-between
px-4
sm:px-6
py-4
sm:py-5
transition-all
duration-300
${
isOpen
? "bg-[#F6EEFF] dark:bg-[#2B103D]"
: "hover:bg-[#FAF7FF] dark:hover:bg-[#18181B]"
}
`}
  >
    <ChevronDown
  size={18}
  className={`
    transition-all
    duration-300
    ${isOpen ? "rotate-180 text-[#B348FE]" : "rotate-0 text-gray-500 dark:text-gray-400"}
  `}
/>
  </div>

  {/* العنوان - يمين */}
<div className="flex flex-row-reverse items-center justify-start gap-3">

  <h3
    className="
      text-base
      sm:text-xl
      xl:text-2xl
      font-black
      text-gray-900
dark:text-white
group-hover:text-[#B348FE]
transition-all
duration-300
ease-out
truncate
    "
  >
{unit.title}
  </h3>

  <div
    className="
      flex-shrink-0
      w-8
      h-8
      sm:w-10
      sm:h-10
      rounded-xl
      bg-[#F6EEFF]
      dark:bg-[#2B103D]
      flex
      items-center
      justify-center
    "
  >
    <LayoutGrid
      size={16}
      className="sm:hidden text-[#B348FE]"
    />

    <LayoutGrid
      size={20}
      className="hidden sm:block text-[#B348FE]"
    />
  </div>

</div>

</button>
                  {/* ── Lessons list ── */}
                  {isOpen && (
                    <div className="border-t border-slate-200 dark:border-[#262626]">
                      {unit.lessons.map((lesson: any, idx: number) => {
                        const isVideo = lesson.type === "video";
                        const isFile = lesson.type === "pdf";
                        const isHomework = lesson.type === "homework";
                        const isExam = lesson.type === "quiz";

                        return (
                          <div
                            key={lesson.id}
                            className={`
                              flex flex-row-reverse items-center justify-between
                              px-3 sm:px-6 py-3 sm:py-5 gap-2 sm:gap-4
                              ${
                                idx !== unit.lessons.length - 1
                                  ? "border-b border-gray-100 dark:border-gray-700"
                                  : ""
                              }
hover:bg-[#FAF7FF]
dark:hover:bg-[#171717]
transition-all
duration-300
hover:pr-8
                            `}
                          >
                 {/* Action button — على اليسار */}
<div className="flex-shrink-0">
  {isEnrolled ? (
    <>
      {isVideo && (
        <button
        onClick={() => {
  console.log("LESSON =", lesson);
  console.log("URL =", lesson.url);

  if (!lesson.url) {
    alert("الرابط غير موجود");
    return;
  }

            window.open(lesson.url, "_blank", "noopener,noreferrer");
          }}
          className="flex items-center gap-1.5 sm:gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-yellow-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
        >
          <Play size={13} />
          <span>مشاهدة الفيديو</span>
        </button>
      )}

      {isFile && (
        <button
          onClick={() => {
            if (!lesson.url) {
              alert("رابط الملف غير موجود");
              return;
            }

            window.open(lesson.url, "_blank", "noopener,noreferrer");
          }}
          className="flex items-center gap-1.5 sm:gap-2 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-blue-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
        >
          <FileText size={13} />
          <span>تحميل الملف</span>
        </button>
      )}

      {isHomework && (
        <button
          onClick={() =>
  navigate(`/dashboard/homework/${lesson.id}`, {
    state: {
      fromCourse: true,
      courseId: slug,
    },
  })
}
          className="flex items-center gap-1.5 sm:gap-2 bg-green-500 hover:bg-green-600 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-green-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
        >
          <ClipboardCheck size={13} />
          <span>حل الواجب</span>
        </button>
      )}

{isExam && (
  <button
    onClick={async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("id")
        .eq("course_item_id", lesson.id)
        .single();

      if (error || !data) {
        console.error(error);
        alert("الامتحان غير موجود");
        return;
      }

      navigate(`/dashboard/exams/${data.id}`);
    }}
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
      <span className="text-xs sm:text-sm font-bold">
        مقفل
      </span>
    </div>
  )}
</div>

                            {/* Title + icon — على اليمين */}
                            <div className="flex flex-row-reverse items-center gap-3 text-right flex-1 min-w-0">
                              <div className="flex-1 min-w-0">
                                <h4 className="
text-sm
sm:text-base
xl:text-lg
font-bold
text-[#111827]
dark:text-white
truncate
transition-colors
duration-300
group-hover:text-[#B348FE]
">
                                  {lesson.title}
                                </h4>
                                {isVideo && lesson.duration && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {lesson.duration}
                                  </p>
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
                                  transition-all
duration-300
group-hover:scale-110
                                  ${isVideo ? "bg-yellow-100 text-yellow-500" : ""}
                                  ${isFile ? "bg-blue-100   text-blue-500" : ""}
                                  ${isHomework ? "bg-green-100  text-green-500" : ""}
                                  ${isExam ? "bg-red-100    text-red-500" : ""}
                                `}
                              >
                                {isVideo && <Play size={15} />}
                                {isFile && <FileText size={15} />}
                                {isHomework && <ClipboardCheck size={15} />}
                                {isExam && <ClipboardList size={15} />}
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

      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">

          <div
            className="
              w-full
              max-w-md
              rounded-[30px]
              bg-white
              dark:bg-[#111111]
              border
              border-gray-200
              dark:border-[#2A2A2A]
              shadow-[0_25px_70px_rgba(15,23,42,.12)]
              dark:shadow-[0_30px_70px_rgba(0,0,0,.65)]
              p-8
            "
          >
            <div className="text-center">

              <div
                className="
                  mx-auto
                  mb-6
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-full
                  bg-[#F6EEFF]
                  dark:bg-[#2B103D]
                "
              >
                <ShieldCheck
                  size={36}
                  className="text-[#B348FE]"
                />
              </div>

              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                تفعيل الاشتراك
              </h2>

              <p className="mt-3 text-gray-500 dark:text-gray-400 leading-7">
                أدخل كود الاشتراك الخاص بك لتفعيل الكورس.
              </p>

              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-[#EAD8FF]
                  dark:border-[#2A2A2A]
                  bg-[#F6EEFF]
                  dark:bg-[#1A1A1A]
                  px-5
                  py-4
                "
              >
                <h3 className="text-lg font-black text-[#B348FE] text-center">
                  {course?.title}
                </h3>
              </div>

            </div>

            <input
              type="text"
              value={subscriptionCode}
              onChange={(e) =>
                setSubscriptionCode(e.target.value.toUpperCase())
              }
              placeholder="XXXX-XXXX"
              className="
                mt-7
                w-full
                rounded-2xl
                border
                border-gray-200
                dark:border-[#2A2A2A]
                bg-gray-50
                dark:bg-[#181818]
                px-5
                py-4
                text-center
                text-lg
                tracking-[6px]
                font-black
                text-[#B348FE]
                outline-none
                transition-all
                duration-300
                focus:border-[#B348FE]
                focus:ring-4
                focus:ring-[#B348FE]/20
              "
            />

            <Button
              className="w-full mt-5"
              onClick={activateSubscription}
            >
              تفعيل الاشتراك
            </Button>

            <Button
              variant="outline"
              className="
                w-full
                mt-3
                bg-green-50
                border-green-200
                text-green-700
                dark:bg-[#16281F]
                dark:border-[#245D3A]
                dark:text-green-400
                hover:bg-green-500
                hover:text-white
                flex
                items-center
                justify-center
                gap-2
              "
              onClick={() =>
                window.open(
                  `https://wa.me/201109414585?text=${encodeURIComponent(
                    `السلام عليكم، عايز الاشتراك في كورس ${course?.title}`
                  )}`,
                  "_blank"
                )
              }
            >
              <FaWhatsapp className="text-xl" />
              شراء كود عبر واتساب
            </Button>

            <Button
              variant="ghost"
              className="
                w-full
                mt-3
                text-gray-500
                dark:text-gray-400
                hover:text-[#B348FE]
              "
              onClick={() => {
                setShowSubscriptionModal(false);
                setSubscriptionCode("");
              }}
            >
              إلغاء
            </Button>

          </div>

        </div>
      )}

      <Footer />
    </div>
  );
}
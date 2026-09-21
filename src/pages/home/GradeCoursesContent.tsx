// src/pages/student/GradeCoursesContent.tsx

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { BookOpen, Clock, Tag, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { HiArrowPath } from "react-icons/hi2";
import { HiDocumentPlus } from "react-icons/hi2";
import { COURSE_CATEGORIES, getCategoryLabel } from "../../lib/courseCategories";
interface GradeCoursesContentProps {
  grade: string;
}

export default function GradeCoursesContent({ grade }: GradeCoursesContentProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const [showAuthModal, setShowAuthModal] = useState(false);
const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const [subscriptionCode, setSubscriptionCode] = useState("");
const [selectedCourse, setSelectedCourse] = useState<any>(null);
const [myCourses, setMyCourses] = useState<string[]>([]);
const [expandedId, setExpandedId] = useState<string | null>(null);
const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
const toggleSection = (key: string) =>
  setCollapsedSections((p) => ({ ...p, [key]: !(p[key] ?? true) }));
const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const showToast = (message: string) => {
  if (toastTimeoutRef.current) {
    clearTimeout(toastTimeoutRef.current);
  }
  setToast({ id: Date.now(), message });
  toastTimeoutRef.current = setTimeout(() => {
    setToast(null);
  }, 4000);
};

useEffect(() => {
  loadCourses();
  loadMyCourses();
}, [grade]);

  const loadCourses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
.eq("is_hidden", false)
.eq("grade", grade)
.order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

const loadMyCourses = async () => {
  const user = localStorage.getItem("user");

  if (!user) return;

  const currentUser = JSON.parse(user);

  const now = new Date().toISOString();

const { data } = await supabase
  .from("student_courses")
  .select("course_id, expires_at")
  .eq("student_id", currentUser.studentId)
  .eq("active", true);

const validCourses =
  data
    ?.filter((item: any) => {
      return !item.expires_at || item.expires_at > now;
    })
    .map((item: any) => item.course_id) || [];

setMyCourses(validCourses);
};

const handleCourseAction = (course: any) => {

if (myCourses.includes(course.id)) {
  navigate(`/courses/${course.id}`);
  return;
}

  const user = localStorage.getItem("user");

if (!user) {
  navigate("/login", {
    state: {
      redirectTo: window.location.pathname,
    },
  });
  return;
}

  if (course.is_free) {
    navigate(`/courses/${course.id}`);
    return;
  }

  setSelectedCourse(course);
  setShowSubscriptionModal(true);
};

const generateInvoiceNumber = async (): Promise<string> => {
  const { data } = await supabase
    .from("subscription_payments")
    .select("invoice_number")
    .order("id", { ascending: false })
    .limit(1);

  const last = data?.[0]?.invoice_number as string | undefined;
  const lastNum = last ? parseInt(last.replace("INV-", ""), 10) : 0;
  const nextNum = (isNaN(lastNum) ? 0 : lastNum) + 1;
  return `INV-${String(nextNum).padStart(5, "0")}`;
};

const activateSubscription = async () => {
  const { data, error } = await supabase.rpc("redeem_subscription_code", {
    p_code: subscriptionCode,
    p_course_id: selectedCourse.id,
  });

  if (error || !data?.success) {
    showToast(data?.error || "حدث خطأ أثناء تفعيل الاشتراك");
    return;
  }

  await loadMyCourses();

  setShowSubscriptionModal(false);
  setSubscriptionCode("");
  setSelectedCourse(null);

  showToast("تم تفعيل الاشتراك بنجاح");
};


const formatDate = (date: string) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

 const CourseCard = ({ course }: { course: any }) => {

const hasAccess =
  course.is_free ||
  myCourses.map(String).includes(String(course.id));


return (

<Card
  hover
  className="
    group
    overflow-hidden
    p-0
    bg-white
    dark:bg-[#151515]
    border
    border-gray-200
    dark:border-[#262626]
    shadow-[0_4px_20px_rgba(0,0,0,.06)]
    hover:shadow-[0_10px_35px_rgba(0,0,0,.1)]
    rounded-[26px]
    cursor-pointer
"
>

<div className="p-3 sm:p-3.5 pb-0">
<div
  className="
    relative
    aspect-[1000/563]
    overflow-hidden
    rounded-2xl
  "
>

        <img
          src={
            course.thumbnail
              ? /^https?:\/\//i.test(course.thumbnail)
                ? course.thumbnail
                : `${import.meta.env.VITE_R2_PUBLIC_URL}/${course.thumbnail}`
              : "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800"
          }
          alt={course.title}
className="
w-full
h-full
object-cover
transition-transform
duration-300
group-hover:scale-105
"
        />

        {course.category && (
          <span className="
            absolute top-3 left-3
            bg-black/70
backdrop-blur-md backdrop-blur-sm text-white
            text-xs font-semibold
            px-2.5 py-1 rounded-full
          ">
            {getCategoryLabel(course.category) || course.category}
          </span>
        )}

        <div className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-700
          bg-gradient-to-r from-transparent via-white/15 to-transparent
          -translate-x-full group-hover:translate-x-full
          transition-transform duration-500
        " />
      </div>
</div>

<CardContent
  className="
    relative
    z-20
    p-4
    sm:p-5
    lg:p-6
    flex
    flex-col
    flex-1
    gap-3
  "
>
<h3
  className="
    text-[21px]
    sm:text-[24px]
    leading-tight
    font-black
    text-[#5800a9]
    dark:text-white
    line-clamp-2
    group-hover:text-[#b600d7]
    dark:group-hover:text-[#b600d7]
    transition-colors
    duration-300
  "
>
  {course.title}
</h3>

<div className="flex items-center gap-0 mt-3">
  <span className="w-[8px] h-[8px] rounded-full bg-[#5800a9] dark:bg-white group-hover:bg-[#b600d7] dark:group-hover:bg-[#b600d7] transition-colors duration-300 flex-shrink-0" />
  <span className="flex-1 h-[3px] -mx-px bg-[#5800a9] dark:bg-white group-hover:bg-[#b600d7] dark:group-hover:bg-[#b600d7] transition-colors duration-300" />
  <span className="w-[8px] h-[8px] rounded-full bg-[#5800a9] dark:bg-white group-hover:bg-[#b600d7] dark:group-hover:bg-[#b600d7] transition-colors duration-300 flex-shrink-0" />
</div>

<div className="mt-4">

  <div className="space-y-5">
    


{/* الوصف */}
{(() => {
  const description: string = course.description || "";
  const isLongDescription = description.length > 150;
  const isExpanded = expandedId === course.id;

  return (
    <div>
      <p
        style={
          !isExpanded && isLongDescription
            ? {
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
        className="
          text-[13px]
          sm:text-[14px]
          leading-6
          sm:leading-7
          font-medium
          text-[#5800a9]
          dark:text-white
          whitespace-pre-line
          break-words
        "
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
            text-[12px] sm:text-[13px] font-bold text-[#5800a9]
            dark:text-white
            hover:text-[#b600d7]
            dark:hover:text-[#b600d7]
            transition-colors
          "
        >
          {isExpanded ? "أقل ▲" : "عرض تفاصيل ▼"}
        </button>
      )}
    </div>
  );
})()}
<div className="flex flex-col gap-3 items-start"></div>
<div className="border-t border-slate-200 pt-5">
{/* الأزرار */}
<div
  className="
    flex
    flex-col
    gap-2.5
  "
>
  <Button
    className="
      w-full
      h-12
      rounded-xl
      font-black
      text-[15px]
      text-white
      bg-[#b600d7]
      border-2
      border-[#b600d7]
      hover:bg-transparent
      hover:text-[#b600d7]
      !shadow-none
      cursor-pointer
      transition-all
      duration-300
    "
    onClick={() => navigate(`/courses/${course.id}`)}
  >
    الدخول للكورس
  </Button>

  {!hasAccess && (
    <Button
      className="
        w-full
        h-12
        rounded-xl
        font-black
        text-[15px]
        text-white
        bg-[#5800a9]
        border-2
        border-[#5800a9]
        hover:bg-transparent
        hover:text-[#5800a9]
        !shadow-none
        cursor-pointer
        transition-all
        duration-300
      "
      onClick={() => handleCourseAction(course)}
    >
      الاشتراك في الكورس!
    </Button>
  )}
</div>


</div>
</div>
{/* السعر + التاريخ */}
<div
  className="
    mt-6
    pt-5
    border-t
    border-gray-200
    dark:border-[#262626]
  "
>

<div className="flex items-end justify-between gap-6">

<div
  className={`
    inline-flex
    items-center
    gap-1
    rounded-lg
    p-1
    shrink-0
    ${hasAccess || course.is_free ? "" : "bg-[#5800a9] dark:bg-[#b600d7]"}
  `}
>
  
{course.is_free ? (
    <span
      className="
        flex
        items-center
        gap-1.5
        bg-emerald-50
        dark:bg-emerald-500/10
        text-emerald-600
        dark:text-emerald-400
        rounded-md
        px-4
        py-[6px]
        text-[13px]
        font-black
        whitespace-nowrap
        cursor-default
        select-none
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
      كورس مجاني
    </span>
  ) : hasAccess ? (
    <span
className="
        flex
        items-center
        gap-1.5
        bg-emerald-50
        dark:bg-emerald-500/10
        text-emerald-600
        dark:text-emerald-400
        rounded-md
        px-4
        py-[6px]
        text-[13px]
        font-black
        whitespace-nowrap
        cursor-default
        select-none
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
      تم الاشتراك
    </span>
  ) : (
    <>
      <span
        className="
          bg-white
          text-[#111111]
          rounded-md
          px-3
          py-[5px]
          min-w-[46px]
          text-center
          text-[13px]
          font-black
        "
      >
        {Number(course.price).toFixed(2)}
      </span>

      <span className="px-2 text-[13px] font-black text-white">
        جنيهًا
      </span>
    </>
  )}
</div>

  <div className="flex flex-col w-fit gap-2.5">

    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] font-medium text-[#5800a9] dark:text-white whitespace-nowrap">
        {formatDate(course.updated_at)}
      </span>
      <span className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 bg-[#F6EEFF] text-[#5800a9] dark:bg-[#b600d7] dark:text-white">
        <HiArrowPath className="text-[14px]" />
      </span>
    </div>

    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] font-medium text-[#5800a9] dark:text-white whitespace-nowrap">
        {formatDate(course.created_at)}
      </span>
      <span className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 bg-[#F6EEFF] text-[#5800a9] dark:bg-[#b600d7] dark:text-white">
        <HiDocumentPlus className="text-[14px]" />
      </span>
    </div>

  </div>

</div>


</div>

</div>
      </CardContent>
    </Card>
   
  );
};
   const CourseSection = ({
    title,
    list,
  }: {
    title: string;
    icon?: React.ReactNode;
    list: any[];
    accent?: string;
  }) => {
    if (list.length === 0) return null;

    const isCollapsed = collapsedSections[title] ?? true;

    // آخر كلمة في العنوان بلون المنصة
    const words = title.trim().split(/\s+/);
    const lastWord = words.pop() || "";
    const firstPart = words.join(" ");

    return (
      <section className="mb-12 sm:mb-16">
        <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-3 mb-5 sm:mb-7">
          {/* العنوان بالخطوط */}
          <div className="flex flex-col items-center">
            <h2 className="group cursor-default text-2xl sm:text-3xl font-black">
              {firstPart && (
                <span className="text-gray-900 dark:text-white group-hover:text-[#b600d7] dark:group-hover:text-[#b600d7] transition-colors duration-300">
                  {firstPart}{" "}
                </span>
              )}
              <span className="text-[#5800a9] dark:text-[#b600d7]">
                {lastWord}
              </span>
            </h2>
          </div>

          {/* زرار الإخفاء / العرض */}
          <button
            type="button"
            aria-expanded={!isCollapsed}
            onClick={() => toggleSection(title)}
            className="
              inline-flex items-center gap-2 cursor-pointer
              text-[13px] sm:text-[14px] font-bold
              text-[#5800a9] dark:text-white
              hover:text-[#b600d7] dark:hover:text-[#b600d7]
              transition-colors
            "
          >
            <span>{isCollapsed ? "عرض الكورسات" : "إخفاء الكورسات"}</span>
            <span className="text-[10px]">{isCollapsed ? "▲" : "▼"}</span>
          </button>

        </div>

        {!isCollapsed && (
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              2xl:grid-cols-3
              gap-x-6
              sm:gap-x-8
              lg:gap-x-10
              gap-y-10
            "
          >
            {list.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    );
  };

  const knownValues = COURSE_CATEGORIES.map((c) => c.value);
  const other = courses.filter((c) => !knownValues.includes(c.category));
  const hasSections = courses.some((c) => knownValues.includes(c.category));

 
return (
  <>
    {toast && (
      <div
        key={toast.id}
        className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[100] w-[92%] sm:w-full max-w-sm bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden animate-in slide-in-from-top-3 fade-in duration-300"
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 text-right flex-1">
            {toast.message}
          </p>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="h-1 w-full bg-gray-100 dark:bg-[#2A2A2A] overflow-hidden">
          <div
            key={toast.id}
            className="h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-pink-500"
            style={{
              animation: "toast-shrink 4s linear forwards",
            }}
          />
        </div>
      </div>
    )}

    <style>{`
      @keyframes toast-shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
    `}</style>

    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 sm:py-12 lg:py-16">

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="
              rounded-2xl overflow-hidden
              bg-white dark:bg-[#1E244F]
              border border-slate-200 dark:border-white/10
              animate-pulse
            ">
              <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                <div className="flex gap-2 pt-2">
                  <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="flex-1 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center py-20 sm:py-32">
          <div className="
            w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6
            rounded-2xl bg-slate-100 dark:bg-white/10
            flex items-center justify-center
          ">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
          </div>
          <h3 className="
            text-xl sm:text-3xl font-black
            text-slate-900 dark:text-white mb-3
          ">
            لا توجد كورسات متاحة حالياً
          </h3>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">
            سيتم إضافة الكورسات قريبًا...
          </p>
        </div>
      )}

      {!loading && hasSections ? (
        <>
          {COURSE_CATEGORIES.filter(
            (cat) => cat.label !== "الامتحانات الشاملة لطلبة اليوتيوب"
          ).map((cat) => (
            <CourseSection
              key={cat.value}
              title={cat.sectionTitle}
              icon={<BookOpen className="w-5 h-5" />}
              list={courses.filter((c) => c.category === cat.value)}
              accent={cat.accent}
            />
          ))}
          {other.length > 0 && (
            <CourseSection
              title="كورسات أخرى"
              icon={<BookOpen className="w-5 h-5" />}
              list={other}
              accent="bg-slate-400"
            />
          )}
        </>
      ) : (
        !loading && courses.length > 0 && (
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  2xl:grid-cols-3
  gap-x-6
  sm:gap-x-8
  lg:gap-x-10
  gap-y-8
  sm:gap-y-10
">
  {courses.map(c => <CourseCard key={c.id} course={c} />)}
</div>
        )
      )}
    </div>

   {showSubscriptionModal && (
  <div
  className="
    fixed
    inset-0
    z-50
    flex
    items-center
    justify-center
    bg-black/70
    backdrop-blur-md
    p-6
    animate-in
    fade-in
    duration-300
  "
>

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
  animate-in
  zoom-in-95
  duration-300
"
    >

      <div className="text-center">
<div className="space-y-2"> </div>
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
    className="text-[#5800a9] dark:text-[#c9a6ff]"
  />
</div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          تفعيل الاشتراك
        </h2>

        <p className="mt-3 text-gray-500
dark:text-gray-400
text-[15px]
leading-7 leading-7">
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
  <h3
    className="
      text-lg
      font-black
      text-[#5800a9]
      dark:text-[#c9a6ff]
      text-center
    "
  >
    {selectedCourse?.title}
  </h3>
</div>


      </div>

      <input
        type="text"
        value={subscriptionCode}
        onChange={(e) => setSubscriptionCode(e.target.value.toUpperCase())}
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
  text-[#5800a9]
  outline-none
  transition-all
  duration-300
  focus:border-[#5800a9]
  focus:ring-4
  focus:ring-[#5800a9]/20
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
    flex items-center justify-center gap-2
  "
  onClick={() =>
  window.open(
    `https://wa.me/201109414585?text=${encodeURIComponent(
      `السلام عليكم، عايز الاشتراك في كورس ${selectedCourse?.title}`
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
hover:text-[#5800a9]
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

  </>
);
}
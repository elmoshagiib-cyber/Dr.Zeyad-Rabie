// src/components/student/courses/GradeCoursesContent.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { BookOpen, Clock, Tag } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { HiOutlineFolder } from "react-icons/hi2";
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

const activateSubscription = async () => {

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

  if (data.course_id !== selectedCourse.id) {
    alert("هذا الكود لا يخص هذا الكورس");
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("user")!);

const studentId = currentUser.studentId;

// التحقق أولًا هل الطالب مشترك بالفعل
const { data: existingSubscription } = await supabase
  .from("student_courses")
  .select("id")
  .eq("student_id", studentId)
  .eq("course_id", selectedCourse.id)
  .eq("active", true)
  .maybeSingle();

if (existingSubscription) {
  alert("أنت مشترك بالفعل في هذا الكورس.");
  return;
}

// إضافة الاشتراك
const { error: enrollError } = await supabase
  .from("student_courses")
  .insert({
    student_id: studentId,
    course_id: selectedCourse.id,
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

// تحديث حالة الكود
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

// تحديث الواجهة
await loadMyCourses();

setShowSubscriptionModal(false);
setSubscriptionCode("");
setSelectedCourse(null);

alert("تم تفعيل الاشتراك بنجاح ✅");
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
  
  className="
    group
    overflow-visible
    bg-transparent
    dark:bg-transparent
    border-0
    transition-all
    duration-300
    ease-out
    hover:-translate-y-2
    hover:shadow-[0_25px_60px_rgba(179,72,254,0.18)]
    rounded-none
    p-0
    cursor-pointer
"
>

<div
  className="
    relative

    aspect-[16/9.5]

    w-[108%]
    -mr-[4%]

    sm:w-[114%]
    sm:-mr-[7%]

    lg:w-[120%]
    lg:-mr-[10%]

    xl:w-[127%]
    xl:-mr-[15%]

    rounded-[24px]
    sm:rounded-[28px]
    lg:rounded-[32px]

    overflow-hidden
  "
>
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800"
          }
          alt={course.title}
className="
w-full
h-full
object-cover object-center
object-top
translate-y-[-6px]

transition-all
duration-300
ease-out

group-hover:translate-y-[-14px]
group-hover:scale-[1.06]
group-hover:brightness-110
group-hover:saturate-110
"
        />

        {course.is_free && (
       <span
  className="
    absolute
    top-4
    right-4
    rounded-full
    bg-gradient-to-r
from-[#B348FE]
to-[#8D2BFF]
    text-white
    text-xs
    font-black
    px-4
    py-2
    shadow-[0_10px_25px_rgba(16,185,129,.35)]
  "
>
  مجاني
</span>
        )}

        {course.category && (
          <span className="
            absolute top-3 left-3
            bg-black/70
backdrop-blur-md backdrop-blur-sm text-white
            text-xs font-semibold
            px-2.5 py-1 rounded-full
          ">
            {course.category === 'term1' && 'الترم الأول'}
            {course.category === 'term2' && 'الترم الثاني'}
            {course.category === 'revision' && 'مراجعة'}
            {course.category === 'free' && 'مجاني'}
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

<CardContent
  className="
    relative
    z-20
    -mt-9
    -mx-2
sm:-mx-4
lg:-mx-5
xl:-mx-7
    mb-5
    rounded-[28px]
    bg-white
    dark:bg-[#111111]
    border
    border-gray-200
    dark:border-[#262626]
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
    text-slate-900
    dark:text-white
    line-clamp-2
    group-hover:text-[#9F3FFF]
    dark:group-hover:text-[#C36CFF]
    transition-colors
    duration-300
  "
>
  {course.title}
</h3>

<div className="h-[2px] w-full rounded-full bg-[#B348FE]" />


<div className="mt-4">

  <div className="space-y-5">
    


{/* الوصف */}
<p
  className="
   text-sm
sm:text-base
leading-7
sm:leading-8
    text-slate-500
    dark:text-slate-300
    whitespace-pre-line
    break-words
  "
>
  {course.description}
</p>
<div className="flex flex-col gap-3 items-start"></div>
<div className="border-t border-slate-200 pt-5">
{/* الأزرار */}
<div
  className="
    flex
    flex-col
    sm:flex-row
    gap-3
  "
>
  {!hasAccess && (
    <Button
      className="
        flex-1
        h-12
        rounded-2xl
        font-black
        text-[15px]
        text-white
        bg-[#B348FE]
        hover:bg-[#9E2FFF]
        shadow-lg
        shadow-[#B348FE]/25
        transition-all
        duration-300
        hover:-translate-y-0.5
      "
      onClick={() => handleCourseAction(course)}
    >
      اشترك الآن
    </Button>
  )}

  <Button
    variant="outline"
    className="
      flex-1
      h-12
      rounded-2xl
      font-black
      text-[15px]

      border-2
      border-[#B348FE]

      bg-transparent
      text-[#B348FE]

      hover:bg-transparent
      hover:text-[#B348FE]
      hover:border-[#B348FE]

      active:bg-transparent

      shadow-none
      transition-all
      duration-300
    "
    onClick={() => navigate(`/courses/${course.id}`)}
  >
    عرض المحتوى
  </Button>
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
    rounded-xl
    p-1
    shrink-0
    ${hasAccess ? "" : "bg-[#B348FE]"}
  `}
>
  
{hasAccess ? (
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
        جنيه
      </span>
    </>
  )}
</div>

  <div className="flex flex-col gap-2">

    <div className="flex items-center text-slate-500 dark:text-slate-400">
      <span className="text-[13px] font-medium">
        {formatDate(course.created_at)}
      </span>
      <HiOutlineCalendarDays className="mr-2 text-[17px]" />
    </div>

    <div className="flex items-center text-slate-500 dark:text-slate-400">
      <span className="text-[13px] font-medium">
        {formatDate(course.updated_at)}
      </span>
      <HiOutlineFolder className="mr-2 text-[17px]" />
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
    icon,
    list,
    accent,
  }: {
    title: string;
    icon: React.ReactNode;
    list: any[];
    accent: string;
  }) => {
    if (list.length === 0) return null;
    return (
      <section className="mb-12 sm:mb-16">
        <div className="flex items-center gap-3 mb-5 sm:mb-7">
          <div className={`w-1 h-8 rounded-full ${accent}`} />
          <span className="text-slate-400 dark:text-slate-500">{icon}</span>
          <h2 className="text-lg sm:text-2xl font-black text-gray-900
dark:text-white
text-3xl">
            {title}
          </h2>
          <span className="
            mr-auto text-xs sm:text-sm font-bold
            bg-slate-100 dark:bg-white/10
            text-slate-500 dark:text-slate-400
            px-2.5 py-1 rounded-full
          ">
            {list.length} كورس
          </span>
        </div>

<div
  className="
    grid
    grid-cols-1
    md:grid-cols-2
    xl:grid-cols-3
    gap-x-16
    gap-y-12
  "
>
          {list.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>
    );
  };

  const term1 = courses.filter(c => c.category === 'term1');
  const term2 = courses.filter(c => c.category === 'term2');
  const revision = courses.filter(c => c.category === 'revision');
  const free = courses.filter(c => c.category === 'free');
  const other = courses.filter(
    c => !['term1', 'term2', 'revision', 'free'].includes(c.category)
  );

  const hasSections = term1.length || term2.length || revision.length || free.length;

 
return (
  <>
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
          <CourseSection
            title="كورسات الترم الأول"
            icon={<BookOpen className="w-5 h-5" />}
            list={term1}
            accent="bg-purple-500"
          />
          <CourseSection
            title="كورسات الترم الثاني"
            icon={<BookOpen className="w-5 h-5" />}
            list={term2}
            accent="bg-blue-500"
          />
          <CourseSection
            title="كورسات المراجعة"
            icon={<BookOpen className="w-5 h-5" />}
            list={revision}
            accent="bg-amber-500"
          />
          <CourseSection
            title="الكورسات المجانية"
            icon={<BookOpen className="w-5 h-5" />}
            list={free}
            accent="bg-green-500"
          />
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
            xl:grid-cols-3
            gap-4 sm:gap-6
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
    className="text-[#B348FE]"
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
      text-[#B348FE]
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

  </>
);
}
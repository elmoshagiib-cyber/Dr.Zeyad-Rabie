
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { ScrollReveal } from "../components/layout/ScrollReveal";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import StudentGradeCard from "../components/home/StudentGradeCard";
import { BannerCarousel } from "../components/home/features/BannerCarousel";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Download } from "lucide-react";
import GradeCoursesContent from "../components/student/courses/GradeCoursesContent";
import {
  ChevronRight,
  Play,
  Star,
  Users,
  BookOpen,
  TrendingUp,
  ChevronDown,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

import {
  TEACHER,
  STATS,
  COURSES,
  TESTIMONIALS,
  FAQS,
  ANNOUNCEMENTS,
  GRADES,
} from "../data/mockData";

const gradeColors: Record<string, string> = {
  sec_3: "rose",
  sec_2: "violet",
  sec_1: "blue",
  primary: "emerald",
};

export function HomePage() {
    console.log("HOME PAGE RENDERED");
  const navigate = useNavigate();
  
const { user } = useApp();
  const [selectedStage, setSelectedStage] =
    useState<"secondary" | "prep">("secondary");

    const [courses, setCourses] = useState<any[]>([]);
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
useEffect(() => {
  console.log("Deferred Prompt =", deferredPrompt);
}, [deferredPrompt]);
    useEffect(() => {
  loadCourses();
}, []);

useEffect(() => {
const handler = (e: any) => {
  console.log("beforeinstallprompt Fired");

  e.preventDefault();

  setDeferredPrompt(e);
};

  window.addEventListener("beforeinstallprompt", handler);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
  };
}, []);

const loadCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
.eq("is_hidden", false);

  if (!error) {
    setCourses(data || []);
  }
};

const installApp = async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("PWA Installed");
  }

  setDeferredPrompt(null);
};

const gradeMap = {
  "الصف الأول الثانوي": {
    title: "الصف الأول الثانوي",
    slug: "sec_1",
    image: "/images/secondary-stage.jpg",
  },

  "الصف الثاني الثانوي": {
    title: "الصف الثاني الثانوي",
    slug: "sec_2",
    image: "/images/secondary-stage.jpg",
  },

  "الصف الثالث الثانوي": {
    title: "الصف الثالث الثانوي",
    slug: "sec_3",
    image: "/images/secondary-stage.jpg",
  },
};

const studentGrade =
  gradeMap[user?.grade as keyof typeof gradeMap];

console.log("USER =", user);
console.log("GRADE =", user?.grade);

const gradeSlugMap: Record<string, string> = {
  "الصف الأول الثانوي": "sec_1",
  "الصف الثاني الثانوي": "sec_2",
  "الصف الثالث الثانوي": "sec_3",
  "الصف الأول الإعدادي": "first_prep",
  "الصف الثاني الإعدادي": "second_prep",
  "الصف الثالث الإعدادي": "third_prep",
};

const userGradeSlug = gradeSlugMap[user?.grade ?? ""] ?? "";

return (
    <div className="min-h-screen bg-white dark:bg-[#0b0715]" dir="rtl">
      <Navbar />

      

      <section
className="
relative
overflow-hidden
py-28
bg-white
dark:bg-[#09090B]
"
>

  {/* Chemistry Icons */}

  <div className="max-w-[1400px] mx-auto px-6 w-full">

   <div
  className="
grid
lg:grid-cols-2
items-center
gap-24
py-12
lg:py-20
"
>

{/* TEXT */}
<motion.div
initial={{
opacity:0,
y:40
}}
animate={{
opacity:1,
y:0
}}
transition={{
duration:.8,
delay:.25,
ease:[0.22,1,0.36,1]
}}
  className="
  mt-4
  sm:mt-6
  text-center
  lg:text-right
  max-w-[700px]
  mx-auto
  lg:mx-0
  px-2
  sm:px-0
  "
>
  <h1
    className="
    text-[26px]
    xs:text-[28px]
    sm:text-[36px]
    md:text-[44px]
    lg:text-[52px]
    font-bold
    leading-[1.25]
    tracking-[-0.5px]
    text-slate-900
    dark:text-white
    "
  >
    مرحبا بكم في منصة

    <span
className="
block
mt-1.5
sm:mt-2
text-[32px]
xs:text-[36px]
sm:text-[44px]
md:text-[54px]
lg:text-[64px]
font-bold
leading-tight
tracking-[-1px]
text-[#F6AC08]
dark:text-[#F6AC08]
"
    >
      مستر زياد ربيع
    </span>
  </h1>

  <p
    className="
    mt-4
    sm:mt-6
    lg:mt-8
    max-w-[320px]
    xs:max-w-[380px]
    sm:max-w-[500px]
    lg:max-w-[620px]
    mx-auto
    lg:mx-0
    text-[15px]
    sm:text-[17px]
    lg:text-[20px]
    xl:text-[22px]
    leading-[1.7]
    sm:leading-[1.8]
    font-normal
    text-slate-600
    dark:text-slate-300
    "
  >
    شرح مبسط، مراجعات شاملة،
    واختبارات تفاعلية لتحقيق أعلى الدرجات.
  </p>

  <div
    className="
    mt-6
    sm:mt-8
    lg:mt-10
    flex
    justify-center
    lg:justify-start
    "
  >
   <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">

 {!user && (
  <Button
    size="lg"
    onClick={() => navigate("/register")}
    className="
      h-11
      sm:h-12
      lg:h-14
      px-6
      sm:px-7
      lg:px-9
      rounded-xl
      bg-[#422e91]
      hover:bg-[#5340A8]
      border-0
      text-white
      text-[14px]
      sm:text-[16px]
      lg:text-[18px]
      font-semibold
      shadow-[0_14px_35px_rgba(66,46,145,.35)]
      hover:scale-[1.03]
      transition-all
      duration-300
    "
  >
    سجل الآن مجانًا
  </Button>
)}

  {true && (
    <Button
      size="lg"
      onClick={installApp}
      className="
        h-11
        sm:h-12
        lg:h-14
        px-6
        sm:px-7
        lg:px-9
        rounded-xl
        bg-[#F6AC08]
        hover:bg-[#E29E00]
        text-[#ffffff]
        font-bold
        shadow-[0_12px_30px_rgba(246,172,8,.45)]
        hover:scale-[1.03]
        transition-all
        duration-300
      "
    >
      <Download className="w-5 h-5 ml-2" />

      تثبيت التطبيق
    </Button>
  )}
</div>
</div>
</motion.div>

      {/* IMAGE */}
      <motion.div
initial={{
opacity:0,
x:80,
scale:.95
}}

animate={{
opacity:1,
x:0,
scale:1
}}

transition={{
duration:1,
delay:.45,
ease:[0.22,1,0.36,1]
}}
  className="
mt-10
sm:mt-12
lg:mt-0
flex
justify-center
"
>

        <div className="relative">

          
         <img
  src={TEACHER.image}
  alt={TEACHER.name}
  className="
relative
z-10
w-[320px]
xs:w-[360px]
sm:w-[430px]
md:w-[500px]
lg:w-[560px]
xl:w-[620px]
2xl:w-[680px]
mx-auto
object-contain
"
/>

<motion.div
  animate={{ y: [0, -8, 0] }}
  transition={{ repeat: Infinity, duration: 9 }}
  className="absolute bottom-8 sm:bottom-12 lg:bottom-16 -right-4 sm:-right-6 lg:-right-8 bg-white dark:bg-white rounded-3xl p-3 sm:p-4 lg:p-5 shadow-2xl"
>
  
</motion.div>
        </div>

      </motion.div>

    </div>

  </div>

</section>


{!user && (
  <>
    {/* FEATURES */}
    <ScrollReveal>
      <section
        className="
          relative
          py-12
          sm:py-16
          lg:py-24
          bg-white
          dark:bg-[#09090B]
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <img
              src="/typography/features-title.png"
              alt="ليه تختار مستر زياد ربيع؟"
              draggable={false}
              className="
                mx-auto
                w-[280px]
                sm:w-[420px]
                md:w-[560px]
                lg:w-[700px]
                xl:w-[820px]
                h-auto
                select-none
                pointer-events-none
              "
            />
          </div>

          <BannerCarousel />

        </div>
      </section>
    </ScrollReveal>
  </>
)}

{/* ================= GRADES SECTION ================= */}
<ScrollReveal>
  <section className="relative py-14 sm:py-20 lg:py-28 bg-white dark:bg-[#09090B]">
    <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8">

{/* Title */}
<div className="text-center mb-10 sm:mb-14 lg:mb-20">
  <img
    src={
      user
        ? "/typography/courses-title.png"
        : "/typography/grades-title.png"
    }
    alt={
      user
        ? "الكورسات المتاحة"
        : "الصفوف الدراسية"
    }
    className="
      mx-auto
      w-[280px]
      sm:w-[420px]
      md:w-[560px]
      lg:w-[700px]
      xl:w-[820px]
      h-auto
      select-none
      pointer-events-none
    "
  />
</div>

      {/* Content */}
      
      {user ? (
        
  <GradeCoursesContent grade={userGradeSlug} />
) : (
        <div className="
          grid grid-cols-1 sm:grid-cols-2
          gap-6 sm:gap-8 lg:gap-12
          mt-4 sm:mt-8
        ">

          {/* الثانوية */}
          <div
            onClick={() => navigate("/stage/secondary")}
            className="cursor-pointer group"
          >
            {/* Image */}
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] shadow-xl">
              <motion.img
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.5 }}
                src="/images/secondary-stage.jpg"
                alt="المرحلة الثانوية"
                className="
                  w-full
                  h-[180px] sm:h-[240px] lg:h-[300px]
                  object-cover
                  saturate-110
                  group-hover:saturate-150
                  group-hover:brightness-110
                  transition-all duration-700
                "
              />
              {/* Overlay badge */}
              <div className="
                absolute top-3 right-3 sm:top-4 sm:right-4
                bg-[#422E91] dark:bg-[#F6AC08]
                text-white dark:text-slate-900
                text-[11px] sm:text-[12px] font-bold
                px-3 py-1 rounded-full
              ">
                ثانوي
              </div>
            </div>

            {/* Card info */}
            <div className="
              bg-white dark:bg-[#1E244F]
              rounded-[16px] sm:rounded-[24px]
              shadow-xl
              w-[80%] sm:w-[78%]
              mx-auto -mt-7 sm:-mt-10
              relative z-10
              py-4 sm:py-5
              px-4 sm:px-6
              text-center
              group-hover:-translate-y-2
              transition-transform duration-300
            ">
              <h3 className="
                text-[18px] sm:text-[22px] lg:text-[26px]
                font-black mb-3 sm:mb-4
                text-slate-900 dark:text-white
              ">
                المراحل الثانوية
              </h3>
              <div className="h-[3px] bg-[#422E91] dark:bg-[#F6AC08] rounded-full mb-3 sm:mb-4" />
              <p className="text-slate-500 dark:text-slate-300 text-[13px] sm:text-[15px]">
                الصف الأول والثاني والثالث الثانوي
              </p>
            </div>
          </div>

          {/* الإعدادي */}
          <div
            onClick={() => navigate("/stage/prep")}
            className="cursor-pointer group"
          >
            {/* Image */}
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] shadow-xl">
              <motion.img
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.5 }}
                src="/images/prep-stage.jpg"
                alt="المرحلة الإعدادية"
                className="
                  w-full
                  h-[180px] sm:h-[240px] lg:h-[300px]
                  object-cover
                  saturate-110
                  group-hover:saturate-150
                  group-hover:brightness-110
                  transition-all duration-700
                "
              />
              {/* Overlay badge */}
              <div className="
                absolute top-3 right-3 sm:top-4 sm:right-4
                bg-[#422E91] dark:bg-[#F6AC08]
                text-white dark:text-slate-900
                text-[11px] sm:text-[12px] font-bold
                px-3 py-1 rounded-full
              ">
                إعدادي
              </div>
            </div>

            {/* Card info */}
            <div className="
              bg-white dark:bg-[#1E244F]
              rounded-[16px] sm:rounded-[24px]
              shadow-xl
              w-[80%] sm:w-[78%]
              mx-auto -mt-7 sm:-mt-10
              relative z-10
              py-4 sm:py-5
              px-4 sm:px-6
              text-center
              group-hover:-translate-y-2
              transition-transform duration-300
            ">
              <h3 className="
                text-[18px] sm:text-[22px] lg:text-[26px]
                font-black mb-3 sm:mb-4
                text-slate-900 dark:text-white
              ">
                المراحل الإعدادية
              </h3>
              <div className="h-[3px] bg-[#422E91] dark:bg-[#F6AC08] rounded-full mb-3 sm:mb-4" />
              <p className="text-slate-500 dark:text-slate-300 text-[13px] sm:text-[15px]">
                الصف الأول والثاني والثالث الإعدادي
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  </section>
</ScrollReveal>

<Footer />
</div>
);
}
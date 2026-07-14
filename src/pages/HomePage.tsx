
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { ScrollReveal } from "../components/layout/ScrollReveal";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import StudentGradeCard from "../components/home/StudentGradeCard";

import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";

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
  third_sec: "rose",
  second_sec: "violet",
  first_sec: "blue",
  primary: "emerald",
};

export function HomePage() {
  const navigate = useNavigate();
  
const { user } = useApp();
console.log("USER =", user);
console.log("GRADE =", user?.grade);
  const [selectedStage, setSelectedStage] =
    useState<"secondary" | "prep">("secondary");

    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
  loadCourses();
}, []);

const loadCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("active", true);

  if (!error) {
    setCourses(data || []);
  }
};


const gradeMap = {
  "الصف الأول الثانوي": {
    title: "الصف الأول الثانوي",
    slug: "first_sec",
    image: "/images/secondary-stage.jpg",
  },

  "الصف الثاني الثانوي": {
    title: "الصف الثاني الثانوي",
    slug: "second_sec",
    image: "/images/secondary-stage.jpg",
  },

  "الصف الثالث الثانوي": {
    title: "الصف الثالث الثانوي",
    slug: "third_sec",
    image: "/images/secondary-stage.jpg",
  },
};

const studentGrade =
  gradeMap[user?.grade as keyof typeof gradeMap];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0715]" dir="rtl">
      <Navbar />

      

      <section
className="
relative
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
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }}
  variants={{
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
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
    أهلاً بك في منصة

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
      text-[#5B21B6]
      dark:text-violet-400
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
    <Button
      size="lg"
      variant="outline"
      onClick={() => navigate("/register")}
      className="
      h-11
      sm:h-12
      lg:h-14
      px-6
      sm:px-7
      lg:px-9
      rounded-xl
      bg-[#F97316]
      hover:bg-[#EA580C]
      border-0
      text-white
      text-[14px]
      sm:text-[16px]
      lg:text-[18px]
      font-semibold
      shadow-[0_14px_35px_rgba(249,115,22,.28)]
      hover:scale-[1.03]
      transition-all
      duration-300
      "
    >
      سجل الآن مجانًا
    </Button>
  </div>
</motion.div>

      {/* IMAGE */}
      <motion.div
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }}
  variants={{
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
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


{/* FEATURES */}
<ScrollReveal>
<section
className="
relative
py-28
bg-white
dark:bg-[#09090B]
"
>
  <div className="max-w-7xl mx-auto px-6">

    <div className="text-center mb-20">

<h2
  className="
  text-5xl
  lg:text-7xl
  font-black
  leading-[1.25]
  mb-6
  text-slate-900
  dark:text-white
  "
>
  ليه تختار{" "}

  <span
    className="
    inline-block
    pb-3
    bg-gradient-to-r
    from-[#7C1DCC]
    via-[#A52DFF]
    to-[#D900A8]
    bg-clip-text
    text-transparent
    "
  >
    مستر زياد ربيع؟
  </span>
</h2>

    </div>

    <motion.div
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }}
  variants={{
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  }}
 className="
flex
justify-center
lg:justify-start
"
>
  <div
    className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-4
    gap-8
    "
  >

    {/* Card 1 */}
    <div
      className="
      group
      overflow-hidden
      rounded-[36px]
      shadow-[0_20px_50px_rgba(0,0,0,0.15)]
      hover:shadow-2xl
      transition-all
      duration-500
      hover:-translate-y-4
      "
    >
      <img
        src="/images/card1.jpg"
        alt=""
        className="
        w-full
        aspect-[3/4]
        object-cover
        transition-transform
        duration-700
        group-hover:scale-110
will-change-transform
        "
      />
    </div>

    {/* Card 2 */}
    <div
      className="
      group
      overflow-hidden
      rounded-[36px]
      shadow-[0_20px_50px_rgba(0,0,0,0.15)]
      hover:shadow-2xl
      transition-all
      duration-500
      hover:-translate-y-4
      "
    >
      <img
        src="/images/card2.jpg"
        alt=""
        className="
        w-full
        aspect-[3/4]
        object-cover
        transition-transform
        duration-700
        group-hover:scale-110
will-change-transform
        "
      />
    </div>

    {/* Card 3 */}
    <div
      className="
      group
      overflow-hidden
      rounded-[36px]
      shadow-[0_20px_50px_rgba(0,0,0,0.15)]
      hover:shadow-2xl
      transition-all
      duration-500
      hover:-translate-y-4
      "
    >
      <img
        src="/images/card3.jpg"
        alt=""
        className="
        w-full
        aspect-[3/4]
        object-cover
        transition-transform
        duration-700
        group-hover:scale-110
will-change-transform
        "
      />
    </div>

    {/* Card 4 */}
    <div
      className="
      group
      overflow-hidden
      rounded-[36px]
      shadow-[0_20px_50px_rgba(0,0,0,0.15)]
      hover:shadow-2xl
      transition-all
      duration-500
      hover:-translate-y-4
      "
    >
      <img
        src="/images/card4.jpg"
        alt=""
        className="
        w-full
        aspect-[3/4]
        object-cover
        transition-transform
        duration-700
        group-hover:scale-105
        "
      />
    </div>

  </div>
</motion.div>
</div>
</section>
</ScrollReveal>
{/* ================= GRADES SECTION ================= */}
<ScrollReveal>
<section
className="
relative
py-28
bg-white
dark:bg-[#09090B]
"
>
  <div className="max-w-[1150px] mx-auto px-6">

<div
  className="
  absolute
  top-1/2
  left-1/2
  -translate-x-1/2
  -translate-y-1/2
  w-[600px]
  h-[600px]
  bg-[#A52DFF]/15
  rounded-full
  blur-[120px]
  z-0
  "
/>

    <div className="text-center mb-20">
       <h2 className="
text-5xl
lg:text-7xl
font-black
leading-tight
mb-6
text-slate-900
dark:text-white
">
 الصفوف
  <span className="bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8]
bg-clip-text
text-transparent">
    {" "}الدراسية 
  </span>
</h2>


      <div className="flex justify-center items-center gap-4 mt-8">
        <div className="w-64 h-[3px] bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8] rounded-full"></div>
        <div className="w-5 h-5 rotate-45 bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8]"></div>
        <div className="w-52 h-[3px] bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8] rounded-full"></div>
      </div>
    </div>

{user ? (
  <StudentGradeCard grade={user.grade ?? ""} />
) : (
  <div className="grid lg:grid-cols-2 gap-14 mt-24 relative">

    {/* الثانوية */}
    <div
      onClick={() => navigate("/stage/secondary")}
      className="
cursor-pointer
group
relative
group-hover:-translate-y-4
transition-all
duration-500
"
    >
      <div className="relative overflow-hidden rounded-[28px] shadow-2xl">
        <motion.img
          whileHover={{ scale: 1.1, y: -10 }}
          transition={{ duration: 0.5 }}
          src="/images/secondary-stage.jpg"
          alt=""
          className="
w-full
h-[320px]
object-cover
transition-all
duration-700
saturate-110
group-hover:saturate-150
group-hover:brightness-110
"
        />
      </div>

      <div className="bg-white dark:bg-[#130726] rounded-[24px] shadow-2xl w-[75%] mx-auto -mt-10 relative z-10 py-5 px-6 text-center">
        <h3 className="text-3xl font-black mb-5 dark:text-white">
          المراحل الثانوية
        </h3>

        <div className="h-[3px] bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] mb-5"></div>

        <p className="text-slate-500 dark:text-slate-300 text-base">
          الصف الأول والثاني والثالث الثانوي
        </p>
      </div>
    </div>

    {/* الإعدادي */}
    <div
      onClick={() => navigate("/stage/prep")}
      className="
cursor-pointer
group
relative
group-hover:-translate-y-4
transition-all
duration-500
"
    >
      <div className="relative overflow-hidden rounded-[28px] shadow-2xl">
        <motion.img
          whileHover={{ scale: 1.1, y: -10 }}
          transition={{ duration: 0.5 }}
          src="/images/prep-stage.jpg"
          alt=""
          className="
w-full
h-[320px]
object-cover
transition-all
duration-700
saturate-110
group-hover:saturate-150
group-hover:brightness-110
"
        />
      </div>

      <div className="bg-white dark:bg-[#130726] rounded-[24px] shadow-2xl w-[75%] mx-auto -mt-10 relative z-10 py-5 px-6 text-center">
        <h3 className="text-3xl font-black mb-5 dark:text-white">
          المراحل الإعدادية
        </h3>

        <div className="h-[3px] bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] mb-5"></div>

        <p className="text-slate-500 dark:text-slate-300 text-base">
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
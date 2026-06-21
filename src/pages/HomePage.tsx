
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { supabase } from "../lib/supabase";

import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ScrollingBanner } from "../components/layout/ScrollingBanner";
import { FaqSection } from "../components/home/FaqSection";

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
  Atom,
  FlaskConical,
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
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0715]" dir="rtl">
      <Navbar />

      

      <section
  className="
  relative
  overflow-hidden
  min-h-[calc(100vh-96px)]
  flex
  items-center
  bg-white
  dark:bg-[#09090B]
  "

>

  {/* Chemistry Icons */}

  <div className="max-w-[1400px] mx-auto px-6 w-full">

    <div className="grid lg:grid-cols-2 gap-4 items-center">


      {/* TEXT */}
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center lg:text-right"
      >


        <h2 className="
text-5xl
lg:text-7xl
font-black
leading-tight
mb-6
text-slate-900
dark:text-white
">
         أهـلا بـك فـي منصة
          <br />
          <div className="relative">
            
          <span className="text-[#7C3AED]">
  مستــر زيــاد ربيــع
</span>

          </div>
        </h2>

        <p className="
text-slate-500
dark:text-slate-400
text-2xl
leading-relaxed
max-w-2xl
">
          شرح مبسط، مراجعات شاملة، امتحانات تفاعلية، ومتابعة مستمرة تساعدك
          تحقق أعلى الدرجات في الكيمياء.
        </p>

        <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-10">

          <Button
  size="lg"
  onClick={() => navigate("/courses")}
>
  <BookOpen size={20} />
  تصفح الكورسات
</Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/register")}
            className="
border-2
border-[#7C3AED]
text-[#7C3AED]
bg-white
hover:bg-[#7C3AED]/5
"
          >
            سجل الآن مجاناً
          </Button>

        </div>

      </motion.div>

      {/* IMAGE */}
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="relative flex justify-center items-end -mt-8"
      >

        <div className="relative">
<div
  className="
  absolute
  top-1/2
  left-1/2
  -translate-x-1/2
  -translate-y-1/2
  w-[600px]
h-[600px]
  lg:w-[520px]
  lg:h-[520px]
  bg-[#7C3AED]/20
  rounded-full
  blur-[120px]
  z-0
  "
/>
          
         <img
  src={TEACHER.image}
  alt={TEACHER.name}
  className="
relative
z-10
w-[520px]
lg:w-[620px]
object-contain
animate-float
"
/>

<motion.div
  animate={{ y: [0, -8, 0] }}
  transition={{ repeat: Infinity, duration: 9 }}
  className="absolute bottom-16 -right-8 bg-white dark:bg-white rounded-3xl p-5 shadow-2xl"
>
  
</motion.div>
        </div>

      </motion.div>

    </div>

  </div>

</section>

<ScrollingBanner />

{/* FEATURES */}

<section className="
py-28
bg-white

dark:bg-[#09090B]
">

{/* Chemistry Background */}

<div className="absolute inset-0 overflow-hidden pointer-events-none">

  <Atom
    size={180}
    className="
    absolute
    top-20
    right-32
    text-[#7C3AED]/10
    animate-spin
    "
    style={{ animationDuration: "30s" }}
  />

  <FlaskConical
    size={120}
    className="
    absolute
    bottom-24
    left-24
    text-[#A855F7]/10
    animate-pulse
    "
  />

  <Atom
    size={120}
    className="
    absolute
    top-1/2
    left-1/3
    text-violet-400/5
    "
  />

</div>
  <div className="max-w-7xl mx-auto px-6">

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
  ليه تختار
  <span className="text-[#7C3AED]">
    {" "}مستر زياد ربيع؟
  </span>
</h2>

    </div>

    <motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.7 }}
  className="mt-16"
>
  <div
  className="
  relative
  overflow-hidden
  rounded-[32px]
  "
>
  <img
    src="/images/features-banner.png"
    alt="مميزات المنصة"
    className="
    w-full
    transition-all
    duration-700
    hover:scale-[1.03]
    "
  />

  <div
    className="
    absolute
    inset-0
    bg-gradient-to-t
    from-purple-500/5
    to-transparent
    pointer-events-none
    "
  />
</div>
</motion.div>
</div>
</section>
{/* ================= GRADES SECTION ================= */}

<section
  className="
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
  bg-violet-500/15
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
        الصفوف الدراسية
      </h2>


      <div className="flex justify-center items-center gap-4 mt-8">
        <div className="w-52 h-[3px] bg-[#7C3AED] rounded-full"></div>
        <div className="w-5 h-5 rotate-45 bg-[#7C3AED]"></div>
        <div className="w-52 h-[3px] bg-[#7C3AED] rounded-full"></div>
      </div>
    </div>

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
  whileHover={{
    scale: 1.1,
    y: -10
  }}
  transition={{
    duration: 0.5
  }}
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

        <div
          className="
          bg-white
          dark:bg-[#130726]
          rounded-[24px]
          shadow-2xl
          w-[75%]
mx-auto
-mt-10
          relative
          z-10
          py-5 px-6
          text-center
        "
        >
          <h3 className="text-3xl font-black mb-5 dark:text-white">
            المراحل الثانوية
          </h3>

          <div className="h-[3px] bg-[#7C3AED] mb-5"></div>

          <p className="text-slate-500 dark:text-slate-300 text-base">
            الصف الأول والثاني والثالث الثانوي
          </p>
          <div
  className="
  mt-6
  inline-flex
  items-center
  gap-2
  text-[#7C3AED]
  font-black
  "
>
 
</div>
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
  whileHover={{
    scale: 1.1,
    y: -10
  }}
  transition={{
    duration: 0.5
  }}
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

        <div
          className="
          bg-white
          dark:bg-[#130726]
          rounded-[24px]
          shadow-2xl
          w-[75%]
mx-auto
-mt-10
          relative
          z-10
          py-5 px-6
          text-center
        "
        >
          <h3 className="text-3xl font-black mb-5 dark:text-white">
            المراحل الإعدادية
          </h3>

          <div className="h-[3px] bg-[#7C3AED] mb-5"></div>

          <p className="text-slate-500 dark:text-slate-300 text-base">
           الصف الأول والثاني والثالث الإعدادي
          </p>
          <div
  className="
  mt-6
  inline-flex
  items-center
  gap-2
  text-[#7C3AED]
  font-black
  "
>
 
</div>
        </div>
      </div>

    </div>

  </div>
</section>
<FaqSection />
<Footer />

</div>
);
}
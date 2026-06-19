import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
} from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import {
  TEACHER,
  STATS,
  COURSES,
  TESTIMONIALS,
  FAQS,
  ANNOUNCEMENTS,
  GRADES,
} from "../data/mockData";
import { motion } from "framer-motion";


const gradeColors: Record<string, string> = {
  third_sec: "rose",
  second_sec: "violet",
  first_sec: "blue",
  primary: "emerald",
};

export function HomePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const featuredCourses = COURSES.filter(c => c.isFeatured || true).slice(0, 4);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0715]" dir="rtl">
      <Navbar />

      

      <section
  className="
  relative
  overflow-hidden
  min-h-[92vh]
  flex
  items-center
  pt-32
  lg:mt-24
  bg-gradient-to-br
  "
>

  {/* Chemistry Icons */}

  <div className="max-w-[1400px] mx-auto px-6 w-full mt-10">

    <div className="grid lg:grid-cols-2 gap-4 items-center">

      {/* TEXT */}
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center lg:text-right pt-8"
      >

        <Badge className="mb-6 px-5 py-2 text-sm bg-purple-500/20 text-purple-200 border-purple-500/30">
          ⚛️ المنصة التعليمية الأولى في الكيمياء
        </Badge>

        <h1 className="
text-5xl
lg:text-7xl
font-black
leading-tight
mb-6
text-slate-900
dark:text-white
">
         أهلا بك في منصة
          <br />
          <div className="relative">
            
           <> د. زياد ربيع
<br />

</>

          </div>
        </h1>

        <p className="
text-slate-600
dark:text-slate-300
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
border-violet-400
text-violet-700
bg-white
hover:bg-violet-50
"
          >
            سجل الآن مجاناً
          </Button>

        </div>

        <div className="flex gap-24 mt-20 justify-center lg:justify-start mt-16 border-t border-slate-200 pt-10">

        </div>

      </motion.div>

      {/* IMAGE */}
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="relative flex justify-center items-end mt-28"
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
  bg-violet-500/15
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

          {/* CARD 1 */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 9 }}
            className="
absolute
top-14
right-[-40px]
bg-white
rounded-[28px]
p-6
shadow-[0_20px_60px_rgba(15,23,42,0.15)]
"
          >
            <div className="flex items-center gap-2">
              <Users className="text-purple-600" size={20} />
              <span className="font-bold">2400+</span>
            </div>
            <p className="text-sm text-slate-500">
              طالب مسجل
            </p>
          </motion.div>

          {/* CARD 2 */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 7 }}
className="
absolute
top-32
left-[-30px]
bg-white
rounded-[28px]
p-6
shadow-[0_20px_60px_rgba(15,23,42,0.15)]
"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              <span className="font-bold">98%</span>
            </div>
            <p className="text-sm text-slate-500">
              معدل النجاح
            </p>
          </motion.div>
<motion.div
  animate={{ y: [0, -8, 0] }}
  transition={{ repeat: Infinity, duration: 9 }}
  className="absolute bottom-16 -right-8 bg-white dark:bg-white rounded-3xl p-5 shadow-2xl"
>
  <div className="flex items-center gap-2">
    <span className="text-purple-600 text-xl">🎓</span>
    <span className="font-bold">15+</span>
  </div>

  <p className="text-sm text-slate-500">
    سنة خبرة
  </p>
</motion.div>
        </div>

      </motion.div>

    </div>

  </div>

</section>
{/* FEATURES */}

<section className="
py-28
bg-gradient-to-b
from-white
via-slate-50
to-purple-50

dark:from-[#0b0715]
dark:via-[#130726]
dark:to-[#1a0930]
">

{/* Chemistry Background */}

<div className="absolute inset-0 overflow-hidden pointer-events-none">

  <Atom
    size={180}
    className="
    absolute
    top-20
    right-32
    text-violet-500/10
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
    text-purple-400/10
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

      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 text-purple-700 font-bold mb-6">
        ✨ مميزات المنصة
      </div>

      <h2 className="font-hala text-6xl">
        ليه تختار منصة د. زياد ربيع؟
      </h2>

      <p className="text-slate-500 text-xl">
        كل الأدوات اللي محتاجها عشان تحقق أعلى الدرجات في الكيمياء
      </p>

    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

      <div className="bg-white dark:bg-[#130726] rounded-[28px] p-8 shadow-xl hover:-translate-y-2 transition-all duration-300">
        <div className="w-20 h-20 rounded-3xl bg-purple-100 flex items-center justify-center text-5xl font-black mb-6 mx-auto">
          🎥
        </div>

        <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-4">
          فيديوهات عالية الجودة
        </h3>

        <p className="text-slate-500 text-center leading-relaxed">
          شرح احترافي وصوت وصورة بأعلى جودة لضمان أفضل تجربة تعليمية.
        </p>
      </div>

      <div className="bg-white dark:bg-[#130726] rounded-[28px] p-8 shadow-xl hover:-translate-y-2 transition-all duration-300">
        <div className="w-20 h-20 rounded-3xl bg-cyan-100 flex items-center justify-center text-5xl font-black mb-6 mx-auto">
          📊
        </div>

        <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-4">
          امتحانات تفاعلية
        </h3>

        <p className="text-slate-500 text-center leading-relaxed">
          اختبارات بعد كل درس مع تصحيح فوري وتحليل للنتائج.
        </p>
      </div>

      <div className="bg-white dark:bg-[#130726] rounded-[28px] p-8 shadow-xl hover:-translate-y-2 transition-all duration-300">
        <div className="w-20 h-20 rounded-3xl bg-violet-100 flex items-center justify-center text-5xl font-black mb-6 mx-auto">
          📚
        </div>

        <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-4">
          مراجعات شاملة
        </h3>

        <p className="text-slate-500 text-center leading-relaxed">
          مراجعات نهائية وأهم الأسئلة المتوقعة قبل الامتحانات.
        </p>
      </div>

      <div className="bg-white dark:bg-[#130726] rounded-[28px] p-8 shadow-xl hover:-translate-y-2 transition-all duration-300">
        <div className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center text-5xl font-black mb-6 mx-auto">
          🎯
        </div>

        <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-4">
          متابعة مستمرة
        </h3>

        <p className="text-slate-500 text-center leading-relaxed">
          متابعة الأداء والواجبات والتقدم الدراسي أولاً بأول.
        </p>
      </div>

    </div>

  </div>

</section>
{/* ================= GRADES SECTION ================= */}

<section className="
py-28
bg-slate-50
dark:bg-gradient-to-b
dark:from-[#0b0715]
dark:to-[#130726]
">

  <div className="max-w-[1600px] mx-auto px-6">

    <div className="text-center mb-20">

      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 text-purple-700 font-bold mb-6">
        🎓 اختر مرحلتك الدراسية
      </div>

      <h2 className="font-hala text-6xl">
  الصفوف الدراسية
</h2>

      <p className="text-slate-500 text-xl mb-10">
        اختر صفك الدراسي وابدأ رحلتك مع د. زياد ربيع
      </p>

      <div className="flex justify-center items-center gap-4">

        <div className="w-52 h-[3px] bg-cyan-800 rounded-full"></div>

        <div className="w-5 h-5 rotate-45 bg-cyan-800"></div>

        <div className="w-52 h-[3px] bg-cyan-800 rounded-full"></div>

      </div>

    </div>

   <div
  className="
    flex
    gap-10
    overflow-x-auto
    pb-24
    px-4
    mt-24
    scrollbar-hide
  "
  
>
  
<div
  className="
  absolute
  w-[700px]
  h-[700px]
  rounded-full
  bg-violet-600/20
  blur-[140px]
  "
/>
  {GRADES
    .filter((g) =>
      ["first_sec", "second_sec", "third_sec"].includes(g.id)
    )
    .map((grade) => {

      const course = COURSES.find(
        (c) => c.grade === grade.id && c.type === "yearly"
      );

      if (!course) return null;

      return (

       <div
  key={grade.id}
  onClick={() => navigate(`/grade/${grade.id}`)}
  className="group relative cursor-pointer w-[620px]"
>

          {/* Image */}
          <div className="overflow-hidden rounded-[20px] shadow-2xl">

            <img
              src={course.thumbnail}
              alt={course.title}
              className="
                w-full
                h-[280px]
                object-cover
                transition-all
                duration-500
                group-hover:scale-105
              "
            />

          </div>

          {/* Floating Card */}
          <div
            className="
              absolute
              left-1/2
              -translate-x-1/2
              -bottom-16
              w-[85%]
              bg-white dark:bg-[#130726]
              rounded-[12px]
              shadow-xl
              p-6
              text-center
            "
          >

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-5">
              {course.gradeLabel}
            </h3>

            <div className="w-full h-[2px] bg-cyan-400 mb-5"></div>

            <p className="text-slate-500 dark:text-slate-300">
              جميع كورسات {course.gradeLabel}
            </p>

          </div>

        </div>

      );
        })}
</div>

    </div>

</section>

<Footer />

</div>
);
}
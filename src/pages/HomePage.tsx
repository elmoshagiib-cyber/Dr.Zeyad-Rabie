import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
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


        <h2 className="
text-5xl
lg:text-7xl
font-black
leading-tight
mb-6
text-slate-900
dark:text-white
">
         أهلا بك فـي منصة
          <br />
          <div className="relative">
            
           <>مستــر زيــاد ربيــع 
<br />

</>

          </div>
        </h2>

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

      <h1 className="font-hala text-6xl">
        ليه تختار منصة مستر زياد ربيع؟
      </h1>

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

<section className="
py-28
bg-slate-50
dark:bg-gradient-to-b
dark:from-[#0b0715]
dark:to-[#130726]
">

  <div className="max-w-[1600px] mx-auto px-6">

    <div className="text-center mb-20">

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

<div className="grid lg:grid-cols-2 gap-10 mt-20">

  <div
    onClick={() => navigate("/stage/secondary")}
    className="
      group
      cursor-pointer
      bg-white
      rounded-[32px]
      p-10
      shadow-xl
      hover:-translate-y-2
      transition-all
    "
  >
    <div className="flex items-center justify-between">

      <div>
        <h3 className="text-4xl font-black mb-4">
          المراحل الثانوية
        </h3>

        <p className="text-slate-500 text-lg">
          الصف الأول الثانوي - الصف الثاني الثانوي - الصف الثالث الثانوي
        </p>

        <button
          className="
            mt-8
            bg-violet-600
            text-white
            px-8
            py-3
            rounded-2xl
          "
        >
          عرض الصفوف
        </button>
      </div>

      <img
        src="/images/secondary-stage.png"
        className="w-52"
      />
    </div>
  </div>

  <div
    onClick={() => navigate("/stage/prep")}
    className="
      group
      cursor-pointer
      bg-white
      rounded-[32px]
      p-10
      shadow-xl
      hover:-translate-y-2
      transition-all
    "
  >
    <div className="flex items-center justify-between">

      <div>
        <h3 className="text-4xl font-black mb-4">
          المراحل الإعدادية
        </h3>

        <p className="text-slate-500 text-lg">
          الصف الأول الإعدادي - الصف الثاني الإعدادي - الصف الثالث الإعدادي
        </p>

        <button
          className="
            mt-8
            bg-violet-600
            text-white
            px-8
            py-3
            rounded-2xl
          "
        >
          عرض الصفوف
        </button>
      </div>

      <img
        src="/images/prep-stage.png"
        className="w-52"
      />
    </div>
  </div>
   
</div>

    </div>

</section>

<Footer />

</div>
);
}
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
export default function GradesPage() {
const { stage } = useParams();
const navigate = useNavigate();

const grades =
stage === "secondary"
? [
{
id: "first_sec",
title: "الصف الأول الثانوي",
image: "/images/course-science1.jpg",
},
{
id: "second_sec",
title: "الصف الثاني الثانوي",
image: "/images/course-chemistry2.jpg",
},
{
id: "third_sec",
title: "الصف الثالث الثانوي",
image: "/images/course-chemistry3.jpg",
},
]
: [
{
id: "first_prep",
title: "الصف الأول الإعدادي",
image: "/images/prep1.jpg",
},
{
id: "second_prep",
title: "الصف الثاني الإعدادي",
image: "/images/prep2.jpg",
},
{
id: "third_prep",
title: "الصف الثالث الإعدادي",
image: "/images/prep3.jpg",
},
];

return (
  <>
    <Navbar />

  <div
    className="
    min-h-screen
    bg-white
    dark:bg-[#09090B]
    relative
    overflow-hidden
    "
  >

<div
className="
absolute
top-0
left-1/2
-translate-x-1/2
w-[900px]
h-[500px]
bg-[#A52DFF]/8
blur-[180px]
rounded-full
pointer-events-none
"
/>

<div
className="
absolute
bottom-0
right-0
w-[500px]
h-[500px]
bg-fuchsia-500/10
blur-[180px]
rounded-full
pointer-events-none
"
/>


<div className="max-w-[1600px] mx-auto py-28 px-6 relative z-10">

<h1
className="
text-6xl
font-black
text-center
text-slate-900
dark:text-white
"
>
    {stage === "secondary" ? (
<>
المرحلة

<span
className="
bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8]
bg-clip-text
text-transparent
"
>
 الثانوية
</span>
</>
) : (
<>
المرحلة

<span
className="
bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8]
bg-clip-text
text-transparent
"
>
 الإعدادية
</span>
</>
)}
  </h1>

<p
 className="
text-slate-300
dark:text-slate-400
 text-xl
 text-center
 mt-5
 mb-16
 "
>
اختر صفك الدراسي وابدأ رحلتك التعليمية
</p>

<div className="flex justify-center items-center gap-4 mt-8 mb-20">

  <div
    className="
    w-40
    h-[3px]
    rounded-full
    bg-gradient-to-r
    from-[#7C1DCC]
    via-[#A52DFF]
    to-[#D900A8]
    "
  />

  <div
    className="
    w-4
    h-4
    rotate-45
    bg-gradient-to-r
    from-[#7C1DCC]
    via-[#A52DFF]
    to-[#D900A8]
    "
  />

  <div
    className="
    w-40
    h-[3px]
    rounded-full
    bg-gradient-to-r
    from-[#7C1DCC]
    via-[#A52DFF]
    to-[#D900A8]
    "
  />

</div>


  <div className="grid lg:grid-cols-3 gap-11 max-w-[1800px] mx-auto">

    {grades.map((grade) => (
<motion.div
  key={grade.id}
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
  whileHover={{
  y: -10,
}}
  onClick={() => navigate(`/grade/${grade.id}`)}
  className="
  bg-white
dark:bg-[#130726]
  rounded-[32px]
  overflow-hidden
  cursor-pointer
  group
  shadow-[0_20px_50px_rgba(124,29,204,0.18)]
hover:shadow-[0_25px_70px_rgba(217,0,168,0.30)]
  transition-all
  duration-500
  "
>

  {/* Image */}
  <div className="overflow-hidden relative">

    <img
      src={grade.image}
      alt={grade.title}
      className="
w-full
h-[280px]
object-cover
saturate-[1.05]
transition-all
duration-700
group-hover:scale-110
group-hover:saturate-[1.4]
group-hover:brightness-110
"
    />
<div
  className="
  absolute
  inset-0
  opacity-0
  group-hover:opacity-100
  transition-all
  duration-700
  bg-gradient-to-r
  from-transparent
  via-white/20
  to-transparent
  -translate-x-full
  group-hover:translate-x-full
  "
/>
    {/* Light Effect */}
    <div
      className="
      absolute
      inset-0
      opacity-0
      group-hover:opacity-100
      transition-all
      duration-700
      bg-gradient-to-r
      from-transparent
      via-white/20
      to-transparent
      -translate-x-full
      group-hover:translate-x-full
      "
    />
  </div>

  {/* Content */}
 <div className="p-6 flex items-center justify-between">

  <h3
    className="
    text-3xl
    font-black
    text-slate-900
dark:text-white
    "
  >
    {grade.title}
  </h3>

  <button
  className="
  bg-gradient-to-r
  from-[#7C1DCC]
  via-[#A52DFF]
  to-[#D900A8]
  text-white
  px-6
  py-3
  rounded-2xl
  font-bold
  flex
  items-center
  gap-2
  shadow-[0_10px_30px_rgba(165,45,255,0.35)]
  transition-all
  duration-300
  group-hover:scale-105
  "
>
    ابدأ الآن
    <ArrowLeft size={18} />
  </button>

</div>

</motion.div>
    
    ))}

  </div>
     </div> {/* grid */}

    </div> {/* container */}

    <Footer />
  </>
);
}
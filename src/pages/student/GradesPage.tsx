import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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

return ( <div className="max-w-[1600px] mx-auto py-20 px-6 relative">


<h1 className="text-6xl font-black text-center">
    {stage === "secondary"
      ? "المرحلة الثانوية"
      : "المرحلة الإعدادية"}
  </h1>

<p
 className="
 text-slate-500
 text-xl
 text-center
 mt-5
 mb-16
 "
>
اختر صفك الدراسي وابدأ رحلتك التعليمية
</p>

<div
  className="
  absolute
  top-0
  left-1/2
  -translate-x-1/2
  w-[900px]
  h-[500px]
  bg-pink-500/10
  blur-[180px]
  rounded-full
  pointer-events-none
  "
/>

  <div className="grid lg:grid-cols-3 gap-10 max-w-[1800px] mx-auto">

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
  rounded-[32px]
  overflow-hidden
  cursor-pointer
  group
  shadow-xl
  hover:shadow-2xl
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
    "
  >
    {grade.title}
  </h3>

  <button
    className="
    bg-red-500
    text-white
    px-6
    py-3
    rounded-2xl
    font-bold
    flex
    items-center
    gap-2
    "
  >
    ابدأ الآن
    <ArrowLeft size={18} />
  </button>

</div>

</motion.div>
    
    ))}

  </div>
</div>

);
}
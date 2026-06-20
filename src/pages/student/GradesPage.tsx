import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

return ( <div className="max-w-7xl mx-auto py-20 px-6 relative">


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
<div
  key={grade.id}
  onClick={() => navigate(`/grade/${grade.id}`)}
  className="
  bg-white
  rounded-[28px]
  overflow-hidden
  shadow-xl
  cursor-pointer
  group
  transition-all
  duration-500
  hover:-translate-y-2
  hover:shadow-[0_25px_70px_rgba(0,0,0,0.15)]
  border
  border-slate-100
  "
>

  {/* Image */}
  <div className="overflow-hidden relative">

    {/* Badge */}
    <div className="absolute top-4 right-4 z-20">
      <span
        className="
        bg-cyan-500
        text-white
        px-4
        py-2
        rounded-full
        text-sm
        font-bold
        shadow-lg
        "
      >
        12 كورس
      </span>
    </div>

    <img
      src={grade.image}
      alt={grade.title}
      className="
      w-full
      h-[300px]
      object-cover
      transition-all
      duration-700
      group-hover:scale-105
      "
    />

  </div>

  {/* Footer */}
  <div
    className="
    px-6
    py-5
    flex
    items-center
    justify-between
    "
  >

    <button
      className="
      bg-cyan-500
      hover:bg-cyan-600
      text-white
      px-6
      py-3
      rounded-2xl
      flex
      items-center
      gap-2
      transition-all
      duration-300
      "
    >
      <ArrowLeft size={18} />
      ابدأ الآن
    </button>

    <h3
      className="
      text-2xl
      lg:text-3xl
      font-black
      text-slate-900
      text-right
      "
    >
      {grade.title}
    </h3>

  </div>


</div>
    
    ))}

  </div>
</div>

);
}
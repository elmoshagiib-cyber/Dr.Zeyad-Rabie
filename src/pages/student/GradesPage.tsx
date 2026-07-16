import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

      <div className="min-h-screen bg-white dark:bg-[#09090B] relative overflow-hidden">

        <div className="max-w-[1600px] mx-auto py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative z-10">

{/* ── العنوان ── */}
<img
  src={
    stage === "secondary"
      ? "/typography/secondary-title.png"
      : "/typography/prep-title.png"
  }
  alt={
    stage === "secondary"
      ? "المرحلة الثانوية"
      : "المرحلة الإعدادية"
  }
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

         
  

          {/* ── الكروت ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7 lg:gap-11 max-w-[1800px] mx-auto">
            {grades.map((grade) => (
              <motion.div
                key={grade.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.015 }}
                onClick={() => navigate(`/grade/${grade.id}`)}
                className="
                  bg-white
                  dark:bg-[#130726]
                  rounded-[24px]
                  sm:rounded-[28px]
                  lg:rounded-[32px]
                  overflow-hidden
                  cursor-pointer
                  group
                  shadow-[0_6px_18px_rgba(0,0,0,.08)]
                  hover:shadow-[0_10px_28px_rgba(0,0,0,.12)]
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
                      h-[180px]
                      sm:h-[200px]
                      lg:h-[220px]
                      object-cover
                      transition-all
                      duration-700
                      ease-out
                      group-hover:scale-[1.08]
                      group-hover:brightness-110
                      group-hover:saturate-110
                    "
                  />
                  {/* Light Effect */}
                  <div className="
                    absolute inset-0
                    opacity-0
                    group-hover:opacity-100
                    transition-all duration-700
                    bg-gradient-to-r from-transparent via-white/20 to-transparent
                    -translate-x-full group-hover:translate-x-full
                  " />
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 lg:px-7 py-4 sm:py-5 flex items-center justify-between gap-3">
                  <h3 className="
                    text-base
                    sm:text-[18px]
                    lg:text-[22px]
                    xl:text-[24px]
                    font-black
                    leading-tight
                    text-slate-900
                    dark:text-white
                    flex-1
                    min-w-0
                  ">
                    {grade.title}
                  </h3>

                  <button className="
                    bg-[#371143]
                    hover:bg-[#4A175B]
                    text-white
                    h-10
                    sm:h-11
                    lg:h-12
                    px-3
                    sm:px-4
                    lg:px-5
                    rounded-xl
                    sm:rounded-2xl
                    font-bold
                    flex
                    items-center
                    gap-1.5
                    sm:gap-2
                    text-sm
                    sm:text-base
                    shadow-[0_6px_18px_rgba(0,0,0,.08)]
                    hover:shadow-[0_10px_28px_rgba(0,0,0,.12)]
                    transition-all
                    duration-300
                    group-hover:scale-105
                    shrink-0
                  ">
                    ابدأ الآن
                    <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        <Footer />
      </div>
    </>
  );
}
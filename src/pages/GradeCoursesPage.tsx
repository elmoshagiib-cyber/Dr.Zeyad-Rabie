import { useParams } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import GradeCoursesContent from "./student/GradeCoursesContent";

export default function GradeCoursesPage() {
  const { grade } = useParams();

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B]" dir="rtl">
      <Navbar />

      <div className="pt-24 sm:pt-28">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14 sm:py-20 lg:py-28 text-center relative z-10">
            <img
              src="/typography/courses-title.png"
              alt="الكورسات المتاحة"
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
        </div>

        <GradeCoursesContent grade={grade!} />
      </div>

      <Footer />
    </div>
  );
}
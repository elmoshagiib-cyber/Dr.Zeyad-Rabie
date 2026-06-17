import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function GradeCoursesPage() {

  const { grade } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<any[]>([]);

  const gradeNames: Record<string, string> = {
    first_sec: "الصف الأول الثانوي",
    second_sec: "الصف الثاني الثانوي",
    third_sec: "الصف الثالث الثانوي",
    primary: "المرحلة الابتدائية",
  };

  useEffect(() => {
    loadCourses();
  }, [grade]);

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("active", true)
      .eq("grade", grade);

    setCourses(data || []);
    console.log(data);
  };

 return (
  <div
    className="min-h-screen bg-slate-50 dark:bg-[#0b0715]"
    dir="rtl"
  >
    <Navbar />

    <div className="pt-16">

  <div className="
  bg-gradient-to-br
  from-slate-900
  to-blue-900
  dark:from-[#0b0715]
  dark:to-[#1a0930]
  py-20
  ">

    <div className="max-w-7xl mx-auto px-6 text-center">

      <div className="
      inline-flex
      px-5 py-2
      rounded-full
      bg-blue-500/20
      text-blue-300
      border
      border-blue-500/30
      mb-5
      ">
        الصف الدراسي
      </div>

      <h1 className="
      font-hala
      text-5xl
      md:text-7xl
      text-white
      mb-6
      ">
        {gradeNames[grade as string]}
      </h1>

      <p className="text-slate-300 text-xl">
        عدد الكورسات المتاحة:
        <span className="font-black mr-2">
          {courses.length}
        </span>
      </p>

    </div>

  </div>

      
      {/* Courses */}

      <div className="max-w-7xl mx-auto px-6 py-16">

        {courses.length === 0 ? (

          <div className="text-center py-24">

            <h3 className="text-2xl font-bold text-white mb-4">
              لا توجد كورسات حالياً
            </h3>

            <p className="text-slate-400">
              سيتم إضافة الكورسات قريباً
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {courses.map((course) => (

              <Card
  key={course.id}
  hover
  className="
  overflow-hidden
  group
  bg-white
  dark:bg-[#130726]
  "
>
<div className="relative overflow-hidden">

  <img
    src={
      course.thumbnail ||
      "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400"
    }
    alt={course.title}
    className="
    w-full
    h-56
    object-cover
    transition-all
    duration-500
    group-hover:scale-105
    "
  />

  {course.price === 0 && (
    <div className="absolute top-3 left-3">
      <span
        className="
        bg-emerald-500
        text-white
        px-3
        py-1
        rounded-full
        text-xs
        font-bold
      "
      >
        مجاني
      </span>
    </div>
  )}

</div>

                <CardContent>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">
                    {course.title}
                  </h3>

                  <p className="text-slate-500 mb-5 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between">

                    <span className="font-black text-emerald-500">
                      {course.price === 0
                        ? "مجاني"
                        : `${course.price} جنيه`}
                    </span>

                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`/courses/${course.id}`)
                      }
                    >
                      عرض الكورس
                    </Button>

                  </div>

                </CardContent>

              </Card>

            ))}

          </div>

        )}

      </div>

    </div>

    <Footer />
  </div>
);
}
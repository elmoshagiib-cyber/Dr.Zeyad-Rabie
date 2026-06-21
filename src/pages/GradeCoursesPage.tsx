import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
export default function GradeCoursesPage() {

  const { grade } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<any[]>([]);
const term1Courses = courses.filter(
  (course) => course.category === "term1"
);

const term2Courses = courses.filter(
  (course) => course.category === "term2"
);

const revisionCourses = courses.filter(
  (course) => course.category === "revision"
);

const freeCourses = courses.filter(
  (course) => course.category === "free"
);

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
    .eq("grade", grade)
    .order("sort_order", { ascending: true });

  setCourses(data || []);
};

const renderCourseCards = (courseList: any[]) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
    {courseList.map((course) => (
      <Card
        key={course.id}
        hover
        className="
        overflow-hidden
        rounded-[24px]
        border
        border-slate-200
        bg-white
        shadow-lg
        min-h-[620px]
        flex
        flex-col
        "
      >
        <div className="relative">

          <img
            src={
              course.thumbnail ||
              "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=1200"
            }
            alt={course.title}
            className="
            w-full
            h-[220px]
            object-cover
            "
          />

          {course.price === 0 && (
            <div className="absolute top-4 right-4">
              <span
                className="
                bg-blue-500
                text-white
                px-4
                py-2
                rounded-xl
                text-sm
                font-bold
                "
              >
                هذا الكورس مجاني
              </span>
            </div>
          )}

        </div>

        <CardContent className="p-6 flex flex-col flex-1">

          <h3
            className="
            text-xl
            font-black
            text-slate-900
            mb-2
            line-clamp-2
            "
          >
            {course.title}
          </h3>

          <p
            className="
            text-slate-500
            text-base
            mb-6
            line-clamp-2
            "
          >
            {course.description}
          </p>

          <div
            className="
            flex
            items-center
            justify-between
            text-slate-500
            text-sm
            mb-6
            "
          >
            <span>17 أبريل 2026</span>
            <span>5 مايو 2026</span>
          </div>

          <hr className="mb-6 border-slate-200" />

          <div className="mt-auto" />

          <div className="flex gap-3">

            <Button
              className="
              flex-1
              bg-[#6b6d52]
              hover:bg-[#5b5d45]
              text-white
              "
            >
              اشترك الآن
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              تفاصيل الكورس
            </Button>

          </div>

        </CardContent>

      </Card>
    ))}
  </div>
);

 return (
  <div
    className="min-h-screen bg-slate-50 dark:bg-[#0b0715]"
    dir="rtl"
  >
    <Navbar />

    <div className="pt-16">

  



      
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
group
overflow-hidden
rounded-[24px]
border
border-slate-200
bg-white
shadow-lg
min-h-[620px]
flex
flex-col
transition-all
duration-500
hover:-translate-y-2
hover:shadow-2xl
"
>

  <div className="relative">

  <img
  src={
    course.thumbnail ||
    "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=1200"
  }
  alt={course.title}
  className="
w-full
h-[220px]
object-cover
transition-all
duration-700
ease-out
brightness-95
saturate-75
group-hover:scale-110
group-hover:saturate-125
group-hover:brightness-105
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
</div>
<CardContent className="p-6 flex flex-col flex-1">

  <h3
    
  className="
  text-xl
  font-black
  text-slate-900
  mb-2
  line-clamp-2
  transition-all
  duration-300
  group-hover:text-violet-600
  "

  >
    {course.title}
  </h3>

  <p
    className="
    text-slate-500
    text-base
    mb-6
    line-clamp-2
    "
  >
    {course.description}
  </p>

  <div
    className="
    flex
    items-center
    justify-between
    text-slate-500
    text-sm
    mb-6
    "
  >
    <span>17 أبريل 2026</span>
    <span>5 مايو 2026</span>
  </div>

  <hr className="mb-6 border-slate-200" />
<div className="mt-auto">
  
</div>
  <div className="flex gap-3">

    <Button
  className="
  flex-1
  bg-[#6b6d52]
  hover:bg-[#5b5d45]
  text-white
  transition-all
  duration-300
  hover:scale-105
  "
    >
      اشترك الآن
    </Button>

    <Button
      variant="outline"
      className="flex-1"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      تفاصيل الكورس
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
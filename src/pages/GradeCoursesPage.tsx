import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { BookOpen, Clock, Tag } from "lucide-react";

export default function GradeCoursesPage() {
  const { grade } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 const gradeNames: Record<string, string> = {
  prep_1: "الصف الأول الإعدادي",
  prep_2: "الصف الثاني الإعدادي",
  prep_3: "الصف الثالث الإعدادي",

  sec_1: "الصف الأول الثانوي",
  sec_2: "الصف الثاني الثانوي",
  sec_3: "الصف الثالث الثانوي",
};
  useEffect(() => {
    loadCourses();
    console.log("URL GRADE =", grade);
  }, [grade]);

  const loadCourses = async () => {
    setLoading(true);
const { data, error } = await supabase
  .from("courses")
  .select(`
    *,
    course_sections (
      id,
      course_items (
        id,
        type
      )
    )
  `)
  .eq("is_published", true)
  .eq("is_hidden", false)
  .eq("grade", grade)
  .order("created_at", { ascending: false });

console.log("==========");
console.log("USER:", localStorage.getItem("user"));
console.log("GRADE:", grade);
console.log("DATA:", data);
console.log("ERROR:", error);
console.log("==========");

console.log(data);
if (error) {
  console.log("SUPABASE ERROR:", error);
  alert(JSON.stringify(error, null, 2));
  setLoading(false);
  return;
}

setCourses(data || []);
setLoading(false);
  };

  /* ─── single course card ─── */
  const CourseCard = ({ course }: { course: any }) => (
    <Card
      hover
      className="
        group overflow-hidden rounded-2xl
        border border-slate-200 dark:border-white/10
        bg-white dark:bg-[#130726]
        shadow-md hover:shadow-xl
        flex flex-col
        transition-all duration-500
        hover:-translate-y-1
      "
    >
      {/* thumbnail */}
      <div className="relative overflow-hidden aspect-video w-full">
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800"
          }
          alt={course.title}
          className="
            w-full h-full object-cover
            transition-transform duration-700
            group-hover:scale-105
            brightness-95 group-hover:brightness-100
          "
        />

        {/* free badge */}
        {course.is_free && (
          <span className="
            absolute top-3 right-3
            bg-blue-500 text-white
            text-xs sm:text-sm font-bold
            px-3 py-1 rounded-lg
            shadow
          ">
            مجاني
          </span>
        )}

        {/* category badge */}
        {course.category && (
          <span className="
            absolute top-3 left-3
            bg-black/50 backdrop-blur-sm text-white
            text-xs font-semibold
            px-2.5 py-1 rounded-lg
          ">
            {course.category === 'term1' && 'الترم الأول'}
            {course.category === 'term2' && 'الترم الثاني'}
            {course.category === 'revision' && 'مراجعة'}
            {course.category === 'free' && 'مجاني'}
          </span>
        )}

        {/* shine overlay */}
        <div className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-700
          bg-gradient-to-r from-transparent via-white/15 to-transparent
          -translate-x-full group-hover:translate-x-full
          transition-transform duration-1000
        " />
      </div>

      {/* content */}
      <CardContent className="p-4 sm:p-5 flex flex-col flex-1 gap-3">

        {/* title */}
        <h3 className="
          text-base sm:text-lg font-black
          text-slate-900 dark:text-white
          line-clamp-2
          group-hover:text-[#5C1D75] dark:group-hover:text-[#F6AC08]
          transition-colors duration-300
        ">
          {course.title}
        </h3>

        {/* description */}
        <p className="
          text-sm text-slate-500 dark:text-slate-400
          line-clamp-2 flex-1
        ">
          {course.description}
        </p>

        {/* dates row */}
        <div className="
          flex items-center justify-between
          text-xs sm:text-sm text-slate-400 dark:text-slate-500
          border-t border-slate-100 dark:border-white/10
          pt-3
        ">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            17 أبريل 2026
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            5 مايو 2026
          </span>
        </div>

        {/* price */}
        <div className="flex items-center gap-1.5">
  <Tag className="w-4 h-4 text-purple-500" />

  <span
    className={`text-base sm:text-lg font-black ${
      course.is_free
        ? "text-emerald-600"
        : "text-purple-600 dark:text-purple-400"
    }`}
  >
    {course.is_free ? "مجاني" : `${course.price} جنيه`}
  </span>
</div>

        {/* actions */}
        <div className="flex gap-2 sm:gap-3 mt-1">
          <Button
            className="
              flex-1 text-xs sm:text-sm py-2 sm:py-2.5
              bg-[#371143] hover:bg-[#4A175B]
              text-white transition-all duration-300
              hover:scale-[1.02]
            "
          >
            {course.is_free ? "ابدأ مجانًا" : "اشترك الآن"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            تفاصيل
          </Button>
        </div>

      </CardContent>
    </Card>
  );

  /* ─── section block ─── */
  const CourseSection = ({
    title,
    icon,
    list,
    accent,
  }: {
    title: string;
    icon: React.ReactNode;
    list: any[];
    accent: string;
  }) => {
    if (list.length === 0) return null;
    return (
      <section className="mb-12 sm:mb-16">
        {/* section heading */}
        <div className="flex items-center gap-3 mb-5 sm:mb-7">
          <div className={`w-1 h-8 rounded-full ${accent}`} />
          <span className="text-slate-400 dark:text-slate-500">{icon}</span>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
            {title}
          </h2>
          <span className="
            mr-auto text-xs sm:text-sm font-bold
            bg-slate-100 dark:bg-white/10
            text-slate-500 dark:text-slate-400
            px-2.5 py-1 rounded-full
          ">
            {list.length} كورس
          </span>
        </div>

        {/* cards grid */}
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          gap-4 sm:gap-6
        ">
          {list.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>
    );
  };

  /* ─── categorised lists ─── */
  const term1   = courses.filter(c => c.category === 'term1');
  const term2   = courses.filter(c => c.category === 'term2');
  const revision = courses.filter(c => c.category === 'revision');
  const free    = courses.filter(c => c.category === 'free');
  const other   = courses.filter(
    c => !['term1','term2','revision','free'].includes(c.category)
  );

  const hasSections = term1.length || term2.length || revision.length || free.length;

  /* ════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0715]" dir="rtl">
      <Navbar />

      <div
  className="
    pt-24
    sm:pt-28
  "
>

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden">
          {/* bg blobs */}
          

          <div className="
            max-w-5xl mx-auto
            px-4 sm:px-8
            py-14 sm:py-20 lg:py-28
            text-center relative z-10
          ">
            

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
        {/* ── COURSES AREA ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

          {/* loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="
                  rounded-2xl overflow-hidden
                  bg-white dark:bg-[#130726]
                  border border-slate-200 dark:border-white/10
                  animate-pulse
                ">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                      <div className="flex-1 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* empty state */}
          {!loading && courses.length === 0 && (
            <div className="text-center py-20 sm:py-32">
              <div className="
                w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6
                rounded-2xl bg-slate-100 dark:bg-white/10
                flex items-center justify-center
              ">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="
                text-xl sm:text-3xl font-black
                text-slate-900 dark:text-white mb-3
              ">
                لا توجد كورسات متاحة حالياً
              </h3>
              <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">
                سيتم إضافة الكورسات قريبًا...
              </p>
            </div>
          )}

          {/* categorised sections */}
          {!loading && hasSections ? (
            <>
              <CourseSection
                title="كورسات الترم الأول"
                icon={<BookOpen className="w-5 h-5" />}
                list={term1}
                accent="bg-purple-500"
              />
              <CourseSection
                title="كورسات الترم الثاني"
                icon={<BookOpen className="w-5 h-5" />}
                list={term2}
                accent="bg-blue-500"
              />
              <CourseSection
                title="كورسات المراجعة"
                icon={<BookOpen className="w-5 h-5" />}
                list={revision}
                accent="bg-amber-500"
              />
              <CourseSection
                title="الكورسات المجانية"
                icon={<BookOpen className="w-5 h-5" />}
                list={free}
                accent="bg-green-500"
              />
              {other.length > 0 && (
                <CourseSection
                  title="كورسات أخرى"
                  icon={<BookOpen className="w-5 h-5" />}
                  list={other}
                  accent="bg-slate-400"
                />
              )}
            </>
          ) : (
            /* flat grid — no categories */
            !loading && courses.length > 0 && (
              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-3
                gap-4 sm:gap-6
              ">
                {courses.map(c => <CourseCard key={c.id} course={c} />)}
              </div>
            )
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
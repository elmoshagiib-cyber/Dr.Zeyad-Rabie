import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, BookOpen, Users, Star, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";



const gradeColors: Record<string, string> = {
  third_sec: "rose",
  second_sec: "violet",
  first_sec: "blue",
  primary: "emerald",
};

const gradeOptions = [
  { value: "", label: "جميع المراحل" },

  { value: "first_sec", label: "الصف الأول الثانوي" },
  { value: "second_sec", label: "الصف الثاني الثانوي" },
  { value: "third_sec", label: "الصف الثالث الثانوي" },

  { value: "first_prep", label: "الصف الأول الإعدادي" },
  { value: "second_prep", label: "الصف الثاني الإعدادي" },
  { value: "third_prep", label: "الصف الثالث الإعدادي" },
];

const typeOptions = [
  { value: "", label: "جميع الأنواع" },
  { value: "yearly", label: "كورس سنوي" },
  { value: "monthly", label: "كورس شهري" },
  { value: "revision", label: "كورس مراجعة" },
  { value: "free", label: "مجاني" },
];

export function CoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("");
  const [type, setType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
  console.log(data);
  setCourses(data);
}
  };
  const filtered = courses.filter((c) => {
  const matchSearch =
    c.title?.includes(search) ||
    c.description?.includes(search);

  const matchGrade =
    !grade || c.grade === grade;

  const matchType =
    !type || c.type === type;

  return matchSearch && matchGrade && matchType;
});
  return (
    <div
className="
min-h-screen
bg-white
dark:bg-[#09090B]
"
dir="rtl"
>
      <Navbar />
      <div className="pt-4">
        {/* Hero */}
        <section
className="
relative
py-24
lg:py-32
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
bg-[#A52DFF]/15
blur-[180px]
rounded-full
pointer-events-none
"
/>

<div className="max-w-7xl mx-auto px-6 text-center relative z-10">


<h1
className="
text-5xl
lg:text-7xl
font-black
text-white
mb-6
"
>
الكورسات
</h1>

<p
className="
text-slate-400
text-xl
max-w-2xl
mx-auto
"
>
اختر الكورس المناسب وابدأ رحلة التعلم
</p>

<div className="flex justify-center items-center gap-4 mt-10">

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
<div className="max-w-xl mx-auto relative mt-12">
  <Search
    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
    size={20}
  />

  <input
    type="text"
    placeholder="ابحث عن كورس..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="
    w-full
    pr-12
    pl-4
    py-4
    rounded-2xl
    bg-white/5
    backdrop-blur-xl
    border
    border-white/10
    text-white
    placeholder-slate-400
    focus:outline-none
    focus:ring-2
    focus:ring-[#A52DFF]
    "
  />
</div>
</div>

</section>
          

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12">
          {/* Filter Bar */}
          <div
className="
mb-10
rounded-3xl
border
border-white/10
bg-white/5
backdrop-blur-xl
p-5
flex
flex-wrap
items-center
gap-3
"
>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Filter size={16} />
              <span>تصفية:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">

  {/* جميع المراحل */}
  <button
    onClick={() => setGrade("")}
    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
      grade === ""
        ? "bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] text-white"
        : "bg-white/5 border border-white/10 text-slate-300"
    }`}
  >
    جميع المراحل
  </button>

  {/* فاصل */}
  <div className="w-px h-8 bg-white/10 mx-2" />

  {/* الثانوية */}
  <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-bold">
  الثانوية
</span>

  <button
    onClick={() => setGrade("first_sec")}
    className={`px-4 py-2 rounded-xl text-sm ${
      grade === "first_sec"
        ? "bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] text-white"
        : "bg-white/5 border border-white/10 text-slate-300"
    }`}
  >
    أولى ثانوي
  </button>

  <button
    onClick={() => setGrade("second_sec")}
    className={`px-4 py-2 rounded-xl text-sm ${
      grade === "second_sec"
        ? "bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] text-white"
        : "bg-white/5 border border-white/10 text-slate-300"
    }`}
  >
    ثانية ثانوي
  </button>

  <button
    onClick={() => setGrade("third_sec")}
    className={`px-4 py-2 rounded-xl text-sm ${
      grade === "third_sec"
        ? "bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] text-white"
        : "bg-white/5 border border-white/10 text-slate-300"
    }`}
  >
    ثالثة ثانوي
  </button>

  {/* فاصل */}
  <div className="w-px h-8 bg-white/10 mx-2" />

  {/* الإعدادي */}
  <span className="px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 text-xs font-bold">
  الإعدادي
</span>

  <button
    onClick={() => setGrade("first_prep")}
    className={`px-4 py-2 rounded-xl text-sm ${
      grade === "first_prep"
        ? "bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] text-white"
        : "bg-white/5 border border-white/10 text-slate-300"
    }`}
  >
    أولى إعدادي
  </button>

  <button
    onClick={() => setGrade("second_prep")}
    className={`px-4 py-2 rounded-xl text-sm ${
      grade === "second_prep"
        ? "bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] text-white"
        : "bg-white/5 border border-white/10 text-slate-300"
    }`}
  >
    ثانية إعدادي
  </button>

  <button
    onClick={() => setGrade("third_prep")}
    className={`px-4 py-2 rounded-xl text-sm ${
      grade === "third_prep"
        ? "bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] text-white"
        : "bg-white/5 border border-white/10 text-slate-300"
    }`}
  >
    ثالثة إعدادي
  </button>

</div>
            <div className="mr-auto flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="
flex
items-center
gap-2
px-4
py-2
rounded-xl
text-sm
font-medium
bg-white/5
border
border-white/10
text-slate-300
hover:border-violet-500/40
transition-all
"
              >
                <SlidersHorizontal
  className={`
    transition-all
    duration-300
    ${showFilters ? "rotate-180" : ""}
  `}
/>
                فلاتر أخرى
              </button>
            </div>
          </div>

          <AnimatePresence>
  {showFilters && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="
      overflow-hidden
      mt-4
      rounded-3xl
      border
      border-white/10
      bg-[#130726]
      p-6
      "
    >
      <div className="bg-[#10051f] rounded-2xl border border-white/10 p-5">

        <label className="text-xs font-bold text-slate-400 mb-3 block">
          نوع الكورس
        </label>

        <div className="flex flex-wrap gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                type === opt.value
                  ? "bg-gradient-to-r from-[#7C1DCC] via-[#A52DFF] to-[#D900A8] text-white"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:border-violet-500/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

      </div>
    </motion.div>
  )}
</AnimatePresence>

          {/* Results info */}
          <div className="flex items-center justify-between mb-6">
           <p className="text-slate-300 text-base font-semibold">
              عرض <span className="font-bold text-slate-300 dark:text-white">{filtered.length}</span> كورس
            </p>
          </div>

          {/* Courses Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-bold text-slate-700 mb-2">لا توجد نتائج</p>
              <p className="text-slate-300 dark:text-slate-300">جرب كلمات بحث مختلفة أو غيّر الفلاتر</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(course => (
                <Card
key={course.id}
className="
overflow-hidden
rounded-[32px]
bg-[#130726]
border
border-white/10
shadow-[0_20px_50px_rgba(124,29,204,0.18)]
hover:shadow-[0_25px_70px_rgba(217,0,168,0.30)]
hover:-translate-y-2
transition-all
duration-500
"
>
  
                  <div className="relative overflow-hidden rounded-t-2xl">
                   <img
  src={
    course.thumbnail ||
    "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400&h=250&fit=crop"
  }
  alt={course.title}
  className="
w-full
aspect-video
object-cover
hover:scale-105
transition-all
duration-500
"
/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <Badge
className="
bg-violet-500/20
text-violet-300
border-violet-500/30
"
>
  {gradeOptions.find(
    g => g.value === course.grade
  )?.label}
</Badge>
                    </div>
                    {course.price === 0 && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="emerald">مجاني</Badge>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-white text-xs font-bold">{5}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent>
                    <div className="mb-2">
                     <Badge variant="slate" className="mb-2">
  كورس
</Badge>
                    </div>
                    <h3 className="font-bold text-white dark:text-white mb-2 leading-tight">{course.title}</h3>
                    <p className="text-sm text-slate-300 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-300 mb-4">
                      <span className="flex items-center gap-1.5">
  <Users size={13} />
  0 طالب
</span>
                     <span className="flex items-center gap-1.5">
  <BookOpen size={13} />
  لا يوجد دروس
</span>
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                      <div>
                        {course.isFree ? (
                          <span className="text-xl font-black text-emerald-600">مجاني</span>
                        ) : (
                          <span className="text-xl font-black text-white">{course.price} <span className="text-sm font-medium text-slate-300">جنيه</span></span>
                        )}
                      </div>
                      
                     <Button
size="sm"
onClick={() => navigate(`/courses/${course.id}`)}
className="
bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8]
text-white
"
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, BookOpen, Users, Star, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

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
  { value: "primary", label: "المرحلة الابتدائية" },
  { value: "first_sec", label: "الصف الأول الثانوي" },
  { value: "second_sec", label: "الصف الثاني الثانوي" },
  { value: "third_sec", label: "الصف الثالث الثانوي" },
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

  return matchSearch && matchGrade;
});
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0715]" dir="rtl">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 dark:from-[#0b0715] dark:to-[#1a0930] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="blue" className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">الكورسات</Badge>
            <h2 className="font-hala text-5xl md:text-6xl">أحدث الكروسات</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
              كورسات متخصصة لجميع المراحل الدراسية مع شرح شامل وتدريبات متنوعة
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="ابحث عن كورس..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pr-12 pl-4 py-4 rounded-2xl bg-white dark:bg-[#130726]/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-[#130726]/20 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter size={16} />
              <span>تصفية:</span>
            </div>
            {gradeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setGrade(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  grade === opt.value
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white dark:bg-[#130726] text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <div className="mr-auto flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium  bg-whitedark:bg-[#130726] text-slate-600 border border-slate-200 hover:border-blue-300"
              >
                <SlidersHorizontal size={16} />
                فلاتر أخرى
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white dark:bg-[#130726] rounded-2xl border border-slate-200 p-5 mb-6 grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block">نوع الكورس</label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setType(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        type === opt.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-500 dark:text-slate-300 text-sm">
              عرض <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> كورس
            </p>
          </div>

          {/* Courses Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-bold text-slate-700 mb-2">لا توجد نتائج</p>
              <p className="text-slate-500 dark:text-slate-300">جرب كلمات بحث مختلفة أو غيّر الفلاتر</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(course => (
                <Card
  key={course.id}
  hover
  className="
  overflow-hidden
  bg-white
  dark:bg-[#130726]
  border
  dark:border-purple-500/20
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
                      <Badge variant="blue">
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
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 leading-tight">{course.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
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
                          <span className="text-xl font-black text-slate-900">{course.price} <span className="text-sm font-medium text-slate-500">جنيه</span></span>
                        )}
                      </div>
                     <Button
  size="sm"
  onClick={() => navigate(`/courses/${course.id}`)}
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

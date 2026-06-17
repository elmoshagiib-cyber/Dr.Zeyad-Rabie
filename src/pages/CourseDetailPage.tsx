import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  Users,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronDown,
  Play,
  FileText,
  CheckCircle,
  Award,
  Download,
  Lock,
  
} from "lucide-react";

import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { COURSES, TEACHER } from "../data/mockData";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";


export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
const gradeLabels: Record<string, string> = {
  third_sec: "الصف الثالث الثانوي",
  second_sec: "الصف الثاني الثانوي",
  first_sec: "الصف الأول الثانوي",
  primary: "المرحلة الابتدائية",
};

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openUnit, setOpenUnit] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  console.log("slug =", slug);
  console.log("course =", course);

  const totalDuration = "18 ساعة و 30 دقيقة";

  const loadCourse = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", slug)
    .single();

  console.log("error =", error);
  console.log("data =", data);

  if (data) {
    setCourse(data);
  }
};
const loadUnits = async () => {
  console.log("slug inside loadUnits =", slug);

  const { data: lectures, error } = await supabase
    .from("course_lectures")
    .select("*")
    .eq("course_id", slug);

  console.log("ERROR =", error);
  console.log("LECTURES =", lectures);

  if (!lectures?.length) return;

  const unitsData = await Promise.all(
    lectures.map(async (lecture) => {
      const { data: videos } = await supabase
        .from("lecture_videos")
        .select("*")
        .eq("lecture_id", lecture.id);

      const { data: files } = await supabase
        .from("lecture_files")
        .select("*")
        .eq("lecture_id", lecture.id);

      return {
        id: lecture.id,
        title: lecture.title,
        lessons: [
         ...(videos || []).map((v) => ({
  id: v.id,
  title: v.title,
  type: "video",
  icon: "video",
  video_url: v.video_url,
  duration: v.duration,
})),
          ...(files || []).map((f) => ({
  id: f.id,
  title: f.title,
  type: "file",
  icon: "file",
  file_url: f.file_url,
})),

        ],
      };
    })
  );

  setUnits(unitsData);
  console.log("UNITS DATA =", unitsData);
  
};

  const checkEnrollment = async () => {
    if (!user || !course) return;

    const { data } = await supabase
      .from("student_courses")
      .select("*")
      .eq("student_id", user.id)
      .eq("course_id", course.id)
      .eq("active", true);

    setIsEnrolled(!!data?.length);
  };

 useEffect(() => {
  loadCourse();
  loadUnits();
}, [slug]);

  useEffect(() => {
    if (course) {
      checkEnrollment();
    }
  }, [user, course]);

  const handleEnroll = async () => {
    // الكود بتاعك كما هو
  };

  if (!course) {
    return (
      <div className="p-10 text-center">
        جاري تحميل الكورس...
      </div>
    );
  }

  const lessonsCount = units.reduce(
  (total, unit) => total + unit.lessons.length,
  0
);
console.log("UNITS =", units);
const studentsCount =
  course.studentsCount || 2450;
  return (
    // باقي الصفحة
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0715]" dir="rtl">
      <Navbar />
      <div className="pt-16">
        
        <div className="max-w-7xl mx-auto px-6 pt-8">
  <button
    onClick={() => navigate("/")}
    className="text-slate-500 hover:text-purple-600"
  >
    ← العودة للرئيسية
  </button>
</div>
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 py-6 min-h-[420px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
              <button onClick={() => navigate("/")} className="hover:text-white">الرئيسية</button>
              <ChevronRight size={14} />
              <button onClick={() => navigate("/courses")} className="hover:text-white">الكورسات</button>
              <ChevronRight size={14} />
              <span className="text-white truncate max-w-[200px]">{course.title}</span>
            </div>
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left: Info */}
             <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap gap-2">
  <Badge variant="blue">
  {gradeLabels[course.grade] || "الصف الدراسي"}
</Badge>
  <Badge variant="slate">
    كورس
  </Badge>

<div className="absolute top-3 left-3">
  <span className="
  px-3 py-1
  rounded-full
  bg-emerald-500/90
  text-white
  text-xs
  font-bold
  ">
    مجاني
  </span>
</div>

  {course.price === 0 && (
    <Badge variant="emerald">
      مجاني
    </Badge>
  )}
</div>
                <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight">{course.title}</h1>
                <p className="text-slate-300 text-base lg:text-lg leading-relaxed max-w-2xl">{course.description}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Star size={16} className="fill-amber-400" />
                    <span className="font-bold text-white">{course.rating || 5}</span>
                    <span className="text-slate-400">({(course.studentsCount || 0).toLocaleString("ar-EG")} تقييم)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Users size={16} />
                    <span>
  {studentsCount.toLocaleString("ar-EG")} طالب مسجل
</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <BookOpen size={16} />
                    <span>{lessonsCount} درس</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={16} />
                    <span>{totalDuration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name={TEACHER.nameEn} size="md" />
                  <div>
                    
                    <p className="text-white font-bold text-sm">{TEACHER.nameEn}</p>
                    <p className="text-slate-400 text-xs">{TEACHER.titleEn}</p>
                  </div>
                  
                </div>
                
              </div>
              
              {/* Right: Enrollment Card */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
  <div className="grid lg:grid-cols-12 gap-4 items-start">

    <div className="lg:col-span-8">
      <img
  src={course.thumbnail}
  alt={course.title}
  className="w-full aspect-video object-cover rounded-2xl"
/>
    </div>

    <div className="lg:col-span-4 max-w-[460px] relative -top-80">
      <div className="space-y-6 sticky top-24 self-start">
              <Card className="shadow-2xl overflow-hidden border-0">
                  <div className="relative">
<div className="relative overflow-hidden">

  <img
  src={course.thumbnail}
  alt={course.title}
  className="
    w-full
    aspect-video
    object-cover
    transition-all
    duration-500
    group-hover:scale-105
  "
/>

  {course.price === 0 && (
    <div className="absolute top-3 left-3">
      <span className="
      bg-emerald-500
      text-white
      px-3
      py-1
      rounded-full
      text-xs
      font-bold
      ">
        مجاني
      </span>
    </div>
  )}

</div>
                
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-white text-xs">
                      معاينة مجانية
                    </div>

                  </div>
                  <CardContent className="space-y-4">
                    <div className="text-center">
  {course.isFree ? (
    <p className="text-3xl font-black text-emerald-600">
      مجاني تماماً
    </p>
  ) : (
    <div>
      <p className="text-4xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
        {course.price} جنيه
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-300 dark:text-slate-300">
        اشتراك كامل للكورس
      </p>
    </div>
  )}
</div>

{isEnrolled ? (
  <Button
    fullWidth
    size="lg"
    onClick={() => navigate("/dashboard/courses")}
  >
    <Play size={18} />
    متابعة الدراسة
  </Button>
) : (
  <>
    <Button
  fullWidth
  size="lg"
  className="h-14 text-lg font-black"
  onClick={handleEnroll}
>
      اشترك في الكورس
    </Button>

    <Button
      fullWidth
      size="lg"
      variant="outline"
      onClick={() => navigate("/login")}
    >
      دخول للمشتركين
    </Button>
  </>
)}
                 <div className="space-y-2 text-sm">
  {[
    {
      icon: <CheckCircle size={14} className="text-emerald-500" />,
      text: `${lessonsCount} درس فيديو`
    },
    {
      icon: <Download size={14} className="text-blue-500" />,
      text: "ملفات PDF قابلة للتحميل"
    },
    {
      icon: <FileText size={14} className="text-violet-500" />,
      text: "اختبارات تفاعلية"
    },
    {
      icon: <Award size={14} className="text-amber-500" />,
      text: "شهادة إتمام الكورس"
    },
    {
      icon: <Clock size={14} className="text-slate-400" />,
      text: "وصول دائم بدون انقطاع"
    },
  ].map((item, i) => (
    <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
      {item.icon}
      <span>{item.text}</span>
    </div>

  ))}
</div>
                  </CardContent>
                </Card>
       
    </div>

  </div>
</div>

</div>
</div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
           
            </div>
            <div className="lg:col-span-9 space-y-8">
              {/* What you'll learn */}
              

             {/* Course Content */}
<div>
  <h1 className="text-xl font-black text-slate-900 dark:text-white dark:text-white mb-5">
    محتوى الكورس
  </h1>

  {units.length > 0 ? (
    <div className="space-y-3">
      {units.map((unit: any, ui: number) => (
  <Card key={unit.id}>
    <div
      onClick={() =>
        setOpenUnit(
          openUnit === unit.id ? null : unit.id
        )
      }
      className="p-5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a0930] transition"
    >
           <div className="flex items-center justify-between w-full flex-row-reverse">

  {/* السهم في الشمال */}
  <ChevronDown
    size={32}
    className={`text-slate-700 transition-transform ${
      openUnit === unit.id ? "rotate-180" : ""
    }`}
  />

  {/* الرقم + عنوان القسم */}
  <div className="flex flex-row-reverse items-center gap-5">

    <div>
      <p className="font-black text-2xl text-slate-900 dark:text-white dark:text-white">
        {unit.title}
      </p>

      <p className="text-sm text-slate-500 dark:text-slate-300 dark:text-slate-300">
        {unit.lessons.length} محتوى
      </p>
    </div>

    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black text-lg flex items-center justify-center">
      {ui + 1}
    </div>

  </div>


</div>
</div>
<div className="flex gap-3 mt-1 text-xs text-slate-500 dark:text-slate-300 dark:text-slate-300">
  
</div>
    {openUnit === unit.id && (
  <div className="divide-y divide-slate-100">
           {unit.lessons.map((lesson: any) => {
  console.log("LESSON =", lesson);

  return (
   <div
  key={lesson.id}
  onClick={() => {
    if (lesson.type === "video") {
      console.log("VIDEO URL =", lesson.video_url);
      window.open(lesson.video_url, "_blank");
    }

    if (lesson.type === "file") {
      console.log("FILE URL =", lesson.file_url);
      window.open(lesson.file_url, "_blank");
    }
  }}
  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1a0930]"
>
      <span>{lesson.title}</span>

      <div className="flex items-center gap-3">
  {lesson.type === "video" ? (
    <>
      <Play
        size={14}
        className="text-blue-600"
      />
      <span className="text-xs text-slate-500 dark:text-slate-300 dark:text-slate-300">
        فيديو
      </span>
    </>
  ) : (
    <>
      <FileText
        size={14}
        className="text-violet-600"
      />
      <span className="text-xs text-slate-500 dark:text-slate-300 dark:text-slate-300">
        PDF
      </span>
    </>
  )}

  <Lock
    size={14}
    className="text-slate-400"
  />
</div>
</div>
  );
})}
            </div>
          )}
        </Card>
        
      ))}
    </div>
    
  ) : (
    <Card>
      <CardContent className="text-center py-10">
        لا يوجد محتوى حتى الآن
      </CardContent>
    </Card>
  )}
</div>

              {/* Instructor */}
      
        </div>
      </div>
      <Footer />
    </div>
  );
}

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
  ClipboardList,
  ClipboardCheck,
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
    .select(`
  *,
  teacher_name,
  teacher_image,
  teacher_bio,
  course_features,
  cover_image,
  intro_video,
  students_count
`)
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
const { data: homeworks } = await supabase
  .from("homeworks")
  .select("*")
  .eq("lecture_id", lecture.id);

const { data: exams } = await supabase
  .from("exams")
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
    video_url: v.video_url,
    duration: v.duration,
  })),

  ...(files || []).map((f) => ({
    id: f.id,
    title: f.title,
    type: "file",
    file_url: f.file_url,
  })),

  ...(homeworks || []).map((h) => ({
    id: h.id,
    title: h.title,
    type: "homework",
    homework_id: h.id,
  })),

  ...(exams || []).map((e) => ({
    id: e.id,
    title: e.title,
    type: "exam",
    exam_id: e.id,
    duration: e.duration,
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
const lessonsCount = units.reduce(
  (total, unit) => total + unit.lessons.length,
  0
);

const studentsCount = 2450;
if (!course) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      جاري تحميل الكورس...
    </div>
  );
}
return (
  <div className="min-h-screen bg-white dark:bg-[#0b0715]">
    
    <Navbar />

    <div className="pt-24 pb-44">

<div className="max-w-[1700px] mx-auto px-6">

<div
className="
relative
overflow-hidden
rounded-[34px]
h-[540px]
"
>

<img
src={
course.cover_image ||
course.thumbnail ||
"https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600"
}
alt={course.title}
className="
absolute
inset-0
w-full
h-full
object-cover
"
/>

<div
className="
absolute
inset-0
bg-gradient-to-r
from-[#0B1020]/95
via-[#0B1020]/80
via-40%
to-black/20
"
/>

<div
className="
absolute
inset-0
bg-gradient-to-t
from-black/60
via-transparent
to-transparent
"
/>

<div
className="
relative
z-10
h-full
grid
grid-cols-[420px_1fr]
items-center
gap-20
px-20
"
>

{/* اليسار */}

<div
className="
w-[460px]
rounded-[30px]
overflow-hidden
shadow-[0_40px_90px_rgba(0,0,0,.6)]
border
border-white/20
bg-black/20
backdrop-blur
">

<img
src={
course.thumbnail ||
course.cover_image
}
alt={course.title}
className="
w-full
h-[320px]
object-cover
"
/>

<div className="p-6">

<div className="flex items-center justify-between text-white/80">

<div className="flex items-center gap-2">

<BookOpen size={18}/>

<span>
{gradeLabels[course.grade]}
</span>

</div>

<div className="flex items-center gap-2">

<Star
size={18}
fill="currentColor"
/>

<span>
{course.rating || 5}
</span>

</div>

</div>

</div>

</div>
{/* اليمين */}

<div
className="
max-w-[900px]
text-right
text-white
"
>

<div
className="
inline-flex
items-center
gap-2
bg-white/10
backdrop-blur-xl
border
border-white/20
rounded-full
px-5
py-2
mb-8
text-white
"
>

<BookOpen size={18}/>

<span>

{gradeLabels[course.grade]}

</span>

</div>

<h1
className="
text-6xl
xl:text-[78px]
font-black
leading-[1.05]
tracking-tight
max-w-[850px]
"
>

{course.title}

</h1>

<p
className="
mt-6
text-xl
max-w-[820px]
text-slate-200
leading-10
"
>

{course.description}

</p>
<div
className="
flex
flex-wrap
gap-4
mt-10
"
>

<div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3 text-white flex items-center gap-3">
<Play size={18}/>
<span className="font-bold">
{units.reduce((t,u)=>t+u.lessons.filter((l:any)=>l.type==="video").length,0)}
</span>
<span className="text-white/70">
فيديوهات
</span>
</div>

<div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3 text-white flex items-center gap-3">
<ClipboardList size={18}/>
<span className="font-bold">
{units.reduce((t,u)=>t+u.lessons.filter((l:any)=>l.type==="exam").length,0)}
</span>
<span className="text-white/70">
امتحانات
</span>
</div>

<div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3 text-white flex items-center gap-3">
<ClipboardCheck size={18}/>
<span className="font-bold">
{units.reduce((t,u)=>t+u.lessons.filter((l:any)=>l.type==="homework").length,0)}
</span>
<span className="text-white/70">
واجبات
</span>
</div>

<div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3 text-white flex items-center gap-3">
<FileText size={18}/>
<span className="font-bold">
{units.reduce((t,u)=>t+u.lessons.filter((l:any)=>l.type==="file").length,0)}
</span>
<span className="text-white/70">
ملفات
</span>
</div>

</div>

<div
className="
mt-10
grid
grid-cols-2
xl:grid-cols-4
gap-4
"
>

<div
className="
bg-white/10
backdrop-blur-xl
border
border-white/10
rounded-2xl
p-5
"
>

<div className="text-sm text-white/60">

عدد الدروس

</div>

<div className="text-3xl font-black text-white mt-2">

{lessonsCount}

</div>

</div>

<div
className="
bg-white/10
backdrop-blur-xl
border
border-white/10
rounded-2xl
p-5
"
>

<div className="text-sm text-white/60">

عدد الطلاب

</div>

<div className="text-3xl font-black text-white mt-2">

{studentsCount}

</div>

</div>

<div
className="
bg-white/10
backdrop-blur-xl
border
border-white/10
rounded-2xl
p-5
"
>

<div className="text-sm text-white/60">

التقييم

</div>

<div className="text-3xl font-black text-white mt-2">

⭐ {course.rating || 5}

</div>

</div>

<div
className="
bg-white/10
backdrop-blur-xl
border
border-white/10
rounded-2xl
p-5
"
>

<div className="text-sm text-white/60">

السعر

</div>

<div className="text-3xl font-black text-white mt-2">

{course.price === 0 ? "مجاني" : `${course.price} ج`}

</div>

</div>

</div>

<div className="flex flex-wrap gap-5 mt-12">



{course.intro_video && (

<Button
variant="outline"
className="
h-14
px-8
rounded-2xl
border-white
text-white
bg-white/10
hover:bg-white/20
"
onClick={()=>window.open(course.intro_video)}
>

<Play size={18}/>

<span className="mr-2">
مشاهدة المقدمة
</span>

</Button>

)}

</div>
</div>

</div>

</div>

</div>

    </div>

    {/* ================= Content ================= */}

<div className="max-w-7xl mx-auto px-6 -mt-10 mb-10">


</div>

    <div className="max-w-7xl mx-auto px-6 -mt-40 pb-24 relative z-20">

      <div className="grid xl:grid-cols-[360px_1fr] gap-8 items-start">

        {/* ================= Main Content ================= */}

        {/* المحتوى */}

{/* ================= Subscription Card ================= */}

<div>

<Card
className="
sticky
bg-white
top-24
rounded-[32px]
overflow-hidden
border-0
shadow-[0_30px_80px_rgba(0,0,0,.35)]
bg-white
"
>

<img
  src={
    course.thumbnail ||
    course.cover_image ||
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000"
  }
  alt={course.title}
  className="
w-full
h-64
object-cover
"
/>

<CardContent className="p-8 text-center">

<h2 className="text-5xl font-black text-slate-900">

{course.price === 0 ? "مجاني" : `${course.price} جنيه`}

</h2>

<p className="mt-5 text-slate-500 leading-8">

احصل على وصول كامل لجميع محتويات الكورس

</p>

<Button
className="
w-full
mt-8
h-[68px]
hover:shadow-[0_20px_50px_rgba(168,85,247,.45)]
text-xl
font-black
shadow-xl
rounded-2xl
bg-gradient-to-r
from-violet-600
via-fuchsia-600
to-pink-600
text-lg
font-black
"
>

{isEnrolled ? "ابدأ التعلم" : "اشترك الآن"}

</Button>

{course.intro_video && (

<Button
variant="outline"
className="
w-full
mt-4
h-14
rounded-2xl
"
onClick={() => window.open(course.intro_video)}

>

<Play size={18}/>

<span className="mr-2">

مشاهدة المقدمة

</span>

</Button>

)}

</CardContent>

</Card>

</div>
<div className="lg:col-span-2 xl:col-span-2">


<Card className="rounded-[32px] border-0 shadow-xl overflow-hidden">

<CardContent className="p-8">

<h2 className="text-4xl font-black mb-8">

محتويات الكورس

</h2>

<div className="space-y-5">

{units.map((unit) => (

<div
key={unit.id}
className="
rounded-3xl
border
overflow-hidden
bg-white
shadow-md
hover:shadow-2xl
transition-all
duration-300
"
>

<button
onClick={() =>
setOpenUnit(openUnit === unit.id ? null : unit.id)
}
className="
w-full
flex
items-center
justify-between
px-8
py-7
text-2xl
font-black
hover:bg-violet-50
transition
"
>

<span>{unit.title}</span>

{openUnit === unit.id ? (

<ChevronDown className="w-7 h-7"/>

) : (

<ChevronRight className="w-7 h-7"/>

)}

</button>

{openUnit === unit.id && (

<div className="border-t bg-slate-50">

{unit.lessons.map((lesson:any)=>{

const isVideo = lesson.type === "video";
const isFile = lesson.type === "file";
const isHomework = lesson.type === "homework";
const isExam = lesson.type === "exam";

return(

<div
className="
flex
items-center
justify-between
px-8
py-6
border-b
last:border-b-0
hover:bg-slate-100
transition-all
duration-300
"
>

<div className="flex items-center gap-5">

<div
className={`
w-16
h-16
rounded-2xl
flex
items-center
justify-center
text-white

${isVideo && "bg-green-600"}

${isFile && "bg-slate-600"}

${isHomework && "bg-blue-600"}

${isExam && "bg-red-600"}
`}
>

{isVideo && <Play size={26} />}

{isFile && <FileText size={26} />}

{isHomework && <ClipboardCheck size={26} />}

{isExam && <ClipboardList size={26} />}

</div>

<div>

<h3 className="text-xl font-bold">

{lesson.title}

</h3>

<p className="text-slate-500 mt-1">

{isVideo && (lesson.duration || "فيديو")}

{isFile && "ملف PDF"}

{isHomework && "واجب"}

{isExam && `امتحان • ${lesson.duration || 30} دقيقة`}

</p>

</div>

</div>

<div>

{isEnrolled ? (

<Button
className="
rounded-xl
h-11
px-8
bg-gradient-to-r
from-violet-600
to-fuchsia-600
"
onClick={() => {

if (isVideo) {
  window.open(lesson.video_url, "_blank");
}

if (isFile) {
  window.open(lesson.file_url, "_blank");
}

if (isHomework) {
  navigate(`/homework/${lesson.homework_id}`);
}

if (isExam) {
  navigate(`/exam/${lesson.exam_id}`);
}

}}
>

{isVideo && "شاهد الآن"}

{isFile && "تحميل"}

{isHomework && "حل الواجب"}

{isExam && "ابدأ الامتحان"}

</Button>

) : (

<div className="flex items-center gap-2 text-slate-500">

<Lock size={18}/>

<span>

مقفل

</span>

</div>

)}

</div>

</div>

)

})}

</div>

)}

</div>

))}

</div>

</CardContent>

</Card>

</div>
    


      </div>

    </div>

    <Footer />

  </div>
);
}

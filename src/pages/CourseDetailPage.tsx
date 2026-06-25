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

    <div className="pt-24 pb-24">

      <div className="max-w-7xl mx-auto px-6">

        <div
          className="
          rounded-[40px]
          overflow-hidden
          border
          border-slate-200
          dark:border-white/10
          bg-white
          dark:bg-[#130726]
          p-12
          text-center
          "
        >

          <h1
            className="
            text-5xl
            lg:text-7xl
            font-black
            text-slate-900
            dark:text-white
            "
          >
            {course.title}
          </h1>

          <p
            className="
            mt-6
            text-xl
            text-slate-500
            dark:text-slate-400
            max-w-3xl
            mx-auto
            "
          >
            {course.description}
          </p>

          <div className="mt-10 flex justify-center gap-6">

            <div className="text-center">
              <div className="text-3xl font-black text-violet-600">
                {studentsCount}
              </div>

              <div className="text-slate-500">
                طالب
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-black text-violet-600">
                {lessonsCount}
              </div>

              <div className="text-slate-500">
                درس
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

    <Footer />

  </div>
);
}
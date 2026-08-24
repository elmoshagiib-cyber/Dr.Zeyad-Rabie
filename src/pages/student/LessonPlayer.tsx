import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, ChevronLeft, CheckCircle, FileText, Download, List, X, Loader2 } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";

interface CourseItem {
  id: string;
  section_id: string;
  type: string;
  title: string;
  description: string | null;
  url: string | null;
  duration: number | null;
  sort_order: number;
}

interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
}

interface LessonProgressRow {
  id: number;
  last_position: number;
  is_completed: boolean;
  watched_seconds: number;
}

export function LessonPlayer() {
  const navigate = useNavigate();
  const { id } = useParams(); // course_items.id (uuid)
  const { user } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<CourseItem | null>(null);
  const [section, setSection] = useState<CourseSection | null>(null);
  const [allSections, setAllSections] = useState<CourseSection[]>([]);
  const [allLessons, setAllLessons] = useState<CourseItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [progressRowId, setProgressRowId] = useState<number | null>(null);
  const [hasResumed, setHasResumed] = useState(false);

  // تحميل بيانات الدرس الحالي + الكورس بالكامل
  useEffect(() => {
    const loadLesson = async () => {
      if (!id) return;
      setLoading(true);

      const { data: lessonData, error: lessonError } = await supabase
        .from("course_items")
        .select("*")
        .eq("id", id)
        .single();

      if (lessonError || !lessonData) {
        
        setLoading(false);
        return;
      }

      setLesson(lessonData as CourseItem);

      const { data: sectionData } = await supabase
        .from("course_sections")
        .select("*")
        .eq("id", lessonData.section_id)
        .single();

      setSection(sectionData as CourseSection);

      if (sectionData) {
        const { data: sectionsData } = await supabase
          .from("course_sections")
          .select("*")
          .eq("course_id", sectionData.course_id)
          .order("sort_order", { ascending: true });

        setAllSections((sectionsData as CourseSection[]) || []);

        const sectionIds = (sectionsData || []).map((s: any) => s.id);

        const { data: lessonsData } = await supabase
          .from("course_items")
          .select("*")
          .in("section_id", sectionIds)
          .order("sort_order", { ascending: true });

        setAllLessons((lessonsData as CourseItem[]) || []);
      }

      setLoading(false);
    };

    loadLesson();
    setHasResumed(false);
  }, [id]);

  // تحميل تقدم الطالب في هذا الدرس تحديدًا (لو موجود)
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.studentId || !lesson) return;

      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("student_id", user.studentId)
        .eq("lesson_id", lesson.id)
        .maybeSingle();

      if (error) {
       
        return;
      }

      if (data) {
        setProgressRowId(data.id);
        setCompleted(data.is_completed);
      } else {
        setProgressRowId(null);
        setCompleted(false);
      }
    };

    loadProgress();
  }, [user?.studentId, lesson]);

  // لما الفيديو يبقى جاهز، نرجعه لآخر نقطة توقف
  const handleLoadedMetadata = async () => {
    if (hasResumed || !videoRef.current || !user?.studentId || !lesson) return;

    const { data } = await supabase
      .from("lesson_progress")
      .select("last_position")
      .eq("student_id", user.studentId)
      .eq("lesson_id", lesson.id)
      .maybeSingle();

    if (data?.last_position && data.last_position > 5) {
      videoRef.current.currentTime = data.last_position;
    }

    setHasResumed(true);
  };

  // حفظ التقدم في الداتابيز
  const saveProgress = async (isCompleted = false) => {
    if (!videoRef.current || !user?.studentId || !lesson || !section) return;

    const currentTime = Math.floor(videoRef.current.currentTime);
    const duration = Math.floor(videoRef.current.duration || 0);
    const percent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

    const payload = {
      student_id: user.studentId,
      lesson_id: lesson.id,
      course_id: section.course_id,
      watched_seconds: currentTime,
      video_duration: duration,
      progress_percent: percent,
      last_position: currentTime,
      is_completed: isCompleted || percent >= 90,
      last_watched_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("lesson_progress")
      .upsert(payload, { onConflict: "student_id,lesson_id" })
      .select()
      .single();

    if (error) {
      return;
    }

    if (data) {
      setProgressRowId(data.id);
      if (data.is_completed) setCompleted(true);
    }
  };

  // حفظ دوري كل 10 ثواني أثناء التشغيل
  const handlePlay = () => {
    if (saveIntervalRef.current) return;
    saveIntervalRef.current = setInterval(() => {
      saveProgress();
    }, 10000);
  };

  const handlePause = () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    saveProgress();
  };

  const handleEnded = () => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    saveProgress(true);
  };

  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, []);

  const toggleCompleted = async () => {
    const newValue = !completed;
    setCompleted(newValue);
    await saveProgress(newValue);
  };

  const currentIndex = allLessons.findIndex((l) => l.id === lesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <p className="text-white font-bold">الدرس غير موجود</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              <ChevronRight size={18} />
            </button>
            <div>
              <p className="text-white font-bold text-sm">{lesson.title}</p>
              <p className="text-slate-400 text-xs">{section?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
              <List size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="bg-black relative" style={{ aspectRatio: "16/9" }}>
              {lesson.url ? (
                <video
                  ref={videoRef}
                  src={lesson.url}
                  controls
                  className="w-full h-full"
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onEnded={handleEnded}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  الفيديو غير متاح حاليًا
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-b border-slate-200">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 mb-1">{lesson.title}</h1>
                    <p className="text-slate-500 text-sm">
                      {section?.title} — الدرس {currentIndex + 1} من {allLessons.length}
                    </p>
                  </div>
                  <Button
                    variant={completed ? "success" : "primary"}
                    size="sm"
                    onClick={toggleCompleted}
                  >
                    <CheckCircle size={15} />
                    {completed ? "تم الإكمال" : "وضع علامة مكتمل"}
                  </Button>
                </div>

                {lesson.description && (
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {lesson.description}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    disabled={!prevLesson}
                    onClick={() => prevLesson && navigate(`/dashboard/lesson/${prevLesson.id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                    الدرس السابق
                  </button>
                  <button
                    disabled={!nextLesson}
                    onClick={() => nextLesson && navigate(`/dashboard/lesson/${nextLesson.id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors mr-auto disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    الدرس التالي
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showSidebar && (
            <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm">محتوى الكورس</h3>
                <button onClick={() => setShowSidebar(false)} className="text-slate-400 hover:text-slate-600 lg:hidden">
                  <X size={16} />
                </button>
              </div>
              {allSections.map((s) => (
                <div key={s.id}>
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <p className="text-xs font-black text-slate-600">{s.title}</p>
                  </div>
                  {allLessons.filter((l) => l.section_id === s.id).map((l) => {
                    const isCurrent = l.id === lesson.id;
                    return (
                      <div
                        key={l.id}
                        onClick={() => navigate(`/dashboard/lesson/${l.id}`)}
                        className={`px-4 py-3 border-b border-slate-100 flex items-center gap-3 cursor-pointer transition-colors ${isCurrent ? "bg-blue-50 border-r-2 border-r-blue-600" : "hover:bg-slate-50"}`}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={13} className={isCurrent ? "text-blue-600" : "text-slate-400"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium leading-tight truncate ${isCurrent ? "text-blue-700 font-bold" : "text-slate-700"}`}>
                            {l.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
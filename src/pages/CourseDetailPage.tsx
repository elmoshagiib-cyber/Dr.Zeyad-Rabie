import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Lock,
  ClipboardList,
  ClipboardCheck,
  LayoutGrid,
  X,
  Maximize,
  Minimize,
  Info,
  Clock,
  Timer,
  Hash,
  HelpCircle,
} from "lucide-react";
import {
  HiOutlineCalendarDays,
  HiOutlineFolder,
} from "react-icons/hi2";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { FaWhatsapp } from "react-icons/fa";

interface LessonProgress {
  student_id: number;
  lesson_id: string;
  course_id: string;
  watched_seconds: number;
  video_duration: number;
  progress_percent: number;
  is_completed: boolean;
  watch_count: number;
  last_position: number;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
}

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const navigate = useNavigate();
  const { user } = useApp();

  const gradeLabels: Record<string, string> = {
    sec_3: "الصف الثالث الثانوي",
    sec_2: "الصف الثاني الثانوي",
    sec_1: "الصف الأول الثانوي",
  };

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openUnit, setOpenUnit] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ id: Date.now(), message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionCode, setSubscriptionCode] = useState("");

  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [videoPlayerUrl, setVideoPlayerUrl] = useState("");
  const [videoPlayerTitle, setVideoPlayerTitle] = useState("");
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [watermarkPosition, setWatermarkPosition] = useState({ top: "10%", left: "10%" });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lessonProgressRef = useRef<LessonProgress | null>(null);
  const hasIncrementedWatchedLessonsRef = useRef(false);

  type VideoExtra = { watchedSeconds: number; progressPercent: number };
  type ExamExtra = {
    examId: number;
    description: string;
    duration: number;
    questionsCount: number;
    minScore: number;
    avgScore: number;
    maxScore: number;
    attemptsCount: number;
    completedCount: number;
  };

  const [videoExtras, setVideoExtras] = useState<Record<string, VideoExtra>>({});
  const [examExtras, setExamExtras] = useState<Record<string, ExamExtra>>({});
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  const toggleLessonExpand = (lessonId: string) => {
    setExpandedLessonId((prev) => (prev === lessonId ? null : lessonId));
  };

  const loadCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", slug)
      .single();



    if (data) {
      setCourse(data);
    }
  };

  const loadUnits = async () => {
    const { data: sections, error: sectionsError } = await supabase
      .from("course_sections")
      .select("*")
      .eq("course_id", slug);



    if (!sections?.length) return;

    const units = [];

    for (const section of sections) {
      const { data: items, error: itemsError } = await supabase
        .from("course_items")
        .select("*")
        .eq("section_id", section.id)
        .order("sort_order");

      units.push({
        id: section.id,
        title: section.title,
        lessons: items || [],
      });
    }

    setUnits(units);
  };

  const getStudentId = (): number | null => {
    if (!user?.studentId) return null;
    return user.studentId;
  };

  const getWatermarkText = (): string => {
    if (!user) return "";

    const name = (user as any).name || (user as any).full_name || "";
    const phone = (user as any).phone || (user as any).phone_number || "";
    const email = (user as any).email || "";

    const identifier = phone || email || name || `طالب #${(user as any).studentId || ""}`;

    return `${name ? name + " - " : ""}${identifier}`.trim();
  };

  const checkEnrollment = async () => {
    if (!user || !course) return;

    const studentId = getStudentId();

    if (!studentId) {
      console.warn("checkEnrollment: studentId is null, skipping");
      return;
    }

  

    const { data, error } = await supabase
      .from("student_courses")
      .select("*")
      .eq("student_id", studentId)
      .eq("course_id", course.id)
      .eq("active", true);



    setIsEnrolled((data?.length ?? 0) > 0);
    
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

  const loadContentExtras = async () => {
    const studentId = getStudentId();
    if (!studentId || units.length === 0) return;

    const videoLessonIds = units.flatMap((u) =>
      u.lessons.filter((l: any) => l.type === "video").map((l: any) => l.id)
    );
    const quizLessonIds = units.flatMap((u) =>
      u.lessons.filter((l: any) => l.type === "quiz").map((l: any) => l.id)
    );

    if (videoLessonIds.length > 0) {
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, watched_seconds, progress_percent")
        .eq("student_id", studentId)
        .in("lesson_id", videoLessonIds);

      const map: Record<string, VideoExtra> = {};
      (progressData || []).forEach((p: any) => {
        map[p.lesson_id] = {
          watchedSeconds: p.watched_seconds || 0,
          progressPercent: Math.min(100, Math.max(0, p.progress_percent || 0)),
        };
      });
      setVideoExtras(map);
    }

    if (quizLessonIds.length > 0) {
      const { data: examsData } = await supabase
        .from("exams")
        .select("id, course_item_id, description, duration")
        .in("course_item_id", quizLessonIds);

      const examIds = (examsData || []).map((e: any) => e.id);

      const { data: questionsData } = await supabase
        .from("exam_questions")
        .select("id, exam_id")
        .in("exam_id", examIds.length ? examIds : [-1]);

      const { data: resultsData } = await supabase
        .from("exam_results")
        .select("exam_id, percentage, started_at, completed_at")
        .eq("student_id", studentId)
        .in("exam_id", examIds.length ? examIds : [-1]);

      const map: Record<string, any> = {};

      (examsData || []).forEach((exam: any) => {
        const results = (resultsData || []).filter((r: any) => r.exam_id === exam.id);
        const percentages = results.map((r: any) => Number(r.percentage) || 0);
        const questionsCount = (questionsData || []).filter((q: any) => q.exam_id === exam.id).length;

        map[exam.course_item_id] = {
          examId: exam.id,
          description: exam.description || "",
          duration: exam.duration || 0,
          questionsCount,
          minScore: percentages.length ? Math.min(...percentages) : 0,
          avgScore: percentages.length
            ? Math.round(percentages.reduce((a: number, b: number) => a + b, 0) / percentages.length)
            : 0,
          maxScore: percentages.length ? Math.max(...percentages) : 0,
          attemptsCount: results.filter((r: any) => r.started_at).length,
          completedCount: results.filter((r: any) => r.completed_at).length,
        };
      });

      setExamExtras(map);
    }
  };

  useEffect(() => {
    if (isEnrolled && units.length > 0) {
      loadContentExtras();
    }
  }, [isEnrolled, units]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!course) return;

    if (course.is_free) {
      const studentId = getStudentId();

      if (!studentId) {
        console.error("handleEnroll: could not resolve studentId");
        return;
      }

      const { data: existing } = await supabase
        .from("student_courses")
        .select("id")
        .eq("student_id", studentId)
        .eq("course_id", course.id)
        .eq("active", true)
        .maybeSingle();

      if (existing) {
        setIsEnrolled(true);
        showToast("أنت مشترك بالفعل في هذا الكورس");
        return;
      }

      const { data, error } = await supabase
        .from("student_courses")
        .insert({
          student_id: studentId,
          course_id: course.id,
          active: true,
          subscription_type: "مجاني",
        })
        .select();

      if (error && error.code !== "23505") {
        console.error("Insert failed:", error);
        showToast("حدث خطأ أثناء الاشتراك، حاول مرة أخرى");
        return;
      }

      setIsEnrolled(true);
      showToast("تم الاشتراك في الكورس بنجاح");
      return;
    }

    setShowSubscriptionModal(true);
    return;
  };

  const lessonsCount = units.reduce(
    (total, unit) => total + unit.lessons.length,
    0
  );

  const activateSubscription = async () => {
    if (!course) return;

    const { data, error } = await supabase
      .from("subscription_codes")
      .select("*")
      .eq("code", subscriptionCode)
      .single();

    if (error || !data) {
      showToast("كود الاشتراك غير صحيح");
      return;
    }

    if (data.status !== "active") {
      showToast("هذا الكود غير صالح أو تم استخدامه");
      return;
    }

    if (data.course_id !== course.id) {
      showToast("هذا الكود لا يخص هذا الكورس");
      return;
    }

    const studentId = getStudentId();

    if (!studentId) {
      showToast("يجب تسجيل الدخول أولاً");
      return;
    }

    const { data: existingSubscription } = await supabase
      .from("student_courses")
      .select("id")
      .eq("student_id", studentId)
      .eq("course_id", course.id)
      .eq("active", true)
      .maybeSingle();

    if (existingSubscription) {
      showToast("أنت مشترك بالفعل في هذا الكورس.");
      return;
    }

    const { error: enrollError } = await supabase
      .from("student_courses")
      .insert({
        student_id: studentId,
        course_id: course.id,
        active: true,
        subscription_type: "كود اشتراك",
        expires_at: new Date(
          Date.now() + data.duration_days * 24 * 60 * 60 * 1000
        ).toISOString(),
      });

    if (enrollError) {
      showToast("حدث خطأ أثناء إضافة الاشتراك");
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.duration_days);

    const { error: codeError } = await supabase
      .from("subscription_codes")
      .update({
        status: "used",
        student_id: studentId,
        used_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", data.id);

    if (codeError) {
      showToast("تم الاشتراك لكن حدث خطأ أثناء تحديث الكود");
      return;
    }

    setIsEnrolled(true);
    setShowSubscriptionModal(false);
    setSubscriptionCode("");

    showToast("تم تفعيل الاشتراك بنجاح");
  };

  const videosCount = units.reduce(
    (t, u) => t + u.lessons.filter((l: any) => l.type === "video").length,
    0
  );

  const totalVideoMinutes = units.reduce(
    (total, unit) =>
      total +
      unit.lessons
        .filter((l: any) => l.type === "video")
        .reduce((sum: number, l: any) => sum + (Number(l.duration) || 0), 0),
    0
  );
  const totalContentHours = Math.round(totalVideoMinutes / 60);

  const totalQuestionsCount = units.reduce((total, unit) => {
    const quizQuestions = unit.lessons
      .filter((l: any) => l.type === "quiz")
      .reduce(
        (sum: number, l: any) => sum + (examExtras[l.id]?.questionsCount || 0),
        0
      );
    return total + quizQuestions;
  }, 0);

  const examsCount = units.reduce(
    (t, u) => t + u.lessons.filter((l: any) => l.type === "quiz").length,
    0
  );
  const homeworksCount = units.reduce(
    (t, u) => t + u.lessons.filter((l: any) => l.type === "homework").length,
    0
  );
  const filesCount = units.reduce(
    (t, u) => t + u.lessons.filter((l: any) => l.type === "pdf").length,
    0
  );

  const loadOrCreateLessonProgress = async (
    studentId: number,
    lessonId: string,
    courseId: string
  ): Promise<LessonProgress | null> => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("student_id", studentId)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching lesson progress:", fetchError);
        return null;
      }

      if (existing) {
        return existing as LessonProgress;
      }

      const { data: newProgress, error: insertError } = await supabase
        .from("lesson_progress")
        .insert({
          student_id: studentId,
          lesson_id: lessonId,
          course_id: courseId,
          watched_seconds: 0,
          video_duration: 0,
          progress_percent: 0,
          is_completed: false,
          watch_count: 1,
          last_position: 0,
          last_watched_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating lesson progress:", insertError);
        return null;
      }

      return newProgress as LessonProgress;
    } catch (error) {
      console.error("Error in loadOrCreateLessonProgress:", error);
      return null;
    }
  };

const saveProgress = async (currentTime: number, duration: number) => {
    const studentId = getStudentId();
    if (!studentId || !currentLessonId || !slug) return;

    try {
      const watchedSeconds = Math.floor(currentTime);
      const lastPosition = Math.floor(currentTime);
      const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;


      const { data, error, count } = await supabase
        .from("lesson_progress")
        .update({
          watched_seconds: watchedSeconds,
          last_position: lastPosition,
          progress_percent: progressPercent,
          last_watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", studentId)
        .eq("lesson_id", currentLessonId)
        .select();

      console.log("SAVE PROGRESS RESULT →", { data, error, rowsAffected: data?.length });

      await supabase
        .from("students")
        .update({
          last_activity: new Date().toISOString(),
        })
        .eq("id", studentId);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const markAsCompleted = async () => {
    const studentId = getStudentId();
    if (!studentId || !currentLessonId || !slug || !lessonProgressRef.current) return;

    if (lessonProgressRef.current.is_completed) {
      return;
    }

    try {
      await supabase
        .from("lesson_progress")
        .update({
          is_completed: true,
          progress_percent: 100,
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", studentId)
        .eq("lesson_id", currentLessonId);

      if (!hasIncrementedWatchedLessonsRef.current) {
        const { data: studentData } = await supabase
          .from("students")
          .select("watched_lessons, total_watch_minutes")
          .eq("id", studentId)
          .single();

        if (studentData) {
          const videoDuration = videoRef.current?.duration || 0;
          const additionalMinutes = Math.floor(videoDuration / 60);

          await supabase
            .from("students")
            .update({
              watched_lessons: (studentData.watched_lessons || 0) + 1,
              last_activity: new Date().toISOString(),
              last_watched_lesson_id: currentLessonId,
              total_watch_minutes: (studentData.total_watch_minutes || 0) + additionalMinutes,
            })
            .eq("id", studentId);

          hasIncrementedWatchedLessonsRef.current = true;
        }
      }

      lessonProgressRef.current = {
        ...lessonProgressRef.current,
        is_completed: true,
      };
    } catch (error) {
      console.error("Error marking as completed:", error);
    }
  };

  const openVideoPlayer = async (lessonId: string, title: string) => {
    if (!lessonId) {
      showToast("الفيديو غير متوفر");
      return;
    }

    const studentId = getStudentId();
    if (!studentId || !slug) {
      showToast("يجب تسجيل الدخول أولاً");
      return;
    }

    try {
      let {
        data: { session },
      } = await supabase.auth.getSession();

      // لو الـ session مفقودة، حاول تحدّثها قبل ما تستسلم
      if (!session?.access_token) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session;
      }

      if (!session?.access_token) {
        showToast("انتهت جلسة الدخول، برجاء تسجيل الدخول مرة أخرى");
        navigate("/login");
        return;
      }

      const response = await fetch("/api/video-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lessonId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        console.error("Video URL error:", errData);
        showToast("تعذر فتح الفيديو، حاول مرة أخرى");
        return;
      }

      const { url } = await response.json();

      const progress = await loadOrCreateLessonProgress(studentId, lessonId, slug);
      lessonProgressRef.current = progress;
      hasIncrementedWatchedLessonsRef.current = progress?.is_completed || false;

      setCurrentLessonId(lessonId);
      setVideoPlayerUrl(url);
      setVideoPlayerTitle(title);
      setVideoPlayerOpen(true);
    } catch (error) {
      console.error("Error opening video:", error);
      showToast("حدث خطأ أثناء فتح الفيديو");
    }
  };

  const openPdf = async (lessonId: string) => {
    if (!lessonId) {
      showToast("الملف غير متوفر");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/pdf-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          lessonId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("PDF ERROR:", error);
        showToast(error.error || error.message || "تعذر فتح الملف");
        return;
      }

      const { url } = await response.json();
      
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      showToast("حدث خطأ أثناء فتح الملف");
    }
  };

  const closeVideoPlayer = async () => {
    if (videoRef.current && currentLessonId) {
      await saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    setVideoPlayerOpen(false);
    setVideoPlayerUrl("");
    setVideoPlayerTitle("");
    setCurrentLessonId("");
    lessonProgressRef.current = null;
    hasIncrementedWatchedLessonsRef.current = false;
  };

  const toggleFullscreen = () => {
    if (!videoWrapperRef.current) return;

    if (!document.fullscreenElement) {
      videoWrapperRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && videoPlayerOpen && !document.fullscreenElement) {
        closeVideoPlayer();
      }
    };

    if (videoPlayerOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [videoPlayerOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!videoPlayerOpen) return;

    const positions = [
      { top: "8%", left: "8%" },
      { top: "8%", left: "70%" },
      { top: "80%", left: "8%" },
      { top: "80%", left: "70%" },
      { top: "45%", left: "40%" },
      { top: "15%", left: "45%" },
      { top: "70%", left: "20%" },
    ];

    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % positions.length;
      setWatermarkPosition(positions[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, [videoPlayerOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoPlayerOpen) return;

    const handleLoadedMetadata = async () => {
      const duration = video.duration;
      const studentId = getStudentId();

      if (studentId && currentLessonId && duration > 0) {
        try {
          await supabase
            .from("lesson_progress")
            .update({
              video_duration: Math.floor(duration),
            })
            .eq("student_id", studentId)
            .eq("lesson_id", currentLessonId);
        } catch (error) {
          console.error("Error saving video duration:", error);
        }
      }

      if (lessonProgressRef.current && lessonProgressRef.current.last_position > 0) {
        video.currentTime = lessonProgressRef.current.last_position;
      }
    };

    const handlePlay = () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }

      updateIntervalRef.current = setInterval(() => {
        if (video && !video.paused) {
          saveProgress(video.currentTime, video.duration);
        }
      }, 10000);
    };

    const handlePause = async () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }

      await saveProgress(video.currentTime, video.duration);
    };

    const handleEnded = async () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }

      await markAsCompleted();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);

      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [videoPlayerOpen, currentLessonId]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (videoRef.current && currentLessonId) {
        await saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentLessonId]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b0715]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            جاري تحميل الكورس...
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B]" dir="rtl">
      {toast && (
        <div
          key={toast.id}
          className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[100] w-[92%] sm:w-full max-w-sm bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden animate-in slide-in-from-top-3 fade-in duration-300"
        >
          <div className="flex items-start justify-between gap-3 px-4 py-3">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 text-right flex-1">
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-1 w-full bg-gray-100 dark:bg-[#2A2A2A] overflow-hidden">
            <div
              key={toast.id}
              className="h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-pink-500"
              style={{
                animation: "toast-shrink 4s linear forwards",
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <Navbar />

      <div className="relative overflow-hidden pt-32 lg:pt-32 pb-56">
        <img
          src={
            course.thumbnail ||
            course.cover_image ||
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600"
          }
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        />

        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start">
            <div className="flex flex-wrap justify-start gap-3 mb-8">
              {[
                {
                  label: "فيديوهات",
                  value: videosCount,
                  icon: <Play size={14} />,
                },
                {
                  label: "امتحانات",
                  value: examsCount,
                  icon: <ClipboardList size={14} />,
                },
                {
                  label: "واجبات",
                  value: homeworksCount,
                  icon: <ClipboardCheck size={14} />,
                },
                {
                  label: "ملفات",
                  value: filesCount,
                  icon: <FileText size={14} />,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-white shadow-lg"
                >
                  <span className="text-sm font-bold">{item.label}</span>
                  <span className="text-[#FFD54A]">{item.icon}</span>
                  <span className="rounded-full bg-[#B348FE] text-white px-2.5 py-1 text-[11px] font-black">
                    +{item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-right mb-7 w-full">
              <h1 className="text-[2rem] sm:text-[2.8rem] lg:text-[3.8rem] xl:text-[4.5rem] font-extrabold leading-[1] tracking-tight text-white drop-shadow-[0_6px_20px_rgba(0,0,0,.35)]">
                {course.title}
              </h1>

              {course.description ? (
                <div className="mt-6 max-w-3xl mr-0 ml-auto">
                  <p
                    className={`text-lg sm:text-xl font-bold text-right text-white leading-relaxed ${
                      isDescriptionExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {course.description}
                  </p>

                  <button
                    onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                    className="mt-2 text-sm sm:text-base font-black text-[#FFD54A] hover:text-white transition-colors"
                  >
                    {isDescriptionExpanded ? "عرض أقل" : "عرض المزيد"}
                  </button>
                </div>
              ) : (
                <p className="mt-6 text-lg sm:text-xl font-bold text-right text-white">
                  {gradeLabels[course.grade] || course.grade}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-start gap-5">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold">تاريخ الإنشاء</span>
                <span className="rounded-full bg-[#B348FE] text-white px-4 py-1.5 text-sm font-black">
                  {new Date(course.created_at || Date.now()).toLocaleDateString(
                    "ar-EG",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-white font-bold">آخر تحديث</span>
                <span className="rounded-full bg-white/15 backdrop-blur-md text-white border border-white/15 px-4 py-1.5 text-sm font-black">
                  {new Date(course.updated_at || Date.now()).toLocaleDateString(
                    "ar-EG",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 max-w-[1400px] mx-auto px-8 lg:px-10 -mt-56">
        <div className="flex justify-between items-start">
          <div className="max-w-[430px] w-full ml-0 mr-auto">
            <div className="bg-white dark:bg-[#151515] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,.12)] dark:shadow-[0_25px_70px_rgba(0,0,0,.75)] border border-gray-100 dark:border-[#2A2A2A]">
              <div className="relative w-full aspect-[16/9] overflow-hidden">
                <img
                  src={
                    course.thumbnail ||
                    course.cover_image ||
                    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
                  }
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 bg-white dark:bg-[#1A1A1A]">
                {course.is_free ? (
                  <button
                    onClick={handleEnroll}
                    className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white text-lg sm:text-xl font-black bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg hover:shadow-[0_12px_35px_rgba(179,72,254,.35)] transition-all duration-300 hover:scale-[1.015] mb-3 sm:mb-4"
                  >
                    {isEnrolled ? "مشترك" : "اشترك مجانًا"}
                  </button>
                ) : (
                  <>
                    {isEnrolled ? (
                      <div className="text-center mb-4"></div>
                    ) : (
                      <div className="text-center mb-3 sm:mb-4">
                        <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                          {course.price}
                        </span>
                        <span className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mr-1">
                          جنيه
                        </span>
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        if (isEnrolled) {
                          const firstLesson = units[0]?.lessons[0];

                          if (!firstLesson) {
                            showToast("لا يوجد دروس متاحة");
                            return;
                          }

                          if (firstLesson.type === "video") {
                            await openVideoPlayer(firstLesson.id, firstLesson.title);
                          }

                          return;
                        }

                        handleEnroll();
                      }}
                      className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white text-lg sm:text-xl font-black bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg hover:shadow-[0_12px_35px_rgba(179,72,254,.35)] transition-all duration-300 hover:scale-[1.015] mb-3"
                    >
                      {isEnrolled ? "مشترك" : "اشترك الآن"}
                    </button>
                  </>
                )}

                {course.intro_video && (
                  <button
                    onClick={() => window.open(course.intro_video)}
                    className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-gray-700 dark:text-gray-200 font-bold text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 hover:border-rose-300 flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 mb-3 sm:mb-4"
                  >
                    <Play size={16} className="text-[#B348FE]" />
                    <span>مشاهدة المقدمة</span>
                  </button>
                )}

                <div className="flex items-center justify-between mt-1 pb-1">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span className="text-[13px] font-medium">{formatDate(course.created_at)}</span>
                    <HiOutlineCalendarDays className="text-[17px]" />
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span className="text-[13px] font-medium">{formatDate(course.updated_at)}</span>
                    <HiOutlineFolder className="text-[17px]" />
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#09090B] pt-10 pb-8 sm:pt-14 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="group relative overflow-visible py-6 px-5 sm:py-8 sm:px-7 mb-4 sm:mb-6 transition-all duration-500">

  {/* Decorative lines */}
  <div className="pointer-events-none absolute top-0 right-10 sm:right-16 flex flex-col gap-2 opacity-70">
    <span className="block w-16 sm:w-20 h-1 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-500 group-hover:-translate-x-24 sm:group-hover:-translate-x-40 group-hover:w-20" />
    <span className="block w-10 sm:w-14 h-1 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-500 delay-75 group-hover:-translate-x-16 sm:group-hover:-translate-x-28 group-hover:w-16" />
  </div>

  <div className="pointer-events-none absolute bottom-0 right-4 sm:right-6 flex flex-col gap-2 items-end opacity-70">
    <span className="block w-16 sm:w-20 h-1 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-500 group-hover:-translate-x-20 sm:group-hover:-translate-x-36 group-hover:w-20" />
    <span className="block w-10 sm:w-14 h-1 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-500 delay-75 group-hover:-translate-x-12 sm:group-hover:-translate-x-24 group-hover:w-16" />
  </div>

  {/* Title */}
  <h2 className="relative z-10 text-2xl sm:text-3xl xl:text-4xl font-black text-right transition-all duration-500 group-hover:translate-x-1">

    <span className="text-gray-900 dark:text-white transition-colors duration-500 group-hover:text-[#B348FE]">
      محتوى
    </span>

    <span className="text-[#B348FE] transition-colors duration-500 group-hover:text-gray-900 dark:group-hover:text-white">
      {" "}الكورس
    </span>

  </h2>
</div>

          <div className="space-y-3 sm:space-y-4">
            {units.map((unit) => {
              const isOpen = openUnit === unit.id;

              return (
                <div
  key={unit.id}
  className="group bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
>
                  <button
                    onClick={() => setOpenUnit(isOpen ? null : unit.id)}
                    className={`w-full flex flex-row-reverse items-center justify-between px-4 sm:px-6 py-4 sm:py-5 transition-all duration-300 hover:px-5 sm:hover:px-7 ${
  isOpen
    ? "bg-[#F6EEFF] dark:bg-[#2B103D]"
    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
}`}
                  >
                   <ChevronDown
  size={18}
  className={`flex-shrink-0 transition-all duration-300 ${
    isOpen
      ? "rotate-180 text-[#B348FE]"
      : "rotate-0 text-gray-500 dark:text-gray-400"
  }`}
/>

                    <div className="flex flex-row-reverse items-center justify-start gap-3">
                      <h3 className="text-base sm:text-xl xl:text-2xl font-black text-gray-900 dark:text-white group-hover:text-[#B348FE] transition-all duration-300 ease-out group-hover:-translate-x-1 truncate">
                        {unit.title}
                      </h3>

                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                        <LayoutGrid
                          size={16}
                          className="sm:hidden text-[#B348FE]"
                        />
                        <LayoutGrid
                          size={20}
                          className="hidden sm:block text-[#B348FE]"
                        />
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-200 dark:border-[#262626]">
                      {unit.lessons.map((lesson: any, idx: number) => {
                        const isVideo = lesson.type === "video";
                        const isFile = lesson.type === "pdf";
                        const isHomework = lesson.type === "homework";
                        const isExam = lesson.type === "quiz";

                        const extras = examExtras[lesson.id];
                        const videoExtra = videoExtras[lesson.id];

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => toggleLessonExpand(lesson.id)}
                            className={`px-3 sm:px-6 py-3 sm:py-5 cursor-pointer ${
                              idx !== unit.lessons.length - 1
                                ? "border-b border-gray-100 dark:border-gray-700"
                                : ""
                            } hover:bg-[#FAF7FF] dark:hover:bg-[#171717] transition-all duration-300`}
                          >
                          <div className="flex flex-row-reverse items-center justify-between gap-2 sm:gap-4 hover:pr-2 transition-all duration-300">
                            <div className="flex-shrink-0">
                              {isEnrolled ? (
                                <>
                                  {isVideo && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openVideoPlayer(lesson.id, lesson.title);
                                      }}
                                      className="flex items-center gap-1.5 sm:gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-yellow-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                    >
                                      <Play size={13} />
                                      <span>مشاهدة الفيديو</span>
                                    </button>
                                  )}

                                  {isFile && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPdf(lesson.id);
                                      }}
                                      className="flex items-center gap-1.5 sm:gap-2 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-blue-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                    >
                                      <FileText size={13} />
                                      <span>تحميل الملف</span>
                                    </button>
                                  )}

                                  {isHomework && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/homework/${lesson.id}`, {
                                          state: {
                                            fromCourse: true,
                                            courseId: slug,
                                          },
                                        });
                                      }}
                                      className="flex items-center gap-1.5 sm:gap-2 bg-green-500 hover:bg-green-600 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-green-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                    >
                                      <ClipboardCheck size={13} />
                                      <span>حل الواجب</span>
                                    </button>
                                  )}

                                  {isExam && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const { data, error } = await supabase
                                          .from("exams")
                                          .select("id")
                                          .eq("course_item_id", lesson.id)
                                          .single();

                                        if (error || !data) {
                                          console.error(error);
                                          alert("الامتحان غير موجود");
                                          return;
                                        }

                                        navigate(`/dashboard/exams/${data.id}`);
                                      }}
                                      className="flex items-center gap-1.5 sm:gap-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                    >
                                      <ClipboardList size={13} />
                                      <span>ابدأ الكويز</span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl">
                                  <Lock size={14} />
                                  <span className="text-xs sm:text-sm font-bold">مقفل</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-row-reverse items-center gap-3 text-right flex-1 min-w-0">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm sm:text-base xl:text-lg font-bold text-[#111827] dark:text-white truncate transition-colors duration-300 group-hover:text-[#B348FE]">
                                  {lesson.title}
                                </h4>

                                {isExam && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {lesson.duration || 30} دقيقة
                                  </p>
                                )}
                              </div>

                              <div
                                className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                                  isVideo ? "bg-yellow-100 text-yellow-500" : ""
                                } ${isFile ? "bg-blue-100   text-blue-500" : ""} ${
                                  isHomework ? "bg-green-100  text-green-500" : ""
                                } ${isExam ? "bg-red-100    text-red-500" : ""}`}
                              >
                                {isVideo && <Play size={15} />}
                                {isFile && <FileText size={15} />}
                                {isHomework && <ClipboardCheck size={15} />}
                                {isExam && <ClipboardList size={15} />}
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                          {isEnrolled && expandedLessonId === lesson.id && (isVideo || isFile || (isExam && extras)) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              onClick={(e) => e.stopPropagation()}
                              className="overflow-hidden"
                            >
                            <div className="mt-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-[#171717] px-4 py-3 space-y-2.5">
                              {isVideo && (
                                <>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    <Info size={14} className="text-rose-400 flex-shrink-0" />
                                    <span className="font-bold text-gray-700 dark:text-gray-200">الوصف</span>
                                    <span className="text-gray-400">:</span>
                                    <span className="truncate">{lesson.description || "-"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    <Clock size={14} className="text-amber-400 flex-shrink-0" />
                                    <span className="font-bold text-gray-700 dark:text-gray-200">مدة الفيديو</span>
                                    <span className="text-gray-400">:</span>
                                    <span>{lesson.duration ? `${lesson.duration} دقيقة` : "-"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    <Timer size={14} className="text-emerald-400 flex-shrink-0" />
                                    <span className="font-bold text-gray-700 dark:text-gray-200">إجمالي وقت مشاهدتك</span>
                                    <span className="text-gray-400">:</span>
                                    <span>{Math.floor((videoExtra?.watchedSeconds || 0) / 60)} دقيقة</span>
                                  </div>
                                  <div className="pt-1">
                                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${videoExtra?.progressPercent || 0}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}

                              {isFile && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                  <Info size={14} className="text-rose-400 flex-shrink-0" />
                                  <span className="font-bold text-gray-700 dark:text-gray-200">الوصف</span>
                                  <span className="text-gray-400">:</span>
                                  <span className="truncate">{lesson.description || "-"}</span>
                                </div>
                              )}

                              {isExam && extras && (
                                <>
                                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        اقل نتيجة لك :{" "}
                                        <span className="font-bold text-gray-800 dark:text-white">
                                          {extras.minScore}%
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
                                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        متوسط نتائجك :{" "}
                                        <span className="font-bold text-gray-800 dark:text-white">
                                          {extras.avgScore}%
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0" />
                                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        اعلى نتيجة لك :{" "}
                                        <span className="font-bold text-gray-800 dark:text-white">
                                          {extras.maxScore}%
                                        </span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    عدد مرات دخولك :{" "}
                                    <span className="font-bold text-gray-800 dark:text-white">
                                      {extras.attemptsCount} مرة
                                    </span>
                                    <span className="mx-2 text-gray-300">-</span>
                                    عدد مرات إنهائك :{" "}
                                    <span className="font-bold text-gray-800 dark:text-white">
                                      {extras.completedCount} مرة
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    <Info size={14} className="text-rose-400 flex-shrink-0" />
                                    <span className="font-bold text-gray-700 dark:text-gray-200">الوصف</span>
                                    <span className="text-gray-400">:</span>
                                    <span className="truncate">{extras.description || "-"}</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    <Hash size={14} className="text-violet-400 flex-shrink-0" />
                                    <span className="font-bold text-gray-700 dark:text-gray-200">عدد الاسئلة</span>
                                    <span className="text-gray-400">:</span>
                                    <span>{extras.questionsCount} سؤال</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                    <Clock size={14} className="text-amber-400 flex-shrink-0" />
                                    <span className="font-bold text-gray-700 dark:text-gray-200">مدة الامتحان</span>
                                    <span className="text-gray-400">:</span>
                                    <span>{extras.duration} دقيقة</span>
                                  </div>
                                </>
                              )}
                            </div>
                            </motion.div>
                          )}
                          </AnimatePresence>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {units.length === 0 && (
            <div className="text-center py-16 sm:py-20 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg sm:text-xl font-bold">سيتم اضافه محتوى الكورس قريب اوي متستعجلش ⌛️⏳❤️
</p>
            </div>
          )}
        </div>
      </div>

      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-[30px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] shadow-[0_25px_70px_rgba(15,23,42,.12)] dark:shadow-[0_30px_70px_rgba(0,0,0,.65)] p-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6EEFF] dark:bg-[#2B103D]">
                <ShieldCheck size={36} className="text-[#B348FE]" />
              </div>

              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                تفعيل الاشتراك
              </h2>

              <p className="mt-3 text-gray-500 dark:text-gray-400 leading-7">
                أدخل كود الاشتراك الخاص بك لتفعيل الكورس.
              </p>

              <div className="mt-5 rounded-2xl border border-[#EAD8FF] dark:border-[#2A2A2A] bg-[#F6EEFF] dark:bg-[#1A1A1A] px-5 py-4">
                <h3 className="text-lg font-black text-[#B348FE] text-center">
                  {course?.title}
                </h3>
              </div>
            </div>

            <input
              type="text"
              value={subscriptionCode}
              onChange={(e) => setSubscriptionCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="mt-7 w-full rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#181818] px-5 py-4 text-center text-lg tracking-[6px] font-black text-[#B348FE] outline-none transition-all duration-300 focus:border-[#B348FE] focus:ring-4 focus:ring-[#B348FE]/20"
            />

            <Button className="w-full mt-5" onClick={activateSubscription}>
              تفعيل الاشتراك
            </Button>

            <Button
              variant="outline"
              className="w-full mt-3 bg-green-50 border-green-200 text-green-700 dark:bg-[#16281F] dark:border-[#245D3A] dark:text-green-400 hover:bg-green-500 hover:text-white flex items-center justify-center gap-2"
              onClick={() =>
                window.open(
                  `https://wa.me/201109414585?text=${encodeURIComponent(
                    `السلام عليكم، عايز الاشتراك في كورس ${course?.title}`
                  )}`,
                  "_blank"
                )
              }
            >
              <FaWhatsapp className="text-xl" />
              شراء كود عبر واتساب
            </Button>

            <Button
              variant="ghost"
              className="w-full mt-3 text-gray-500 dark:text-gray-400 hover:text-[#B348FE]"
              onClick={() => {
                setShowSubscriptionModal(false);
                setSubscriptionCode("");
              }}
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {videoPlayerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeVideoPlayer}
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: "none" }}
        >
          <div
            className="relative w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-gray-800 px-6 py-4 border-b border-gray-700">
              <button
                onClick={closeVideoPlayer}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="text-white font-bold text-lg text-right flex-1 mr-4 truncate">
                {videoPlayerTitle}
              </h3>
            </div>

            <div
              ref={videoWrapperRef}
              className="relative bg-black"
              style={{ paddingBottom: isFullscreen ? "0" : "56.25%" }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <video
                ref={videoRef}
                key={videoPlayerUrl}
                src={videoPlayerUrl}
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                preload="metadata"
                playsInline
                onContextMenu={(e) => e.preventDefault()}
                className={isFullscreen ? "w-full h-full" : "absolute inset-0 w-full h-full"}
                autoPlay
              />

              <button
                onClick={toggleFullscreen}
                className="absolute bottom-4 left-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-xl transition-all backdrop-blur-sm"
                title={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>

              <div
                className="absolute pointer-events-none select-none transition-all duration-1000 ease-in-out z-10"
                style={{
                  top: watermarkPosition.top,
                  left: watermarkPosition.left,
                }}
              >
                <div
                  className="px-3 py-1.5 rounded-lg text-white text-xs sm:text-sm font-bold whitespace-nowrap"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                    opacity: 0.55,
                  }}
                >
                  {getWatermarkText()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
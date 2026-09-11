import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
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
  ListVideo,
} from "lucide-react";
import {
  HiArrowPath,
  HiDocumentPlus,
} from "react-icons/hi2";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
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

const VideoLessonIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5.5" width="13" height="13" rx="2" fill="#FDF6E3" stroke="#F0A500" strokeWidth="1.6" />
    <path d="M15 10L21.5 7v10L15 14v-4Z" fill="#FDF6E3" stroke="#F0A500" strokeWidth="1.6" strokeLinejoin="round" />
    <rect x="4.3" y="7.6" width="3" height="1.6" rx="0.4" fill="#F0A500" />
  </svg>
);

const FileLessonIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="2.5" width="14" height="15" rx="2" fill="#DCE9FF" stroke="#4C9AFF" strokeWidth="1.6" />
    <rect x="3" y="5" width="14" height="15" rx="2" fill="#EAF2FF" stroke="#4C9AFF" strokeWidth="1.6" />
    <path d="M3 17.5h14" stroke="#4C9AFF" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const QuizLessonIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 3h18v11.5l-1.8-1.6-1.8 1.6-1.8-1.6-1.8 1.6-1.8-1.6-1.8 1.6-1.8-1.6-1.8 1.6-1.8-1.6-1.8 1.6V3Z"
      fill="#FDE1E5"
      stroke="#EF4444"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <text x="12" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#EF4444" fontFamily="Arial, sans-serif">
      A+
    </text>
  </svg>
);

const HomeworkLessonIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 8.5h10.5v11H4.5a2 2 0 0 1-2-2v-9Z" stroke="#14B8A6" strokeWidth="1.5" />
    <rect x="8" y="2.5" width="13.5" height="13.5" rx="2" fill="#D2F5F0" stroke="#14B8A6" strokeWidth="1.6" />
    <text x="14.7" y="12.3" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#14B8A6" fontFamily="Arial, sans-serif">
      ?
    </text>
  </svg>
);

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
  const [videoPlayerDescription, setVideoPlayerDescription] = useState("");
  const [videoPlayerThumbnail, setVideoPlayerThumbnail] = useState("");
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [playerStage, setPlayerStage] = useState<"info" | "playing">("info");
  const [watermarkPosition, setWatermarkPosition] = useState({ top: "10%", left: "10%" });
  const [videoContentRect, setVideoContentRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showIntroCard, setShowIntroCard] = useState(false);
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const [videoChapters, setVideoChapters] = useState<{ title: string; time: number }[]>([]);
  const [showChapters, setShowChapters] = useState(false);
  const [previewPhase, setPreviewPhase] = useState<"image" | "video" | "image-final">("image");
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
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

  const allLessonsFlat = units.flatMap((u) => u.lessons);

  const isLessonCompleted = (lesson: any): boolean => {
    if (lesson.type === "video") {
      const vp = videoExtras[lesson.id];
      const required = course?.min_watch_percentage > 0 ? course.min_watch_percentage : 90;
      return !!vp && vp.progressPercent >= required;
    }
    if (lesson.type === "quiz") {
      const ex = examExtras[lesson.id];
      return !!ex && ex.completedCount > 0;
    }
    // PDF والواجب مش متتبعين حاليًا، فبنعتبرهم مكتملين تلقائيًا عشان مايبقاش القفل غلط
    return true;
  };

  const isLessonLocked = (lesson: any): boolean => {
    if (!course?.sequential_viewing_enabled) return false;
    const idx = allLessonsFlat.findIndex((l) => l.id === lesson.id);
    if (idx <= 0) return false;
    const previousLesson = allLessonsFlat[idx - 1];
    return !isLessonCompleted(previousLesson);
  };

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

  const openVideoPlayer = async (
    lessonId: string,
    title: string,
    description?: string | null,
    chapters?: { title: string; time: number }[] | null,
    thumbnail?: string | null
  ) => {
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
      setVideoPlayerDescription(description || "");
      setVideoChapters(chapters || []);
      setVideoPlayerThumbnail(thumbnail || "");
      setShowChapters(false);
      setPreviewPhase("image");
      setPlayerStage("info");
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
    setVideoPlayerDescription("");
    setVideoPlayerThumbnail("");
    setCurrentLessonId("");
    setPlayerStage("info");
    setVideoChapters([]);
    setShowChapters(false);
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

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.min(
      Math.max(videoRef.current.currentTime + seconds, 0),
      videoRef.current.duration || 0
    );
    videoRef.current.currentTime = newTime;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    videoRef.current.muted = newVolume === 0;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const calculateSeekRatio = (clientX: number) => {
    if (!seekBarRef.current) return 0;
    const rect = seekBarRef.current.getBoundingClientRect();
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  };

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoDuration) return;
    setIsDraggingSeek(true);
    const newTime = calculateSeekRatio(e.clientX) * videoDuration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = Math.min(Math.max(ratio, 0), 1) * videoDuration;
  };

  useEffect(() => {
    if (!isDraggingSeek) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!videoRef.current || !videoDuration) return;
      const newTime = calculateSeekRatio(e.clientX) * videoDuration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => setIsDraggingSeek(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSeek, videoDuration]);

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
    if (!videoPlayerOpen || playerStage !== "playing") return;

    const calculateContentRect = () => {
      const video = videoRef.current;
      const wrapper = videoWrapperRef.current;
      if (!video || !wrapper || !video.videoWidth || !video.videoHeight) return;

      const wrapperWidth = wrapper.clientWidth;
      const wrapperHeight = wrapper.clientHeight;
      const videoRatio = video.videoWidth / video.videoHeight;
      const wrapperRatio = wrapperWidth / wrapperHeight;

      let contentWidth: number;
      let contentHeight: number;

      if (videoRatio > wrapperRatio) {
        // الفيديو أعرض من الحاوية → فراغ فوق وتحت
        contentWidth = wrapperWidth;
        contentHeight = wrapperWidth / videoRatio;
      } else {
        // الفيديو أطول من الحاوية → فراغ يمين وشمال
        contentHeight = wrapperHeight;
        contentWidth = wrapperHeight * videoRatio;
      }

      setVideoContentRect({
        top: (wrapperHeight - contentHeight) / 2,
        left: (wrapperWidth - contentWidth) / 2,
        width: contentWidth,
        height: contentHeight,
      });
    };

    calculateContentRect();

    const video = videoRef.current;
    video?.addEventListener("loadedmetadata", calculateContentRect);
    window.addEventListener("resize", calculateContentRect);

    return () => {
      video?.removeEventListener("loadedmetadata", calculateContentRect);
      window.removeEventListener("resize", calculateContentRect);
    };
  }, [videoPlayerOpen, playerStage]);

  useEffect(() => {
    if (!videoPlayerOpen || playerStage !== "playing" || !videoContentRect) return;

    const marginX = videoContentRect.width * 0.08;
    const marginY = videoContentRect.height * 0.1;

    const positions = [
      { top: videoContentRect.top + marginY, left: videoContentRect.left + marginX },
      { top: videoContentRect.top + marginY, left: videoContentRect.left + videoContentRect.width - marginX - 140 },
      { top: videoContentRect.top + videoContentRect.height - marginY - 30, left: videoContentRect.left + marginX },
      { top: videoContentRect.top + videoContentRect.height - marginY - 30, left: videoContentRect.left + videoContentRect.width - marginX - 140 },
      { top: videoContentRect.top + videoContentRect.height * 0.45, left: videoContentRect.left + videoContentRect.width * 0.35 },
      { top: videoContentRect.top + videoContentRect.height * 0.15, left: videoContentRect.left + videoContentRect.width * 0.4 },
      { top: videoContentRect.top + videoContentRect.height * 0.7, left: videoContentRect.left + videoContentRect.width * 0.15 },
    ];

    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % positions.length;
      setWatermarkPosition({
        top: `${positions[index].top}px`,
        left: `${positions[index].left}px`,
      });
    }, 4000);

    setWatermarkPosition({ top: `${positions[0].top}px`, left: `${positions[0].left}px` });

    return () => clearInterval(interval);
  }, [videoPlayerOpen, playerStage, videoContentRect]);

  useEffect(() => {
    if (playerStage !== "info" || !videoPlayerUrl) return;

    // لو مفيش صورة غلاف: شغّل معاينة الفيديو 5 ثواني ثم قف عليها
    if (!videoPlayerThumbnail) {
      const timer = setTimeout(() => {
        previewVideoRef.current?.pause();
      }, 5000);
      return () => clearTimeout(timer);
    }

    // لو فيه صورة غلاف: صورة (4 ثواني) ← فيديو (4 ثواني) ← يثبت على الصورة نهائيًا
    if (previewPhase === "image") {
      const timer = setTimeout(() => setPreviewPhase("video"), 4000);
      return () => clearTimeout(timer);
    } else if (previewPhase === "video") {
      previewVideoRef.current?.play().catch(() => {});
      const timer = setTimeout(() => {
        previewVideoRef.current?.pause();
        setPreviewPhase("image-final");
      }, 20000);
      return () => clearTimeout(timer);
    }
    // لو "image-final": متسيبهاش تعمل حاجة، تفضل ثابتة
  }, [playerStage, previewPhase, videoPlayerThumbnail, videoPlayerUrl]);

  useEffect(() => {
    if (!videoPlayerOpen || playerStage !== "playing") {
      setShowIntroCard(false);
      return;
    }

    setShowIntroCard(true);
    const timer = setTimeout(() => setShowIntroCard(false), 3500);

    return () => clearTimeout(timer);
  }, [videoPlayerOpen, playerStage]);



  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoPlayerOpen || playerStage !== "playing") return;

    const handleLoadedMetadata = async () => {
      const duration = video.duration;
      const studentId = getStudentId();

      setVideoDuration(duration || 0);
      setIsMuted(video.muted);
      setPlaybackRate(video.playbackRate);

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
      setIsPlaying(true);

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
      setIsPlaying(false);

      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }

      await saveProgress(video.currentTime, video.duration);
    };

    const handleEnded = async () => {
      setIsPlaying(false);

      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }

      await markAsCompleted();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);

      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [videoPlayerOpen, currentLessonId, playerStage]);

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

      <div className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-40 sm:pb-48 lg:pb-56">
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
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-full bg-[#5800a9] hover:bg-[#4a0089] text-white font-bold text-sm sm:text-base px-5 py-2.5 shadow-lg transition-all duration-300 mb-6 sm:mb-8"
            >
              <span>العودة</span>
              <ChevronRight size={18} />
            </button>

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
                  <span className="rounded-full bg-[#5800a9] text-white px-2.5 py-1 text-[11px] font-black">
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
                <span className="rounded-full bg-[#5800a9] text-white px-4 py-1.5 text-sm font-black">
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

      <div className="relative z-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-48 lg:-mt-56">
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
                    className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white text-lg sm:text-xl font-black bg-[#5800a9] border-2 border-[#5800a9] hover:bg-transparent hover:text-[#5800a9] shadow-none cursor-pointer transition-all duration-300 mb-3 sm:mb-4"
                  >
                    {isEnrolled ? "مشترك" : "اشترك مجانًا"}
                  </button>
                ) : (
                  <>
                    {isEnrolled ? (
                      <div className="text-center mb-4"></div>
                    ) : (
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="inline-flex items-center rounded-full overflow-hidden shadow-sm">
                          <span className="flex items-center gap-2 pl-4 pr-3 sm:pl-5 sm:pr-4 py-2 sm:py-2.5 text-white font-black text-base sm:text-lg bg-[#5800a9]">
                            <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-[#5800a9] text-[10px] sm:text-xs font-black flex-shrink-0">
                              ج
                            </span>
                            <span>{Number(course.price).toFixed(2)}</span>
                          </span>
                          <span className="flex items-center px-4 sm:px-5 py-2 sm:py-2.5 text-white font-bold text-sm sm:text-base bg-[#b600d7]">
                            جنيهًا
                          </span>
                        </div>
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
                            await openVideoPlayer(firstLesson.id, firstLesson.title, firstLesson.description, firstLesson.chapters, firstLesson.thumbnail);
                          }

                          return;
                        }

                        handleEnroll();
                      }}
                      className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white text-lg sm:text-xl font-black bg-[#5800a9] border-2 border-[#5800a9] hover:bg-transparent hover:text-[#5800a9] shadow-none cursor-pointer transition-all duration-300 mb-3"
                    >
                      {isEnrolled ? "مشترك" : "اشترك الآن"}
                    </button>
                  </>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-bold text-sm sm:text-base">
                      <Clock size={16} className="text-[#5800a9]" />
                      <span>المحتوى</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm sm:text-base text-gray-400 dark:text-gray-500 font-bold">
                      <span>+{totalContentHours}</span>
                      <span>ساعات</span>
                    </div>
                  </div>

                  <div className="h-px w-full bg-gray-100 dark:bg-gray-700" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-bold text-sm sm:text-base">
                      <HelpCircle size={16} className="text-[#5800a9]" />
                      <span>اجمالي الاسئلة</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm sm:text-base text-gray-400 dark:text-gray-500 font-bold">
                      <span>+{totalQuestionsCount}</span>
                      <span>سؤال</span>
                    </div>
                  </div>
                </div>

                {course.intro_video && (
                  <button
                    onClick={() => window.open(course.intro_video)}
                    className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-gray-700 dark:text-gray-200 font-bold text-sm sm:text-base border-2 border-gray-200 dark:border-gray-600 hover:border-[#5800a9] flex items-center justify-center gap-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] transition-all duration-300 mb-3 sm:mb-4 cursor-pointer"
                  >
                    <Play size={16} className="text-[#5800a9]" />
                    <span>مشاهدة المقدمة</span>
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#09090B] pt-10 pb-8 sm:pt-14 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
         <div className="group relative py-6 px-5 sm:py-8 sm:px-7 mb-4 sm:mb-6 transition-all duration-500">

  {/* Decorative line - top */}
  <span className="block w-16 sm:w-20 h-1 rounded-full bg-gray-300 dark:bg-gray-700 ml-auto mb-3 sm:mb-4 transition-all duration-500 group-hover:-translate-x-24 sm:group-hover:-translate-x-40 group-hover:w-20" />

  {/* Title */}
  <h2 className="relative z-10 text-2xl sm:text-3xl xl:text-4xl font-black text-right transition-all duration-500 group-hover:translate-x-1">

    <span className="text-gray-900 dark:text-white transition-colors duration-500 group-hover:text-rose-600">
      محتوى
    </span>

    <span className="text-rose-600 transition-colors duration-500 group-hover:text-gray-900 dark:group-hover:text-white">
      {" "}الكورس
    </span>

  </h2>

  {/* Decorative line - bottom */}
  <span className="block w-16 sm:w-20 h-1 rounded-full bg-gray-300 dark:bg-gray-700 ml-auto mt-3 sm:mt-4 transition-all duration-500 group-hover:-translate-x-20 sm:group-hover:-translate-x-36 group-hover:w-20" />
</div>

          <div className="space-y-3 sm:space-y-4">
            {units.map((unit) => {
              const isOpen = openUnit === unit.id;

              return (
                <div
  key={unit.id}
  className="group bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
>
                  <button
                    onClick={() => setOpenUnit(isOpen ? null : unit.id)}
                    className={`w-full flex flex-row-reverse items-center justify-between px-4 sm:px-6 py-4 sm:py-5 transition-colors duration-300 ${
  isOpen ? "bg-rose-50 dark:bg-rose-950/30" : "bg-white dark:bg-[#111111]"
}`}
                  >
                   <ChevronDown
  size={18}
  className={`flex-shrink-0 transition-transform duration-300 text-rose-500 ${
    isOpen ? "rotate-0" : "rotate-180"
  }`}
/>

                    <div className="flex flex-row-reverse items-center justify-start gap-3">
                      <div className="text-right">
                        <h3 className="text-base sm:text-xl xl:text-2xl font-black text-gray-900 dark:text-white truncate">
                          {unit.title}
                        </h3>
                        {unit.description && (
                          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium mt-0.5 truncate">
                            {unit.description}
                          </p>
                        )}
                      </div>

                      <LayoutGrid
                        size={20}
                        className="flex-shrink-0 text-rose-500"
                      />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-slate-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0c0c0c] p-3 sm:p-4 space-y-3"
                    >
                      {unit.lessons.map((lesson: any) => {
                        const isVideo = lesson.type === "video";
                        const isFile = lesson.type === "pdf";
                        const isHomework = lesson.type === "homework";
                        const isExam = lesson.type === "quiz";
                        const isLink = lesson.type === "link";

                        const extras = examExtras[lesson.id];
                        const videoExtra = videoExtras[lesson.id];
                        const isExpanded = expandedLessonId === lesson.id;

                        return (
                          <div
                            key={lesson.id}
                            className="rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-[#1A1A1A] shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300"
                          >
                            <div
                              onClick={() => toggleLessonExpand(lesson.id)}
                              className={`px-3 sm:px-6 py-3 sm:py-5 cursor-pointer transition-colors duration-300 ${
                                isExpanded
                                  ? "bg-slate-100 dark:bg-slate-800/60"
                                  : "hover:bg-gray-50 dark:hover:bg-[#171717]"
                              }`}
                            >
                              <div className="flex flex-row-reverse items-center justify-between gap-2 sm:gap-4 transition-all duration-300">
                                <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                                  <ChevronDown
                                    size={14}
                                    className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                                      isExpanded ? "rotate-0" : "rotate-180"
                                    }`}
                                  />
                                  {isEnrolled && !isLessonLocked(lesson) ? (
                                    <>
                                      {isVideo && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openVideoPlayer(lesson.id, lesson.title, lesson.description, lesson.chapters, lesson.thumbnail);
                                          }}
                                          className="flex items-center gap-1.5 sm:gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-yellow-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                        >
                                          <Play size={13} />
                                          <span>مشاهدة</span>
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

                                      {isLink && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!lesson.url) {
                                              showToast("الرابط غير متوفر");
                                              return;
                                            }
                                            window.open(lesson.url, "_blank", "noopener,noreferrer");
                                          }}
                                          className="flex items-center gap-1.5 sm:gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-cyan-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                                        >
                                          <svg className="w-[13px] h-[13px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" /></svg>
                                          <span>فتح الرابط</span>
                                        </button>
                                      )}
                                    </>
                                  ) : isEnrolled && isLessonLocked(lesson) ? (
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl">
                                      <Lock size={14} />
                                      <span className="text-xs sm:text-sm font-bold">
                                        أكمل السابق أولاً
                                      </span>
                                    </div>
                                  ) : null}
                                </div>

                                <div className="flex flex-row-reverse items-center gap-3 text-right flex-1 min-w-0">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base xl:text-lg font-bold text-[#111827] dark:text-white truncate">
                                      {lesson.title}
                                    </h4>

                                    {isExam && (
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {lesson.duration || 30} دقيقة
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                    {isVideo && <VideoLessonIcon />}
                                    {isFile && <FileLessonIcon />}
                                    {isHomework && <HomeworkLessonIcon />}
                                    {isExam && <QuizLessonIcon />}
                                    {isLink && (
                                      <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" /></svg>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="h-[3px] w-full bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 dark:from-slate-600 dark:via-slate-700 dark:to-slate-600" />
                            )}

                            <AnimatePresence>
                            {isExpanded && (isVideo || isFile || isLink || (isExam && extras)) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                onClick={(e) => e.stopPropagation()}
                                className="overflow-hidden"
                              >
                              <div className="px-4 py-3 space-y-2.5 bg-slate-50 dark:bg-[#171717]">
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

                                {isLink && (
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
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {units.length === 0 && (
            <div className="text-center py-16 sm:py-20 text-gray-400">
              <BookOpen size={64} strokeWidth={1.5} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg sm:text-xl font-bold">سيتم اضافه محتوى الكورس قريب اوي متستعجلش ⌛️⏳❤️
</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-[30px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] shadow-[0_25px_70px_rgba(15,23,42,.12)] dark:shadow-[0_30px_70px_rgba(0,0,0,.65)] p-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6EEFF] dark:bg-[#2B103D]">
                <ShieldCheck size={36} className="text-[#5800a9]" />
              </div>

              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                تفعيل الاشتراك
              </h2>

              <p className="mt-3 text-gray-500 dark:text-gray-400 leading-7">
                أدخل كود الاشتراك الخاص بك لتفعيل الكورس.
              </p>

              <div className="mt-5 rounded-2xl border border-[#EAD8FF] dark:border-[#2A2A2A] bg-[#F6EEFF] dark:bg-[#1A1A1A] px-5 py-4">
                <h3 className="text-lg font-black text-[#5800a9] text-center">
                  {course?.title}
                </h3>
              </div>
            </div>

            <input
              type="text"
              value={subscriptionCode}
              onChange={(e) => setSubscriptionCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="mt-7 w-full rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#181818] px-5 py-4 text-center text-lg tracking-[6px] font-black text-[#5800a9] outline-none transition-all duration-300 focus:border-[#5800a9] focus:ring-4 focus:ring-[#5800a9]/20"
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
              className="w-full mt-3 text-gray-500 dark:text-gray-400 hover:text-[#5800a9]"
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
          className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center ${
            playerStage === "info" ? "p-4" : "p-0"
          }`}
          onClick={closeVideoPlayer}
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: "none" }}
        >
          <div
            className={
              playerStage === "info"
                ? "relative w-full max-w-4xl xl:max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-[0_25px_90px_rgba(88,0,169,0.45)] ring-1 ring-white/10"
                : "relative w-full h-full bg-black"
            }
            onClick={(e) => e.stopPropagation()}
          >
            {playerStage === "info" ? (
              <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                {videoPlayerThumbnail ? (
                  previewPhase === "video" ? (
                    <video
                      ref={previewVideoRef}
                      key={videoPlayerUrl}
                      src={videoPlayerUrl}
                      muted
                      playsInline
                      preload="auto"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={videoPlayerThumbnail}
                      alt={videoPlayerTitle}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )
                ) : (
                  <video
                    ref={previewVideoRef}
                    key={videoPlayerUrl}
                    src={videoPlayerUrl}
                    muted
                    autoPlay
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <button
                  onClick={closeVideoPlayer}
                  className="absolute top-4 left-4 z-20 text-white hover:text-gray-300 transition-colors bg-black/40 hover:bg-black/60 rounded-full p-2"
                >
                  <X size={22} />
                </button>

                <img
                  src="/images/logo-light.png"
                  alt="logo"
                  className="absolute top-4 right-4 z-20 h-8 sm:h-10 w-auto object-contain"
                />

                <div className="absolute bottom-0 right-0 left-0 p-5 sm:p-8 z-20">
                  <h3 className="text-white font-black text-xl sm:text-3xl text-right mb-2 sm:mb-3">
                    {videoPlayerTitle}
                  </h3>

                  {videoPlayerDescription && (
                    <p className="text-gray-200 text-sm sm:text-base text-right leading-relaxed mb-4 sm:mb-6 max-w-2xl mr-0 ml-auto line-clamp-3">
                      {videoPlayerDescription}
                    </p>
                  )}

                  <button
                    onClick={() => setPlayerStage("playing")}
                    className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black font-black text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    <Play size={18} className="fill-black" />
                    <span>عرض</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                ref={videoWrapperRef}
                className="relative w-full h-full bg-black"
                onContextMenu={(e) => e.preventDefault()}
                onClick={togglePlayPause}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeVideoPlayer();
                  }}
                  className="absolute top-4 left-4 z-30 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-2.5"
                >
                  <X size={22} />
                </button>

                <video
                  ref={videoRef}
                  key={videoPlayerUrl}
                  src={videoPlayerUrl}
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  preload="metadata"
                  playsInline
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-contain"
                  autoPlay
                />

                <AnimatePresence>
                  {showIntroCard && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute top-6 sm:top-10 right-6 sm:right-10 z-20 pointer-events-none select-none"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="w-[3px] sm:w-1 h-10 sm:h-14 bg-red-600 rounded-full flex-shrink-0" />
                        <div className="text-right">
                          <h3 className="text-white font-black text-lg sm:text-2xl leading-tight">
                            منصة الكيميائي
                          </h3>
                          <p className="text-gray-300 font-bold text-sm sm:text-base mt-1">
                            مستر زياد ربيع
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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

                {/* شريط التحكم المخصص */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  dir="ltr"
                  className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 pb-3 sm:pb-5 pt-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                >
                  <div
                    ref={seekBarRef}
                    onClick={handleSeekClick}
                    onMouseDown={handleSeekMouseDown}
                    className="relative w-full h-1.5 bg-white/25 rounded-full cursor-pointer mb-3 sm:mb-4"
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
                      style={{ width: `${videoDuration ? (currentTime / videoDuration) * 100 : 0}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow z-10"
                      style={{ left: `calc(${videoDuration ? (currentTime / videoDuration) * 100 : 0}% - 6px)` }}
                    />

                    {videoDuration > 0 &&
                      videoChapters
                        .filter((chapter) => chapter.time > 0 && chapter.time < videoDuration)
                        .map((chapter, index) => (
                          <div
                            key={index}
                            className="absolute top-0 h-full w-[2px] bg-black/70"
                            style={{ left: `${(chapter.time / videoDuration) * 100}%` }}
                          />
                        ))}
                  </div>

                  <div className="relative flex items-center justify-between gap-3 sm:gap-4">
                    <span className="absolute left-1/2 -translate-x-1/2 text-white text-xs sm:text-sm font-bold hidden sm:block truncate max-w-[220px] pointer-events-none">
                      {videoPlayerTitle}
                    </span>
                    <div className="flex items-center gap-3 sm:gap-5">
                      <button onClick={togglePlayPause} className="text-white hover:text-gray-300 transition-colors">
                        {isPlaying ? (
                          <Pause size={22} className="sm:w-7 sm:h-7 fill-white" />
                        ) : (
                          <Play size={22} className="sm:w-7 sm:h-7 fill-white" />
                        )}
                      </button>

                      <button onClick={() => skipTime(-10)} className="relative text-white hover:text-gray-300 transition-colors">
                        <RotateCcw size={20} className="sm:w-6 sm:h-6" />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold pt-0.5">
                          10
                        </span>
                      </button>

                      <button onClick={() => skipTime(10)} className="relative text-white hover:text-gray-300 transition-colors">
                        <RotateCw size={20} className="sm:w-6 sm:h-6" />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold pt-0.5">
                          10
                        </span>
                      </button>

                      <div
                        className="flex items-center gap-2"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors">
                          {isMuted ? <VolumeX size={20} className="sm:w-6 sm:h-6" /> : <Volume2 size={20} className="sm:w-6 sm:h-6" />}
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            showVolumeSlider ? "w-16 sm:w-20 opacity-100" : "w-0 opacity-0"
                          }`}
                        >
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-full h-1.5 accent-red-600 cursor-pointer"
                          />
                        </div>
                      </div>

                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                      <span className="text-white text-xs sm:text-sm font-bold tabular-nums">
                        {formatTime(currentTime)} / {formatTime(videoDuration)}
                      </span>

                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu((prev) => !prev)}
                          className="flex items-center gap-1 text-white hover:text-gray-300 transition-colors"
                        >
                          <Gauge size={20} className="sm:w-6 sm:h-6" />
                          <span className="text-xs sm:text-sm font-bold">{playbackRate}x</span>
                        </button>

                        {showSpeedMenu && (
                          <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded-lg overflow-hidden shadow-xl min-w-[80px]">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                              <button
                                key={rate}
                                onClick={() => changeSpeed(rate)}
                                className={`w-full text-center px-4 py-2 text-sm transition-colors ${
                                  playbackRate === rate ? "text-red-500 font-bold" : "text-white hover:bg-white/10"
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {videoChapters.length > 0 && (
                        <button
                          onClick={() => setShowChapters((prev) => !prev)}
                          className={`transition-colors ${showChapters ? "text-red-500" : "text-white hover:text-gray-300"}`}
                          title="الفصول"
                        >
                          <ListVideo size={20} className="sm:w-6 sm:h-6" />
                        </button>
                      )}

                      <button
                        onClick={toggleFullscreen}
                        className="text-white hover:text-gray-300 transition-colors"
                        title={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
                      >
                        {isFullscreen ? <Minimize size={20} className="sm:w-6 sm:h-6" /> : <Maximize size={20} className="sm:w-6 sm:h-6" />}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showChapters && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.25 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-0 top-0 right-0 z-30 w-[280px] sm:w-[340px] bg-black/90 backdrop-blur-md overflow-y-auto"
                      dir="rtl"
                    >
                      <div className="p-4 sm:p-5 border-b border-white/15 flex items-center justify-between">
                        <h3 className="text-white font-black text-lg sm:text-xl">الفصول</h3>
                        <button
                          onClick={() => setShowChapters(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="p-2 sm:p-3">
                        {videoChapters.map((chapter, index) => {
                          const nextChapter = videoChapters[index + 1];
                          const isActive =
                            currentTime >= chapter.time &&
                            (!nextChapter || currentTime < nextChapter.time);

                          return (
                            <button
                              key={index}
                              onClick={() => {
                                if (videoRef.current) {
                                  videoRef.current.currentTime = chapter.time;
                                }
                              }}
                              className={`w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-3 rounded-xl transition-colors text-right ${
                                isActive ? "bg-red-600/15" : "hover:bg-white/5"
                              }`}
                            >
                              <span className="flex items-center gap-2 flex-1 min-w-0 justify-start">
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                )}
                                <span
                                  className={`text-sm sm:text-base font-bold truncate ${
                                    isActive ? "text-red-500" : "text-white"
                                  }`}
                                >
                                  {chapter.title}
                                </span>
                              </span>

                              <span className="text-gray-300 text-sm sm:text-base font-bold tabular-nums flex-shrink-0">
                                {formatTime(chapter.time)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
import { ScrollReveal } from "../../components/layout/ScrollReveal";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Download } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { HiArrowPath } from "react-icons/hi2";
import GradeCoursesContent from "./GradeCoursesContent";
import toast from "react-hot-toast";
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Star,
  Users,
  BookOpen,
  TrendingUp,
  ChevronDown,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import {
  TEACHER,
  STATS,
  COURSES,
  TESTIMONIALS,
  FAQS,
  ANNOUNCEMENTS,
  GRADES,
} from "../../data/mockData";

import InstallToast from "../../components/ui/InstallToast";
import { ParentAccessModal } from "../../components/layout/navbar/ParentAccessModal";
import { NotebookPen, X as CloseIcon, Loader2, Save, Plus, Trash2, ListChecks, StickyNote } from "lucide-react";

const gradeColors: Record<string, string> = {
  sec_3: "rose",
  sec_2: "violet",
  sec_1: "blue",
  primary: "emerald",
};

export function HomePage() {
    
  const navigate = useNavigate();
  
const { user } = useApp();
  const [selectedStage, setSelectedStage] =
    useState<"secondary" | "prep">("secondary");

    const [courses, setCourses] = useState<any[]>([]);
const [myCourses, setMyCourses] = useState<string[]>([]);
const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const [subscriptionCode, setSubscriptionCode] = useState("");
const [selectedCourse, setSelectedCourse] = useState<any>(null);
const [suggestedToast, setSuggestedToast] = useState<string | null>(null);
const [suggestedIndex, setSuggestedIndex] = useState(0);
const [suggestedDirection, setSuggestedDirection] = useState(1);
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
const [showParentModal, setShowParentModal] = useState(false);
const [showIOSInstallModal, setShowIOSInstallModal] = useState(false);

const [showNotesModal, setShowNotesModal] = useState(false);
const [noteContent, setNoteContent] = useState("");
const [noteLoading, setNoteLoading] = useState(false);
const [noteSaving, setNoteSaving] = useState(false);
const [noteSavedAt, setNoteSavedAt] = useState<string | null>(null);

const [activeNotebookTab, setActiveNotebookTab] = useState<"notes" | "tasks">("notes");
const [tasks, setTasks] = useState<any[]>([]);
const [tasksLoading, setTasksLoading] = useState(false);
const [newTaskText, setNewTaskText] = useState("");
const [newTaskPriority, setNewTaskPriority] = useState<"normal" | "important" | "urgent">("normal");
const [newTaskDueDate, setNewTaskDueDate] = useState("");
const [addingTask, setAddingTask] = useState(false);
const [taskSearch, setTaskSearch] = useState("");
const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
const [editingTaskText, setEditingTaskText] = useState("");

useEffect(() => {
  
}, [deferredPrompt]);

useEffect(() => {
  loadCourses();
  loadMyCourses();
  if (user) loadTasks();
}, [user]);

useEffect(() => {
const handler = (e: any) => {
  

  e.preventDefault();

  setDeferredPrompt(e);
};

  window.addEventListener("beforeinstallprompt", handler);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
  };
}, []);

const loadCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .eq("is_hidden", false)
    .eq("is_featured", true)
    .order("created_at", { ascending: false });

  if (!error) {
    setCourses(data || []);
  }
};

const loadMyCourses = async () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return;

  const currentUser = JSON.parse(storedUser);
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("student_courses")
    .select("course_id, expires_at")
    .eq("student_id", currentUser.studentId)
    .eq("active", true);

  const validCourses =
    data
      ?.filter((item: any) => !item.expires_at || item.expires_at > now)
      .map((item: any) => item.course_id) || [];

  setMyCourses(validCourses);
};

const handleSuggestedCourseAction = (course: any) => {
  if (myCourses.map(String).includes(String(course.id))) {
    navigate(`/courses/${course.id}`);
    return;
  }

  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    navigate("/login", { state: { redirectTo: window.location.pathname } });
    return;
  }

  if (course.is_free) {
    navigate(`/courses/${course.id}`);
    return;
  }

  setSelectedCourse(course);
  setShowSubscriptionModal(true);
};

const activateSuggestedSubscription = async () => {
  const { data, error } = await supabase
    .from("subscription_codes")
    .select("*")
    .eq("code", subscriptionCode)
    .single();

  if (error || !data) {
    setSuggestedToast("كود الاشتراك غير صحيح");
    return;
  }

  if (data.status !== "active") {
    setSuggestedToast("هذا الكود غير صالح أو تم استخدامه");
    return;
  }

  if (data.course_id !== selectedCourse.id) {
    setSuggestedToast("هذا الكود لا يخص هذا الكورس");
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("user")!);
  const studentId = currentUser.studentId;

  const { data: existingSubscription } = await supabase
    .from("student_courses")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", selectedCourse.id)
    .eq("active", true)
    .maybeSingle();

  if (existingSubscription) {
    setSuggestedToast("أنت مشترك بالفعل في هذا الكورس.");
    return;
  }

  const { error: enrollError } = await supabase
    .from("student_courses")
    .insert({
      student_id: studentId,
      course_id: selectedCourse.id,
      active: true,
      subscription_type: "كود اشتراك",
      expires_at: new Date(
        Date.now() + data.duration_days * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

  if (enrollError) {
    setSuggestedToast("حدث خطأ أثناء إضافة الاشتراك");
    return;
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + data.duration_days);

  await supabase
    .from("subscription_codes")
    .update({
      status: "used",
      student_id: studentId,
      used_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", data.id);

  await loadMyCourses();
  setShowSubscriptionModal(false);
  setSubscriptionCode("");
  setSelectedCourse(null);
  setSuggestedToast("تم تفعيل الاشتراك بنجاح");
};

const formatSuggestedDate = (date: string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const goToNextSuggested = () => {
  setSuggestedDirection(1);
  setSuggestedIndex((prev) => (prev + 1) % courses.length);
};

const goToPrevSuggested = () => {
  setSuggestedDirection(-1);
  setSuggestedIndex((prev) => (prev - 1 + courses.length) % courses.length);
};

useEffect(() => {
  if (courses.length <= 1) return;

  const interval = setInterval(() => {
    goToNextSuggested();
  }, 4000);

  return () => clearInterval(interval);
}, [courses.length, suggestedIndex]);

useEffect(() => {
  if (suggestedIndex >= courses.length) {
    setSuggestedIndex(0);
  }
}, [courses]);



const isIOS = () => {
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
};

const isInStandaloneMode = () =>
  "standalone" in window.navigator && (window.navigator as any).standalone;

const installApp = async () => {
  if (!deferredPrompt && !isIOS()) {
    toast("جاري تجهيز خاصية التثبيت، حاول تاني بعد لحظة.");
    return;
  }

  if (isIOS()) {
    if (isInStandaloneMode()) {
      toast("التطبيق مثبت بالفعل على جهازك.");
      return;
    }
    setShowIOSInstallModal(true);
    return;
  }

  toast.custom(<InstallToast type="loading" />, {
    id: "install",
    duration: Infinity,
  });

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    toast.custom(<InstallToast type="success" />, {
      id: "install",
      duration: 4000,
    });
  } else {
    toast.dismiss("install");
  }

  setDeferredPrompt(null);
};

const gradeMap = {
  "الصف الأول الثانوي": {
    title: "الصف الأول الثانوي",
    slug: "sec_1",
    image: "/images/secondary-stage.jpg",
  },

  "الصف الثاني الثانوي": {
    title: "الصف الثاني الثانوي",
    slug: "sec_2",
    image: "/images/secondary-stage.jpg",
  },

  "الصف الثالث الثانوي": {
    title: "الصف الثالث الثانوي",
    slug: "sec_3",
    image: "/images/secondary-stage.jpg",
  },
};

const studentGrade =
  gradeMap[user?.grade as keyof typeof gradeMap];


const gradeSlugMap: Record<string, string> = {
  "الصف الأول الثانوي": "sec_1",
  "الصف الثاني الثانوي": "sec_2",
  "الصف الثالث الثانوي": "sec_3",
  "الصف الأول الإعدادي": "first_prep",
  "الصف الثاني الإعدادي": "second_prep",
  "الصف الثالث الإعدادي": "third_prep",
};

const userGradeSlug = gradeSlugMap[user?.grade ?? ""] ?? "";

const FEATURES = [
  {
    icon: BookOpen,
    title: "شرح مبسط",
    description:
      "شرح بأسلوب سهل ومنظم يساعدك على فهم الكيمياء من أول مرة.",
  },
  {
    icon: GraduationCap,
    title: "مراجعات شاملة",
    description:
      "مراجعات مركزة تغطي جميع أجزاء المنهج مع أهم الأفكار والأسئلة.",
  },
  {
    icon: Star,
    title: "اختبارات تفاعلية",
    description:
      "اختبر مستواك بعد كل درس مع تصحيح فوري وتحليل للنتيجة.",
  },
  {
    icon: TrendingUp,
    title: "متابعة مستمرة",
    description:
      "تابع تقدمك أولًا بأول واعرف نقاط القوة والضعف بسهولة.",
  },
];



const openNotesModal = async () => {
  if (!user) {
    toast("سجل دخولك الأول عشان تقدر تستخدم النوتة");
    return;
  }
setShowNotesModal(true);
  setActiveNotebookTab("notes");
  setNoteLoading(true);
  loadTasks();

  const { data, error } = await supabase
    .from("student_notes")
    .select("content, updated_at")
    .eq("student_id", user.studentId)
    .maybeSingle();

  if (!error && data) {
    setNoteContent(data.content ?? "");
    setNoteSavedAt(data.updated_at ?? null);
  } else {
    setNoteContent("");
    setNoteSavedAt(null);
  }

  setNoteLoading(false);
};

const loadTasks = async () => {
  if (!user) return;
  setTasksLoading(true);

const { data, error } = await supabase
    .from("student_tasks")
    .select("*")
    .eq("student_id", user.studentId)
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (!error) {
    setTasks(data || []);
  }

  setTasksLoading(false);
};

const addTask = async () => {
  if (!user || !newTaskText.trim()) return;
  setAddingTask(true);

const { data, error } = await supabase
    .from("student_tasks")
    .insert({
      student_id: user.studentId,
      content: newTaskText.trim(),
priority: newTaskPriority,
      due_date: newTaskDueDate || null,
      position: tasks.length,
    })

    .select()
    .single();

  if (error) {
    toast.error("حصل خطأ أثناء إضافة المهمة");
  } else {
    setTasks((prev) => [...prev, data]);
    setNewTaskText("");
    setNewTaskPriority("normal");
    setNewTaskDueDate("");
  }

  setAddingTask(false);
};

const toggleTask = async (taskId: number, current: boolean) => {
  setTasks((prev) =>
    prev.map((t) => (t.id === taskId ? { ...t, is_done: !current } : t))
  );

  const { error } = await supabase
    .from("student_tasks")
    .update({ is_done: !current })
    .eq("id", taskId);

  if (error) {
    toast.error("حصل خطأ أثناء تحديث المهمة");
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_done: current } : t))
    );
  }
};

const clearCompletedTasks = async () => {
  const completedIds = tasks.filter((t) => t.is_done).map((t) => t.id);
  if (completedIds.length === 0) return;

  const prevTasks = tasks;
  setTasks((prev) => prev.filter((t) => !t.is_done));

  const { error } = await supabase
    .from("student_tasks")
    .delete()
    .in("id", completedIds);

  if (error) {
    toast.error("حصل خطأ أثناء مسح المهام المكتملة");
    setTasks(prevTasks);
  }
};

const priorityOrder: Record<string, number> = {
  urgent: 0,
  important: 1,
  normal: 2,
};

const sortedTasks = [...tasks]
  .filter((t) =>
    taskSearch.trim() ? t.content.toLowerCase().includes(taskSearch.trim().toLowerCase()) : true
  )
  .sort((a, b) => {
    if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
    const pa = priorityOrder[a.priority ?? "normal"] ?? 2;
    const pb = priorityOrder[b.priority ?? "normal"] ?? 2;
    if (pa !== pb) return pa - pb;
    return 0;
  });

const startEditTask = (task: any) => {
  setEditingTaskId(task.id);
  setEditingTaskText(task.content);
};

const cancelEditTask = () => {
  setEditingTaskId(null);
  setEditingTaskText("");
};

const saveEditTask = async (taskId: number) => {
  if (!editingTaskText.trim()) return;

  const prevTasks = tasks;
  setTasks((prev) =>
    prev.map((t) => (t.id === taskId ? { ...t, content: editingTaskText.trim() } : t))
  );
  setEditingTaskId(null);

  const { error } = await supabase
    .from("student_tasks")
    .update({ content: editingTaskText.trim() })
    .eq("id", taskId);

  if (error) {
    toast.error("حصل خطأ أثناء تعديل المهمة");
    setTasks(prevTasks);
  }
};

const moveTask = async (taskId: number, direction: "up" | "down") => {
  const idx = tasks.findIndex((t) => t.id === taskId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= tasks.length) return;

  const newTasks = [...tasks];
  [newTasks[idx], newTasks[swapIdx]] = [newTasks[swapIdx], newTasks[idx]];
  setTasks(newTasks);

  const updates = [
    { id: newTasks[idx].id, position: idx },
    { id: newTasks[swapIdx].id, position: swapIdx },
  ];

  for (const u of updates) {
    await supabase.from("student_tasks").update({ position: u.position }).eq("id", u.id);
  }
};

const exportTasksAsText = () => {
  const lines = tasks.map((t) => {
    const status = t.is_done ? "[تم]" : "[لسه]";
    const due = t.due_date ? ` - ${t.due_date}` : "";
    return `${status} ${t.content}${due}`;
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "مهامي.txt";
  a.click();
  URL.revokeObjectURL(url);
};

const deleteTask = async (taskId: number) => {
  const prevTasks = tasks;
  setTasks((prev) => prev.filter((t) => t.id !== taskId));

  const { error } = await supabase
    .from("student_tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    toast.error("حصل خطأ أثناء حذف المهمة");
    setTasks(prevTasks);
  }
};

const saveNote = async () => {
  if (!user) return;
  setNoteSaving(true);

  const { data, error } = await supabase
    .from("student_notes")
    .upsert(
      {
        student_id: user.studentId,
        content: noteContent,
      },
      { onConflict: "student_id" }
    )
    .select("updated_at")
    .single();

  if (error) {
    toast.error("حصل خطأ أثناء حفظ النوتة");
  } else {
    setNoteSavedAt(data?.updated_at ?? new Date().toISOString());
    toast.success("تم حفظ النوتة");
  }

  setNoteSaving(false);
};



const [scrollY, setScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  window.addEventListener("scroll", handleScroll);

  return () =>
    window.removeEventListener("scroll", handleScroll);
}, []);

return (
    <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: .5 }}
  className="min-h-screen bg-white dark:bg-[#0b0715]"
  dir="rtl"
>
     <Navbar />

      <section
className="
relative
overflow-hidden
pt-24 sm:pt-28 lg:pt-32
pb-12 sm:pb-16 lg:pb-28
bg-white
dark:bg-[#09090B]
"
>

  {/* Chemistry Icons */}

  <div className="max-w-[1400px] mx-auto px-6 w-full">

   <div
  className="
grid
lg:grid-cols-[1.15fr_1fr]
items-center
gap-6
lg:gap-10
py-6
lg:py-20
"
>

{/* TEXT */}
<motion.div
initial={{
  opacity: 0,
  x: 100,
}}

animate={{
  opacity: 1,
  x: 0,
}}

transition={{
duration:.8,
delay:.25,
ease:[0.22,1,0.36,1]
}}

style={{
  y: scrollY * 0.22,
  opacity: Math.max(1 - scrollY / 650, 0),
}}
  className="
  mt-4
  sm:mt-6
  text-center
  lg:text-right
  max-w-[700px]
  mx-auto
  lg:mx-0
  px-4
  lg:pr-8
  xl:pr-12
  2xl:pr-16
  "
>
  <h1
    className="
    text-[24px]
    xs:text-[28px]
    sm:text-[36px]
    md:text-[44px]
    lg:text-[50px]
    xl:text-[56px]
    font-black
    text-center
lg:text-right
    leading-[1.15]
    tracking-[-1px]
    text-[#5800a9]
    dark:text-white
    "
  >
    مرحبا بكم في منصة

<span
  className="
  block
  mt-2
  sm:mt-2.5
    text-[24px]
    xs:text-[28px]
    sm:text-[36px]
    md:text-[44px]
    lg:text-[50px]
    xl:text-[56px]
  font-black
  text-center
lg:text-right
  leading-[1.1]
  tracking-[-1.5px]
  text-[#b600d7]
  "
>
 الكيميائي مستر زياد ربيع 
</span>

  </h1>

  <p
    className="
    mt-4
    sm:mt-5
    lg:mt-6
    text-[13px]
    xs:text-[14px]
    sm:text-[16px]
    lg:text-[18px]
    text-slate-600
    dark:text-slate-300
    text-center
    lg:text-right
    leading-[1.8]
    max-w-[600px]
    mx-auto
    lg:mx-0
    "
  >
    لا تستعجل النتيجة، فبعض التفاعلات تحتاج وقتًا، لكنها
    <br className="hidden sm:block" />
     في النهاية تعطي أقوى النتائج.
  </p>

  <div
    className="
    mt-6
    sm:mt-7
    lg:mt-8
    flex
    justify-center
    lg:justify-start
    "
  >
   <div className="flex flex-row items-start gap-3">

    <div className="flex flex-col gap-3">
      {!user && (
      <Button
        size="lg"
        onClick={() => navigate("/register")}
        className="
          h-11
          sm:h-12
          lg:h-14
          px-4
          sm:px-7
          lg:px-9
          min-w-[150px]
          sm:min-w-[170px]
          lg:min-w-[200px]
          justify-center
          rounded-xl
          bg-[#5800a9]
          hover:bg-[#420080]
          dark:bg-[#b600d7]
          dark:hover:bg-[#9a00b5]
          border-0
          text-white
          text-[13px]
          sm:text-[16px]
          lg:text-[18px]
          font-black
          !shadow-none
          hover:scale-[1.03]
          transition-all
          duration-300
        "
      >
        سجل الآن
      </Button>
    )}

      {!user && (
      <button
        onClick={() => setShowParentModal(true)}
        className="
          h-11
          sm:h-12
          lg:h-14
          px-4
          sm:px-7
          lg:px-9
          min-w-[150px]
          sm:min-w-[170px]
          lg:min-w-[200px]
          flex
          items-center
          justify-center
          gap-1.5
          rounded-xl
          border-2
          border-[#5800a9]
          dark:border-white
          bg-transparent
          text-[#5800a9]
          dark:text-white
          text-[13px]
          sm:text-[16px]
          lg:text-[18px]
          font-semibold
          whitespace-nowrap
          hover:bg-[#5800a9]
          hover:text-white
          dark:hover:bg-white
          dark:hover:text-[#5800a9]
          transition-all
          duration-300
        "
      >
        <Users size={16} strokeWidth={2} />
        ولي الأمر
      </button>
    )}
    </div>

    {true && (
      <Button
        size="lg"
        onClick={installApp}
        className="
          h-11
          sm:h-12
          lg:h-14
          px-4
          sm:px-7
          lg:px-9
          min-w-[150px]
          sm:min-w-[170px]
          lg:min-w-[200px]
          justify-center
          rounded-xl
          bg-[#F6AC08]
          hover:bg-[#E29E00]
          text-[#ffffff]
          font-black
          hover:scale-[1.03]
          transition-all
          duration-300
        "
      >
        <Download className="w-5 h-5 ml-2" />

        تثبيت التطبيق
      </Button>
    )}
  </div>
</div>
</motion.div>

      {/* IMAGE */}
      <motion.div
initial={{
  opacity: 0,
  x: -120,
  scale: 0.95,
}}

animate={{
  opacity: 1,
  x: 0,
  scale: 1,
}}

transition={{
  duration: 0.9,
  delay: 0.2,
  ease: [0.16, 1, 0.3, 1],
}}
  className="
mt-10
sm:mt-12
lg:mt-0
flex
justify-center
"
>

        <div className="relative group">

          
         <motion.img
  whileHover={{ scale: 1.07 }}
  transition={{
    duration: 0.25,
    ease: [0.22, 1, 0.36, 1],
  }}
  src={TEACHER.image}
  alt={TEACHER.name}
  className="
relative
z-10
w-[320px]
xs:w-[360px]
sm:w-[430px]
md:w-[500px]
lg:w-[560px]
xl:w-[620px]
2xl:w-[680px]
mx-auto
object-contain
saturate-110
group-hover:saturate-150
group-hover:brightness-110
transition-all
duration-700
"
/>

        </div>

      </motion.div>

    </div>

  </div>

</section>

{!user && (
<ScrollReveal>
  <section className="relative py-14 sm:py-20 lg:py-24 bg-white dark:bg-[#09090B]">
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">

      <div className="mb-10 sm:mb-14 lg:mb-16">
        <h2 className="text-[24px] sm:text-[34px] lg:text-[42px] font-black text-slate-900 dark:text-white text-right">
          ليه تختار مستر زياد ربيع؟
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          const isColored = index % 2 === 1;

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`
                rounded-[36px]
                sm:rounded-[40px]
                px-6
                sm:px-7
                pt-8
                sm:pt-9
                pb-8
                sm:pb-9
                flex
                flex-col
                gap-5
                sm:gap-6
                h-full
                ${
                  isColored
                    ? "bg-[#5800a9] dark:bg-[#b600d7]"
                    : "bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#262626]"
                }
              `}
            >
              <div
                className={`
                  w-16 h-16
                  sm:w-[72px] sm:h-[72px]
                  rounded-full
                  flex items-center justify-center
                  ${
                    isColored
                      ? "bg-white/15"
                      : "bg-[#5800a9]/10 dark:bg-[#b600d7]/10"
                  }
                `}
              >
                <Icon
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9
                    ${
                      isColored
                        ? "text-white"
                        : "text-[#5800a9] dark:text-[#b600d7]"
                    }
                  `}
                  strokeWidth={2}
                />
              </div>

              <div>
                <h3
                  className={`
                    text-lg sm:text-xl font-black mb-2
                    ${isColored ? "text-white" : "text-slate-900 dark:text-white"}
                  `}
                >
                  {feature.title}
                </h3>

                <p
                  className={`
                    text-sm sm:text-[15px] leading-7
                    ${isColored ? "text-white/85" : "text-slate-500 dark:text-slate-400"}
                  `}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  </section>
</ScrollReveal>
)}

{/* ================= GRADES SECTION ================= */}
<ScrollReveal>
  <section className="relative py-14 sm:py-20 lg:py-28 bg-white dark:bg-[#09090B]">
    <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8">

{/* Title */}
<div className="text-center mb-10 sm:mb-14 lg:mb-20">
  <img
    src={
      user
        ? "/typography/courses-title.png"
        : "/typography/grades-title.png"
    }
    alt={
      user
        ? "الكورسات المتاحة"
        : "الصفوف الدراسية"
    }
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

      {/* Content */}
      
      {user ? (
        
  <GradeCoursesContent grade={userGradeSlug} />
) : (
        <div className="
          grid grid-cols-1 sm:grid-cols-2
          gap-6 sm:gap-8 lg:gap-12
          mt-4 sm:mt-8
        ">

          {/* الثانوية */}
<motion.div
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1],
  }}
  onClick={() => navigate("/stage/secondary")}
  className="cursor-pointer group"
>
            {/* Image */}
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] shadow-xl">
              <motion.img
                whileHover={{ scale: 1.07 }}
                transition={{
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1],
}}
                src="/images/secondary-stage.jpg"
                alt="المرحلة الثانوية"
                className="
                  w-full
                  h-[180px] sm:h-[240px] lg:h-[300px]
                  object-cover
                  saturate-110
                  group-hover:saturate-150
                  group-hover:brightness-110
                  transition-all duration-700
                "
              />
              {/* Overlay badge */}
              <div className="
                absolute top-3 right-3 sm:top-4 sm:right-4
                bg-white/15
                backdrop-blur-md
                border border-white/25
                text-white
                text-[11px] sm:text-[12px] font-bold
                px-3 py-1 rounded-full
                shadow-sm
              ">
                ثانوي
              </div>
            </div>

            {/* Card info */}
            <div 
className="
bg-white
dark:bg-[#111111]
border
border-gray-200
dark:border-[#262626]
rounded-[16px]
sm:rounded-[24px]
shadow-[0_10px_30px_rgba(0,0,0,.08)]
dark:shadow-[0_15px_40px_rgba(0,0,0,.45)]
w-[80%]
sm:w-[78%]
mx-auto
-mt-7
sm:-mt-10
relative
z-10
py-4
sm:py-5
px-4
sm:px-6
text-center
group-hover:-translate-y-2
group-hover:shadow-[0_18px_45px_rgba(0,0,0,.15)]
dark:group-hover:shadow-[0_18px_45px_rgba(0,0,0,.6)]
transition-all
duration-300
"
>
              <h3 className="
                text-[18px] sm:text-[22px] lg:text-[26px]
                font-black mb-3 sm:mb-4
                text-slate-900 dark:text-white
              ">
                المراحل الثانوية
              </h3>
              <div className="h-[3px] bg-[#b600d7] rounded-full mb-3 sm:mb-4" />
              <p className="text-slate-500 dark:text-slate-300 text-[13px] sm:text-[15px]">
                الصف الأول والثاني والثالث الثانوي
              </p>
            </div>
</motion.div>

          {/* الإعدادي */}
<motion.div
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{
    duration: 0.6,
    delay: 0.15,
    ease: [0.22, 1, 0.36, 1],
  }}
  onClick={() => navigate("/stage/prep")}
  className="cursor-pointer group"
>
            {/* Image */}
            <div className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] shadow-xl">
              <motion.img
                whileHover={{ scale: 1.07 }}
                transition={{
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1],
}}
                src="/images/prep-stage.jpg"
                alt="المرحلة الإعدادية"
                className="
                  w-full
                  h-[180px] sm:h-[240px] lg:h-[300px]
                  object-cover
                  saturate-110
                  group-hover:saturate-150
                  group-hover:brightness-110
                  transition-all duration-700
                "
              />
              {/* Overlay badge */}
              <div className="
                absolute top-3 right-3 sm:top-4 sm:right-4
                bg-white/15
                backdrop-blur-md
                border border-white/25
                text-white
                text-[11px] sm:text-[12px] font-bold
                px-3 py-1 rounded-full
                shadow-sm
              ">
                إعدادي
              </div>
            </div>

            {/* Card info */}
            <div
className="
bg-white
dark:bg-[#111111]
border
border-gray-200
dark:border-[#262626]
rounded-[16px]
sm:rounded-[24px]
shadow-[0_10px_30px_rgba(0,0,0,.08)]
dark:shadow-[0_15px_40px_rgba(0,0,0,.45)]
w-[80%]
sm:w-[78%]
mx-auto
-mt-7
sm:-mt-10
relative
z-10
py-4
sm:py-5
px-4
sm:px-6
text-center
group-hover:-translate-y-2
group-hover:shadow-[0_18px_45px_rgba(0,0,0,.15)]
dark:group-hover:shadow-[0_18px_45px_rgba(0,0,0,.6)]
transition-all
duration-300
"
>
              <h3 className="
                text-[18px] sm:text-[22px] lg:text-[26px]
                font-black mb-3 sm:mb-4
                text-slate-900 dark:text-white
              ">
                المراحل الإعدادية
              </h3>
              <div className="h-[3px] bg-[#b600d7] rounded-full mb-3 sm:mb-4" />
              <p className="text-slate-500 dark:text-slate-300 text-[13px] sm:text-[15px]">
                الصف الأول والثاني والثالث الإعدادي
              </p>
            </div>
</motion.div>

        </div>
      )}
    </div>
  </section>
</ScrollReveal>


{/* ================= SUGGESTED COURSES ================= */}
{courses.length > 0 && (
  <ScrollReveal>
    <section
      className="
        relative
        py-14 sm:py-20 lg:py-24
        bg-white
        dark:bg-[#09090B]
      "
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <div className="text-center mb-8 sm:mb-12">

          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="
                w-11 h-11
                rounded-2xl
                bg-[#F6AC08]/10
                flex items-center justify-center
              "
            >
              <Star
                className="text-[#F6AC08]"
                size={24}
                fill="currentColor"
              />
            </div>
          </div>

<h2
  className="
    text-[26px]
    sm:text-[32px]
    lg:text-[40px]
    font-black
    text-slate-900
    dark:text-white
  "
>
  الكورسات المقترحة
</h2>

          <p
            className="
              mt-3
              text-sm
              sm:text-base
              text-slate-500
              dark:text-slate-400
            "
          >
            كورسات مختارة ومقترحة لك
          </p>

        </div>

        {/* Single rotating suggested course card - positioned on the left */}
        <div dir="ltr" className="flex justify-start">
          <div dir="rtl" className="relative w-full max-w-[420px] sm:max-w-[460px] p-8 sm:p-10 md:p-12">

            {/* Background image behind the slider */}
            <img
              src="/images/suggested-courses-banner.jpg"
              alt=""
              aria-hidden="true"
              className="
                absolute inset-0
                w-full h-full
                object-cover
                rounded-[40px]
                -z-10
              "
            />

            {/* Left Arrow (previous) */}
            <button
              onClick={goToPrevSuggested}
              className="
                absolute -left-5 top-1/2 -translate-y-1/2 z-20
                w-9 h-9 sm:w-10 sm:h-10 rounded-full
                bg-[#5800a9] dark:bg-[#b600d7]
                flex items-center justify-center
                text-white
                shadow-[0_6px_18px_rgba(88,0,169,.35)]
                hover:bg-[#420080] dark:hover:bg-[#9a00b5]
                hover:scale-110
                transition-all duration-300
              "
              aria-label="السابق"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Right Arrow (next) */}
            <button
              onClick={goToNextSuggested}
              className="
                absolute -right-5 top-1/2 -translate-y-1/2 z-20
                w-9 h-9 sm:w-10 sm:h-10 rounded-full
                bg-[#5800a9] dark:bg-[#b600d7]
                flex items-center justify-center
                text-white
                shadow-[0_6px_18px_rgba(88,0,169,.35)]
                hover:bg-[#420080] dark:hover:bg-[#9a00b5]
                hover:scale-110
                transition-all duration-300
              "
              aria-label="التالي"
            >
              <ChevronRight size={18} />
            </button>

            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={suggestedDirection}>
                {courses[suggestedIndex] && (() => {
                  const course = courses[suggestedIndex];
                  const hasAccess =
                    course.is_free ||
                    myCourses.map(String).includes(String(course.id));

                  const description: string = course.description || "";
                  const isLongDescription = description.length > 110;
                  const isExpanded = expandedCourseId === course.id;

                  return (
                    <motion.div
                      key={course.id}
                      custom={suggestedDirection}
                      initial={{ opacity: 0, x: suggestedDirection > 0 ? 60 : -60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: suggestedDirection > 0 ? -60 : 60 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Card
                        hover
                        className="
                          group overflow-hidden p-0 flex flex-col
                          bg-white dark:bg-[#151515]
                          border border-gray-200 dark:border-[#262626]
                          shadow-[0_4px_20px_rgba(0,0,0,.06)]
                          hover:shadow-[0_10px_35px_rgba(0,0,0,.1)]
                          rounded-[26px]
                          cursor-pointer
                          transition-all duration-300
                        "
                      >

                        <div className="p-3 sm:p-3.5 pb-0">
                          <div className="relative aspect-[1000/563] overflow-hidden rounded-2xl">
                            <img
                              src={
                                course.thumbnail ||
                                course.cover_image ||
                                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                              }
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            <div
                              className="
                                absolute top-3 right-3 flex items-center gap-1.5
                                bg-[#F6AC08] text-white text-xs font-bold
                                px-3 py-1.5 rounded-full shadow-lg
                              "
                            >
                              <Star size={13} fill="currentColor" />
                              مقترح
                            </div>

                            {course.grade && (
                              <span
                                className="
                                  absolute top-3 left-3
                                  bg-black/70 backdrop-blur-sm
                                  text-white text-xs font-semibold
                                  px-2.5 py-1 rounded-full
                                "
                              >
                                {course.grade}
                              </span>
                            )}

                            <div className="
                              absolute inset-0 opacity-0 group-hover:opacity-100
                              transition-opacity duration-700
                              bg-gradient-to-r from-transparent via-white/15 to-transparent
                              -translate-x-full group-hover:translate-x-full
                              transition-transform duration-500
                            " />
                          </div>
                        </div>

                        <CardContent className="relative z-20 p-4 sm:p-5 flex flex-col flex-1 gap-3">
                          <h3
                            className="
                              text-[17px] sm:text-[19px] leading-tight font-black
                              text-slate-900 dark:text-white
                              line-clamp-2
                              group-hover:text-[#5800a9] dark:group-hover:text-[#b600d7]
                              transition-colors duration-300
                            "
                          >
                            {course.title}
                          </h3>

                          {description && (
                            <div>
                              <p
                                style={
                                  !isExpanded && isLongDescription
                                    ? {
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                      }
                                    : undefined
                                }
                                className="text-sm leading-6 text-slate-500 dark:text-slate-300 whitespace-pre-line break-words"
                              >
                                {description}
                              </p>

                              {isLongDescription && (
                                <button
                                  onClick={() =>
                                    setExpandedCourseId(isExpanded ? null : course.id)
                                  }
                                  className="
                                    mt-1 inline-flex items-center gap-1
                                    text-[12px] font-bold text-[#5800a9]
                                    dark:text-[#c9a6ff]
                                    hover:text-[#b600d7] dark:hover:text-[#b600d7]
                                    transition-colors
                                  "
                                >
                                  {isExpanded ? "أقل ▲" : "عرض تفاصيل ▼"}
                                </button>
                              )}
                            </div>
                          )}

                          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-[#262626]">
                            <div className="flex flex-col gap-2.5">
                              <Button
                                className="
                                  w-full h-11 rounded-xl font-black text-[14px]
                                  text-white bg-[#b600d7] border-2 border-[#b600d7]
                                  hover:bg-transparent hover:text-[#b600d7]
                                  !shadow-none cursor-pointer
                                  transition-all duration-300
                                "
                                onClick={() => navigate(`/courses/${course.id}`)}
                              >
                                الدخول للكورس
                              </Button>

                              {!hasAccess && (
                                <Button
                                  className="
                                    w-full h-11 rounded-xl font-black text-[14px]
                                    text-white bg-[#5800a9] border-2 border-[#5800a9]
                                    hover:bg-transparent hover:text-[#5800a9]
                                    !shadow-none cursor-pointer
                                    transition-all duration-300
                                  "
                                  onClick={() => handleSuggestedCourseAction(course)}
                                >
                                  الاشتراك في الكورس!
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-200 dark:border-[#262626]">
                            <div className="flex items-end justify-between gap-4">

                              <div
                                className={`
                                  inline-flex items-center gap-1 rounded-xl p-1 shrink-0
                                  ${hasAccess || course.is_free ? "" : "bg-gradient-to-r from-[#5800a9] to-[#b600d7]"}
                                `}
                              >
                                {course.is_free ? (
                                  <span className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full px-3.5 py-2 text-[12px] font-black whitespace-nowrap">
                                    كورس مجاني
                                  </span>
                                ) : hasAccess ? (
                                  <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md px-3.5 py-[6px] text-[12px] font-black whitespace-nowrap">
                                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                    تم الاشتراك
                                  </span>
                                ) : (
                                  <>
                                    <span className="bg-white text-[#111111] rounded-md px-2.5 py-[5px] min-w-[40px] text-center text-[12px] font-black">
                                      {Number(course.price).toFixed(2)}
                                    </span>
                                    <span className="px-1.5 text-[12px] font-black text-white">
                                      جنيه
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
                                <HiArrowPath className="text-[12px]" />
                                {formatSuggestedDate(course.updated_at || course.created_at)}
                              </div>

                            </div>
                          </div>

                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {/* Dots indicator */}
            {courses.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                {courses.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSuggestedDirection(i > suggestedIndex ? 1 : -1);
                      setSuggestedIndex(i);
                    }}
                    className={`
                      h-2.5 rounded-full transition-all duration-300
                      ${i === suggestedIndex ? "w-7 bg-[#5800a9] dark:bg-[#b600d7]" : "w-2.5 bg-[#5800a9]/20 dark:bg-[#b600d7]/20"}
                    `}
                    aria-label={`اذهب للكورس ${i + 1}`}
                  />
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  </ScrollReveal>
)}

{suggestedToast && (
  <div className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[100] w-[92%] sm:w-full max-w-sm bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 text-right flex-1">
        {suggestedToast}
      </p>
      <button
        onClick={() => setSuggestedToast(null)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  </div>
)}

{showSubscriptionModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
    onClick={() => setShowSubscriptionModal(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        w-full max-w-md rounded-[30px]
        bg-white dark:bg-[#111111]
        border border-gray-200 dark:border-[#2A2A2A]
        shadow-[0_25px_70px_rgba(15,23,42,.12)]
        dark:shadow-[0_30px_70px_rgba(0,0,0,.65)]
        p-8
      "
    >
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6EEFF] dark:bg-[#2B103D]">
          <ShieldCheck size={36} className="text-[#5800a9] dark:text-[#c9a6ff]" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          تفعيل الاشتراك
        </h2>

        <p className="mt-3 text-gray-500 dark:text-gray-400 text-[15px] leading-7">
          أدخل كود الاشتراك الخاص بك لتفعيل الكورس.
        </p>

        <div className="mt-5 rounded-2xl border border-[#EAD8FF] dark:border-[#2A2A2A] bg-[#F6EEFF] dark:bg-[#1A1A1A] px-5 py-4">
          <h3 className="text-lg font-black text-[#5800a9] dark:text-[#c9a6ff] text-center">
            {selectedCourse?.title}
          </h3>
        </div>
      </div>

      <input
        type="text"
        value={subscriptionCode}
        onChange={(e) => setSubscriptionCode(e.target.value.toUpperCase())}
        placeholder="XXXX-XXXX"
        className="
          mt-7 w-full rounded-2xl
          border border-gray-200 dark:border-[#2A2A2A]
          bg-gray-50 dark:bg-[#181818]
          px-5 py-4 text-center text-lg tracking-[6px] font-black
          text-[#5800a9] outline-none transition-all duration-300
          focus:border-[#5800a9] focus:ring-4 focus:ring-[#5800a9]/20
        "
      />

      <Button className="w-full mt-5" onClick={activateSuggestedSubscription}>
        تفعيل الاشتراك
      </Button>

      <Button
        variant="outline"
        className="
          w-full mt-3
          bg-green-50 border-green-200 text-green-700
          dark:bg-[#16281F] dark:border-[#245D3A] dark:text-green-400
          hover:bg-green-500 hover:text-white
          flex items-center justify-center gap-2
        "
        onClick={() =>
          window.open(
            `https://wa.me/201109414585?text=${encodeURIComponent(
              `السلام عليكم، عايز الاشتراك في كورس ${selectedCourse?.title}`
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

{/* Student Notebook Button */}
<button
  onClick={openNotesModal}
  className="
    fixed
    bottom-[104px]
    sm:bottom-[112px]
    left-6
    z-[95]
    w-14
    h-14
    sm:w-16
    sm:h-16
    rounded-full
    bg-[#5800a9]
    dark:bg-[#b600d7]
    flex
    items-center
    justify-center
    shadow-[0_12px_30px_rgba(88,0,169,.35)]
    dark:shadow-[0_12px_30px_rgba(182,0,215,.35)]
    hover:scale-110
    hover:shadow-[0_18px_40px_rgba(88,0,169,.45)]
    dark:hover:shadow-[0_18px_40px_rgba(182,0,215,.45)]
    transition-all
    duration-300
  "
  aria-label="نوتة الطالب"
>
  <NotebookPen className="text-white w-6 h-6 sm:w-7 sm:h-7" />
  {tasks.filter((t) => !t.is_done).length > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
      {tasks.filter((t) => !t.is_done).length}
    </span>
  )}
</button>


<div
  className="
    fixed
    bottom-6
    left-6
    z-[95]
    flex
    items-center
    gap-2
  "
>

  {/* Message + Arrow - not clickable, just a visual hint */}
  <div
    className="
      flex items-center gap-1.5
      pointer-events-none
      sm:pointer-events-auto
      hover:opacity-0
      transition-opacity
      duration-300
    "
  >

    {/* Bubble */}
    <div
      className="
        whitespace-nowrap
        rounded-full
        bg-[#3A3A3A]/70
        backdrop-blur-sm
        text-white
        px-4 py-2.5
        sm:px-5
        sm:py-3
        text-[12px]
        sm:text-[14px]
        font-bold
        shadow-xl
      "
    >
      تواصل مع الدعم الفني هنا
    </div>

    {/* Arrow */}
    <svg
      width="26"
      height="26"
      viewBox="0 0 42 42"
      fill="none"
      className="shrink-0 -translate-y-1"
    >
      <path
        d="M5 34C12 18 22 10 35 9"
        stroke="#25D366"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M28 5L35 9L31 16"
        stroke="#25D366"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

  </div>

  {/* WhatsApp - the only clickable part */}
  <a
    href="https://wa.me/201109414585"
    target="_blank"
    rel="noopener noreferrer"
    className="
      group
      w-14
      h-14
      sm:w-16
      sm:h-16
      rounded-full
      bg-[#25D366]
      flex
      items-center
      justify-center
      shadow-[0_12px_30px_rgba(37,211,102,.35)]
      transition-all
      duration-300
      hover:scale-110
      hover:shadow-[0_18px_40px_rgba(37,211,102,.45)]
    "
  >
    <FaWhatsapp className="text-white text-[28px] sm:text-[34px]" />
  </a>

</div>

{showNotesModal && (
  <div
    className="
      fixed inset-0 z-[10000]
      flex items-center justify-center
      bg-black/60 backdrop-blur-sm
      p-4
    "
    onClick={() => setShowNotesModal(false)}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
className="
        w-full
        max-w-[92%]
        sm:max-w-xl
        md:max-w-4xl
        lg:max-w-5xl
        h-[560px]
        sm:h-[600px]
        max-h-[85vh]
        rounded-[24px]
        bg-white
        dark:bg-[#111111]
        border
        border-gray-200
        dark:border-[#262626]
        shadow-[0_25px_70px_rgba(15,23,42,.25)]
        flex
        flex-col
        md:flex-row
        overflow-hidden
      "
    >
      {/* Side Image - fixed, always visible */}
     <div
        className="
          hidden
          md:block
          w-[320px]
          lg:w-[380px]
          flex-shrink-0
          relative
          overflow-hidden
        "
      >
        <img
     src="/images/notebook-teacher.png"
     alt="مستر زياد ربيع"
          className="
            absolute inset-0
            w-full h-full
            object-cover
            object-top
          "
        />
      </div>

      {/* Right Panel: header + tabs + body + footer */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

      {/* Header */}
<div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-[#262626] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#B348FE]/10 flex items-center justify-center">
            <NotebookPen className="text-[#B348FE] w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-[16px] sm:text-[18px] text-slate-900 dark:text-white">
              نوتة
            </h3>
            {noteSavedAt && (
              <p className="text-[11px] text-gray-400">
                آخر حفظ:{" "}
                {new Date(noteSavedAt).toLocaleString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowNotesModal(false)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[#232323] hover:text-red-500 transition-all"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-5 sm:px-6 pt-3">
        <button
          onClick={() => setActiveNotebookTab("notes")}
          className={`
            flex-1 flex items-center justify-center gap-1.5
            py-2.5 rounded-xl text-[13px] sm:text-sm font-bold
            transition-all duration-200
            ${activeNotebookTab === "notes"
              ? "bg-[#B348FE] text-white"
              : "bg-gray-100 dark:bg-[#1c1c1c] text-gray-500 dark:text-gray-400"
            }
          `}
        >
          <StickyNote className="w-4 h-4" />
          نوتتي
        </button>
        <button
          onClick={() => setActiveNotebookTab("tasks")}
          className={`
            flex-1 flex items-center justify-center gap-1.5
            py-2.5 rounded-xl text-[13px] sm:text-sm font-bold
            transition-all duration-200
            ${activeNotebookTab === "tasks"
              ? "bg-[#B348FE] text-white"
              : "bg-gray-100 dark:bg-[#1c1c1c] text-gray-500 dark:text-gray-400"
            }
          `}
        >
          <ListChecks className="w-4 h-4" />
          مهامي
          {tasks.filter((t) => !t.is_done).length > 0 && (
            <span className="bg-white/25 text-[10px] px-1.5 py-0.5 rounded-full">
              {tasks.filter((t) => !t.is_done).length}
            </span>
          )}
        </button>
      </div>

     {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
        {activeNotebookTab === "notes" ? (
  noteLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#B348FE] animate-spin" />
          </div>
        ) : (
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="اكتب ملاحظاتك هنا... (مراجعة، تذكيرات، أفكار)"
            className="
              w-full
              min-h-[220px]
              sm:min-h-[280px]
              resize-none
              rounded-2xl
              border
              border-gray-200
              dark:border-[#262626]
              bg-gray-50
              dark:bg-[#0b0b0b]
              text-slate-800
              dark:text-white
              placeholder-gray-400
              p-4
              text-sm
              sm:text-[15px]
              leading-7
              outline-none
              focus:border-[#B348FE]
              transition-colors
            "
/>
  )
) : (
  
          <div className="flex flex-col gap-3">
            {/* Add task input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTask();
                  }
                }}
                placeholder="مثال: مراجعة الفصل الثالث بكرا"
                className="
                  flex-1 min-w-0
                  rounded-xl
                  border border-gray-200 dark:border-[#262626]
                  bg-gray-50 dark:bg-[#0b0b0b]
                  text-slate-800 dark:text-white
                  placeholder-gray-400
                  px-3.5 py-2.5
                  text-sm
                  outline-none
                  focus:border-[#B348FE]
                  transition-colors
                "
              />
              <button
                onClick={addTask}
                disabled={addingTask || !newTaskText.trim()}
                className="
                  w-10 h-10 flex-shrink-0 rounded-xl
                  bg-[#B348FE] hover:bg-[#9E2FFF]
                  text-white flex items-center justify-center
                  disabled:opacity-50
                  transition-all
                "
              >
                {addingTask ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="
                  rounded-xl
                  border border-gray-200 dark:border-[#262626]
                  bg-gray-50 dark:bg-[#0b0b0b]
                  text-slate-700 dark:text-gray-200
                  px-3 py-2
                  text-xs
                  outline-none
                  focus:border-[#B348FE]
                "
              >
                <option value="normal">عادي</option>
                <option value="important">مهم</option>
                <option value="urgent">عاجل</option>
              </select>

              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="
                  flex-1
                  rounded-xl
                  border border-gray-200 dark:border-[#262626]
                  bg-gray-50 dark:bg-[#0b0b0b]
                  text-slate-700 dark:text-gray-200
                  px-3 py-2
                  text-xs
                  outline-none
                  focus:border-[#B348FE]
                "
              />
            </div>

            {/* Tasks list */}
            {tasksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#B348FE] animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10">
                <ListChecks className="w-9 h-9 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  مفيش مهام لسه، ضيف أول مهمة ليك
                </p>
              </div>
            ) : (
             <>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  placeholder="ابحث في مهامك..."
                  className="
                    flex-1 min-w-0
                    rounded-xl
                    border border-gray-200 dark:border-[#262626]
                    bg-gray-50 dark:bg-[#0b0b0b]
                    text-slate-700 dark:text-gray-200
                    placeholder-gray-400
                    px-3 py-2
                    text-xs
                    outline-none
                    focus:border-[#B348FE]
                  "
                />
                <button
                  onClick={exportTasksAsText}
                  className="text-[11px] font-bold text-gray-400 hover:text-[#B348FE] transition-colors whitespace-nowrap"
                >
                  تصدير
                </button>
              </div>

              {tasks.some((t) => t.is_done) && (
                <div className="flex justify-end">
                  <button
                    onClick={clearCompletedTasks}
                    className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    مسح المكتمل
                  </button>
                </div>
              )}
              <div className="flex flex-col gap-2 max-h-[260px] sm:max-h-[320px] overflow-y-auto pr-0.5">
                {sortedTasks.map((task) => {
                  const isOverdue =
                    task.due_date &&
                    !task.is_done &&
                    new Date(task.due_date) < new Date(new Date().toDateString());

                 return (
                  <div
                    key={task.id}
                    className={`
                      flex items-center gap-2
                      rounded-xl border
                      bg-gray-50 dark:bg-[#0b0b0b]
                      px-3.5 py-2.5
                      ${isOverdue
                        ? "border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/20"
                        : "border-gray-200 dark:border-[#262626]"
                      }
                    `}
                  >
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => moveTask(task.id, "up")}
                        className="text-gray-300 hover:text-[#B348FE] transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button
                        onClick={() => moveTask(task.id, "down")}
                        className="text-gray-300 hover:text-[#B348FE] transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleTask(task.id, task.is_done)}
                      className={`
                        w-5 h-5 flex-shrink-0 rounded-md border-2
                        flex items-center justify-center
                        transition-all duration-200
                        ${task.is_done
                          ? "bg-[#B348FE] border-[#B348FE]"
                          : "border-gray-300 dark:border-gray-600"
                        }
                      `}
                    >
                      {task.is_done && (
                        <svg width="11" height="9" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingTaskId === task.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingTaskText}
                            onChange={(e) => setEditingTaskText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditTask(task.id);
                              if (e.key === "Escape") cancelEditTask();
                            }}
                            autoFocus
                            className="
                              flex-1 min-w-0 text-sm
                              rounded-lg border border-[#B348FE]
                              bg-white dark:bg-[#111111]
                              text-slate-800 dark:text-white
                              px-2 py-1
                              outline-none
                            "
                          />
                          <button onClick={() => saveEditTask(task.id)} className="text-[#B348FE]">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEditTask} className="text-gray-400">
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => startEditTask(task)}
                          className={`
                            text-sm leading-6 cursor-text
                            ${task.is_done
                              ? "line-through text-gray-400"
                              : "text-slate-700 dark:text-gray-200"
                            }
                          `}
                        >
                          {task.content}
                        </span>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        {task.priority === "urgent" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                            عاجل
                          </span>
                        )}
                        {task.priority === "important" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F6AC08] text-white">
                            مهم
                          </span>
                        )}
                        {task.due_date && (
                          <span className={`text-[10px] ${isOverdue ? "text-red-500 font-bold" : "text-gray-400"}`}>
                            {isOverdue && "متأخرة • "}
                            {new Date(task.due_date).toLocaleDateString("ar-EG", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  );
                })}
              </div>
              </>
            )}

          </div>
        )}
      </div>

{/* Footer */}
      {activeNotebookTab === "notes" && (
      <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-[#262626] flex-shrink-0">
        <button

          onClick={saveNote}
          disabled={noteSaving || noteLoading}
          className="
            w-full
            py-3
            rounded-xl
            bg-[#B348FE]
            hover:bg-[#9E2FFF]
            text-white
            font-bold
            text-sm
            sm:text-base
            flex items-center justify-center gap-2
            disabled:opacity-70
            transition-all
            duration-300
          "
        >
          {noteSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              حفظ النوتة
            </>
          )}
        </button>
      </div>
)}
       </div>
    </motion.div>
  </div>
)}
<Footer />

<ParentAccessModal open={showParentModal} onClose={() => setShowParentModal(false)} />

{showIOSInstallModal && (
  <div
    className="
      fixed inset-0 z-[10000]
      flex items-center justify-center
      bg-black/60 backdrop-blur-sm
      p-4
    "
    onClick={() => setShowIOSInstallModal(false)}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
      className="
        w-full
        max-w-[92%]
        sm:max-w-md
        rounded-[24px]
        bg-white
        dark:bg-[#111111]
        border
        border-gray-200
        dark:border-[#262626]
        shadow-[0_25px_70px_rgba(15,23,42,.25)]
        p-6
      "
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-[18px] text-slate-900 dark:text-white">
          تثبيت التطبيق على آيفون
        </h3>
        <button
          onClick={() => setShowIOSInstallModal(false)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[#232323] hover:text-red-500 transition-all"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-4">

        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#B348FE] text-white text-sm font-bold flex items-center justify-center">
            1
          </span>
          <p className="text-sm sm:text-[15px] leading-7 text-slate-600 dark:text-slate-300">
            افتح المنصة من متصفح <span className="font-bold text-slate-900 dark:text-white">Safari</span> (لازم يكون Safari مش أي متصفح تاني).
          </p>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#B348FE] text-white text-sm font-bold flex items-center justify-center">
            2
          </span>
          <p className="text-sm sm:text-[15px] leading-7 text-slate-600 dark:text-slate-300">
            دوس على زرار <span className="font-bold text-slate-900 dark:text-white">المشاركة</span> (المربع وعليه سهم لفوق) في شريط الأدوات.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#B348FE] text-white text-sm font-bold flex items-center justify-center">
            3
          </span>
          <p className="text-sm sm:text-[15px] leading-7 text-slate-600 dark:text-slate-300">
            انزل في القائمة ودوس على <span className="font-bold text-slate-900 dark:text-white">"إضافة إلى الشاشة الرئيسية"</span> (Add to Home Screen).
          </p>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#B348FE] text-white text-sm font-bold flex items-center justify-center">
            4
          </span>
          <p className="text-sm sm:text-[15px] leading-7 text-slate-600 dark:text-slate-300">
            دوس <span className="font-bold text-slate-900 dark:text-white">"إضافة"</span> وهتلاقي أيقونة المنصة على شاشتك الرئيسية زي أي تطبيق عادي.
          </p>
        </div>

      </div>

      <button
        onClick={() => setShowIOSInstallModal(false)}
        className="
          w-full
          mt-6
          py-3
          rounded-xl
          bg-[#B348FE]
          hover:bg-[#9E2FFF]
          text-white
          font-bold
          text-sm
          sm:text-base
          transition-all
          duration-300
        "
      >
        تمام، فهمت
      </button>

    </motion.div>
  </div>
)}
</motion.div>
);
}
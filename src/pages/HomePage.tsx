
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { ScrollReveal } from "../components/layout/ScrollReveal";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import StudentGradeCard from "../components/home/StudentGradeCard";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Download } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import GradeCoursesContent from "../components/student/courses/GradeCoursesContent";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Play,
  Star,
  Users,
  BookOpen,
  TrendingUp,
  ChevronDown,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { Bell, X, Clock3 } from "lucide-react";
import {
  TEACHER,
  STATS,
  COURSES,
  TESTIMONIALS,
  FAQS,
  ANNOUNCEMENTS,
  GRADES,
} from "../data/mockData";

import InstallToast from "../components/ui/InstallToast";
import { NotebookPen, X as CloseIcon, Loader2, Save, Plus, Trash2, ListChecks, StickyNote } from "lucide-react";

const gradeColors: Record<string, string> = {
  sec_3: "rose",
  sec_2: "violet",
  sec_1: "blue",
  primary: "emerald",
};

export function HomePage() {
    console.log("HOME PAGE RENDERED");
  const navigate = useNavigate();
  
const { user } = useApp();
  const [selectedStage, setSelectedStage] =
    useState<"secondary" | "prep">("secondary");

    const [courses, setCourses] = useState<any[]>([]);
    const [announcement, setAnnouncement] = useState<any>(null);
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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
  console.log("Deferred Prompt =", deferredPrompt);
}, [deferredPrompt]);

useEffect(() => {
  loadCourses();
  loadAnnouncement();
  if (user) loadTasks();
}, [user]);

useEffect(() => {
const handler = (e: any) => {
  console.log("beforeinstallprompt Fired");

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
.eq("is_hidden", false);

  if (!error) {
    setCourses(data || []);
  }
};



const installApp = async () => {
  if (!deferredPrompt) {
    toast("التطبيق مثبت بالفعل أو غير متاح للتثبيت.");
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

console.log("USER =", user);
console.log("GRADE =", user?.grade);

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

const loadAnnouncement = async () => {
  if (!user) return;

const { data } = await supabase
.from("student_notifications")
.select(`
id,
student_id,
is_read,
notifications (
id,
title,
content,
type,
icon,
color,
is_pinned,
created_at
)
`)
.eq("student_id", user.studentId)
.eq("is_read", false)
.order("created_at", {
  ascending: false,
  foreignTable: "notifications",
})
.limit(1);

  if (data) {
    setAnnouncement(data?.[0] ?? null);
  }
  console.log("Announcement =", data);
};

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

const dismissAnnouncement = async () => {
  if (!announcement) return;

  const { error } = await supabase
    .from("student_notifications")
.update({
is_read: true,
read_at: new Date().toISOString(),
})
    .eq("id", announcement.id);

  if (error) {
    console.error(error);
    return;
  }

  setAnnouncement(null);
};


const formatAnnouncementDate = (date: string) => {
  const created = new Date(date);
  const now = new Date();

  const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diff < 60) return "الآن";

  if (diff < 3600)
    return `منذ ${Math.floor(diff / 60)} دقيقة`;

  if (diff < 86400)
    return `منذ ${Math.floor(diff / 3600)} ساعة`;

  return created.toLocaleDateString("ar-EG", {
    month: "short",
    day: "numeric",
  });
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

{user && announcement?.notifications && (
  <div
    className="
      fixed
      top-[78px]
      left-0
      right-0
      z-[9999]
      px-4
      animate-in
      slide-in-from-top-3
      duration-500
    "
  >
    <div
      className="
        max-w-[1350px]
        mx-auto
        overflow-hidden
        rounded-2xl
        border
        border-[#E8D6FF]
        bg-white/90
        dark:bg-[#141414]/95
        backdrop-blur-xl
        shadow-[0_15px_45px_rgba(179,72,254,.15)]
      "
    >



      <div className="flex items-center justify-between px-5 py-4">

        <div className="flex items-center gap-4">

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-[#B348FE]
              flex
              items-center
              justify-center
              text-white
              shadow-md
            "
          >
            <Bell size={20} />
          </div>

          <div>

            <div className="flex items-center gap-2 flex-wrap">

              <span className="font-extrabold text-[14px] text-[#2B1042] dark:text-white">
                رسالة من مستر زياد ربيع
              </span>

              {announcement.notifications?.type === "important" && (
                <span className="px-2 py-1 rounded-full bg-[#B348FE] text-white text-[10px] font-bold">
                  مهم
                </span>
              )}

              {announcement.notifications?.type === "urgent" && (
                <span className="px-2 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  عاجل
                </span>
              )}

            </div>

            <p className="mt-2 text-[14px] text-gray-700 dark:text-gray-300 leading-7 whitespace-pre-line">
              {announcement.notifications?.content}
            </p>

            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">

              <Clock3 size={14} />

              <span>
                {formatAnnouncementDate(announcement.notifications?.created_at)}
              </span>

            </div>

          </div>

        </div>

        <button
          onClick={dismissAnnouncement}
          className="
            w-10
            h-10
            rounded-full
            flex
            items-center
            justify-center
            text-gray-500
            hover:bg-[#F3F3F3]
            dark:hover:bg-[#232323]
            hover:text-red-500
            transition-all
          "
        >
          <X size={18} />
        </button>

      </div>

    </div>
  </div>
)}

      

      <section
className="
relative
overflow-hidden
py-28
bg-white
dark:bg-[#09090B]
"
>

  {/* Chemistry Icons */}

  <div className="max-w-[1400px] mx-auto px-6 w-full">

   <div
  className="
grid
lg:grid-cols-2
items-center
gap-24
py-12
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
  px-2
  sm:px-0
  "
>
  <h1
    className="
    text-[26px]
    xs:text-[28px]
    sm:text-[36px]
    md:text-[44px]
    lg:text-[52px]
    font-bold
    text-center
lg:text-center
    leading-[1.25]
    tracking-[-0.5px]
    text-slate-900
    dark:text-white
    "
  >
    مرحبا بكم في منصة

<span
  className="
  block
  mt-1.5
  sm:mt-2
    text-[26px]
    xs:text-[28px]
    sm:text-[36px]
    md:text-[44px]
    lg:text-[52px]
  font-semibold
  text-center
lg:text-center
  leading-tight
  tracking-[-1px]
  text-[#F6AC08]
  "
>
  مستر زياد ربيع
</span>

  </h1>

  <p
    className="
    mt-4
    sm:mt-6
    lg:mt-8
    max-w-[320px]
    xs:max-w-[380px]
    sm:max-w-[500px]
    lg:max-w-[620px]
    mx-auto
    lg:mx-0
    
    text-[15px]
    sm:text-[17px]
    lg:text-[20px]
    xl:text-[22px]
    leading-[1.7]
    sm:leading-[1.8]
    font-normal
    text-slate-600
    dark:text-slate-300
    "
  >
   لا تستعجل النتيجة، فبعض التفاعلات تحتاج وقتًا،
لكنها في النهاية تعطي أقوى النتائج
  </p>

  <div
    className="
    mt-6
    sm:mt-8
    lg:mt-10
    flex
    justify-center
    lg:justify-start
    "
  >
   <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">

 {!user && (
  <Button
    size="lg"
    onClick={() => navigate("/register")}
    className="
      h-11
      sm:h-12
      lg:h-14
      px-6
      sm:px-7
      lg:px-9
      rounded-xl
      bg-[#422E91]
bg-[#B348FE]
hover:bg-[#9A2EFF]
      border-0
      text-white
      text-[14px]
      sm:text-[16px]
      lg:text-[18px]
      font-semibold
      hover:scale-[1.03]
      transition-all
      duration-300
    "
  >
    سجل الآن مجانًا
  </Button>
)}

  {true && (
    <Button
      size="lg"
      onClick={installApp}
      className="
        h-11
        sm:h-12
        lg:h-14
        px-6
        sm:px-7
        lg:px-9
        rounded-xl
        bg-[#F6AC08]
        hover:bg-[#E29E00]
        text-[#ffffff]
        font-bold
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
style={{
  y: scrollY * -0.06,
  scale: Math.max(1 - scrollY / 3500, 0.94),
}}
  className="
mt-10
sm:mt-12
lg:mt-0
flex
justify-center
"
>

        <div className="relative">

          
         <img
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
"
/>

<motion.div
  animate={{ y: [0, -8, 0] }}
  transition={{ repeat: Infinity, duration: 9 }}
  className="absolute bottom-8 sm:bottom-12 lg:bottom-16 -right-4 sm:-right-6 lg:-right-8 bg-white dark:bg-white rounded-3xl p-3 sm:p-4 lg:p-5 shadow-2xl"
>
  
</motion.div>
        </div>

      </motion.div>

    </div>

  </div>

</section>


{!user && (
  <>
    {/* FEATURES */}
    <ScrollReveal>
      <section
        className="
          relative
          py-12
          sm:py-16
          lg:py-24
          bg-white
          dark:bg-[#09090B]
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <img
              src="/typography/features-title.png"
              alt="ليه تختار مستر زياد ربيع؟"
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

        <div
  className="
  grid
  grid-cols-1
  sm:grid-cols-2
  xl:grid-cols-4
  gap-6
  mt-10
"
>
  {FEATURES.map((feature, index) => {
    const Icon = feature.icon;


    
    return (
      <motion.div
        key={feature.title}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: .5,
          delay: index * .12,
        }}
        whileHover={{
          y: -8,
        }}
className="
group
relative
overflow-hidden
rounded-3xl
border
border-gray-200
dark:border-[#262626]
bg-white
dark:bg-[#111111]
p-7
shadow-[0_8px_30px_rgba(0,0,0,.08)]
dark:shadow-[0_10px_35px_rgba(0,0,0,.35)]
hover:-translate-y-2
hover:shadow-[0_18px_45px_rgba(0,0,0,.12)]
dark:hover:shadow-[0_18px_45px_rgba(0,0,0,.55)]
transition-all
duration-300
        "
      >

        <div
          className="
          absolute
          top-0
          left-0
          w-full
          h-1
          bg-[#422E91]
          scale-x-0
          group-hover:scale-x-100
          transition-transform
          duration-300
          origin-left
          "
        />

        <div
          className="
w-16
h-16
rounded-2xl
bg-[#B348FE]/10
dark:bg-[#B348FE]/15
flex
items-center
justify-center
mb-6
group-hover:scale-110
transition-all
duration-300
"
        >
         <Icon
  className="text-[#B348FE]"
  size={30}
/>
        </div>

        <h3
          className="
          text-xl
          font-bold
          text-slate-900
          dark:text-white
          mb-3
          "
        >
          {feature.title}
        </h3>

        <p
          className="
          text-[15px]
          leading-8
          text-slate-500
          dark:text-slate-300
          "
        >
          {feature.description}
        </p>

      </motion.div>
    );
  })}
</div>

        </div>
      </section>
    </ScrollReveal>
  </>
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
                bg-[#422E91] dark:bg-[#F6AC08]
                text-white dark:text-slate-900
                text-[11px] sm:text-[12px] font-bold
                px-3 py-1 rounded-full
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
              <div className="h-[3px] bg-[#422E91] dark:bg-[#F6AC08] rounded-full mb-3 sm:mb-4" />
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
                bg-[#422E91] dark:bg-[#F6AC08]
                text-white dark:text-slate-900
                text-[11px] sm:text-[12px] font-bold
                px-3 py-1 rounded-full
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
              <div className="h-[3px] bg-[#422E91] dark:bg-[#F6AC08] rounded-full mb-3 sm:mb-4" />
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

{/* Student Notebook Button */}
<button
  onClick={openNotesModal}
  className="
    fixed
    bottom-[104px]
    sm:bottom-[112px]
    left-6
    z-50
    w-14
    h-14
    sm:w-16
    sm:h-16
    rounded-full
    bg-[#B348FE]
    flex
    items-center
    justify-center
    shadow-[0_12px_30px_rgba(179,72,254,.35)]
    hover:scale-110
    hover:shadow-[0_18px_40px_rgba(179,72,254,.45)]
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

<a
  href="https://wa.me/201109414585"
  target="_blank"
  rel="noopener noreferrer"
  className="
    fixed
    bottom-6
    left-6
    z-50
    group
    flex
    items-center
    gap-3
  "
>

  {/* Message */}
  <div
    className="
      flex
      items-center
      gap-2

      opacity-0
      -translate-x-4

      group-hover:opacity-100
      group-hover:translate-x-0

      transition-all
      duration-300
      pointer-events-none
    "
  >

    {/* Bubble */}
    <div
      className="
        whitespace-nowrap

        rounded-xl

        bg-[#3A3A3A]

        text-white

       px-6 py-3

        text-[17px]
        font-bold

        shadow-xl
      "
    >
      تواصل معنا عبر واتساب
    </div>

   <svg
  width="42"
  height="42"
  viewBox="0 0 42 42"
  fill="none"
  className="shrink-0"
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

  {/* WhatsApp */}
  <div
    className="
      w-16
      h-16
      rounded-full

      bg-[#25D366]

      flex
      items-center
      justify-center

      shadow-[0_12px_30px_rgba(37,211,102,.35)]

      transition-all
      duration-300

      group-hover:scale-110
      group-hover:shadow-[0_18px_40px_rgba(37,211,102,.45)]
    "
  >
    <FaWhatsapp className="text-white text-[34px]" />
  </div>

</a>

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
        sm:max-w-md
        md:max-w-lg
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
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-[#262626]">
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
      <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-[#262626]">
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
    </motion.div>
  </div>
)}
<Footer />
</motion.div>
);
}
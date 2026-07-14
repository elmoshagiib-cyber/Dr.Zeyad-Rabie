import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InstructorLayout from "../../layouts/InstructorLayout";
import { supabase } from "../../lib/supabase";

// ─────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────

type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "essay";
type SubmissionType = "text" | "pdf" | "image" | "multiple_files";
type TabId = "content" | "exams" | "homework" | "settings";
type UploadStatus = "idle" | "uploading" | "done" | "error";

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  title: string;
  type: QuestionType;
  choices: Choice[];
  correctAnswer: string;
  points: number;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  totalScore: number;
  durationMinutes: number;
  openDate: string;
  closeDate: string;
  isVisible: boolean;
  isPublished: boolean;
  questions: Question[];
  isExpanded: boolean;
}

interface VideoFile {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  durationSeconds: number;
  freePreview: boolean;
  allowDownload: boolean;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  videoUrl: string;
  thumbnailUrl: string;
  file: File | null;
  isExpanded: boolean;
}

interface PdfFile {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  pdfUrl: string;
  file: File | null;
  isExpanded: boolean;
}

interface Section {
  id: string;
  name: string;
  isCollapsed: boolean;
  isRenaming: boolean;
  renameValue: string;
  videos: VideoFile[];
  pdfs: PdfFile[];
}

interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalScore: number;
  allowLateSubmission: boolean;
  allowedTypes: SubmissionType[];
  instructionText: string;
  attachmentPdfUrl: string;
  attachmentPdfName: string;
  attachmentImageUrl: string;
  attachmentImageName: string;
  pdfFile: File | null;
  imageFile: File | null;
  isExpanded: boolean;
  isPublished: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  thumbnailUrl: string;
  grade: string;
  isPublished: boolean;
  isHidden: boolean;
  thumbnailFile: File | null;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function makeEmptyVideo(): VideoFile {
  return {
    id: generateId(),
    title: "",
    description: "",
    fileName: "",
    fileSize: 0,
    durationSeconds: 0,
    freePreview: false,
    allowDownload: false,
    uploadStatus: "idle",
    uploadProgress: 0,
    videoUrl: "",
    thumbnailUrl: "",
    file: null,
    isExpanded: true,
  };
}

function makeEmptyPdf(): PdfFile {
  return {
    id: generateId(),
    title: "",
    fileName: "",
    fileSize: 0,
    uploadStatus: "idle",
    uploadProgress: 0,
    pdfUrl: "",
    file: null,
    isExpanded: true,
  };
}

function makeEmptySection(): Section {
  return {
    id: generateId(),
    name: "قسم جديد",
    isCollapsed: false,
    isRenaming: false,
    renameValue: "",
    videos: [],
    pdfs: [],
  };
}

function makeEmptyChoice(): Choice {
  return { id: generateId(), text: "" };
}

function makeEmptyQuestion(): Question {
  return {
    id: generateId(),
    title: "",
    type: "multiple_choice",
    choices: [makeEmptyChoice(), makeEmptyChoice(), makeEmptyChoice(), makeEmptyChoice()],
    correctAnswer: "",
    points: 1,
  };
}

function makeEmptyExam(): Exam {
  return {
    id: generateId(),
    title: "",
    description: "",
    passingScore: 60,
    totalScore: 100,
    durationMinutes: 60,
    openDate: "",
    closeDate: "",
    isVisible: true,
    isPublished: false,
    questions: [],
    isExpanded: true,
  };
}

function makeEmptyHomework(): Homework {
  return {
    id: generateId(),
    title: "",
    description: "",
    dueDate: "",
    totalScore: 100,
    allowLateSubmission: false,
    allowedTypes: ["text"],
    instructionText: "",
    attachmentPdfUrl: "",
    attachmentPdfName: "",
    attachmentImageUrl: "",
    attachmentImageName: "",
    pdfFile: null,
    imageFile: null,
    isExpanded: true,
    isPublished: false,
  };
}

// ─────────────────────────────────────────────
// SMALL UI ATOMS
// ─────────────────────────────────────────────

function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";
  return (
    <svg className={`${sz} animate-spin text-violet-600`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function Badge({ label, color }: { label: string; color: "green" | "yellow" | "red" | "blue" | "slate" }) {
  const map: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    yellow: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${map[color]}`}>
      {label}
    </span>
  );
}

function IconButton({
  onClick,
  title,
  disabled = false,
  variant = "ghost",
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  variant?: "ghost" | "danger" | "primary";
  children: React.ReactNode;
}) {
  const base = "inline-flex items-center justify-center rounded-lg p-1.5 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    ghost: "text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:ring-slate-300",
    danger: "text-slate-400 hover:text-red-600 hover:bg-red-50 focus:ring-red-300",
    primary: "text-slate-400 hover:text-violet-600 hover:bg-violet-50 focus:ring-violet-300",
  };
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`h-6 w-11 rounded-full transition-colors duration-200 ${checked ? "bg-violet-600" : "bg-slate-200"}`} />
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-0 right-0.5" : "right-5"}`} />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function UploadProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Global State ──────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("content");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Course ────────────────────────────────
  const [course, setCourse] = useState<Course>({
    id: "",
    title: "",
    description: "",
    price: 0,
    isFree: false,
    thumbnailUrl: "",
    grade: "",
    isPublished: false,
    isHidden: false,
    thumbnailFile: null,
  });

  // ── Content ───────────────────────────────
  const [sections, setSections] = useState<Section[]>([]);

  // ── Exams ─────────────────────────────────
  const [exams, setExams] = useState<Exam[]>([]);

  // ── Homework ──────────────────────────────
  const [homeworks, setHomeworks] = useState<Homework[]>([]);

  // ── Delete Modal ──────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // ─────────────────────────────────────────
  // DATA LOADING
  // ─────────────────────────────────────────

async function loadCourse() {
  if (!id) return;

  setLoading(true);

  try {
    // الكورس
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (courseError) throw courseError;

    setCourse({
      id: courseData.id,
      title: courseData.title,
      description: courseData.description,
      price: courseData.price,
      isFree: courseData.is_free,
      thumbnailUrl: courseData.thumbnail,
      grade: courseData.grade,
      isPublished: courseData.is_published,
      isHidden: courseData.is_hidden,
      thumbnailFile: null,
    });

    // الأقسام
    const { data: sectionsData, error: sectionsError } =
  await supabase
    .from("course_sections")
    .select(`
      *,
      course_items(*)
    `)
    .eq("course_id", id)
    .order("sort_order");

    if (sectionsError) throw sectionsError;

setSections(
  (sectionsData || []).map((section: any) => {
    const items = (section.course_items || []).sort(
      (a: any, b: any) => a.sort_order - b.sort_order
    );

    return {
      id: section.id,
      name: section.title,
      isCollapsed: false,
      isRenaming: false,
      renameValue: section.title,

      videos: items
        .filter((item: any) => item.type === "video")
        .map((item: any) => ({
          ...makeEmptyVideo(),
          id: item.id,
          title: item.title,
          description: item.description,
          videoUrl: item.url,
          durationSeconds: item.duration || 0,
          fileSize: item.file_size || 0,
          allowDownload: item.allow_download,
          freePreview: item.is_preview,
          uploadStatus: item.url ? "done" : "idle",
        })),

      pdfs: items
        .filter((item: any) => item.type === "pdf")
        .map((item: any) => ({
          ...makeEmptyPdf(),
          id: item.id,
          title: item.title,
          description: item.description,
          pdfUrl: item.url,
          fileSize: item.file_size || 0,
          uploadStatus: item.url ? "done" : "idle",
        })),
    };
  })
);

console.log("COURSE:", courseData);
console.log("SECTIONS:", sectionsData);

  } catch (err) {
    console.error(err);
  }
await loadExams();
  setLoading(false);
}

async function removeExam(examId: string) {
  if (!confirm("هل تريد حذف الاختبار؟")) return;

  const { error } = await supabase
    .from("exams")
    .delete()
    .eq("id", Number(examId));

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  setExams((prev) => prev.filter((e) => e.id !== examId));
}

function updateExam(examId: string, updates: Partial<Exam>) {
  setExams((prev) =>
    prev.map((e) =>
      e.id === examId
        ? { ...e, ...updates }
        : e
    )
  );
}

async function saveExam(
  examId: string,
  updates: Partial<Exam>
) {
  const { error } = await supabase
    .from("exams")
    .update({
      title: updates.title,
      description: updates.description,
      duration: updates.durationMinutes,
      passing_grade: updates.passingScore,
      total_score: updates.totalScore,
      open_date: updates.openDate || null,
      close_date: updates.closeDate || null,
      is_visible: updates.isVisible,
      is_published: updates.isPublished,
    })
    .eq("id", Number(examId));

  if (error) {
    console.error(error);
    alert(error.message);
  }
}

async function saveQuestion(
  questionId: string,
  updates: {
    title?: string;
    points?: number;
    type?: string;
    correct_answer?: string;
  }
) {
  const { error } = await supabase
    .from("exam_questions")
    .update(updates)
    .eq("id", questionId);

  if (error) {
    console.error(error);
    alert(error.message);
  }
}

async function saveQuestionOrder(questions: Question[]) {
  for (let index = 0; index < questions.length; index++) {
    const question = questions[index];

    console.log(
      "Saving:",
      question.title,
      "=>",
      index
    );

    const { error } = await supabase
      .from("exam_questions")
      .update({
        sort_order: index,
      })
      .eq("id", question.id);

    if (error) {
      console.error(error);
    }
  }
}

async function saveChoice(
  choiceId: string,
  text: string
) {
  const { error } = await supabase
    .from("question_choices")
    .update({
      text,
    })
    .eq("id", choiceId);

  if (error) {
    console.error(error);
    alert(error.message);
  }
}

async function addQuestion(examId: string) {
  const { data, error } = await supabase
    .from("exam_questions")
    .insert({
      exam_id: Number(examId),
      title: "سؤال جديد",
      type: "multiple_choice",
      points: 1,
      sort_order:
        exams.find((e) => e.id === examId)?.questions.length || 0,
      correct_answer: "",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  const choices = Array.from({ length: 4 }).map((_, i) => ({
    question_id: data.id,
    text: `الخيار ${i + 1}`,
    sort_order: i,
  }));

  const { data: choiceData } = await supabase
    .from("question_choices")
    .insert(choices)
    .select();

  setExams((prev) =>
    prev.map((exam) =>
      exam.id === examId
        ? {
            ...exam,
            questions: [
              ...exam.questions,
              {
                id: data.id,
                title: data.title,
                type: data.type as QuestionType,
                correctAnswer: data.correct_answer ?? "",
                points: data.points,
                choices:
                  choiceData?.map((c: any) => ({
                    id: c.id,
                    text: c.text,
                  })) ?? [],
              },
            ],
          }
        : exam
    )
  );
}

 useEffect(() => {
  loadCourse();
  loadExams();
  loadHomeworks();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);
  // ─────────────────────────────────────────
  // COURSE FUNCTIONS
  // ─────────────────────────────────────────

  async function saveCourse() {
  setSaving(true);

  try {
    const { error } = await supabase
      .from("courses")
      .update({
        title: course.title,
        description: course.description,
        grade: course.grade,
        price: course.price,
        is_free: course.isFree,
        is_hidden: course.isHidden,
        is_published: course.isPublished,
        thumbnail: course.thumbnailUrl,
      })
      .eq("id", course.id);

    if (error) throw error;

    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);

  } catch (err: any) {
    console.error(err);
    alert(err.message || "حدث خطأ أثناء حفظ الكورس");
  } finally {
    setSaving(false);
  }
}

  async function deleteCourse() {
    // Placeholder: ready for Supabase integration
    // await supabase.from("courses").delete().eq("id", course.id);
    navigate("/instructor/courses");
  }

  function updateCourseField<K extends keyof Course>(field: K, value: Course[K]) {
    setCourse((prev) => ({ ...prev, [field]: value }));
  }

async function uploadThumbnail(file: File): Promise<string> {
  const ext = file.name.split(".").pop();

  const fileName = `course-${course.id}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("course-thumbnails")
    .upload(fileName, file, {
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("course-thumbnails")
    .getPublicUrl(fileName);

  return publicUrl;
}

  async function handleThumbnailChange(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  try {
    const imageUrl = await uploadThumbnail(file);

    updateCourseField("thumbnailFile", file);
    updateCourseField("thumbnailUrl", imageUrl);

  } catch (err: any) {
    console.error(err);
    alert(err.message || "فشل رفع الصورة");
  }
}
  // ─────────────────────────────────────────
  // SECTION FUNCTIONS
  // ─────────────────────────────────────────

async function addSection() {
  try {
    const { data, error } = await supabase
      .from("course_sections")
      .insert({
        course_id: id,
        title: `قسم ${sections.length + 1}`,
        sort_order: sections.length,
      })
      .select()
      .single();

    if (error) throw error;

    setSections((prev) => [
      ...prev,
      {
        id: data.id,
        name: data.title,
        isCollapsed: false,
        isRenaming: false,
        renameValue: data.title,
        videos: [],
        pdfs: [],
      },
    ]);

  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء إضافة القسم");
  }
}

async function removeSection(sectionId: string) {
  if (!confirm("هل تريد حذف هذا القسم وكل محتوياته؟")) return;

  try {
    // كل العناصر الموجودة داخل القسم
    const { data: items, error: itemsError } = await supabase
      .from("course_items")
      .select("id, type, storage_path")
      .eq("section_id", sectionId);

    if (itemsError) throw itemsError;

    const videoFiles =
      items
        ?.filter(
          (i) => i.type === "video" && i.storage_path
        )
        .map((i) => i.storage_path) || [];

    const pdfFiles =
      items
        ?.filter(
          (i) => i.type === "pdf" && i.storage_path
        )
        .map((i) => i.storage_path) || [];

    // حذف الفيديوهات من Storage
    if (videoFiles.length) {
      const { error } = await supabase.storage
        .from("course-videos")
        .remove(videoFiles);

      if (error) console.error(error);
    }

    // حذف ملفات PDF من Storage
    if (pdfFiles.length) {
      const { error } = await supabase.storage
        .from("course-files")
        .remove(pdfFiles);

      if (error) console.error(error);
    }

    // حذف عناصر القسم
    const { error: itemsDeleteError } =
      await supabase
        .from("course_items")
        .delete()
        .eq("section_id", sectionId);

    if (itemsDeleteError) throw itemsDeleteError;

    // حذف القسم
    const { error: sectionDeleteError } =
      await supabase
        .from("course_sections")
        .delete()
        .eq("id", sectionId);

    if (sectionDeleteError) throw sectionDeleteError;

    loadCourse();
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء حذف القسم");
  }
}

async function renameSection(
  sectionId: string,
  newName: string
) {
  const { error } = await supabase
    .from("course_sections")
    .update({
      title: newName,
    })
    .eq("id", sectionId);

  if (error) {
  console.error("QUESTION ERROR:", error);

  alert(JSON.stringify(error, null, 2));

  return;
}

  loadCourse();
}

  function toggleSectionRenaming(sectionId: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, isRenaming: !s.isRenaming, renameValue: s.name } : s))
    );
  }

  function updateSectionRenameValue(sectionId: string, value: string) {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, renameValue: value } : s)));
  }

  function toggleSectionCollapse(sectionId: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, isCollapsed: !s.isCollapsed } : s))
    );
  }

  async function moveSectionUp(index: number) {
  if (index === 0) return;

  const arr = [...sections];

  [arr[index - 1], arr[index]] = [
    arr[index],
    arr[index - 1],
  ];

  setSections(arr);

  await saveSectionOrder(arr);
}

  async function moveSectionDown(index: number) {
  if (index === sections.length - 1) return;

  const arr = [...sections];

  [arr[index], arr[index + 1]] = [
    arr[index + 1],
    arr[index],
  ];

  setSections(arr);

  await saveSectionOrder(arr);
}

  // ─────────────────────────────────────────
  // VIDEO FUNCTIONS
  // ─────────────────────────────────────────

async function addVideo(sectionId: string) {
  const { data, error } = await supabase
    .from("course_items")
    .insert({
      section_id: sectionId,
      type: "video",
      title: "درس جديد",
      description: "",
      source: "upload",
      sort_order:
        sections.find((s) => s.id === sectionId)?.videos.length || 0,
      allow_download: false,
      is_preview: false,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setSections((prev) =>
    prev.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            videos: [
              ...s.videos,
              {
                ...makeEmptyVideo(),
                id: data.id,
                title: data.title,
              },
            ],
          }
        : s
    )
  );
}

 async function removeVideo(sectionId: string, videoId: string) {
  if (!confirm("هل تريد حذف الفيديو؟")) return;

  try {
    // نجيب مسار الملف من قاعدة البيانات
    const { data, error } = await supabase
      .from("course_items")
      .select("storage_path")
      .eq("id", videoId)
      .single();

    if (error) throw error;

    // حذف الملف من Storage
    if (data?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("course-videos")
        .remove([data.storage_path]);

      if (storageError) {
        console.error(storageError);
      }
    }

    // حذف السجل من قاعدة البيانات
    const { error: deleteError } = await supabase
      .from("course_items")
      .delete()
      .eq("id", videoId);

    if (deleteError) throw deleteError;

    // تحديث الـ UI
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              videos: s.videos.filter((v) => v.id !== videoId),
            }
          : s
      )
    );
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء حذف الفيديو");
  }
}

async function saveSectionOrder(updatedSections: any[]) {
  try {
    await Promise.all(
      updatedSections.map((section, index) =>
        supabase
          .from("course_sections")
          .update({
            sort_order: index,
          })
          .eq("id", section.id)
      )
    );
  } catch (err) {
    console.error(err);
  }
}

async function saveVideo(
  videoId: string,
  updates: any
) {
  const { error } = await supabase
    .from("course_items")
    .update(updates)
    .eq("id", videoId);

  if (error) {
    console.error(error);
  }
}

  function updateVideo(sectionId: string, videoId: string, updates: Partial<VideoFile>) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, videos: s.videos.map((v) => (v.id === videoId ? { ...v, ...updates } : v)) }
          : s
      )
    );
    
  }
  
  async function savePdfOrder(pdfs: PdfFile[]) {
  try {
    await Promise.all(
      pdfs.map((pdf, index) =>
        supabase
          .from("course_items")
          .update({
            sort_order: index,
          })
          .eq("id", pdf.id)
      )
    );
  } catch (err) {
    console.error(err);
  }
}

  async function saveVideoOrder(videos: VideoFile[]) {
  try {
    await Promise.all(
      videos.map((video, index) =>
        supabase
          .from("course_items")
          .update({
            sort_order: index,
          })
          .eq("id", video.id)
      )
    );
  } catch (err) {
    console.error(err);
  }
}

  async function moveVideo(
  sectionId: string,
  videoId: string,
  direction: "up" | "down"
) {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return;

  const arr = [...section.videos];

  const idx = arr.findIndex((v) => v.id === videoId);

  if (direction === "up" && idx > 0) {
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
  }

  if (direction === "down" && idx < arr.length - 1) {
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
  }

  setSections((prev) =>
    prev.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            videos: arr,
          }
        : s
    )
  );

  await saveVideoOrder(arr);
}

  async function uploadVideo(sectionId: string, videoId: string, file: File) {
    updateVideo(sectionId, videoId, { uploadStatus: "uploading", uploadProgress: 0, file });

    // Simulate upload progress
    for (let p = 0; p <= 90; p += 10) {
      await new Promise((r) => setTimeout(r, 80));
      updateVideo(sectionId, videoId, { uploadProgress: p });
    }

    try {
     const ext = file.name.split(".").pop();

const fileName = `${crypto.randomUUID()}.${ext}`;

const storagePath = `${sectionId}/${fileName}`;

const { error: uploadError } = await supabase.storage
  .from("course-videos")
  .upload(storagePath, file);

if (uploadError) throw uploadError;

const { data } = supabase.storage
  .from("course-videos")
  .getPublicUrl(storagePath);

const publicUrl = data.publicUrl;

// استخراج مدة الفيديو
const duration = await new Promise<number>((resolve) => {
  const video = document.createElement("video");
  video.preload = "metadata";

  video.onloadedmetadata = () => {
    resolve(Math.floor(video.duration));
  };

  video.onerror = () => resolve(0);

  video.src = publicUrl;
});

const { error: dbError } = await supabase
  .from("course_items")
  .update({
    url: publicUrl,
    storage_path: storagePath,
    duration,
    file_size: file.size,
  })
  .eq("id", videoId);

if (dbError) {
  console.error("DB ERROR", dbError);
  throw dbError;
}

console.log("DB UPDATED");

async function saveVideoOrder(videos: VideoFile[]) {
  try {
    await Promise.all(
      videos.map((video, index) =>
        supabase
          .from("course_items")
          .update({
            sort_order: index,
          })
          .eq("id", video.id)
      )
    );
  } catch (err) {
    console.error(err);
  }
}

async function saveVideo(videoId: string, updates: any) {
  const { error } = await supabase
    .from("course_items")
    .update(updates)
    .eq("id", videoId);

  if (error) {
    console.error(error);
  }
}

updateVideo(sectionId, videoId, {
  uploadStatus: "done",
  uploadProgress: 100,
  videoUrl: publicUrl,
  fileName: file.name,
  fileSize: file.size,
  durationSeconds: duration,
});
     
    } catch (err) {
  console.error("UPLOAD ERROR:", err);

  updateVideo(sectionId, videoId, {
    uploadStatus: "error",
    uploadProgress: 0,
  });
}
  }

  function handleVideoFileChange(sectionId: string, videoId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void uploadVideo(sectionId, videoId, file);
  }

  // ─────────────────────────────────────────
  // PDF FUNCTIONS
  // ─────────────────────────────────────────

async function addPdf(sectionId: string) {
  const { data, error } = await supabase
    .from("course_items")
    .insert({
      section_id: sectionId,
      type: "pdf",
      title: "ملف جديد",
      description: "",
      source: "upload",
      sort_order:
        sections.find((s) => s.id === sectionId)?.pdfs.length || 0,
      allow_download: true,
      is_preview: false,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setSections((prev) =>
    prev.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            pdfs: [
              ...s.pdfs,
              {
                ...makeEmptyPdf(),
                id: data.id,
                title: data.title,
              },
            ],
          }
        : s
    )
  );
}



 async function removePdf(sectionId: string, pdfId: string) {
  if (!confirm("هل تريد حذف الملف؟")) return;

  try {
    // الحصول على مسار الملف
    const { data, error } = await supabase
      .from("course_items")
      .select("storage_path")
      .eq("id", pdfId)
      .single();

    if (error) throw error;

    // حذف الملف من Storage
    if (data?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("course-files")
        .remove([data.storage_path]);

      if (storageError) {
        console.error(storageError);
      }
    }

    // حذف السجل من قاعدة البيانات
    const { error: deleteError } = await supabase
      .from("course_items")
      .delete()
      .eq("id", pdfId);

    if (deleteError) throw deleteError;

    // تحديث الـ UI
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              pdfs: s.pdfs.filter((p) => p.id !== pdfId),
            }
          : s
      )
    );
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء حذف الملف");
  }
}

  function updatePdf(sectionId: string, pdfId: string, updates: Partial<PdfFile>) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, pdfs: s.pdfs.map((p) => (p.id === pdfId ? { ...p, ...updates } : p)) }
          : s
      )
    );
  }

 async function movePdf(
  sectionId: string,
  pdfId: string,
  direction: "up" | "down"
) {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return;

  const arr = [...section.pdfs];

  const idx = arr.findIndex((p) => p.id === pdfId);

  if (direction === "up" && idx > 0) {
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
  }

  if (direction === "down" && idx < arr.length - 1) {
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
  }

  setSections((prev) =>
    prev.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            pdfs: arr,
          }
        : s
    )
  );

  await savePdfOrder(arr);
}

  async function uploadPdf(sectionId: string, pdfId: string, file: File) {
    updatePdf(sectionId, pdfId, { uploadStatus: "uploading", uploadProgress: 0, file });
    for (let p = 0; p <= 90; p += 15) {
      await new Promise((r) => setTimeout(r, 60));
      updatePdf(sectionId, pdfId, { uploadProgress: p });
    }
    try {
      const ext = file.name.split(".").pop();

const fileName = `${crypto.randomUUID()}.${ext}`;

const storagePath = `${sectionId}/${fileName}`;

const { error: uploadError } = await supabase.storage
  .from("course-files")
  .upload(storagePath, file);

if (uploadError) throw uploadError;

const { data } = supabase.storage
  .from("course-files")
  .getPublicUrl(storagePath);

const publicUrl = data.publicUrl;

const { error: dbError } = await supabase
  .from("course_items")
  .update({
    url: publicUrl,
    storage_path: storagePath,
    file_size: file.size,
  })
  .eq("id", pdfId);

if (dbError) throw dbError;

updatePdf(sectionId, pdfId, {
  uploadStatus: "done",
  uploadProgress: 100,
  pdfUrl: publicUrl,
  fileName: file.name,
  fileSize: file.size,
});
    } 
    catch (err: any) {
  console.error("PDF ERROR =", err);

  alert(err?.message || JSON.stringify(err));

  updatePdf(sectionId, pdfId, {
    uploadStatus: "error",
    uploadProgress: 0,
  });
}
  }

  function handlePdfFileChange(sectionId: string, pdfId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void uploadPdf(sectionId, pdfId, file);
  }

  // ─────────────────────────────────────────
  // EXAM FUNCTIONS
  // ─────────────────────────────────────────

async function addExam() {
  if (!id) return;

  const { data, error } = await supabase
    .from("exams")
    .insert({
      course_id: id,
      title: "اختبار جديد",
      description: "",
      duration: 60,
      passing_grade: 60,
      total_score: 100,
      is_visible: true,
      is_published: false,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  setExams((prev) => [
    ...prev,
    {
      id: String(data.id),
      title: data.title,
      description: data.description ?? "",
      passingScore: data.passing_grade,
      totalScore: data.total_score,
      durationMinutes: data.duration,
      openDate: data.open_date ?? "",
      closeDate: data.close_date ?? "",
      isVisible: data.is_visible,
      isPublished: data.is_published,
      questions: [],
      isExpanded: true,
    },
  ]);
}


async function loadExams() {
  if (!id) return;

  const { data, error } = await supabase
    .from("exams")
    .select(`
      *,
      exam_questions (
        *,
        question_choices (*)
      )
    `)
    .eq("course_id", id)
    .order("id");

  if (error) {
    console.error(error);
    return;
  }

  setExams(
    (data ?? []).map((exam: any) => ({
      id: String(exam.id),
      title: exam.title,
      description: exam.description ?? "",
      passingScore: exam.passing_grade,
      totalScore: exam.total_score,
      durationMinutes: exam.duration,
      openDate: exam.open_date ?? "",
      closeDate: exam.close_date ?? "",
      isVisible: exam.is_visible,
      isPublished: exam.is_published,

      questions:
        exam.exam_questions?.map((question: any) => ({
          id: question.id,
          title: question.title,
          type: question.type as QuestionType,
          correctAnswer: question.correct_answer ?? "",
          points: question.points,

          choices:
            question.question_choices?.map((choice: any) => ({
              id: choice.id,
              text: choice.text,
            })) ?? [],
        })) ?? [],

      isExpanded: false,
    }))
  );
}

 async function removeQuestion(examId: string, questionId: string) {
  if (!confirm("هل تريد حذف السؤال؟")) return;

  const { error } = await supabase
    .from("exam_questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  setExams((prev) =>
    prev.map((exam) =>
      exam.id === examId
        ? {
            ...exam,
            questions: exam.questions.filter(
              (q) => q.id !== questionId
            ),
          }
        : exam
    )
  );
}

  function updateQuestion(examId: string, questionId: string, updates: Partial<Question>) {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId
          ? { ...e, questions: e.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)) }
          : e
      )
    );
  }

async function moveQuestion(
  examId: string,
  questionId: string,
  direction: "up" | "down"
) {
  let updatedQuestions: Question[] = [];

  setExams((prev) =>
    prev.map((exam) => {
      if (exam.id !== examId) return exam;

      const arr = [...exam.questions];
      const idx = arr.findIndex((q) => q.id === questionId);

      if (direction === "up" && idx > 0) {
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      }

      if (direction === "down" && idx < arr.length - 1) {
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      }

      updatedQuestions = arr;

      return {
        ...exam,
        questions: arr,
      };
    })
  );

  await saveQuestionOrder(updatedQuestions);
}

  function updateChoice(examId: string, questionId: string, choiceId: string, text: string) {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId
          ? {
              ...e,
              questions: e.questions.map((q) =>
                q.id === questionId
                  ? { ...q, choices: q.choices.map((c) => (c.id === choiceId ? { ...c, text } : c)) }
                  : q
              ),
            }
          : e
      )
    );
  }

  // ─────────────────────────────────────────
  // HOMEWORK FUNCTIONS
  // ─────────────────────────────────────────

async function addHomework() {
  if (!id) return;

  const { data, error } = await supabase
    .from("homeworks")
    .insert({
      course_id: id,
      title: "واجب جديد",
      description: "",
      total_score: 100,
      due_date: null,
      allow_late_submission: false,
      is_published: false,
      allowed_types: [],
      sort_order: homeworks.length,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  setHomeworks((prev) => [
    ...prev,
    {
      ...makeEmptyHomework(),
      id: String(data.id),
      title: data.title,
      description: data.description ?? "",
      totalScore: data.total_score,
      dueDate: data.due_date ?? "",
      allowLateSubmission: data.allow_late_submission,
      isPublished: data.is_published,
      allowedTypes: data.allowed_types ?? [],
      attachmentPdfUrl: data.attachment_pdf ?? "",
      attachmentImageUrl: data.attachment_image ?? "",
    },
  ]);
}

async function loadHomeworks() {
  if (!id) return;

  const { data, error } = await supabase
    .from("homeworks")
    .select("*")
    .eq("course_id", id)
    .order("sort_order");

  if (error) {
    console.error(error);
    return;
  }

  setHomeworks(
    (data ?? []).map((hw: any) => ({
      id: String(hw.id),
      title: hw.title,
      description: hw.description ?? "",
      dueDate: hw.due_date ?? "",
      totalScore: hw.total_score,
      allowLateSubmission: hw.allow_late_submission,
      allowedTypes: hw.allowed_types ?? ["text"],
      instructionText: hw.instruction_text ?? "",
      attachmentPdfUrl: hw.attachment_pdf ?? "",
      attachmentPdfName: "",
      attachmentImageUrl: hw.attachment_image ?? "",
      attachmentImageName: "",
      pdfFile: null,
      imageFile: null,
      isPublished: hw.is_published,
      isExpanded: false,
    }))
  );
}

 async function removeHomework(hwId: string) {
  const hw = homeworks.find((h) => h.id === hwId);

  if (!hw) return;

  // حذف PDF
  if (hw.attachmentPdfUrl) {
    const path = hw.attachmentPdfUrl.split("/").pop();

    if (path) {
      await supabase.storage
        .from("homework-files")
        .remove([path]);
    }
  }

  // حذف الصورة
  if (hw.attachmentImageUrl) {
    const path = hw.attachmentImageUrl.split("/").pop();

    if (path) {
      await supabase.storage
        .from("homework-images")
        .remove([path]);
    }
  }

  const { error } = await supabase
    .from("homeworks")
    .delete()
    .eq("id", Number(hwId));

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  setHomeworks((prev) =>
    prev.filter((h) => h.id !== hwId)
  );
}

async function saveHomeworkOrder(homeworks: Homework[]) {
  for (let i = 0; i < homeworks.length; i++) {
    await supabase
      .from("homeworks")
      .update({
        sort_order: i,
      })
      .eq("id", Number(homeworks[i].id));
  }
}

async function moveHomework(
  hwId: string,
  direction: "up" | "down"
) {
  const list = [...homeworks];

  const index = list.findIndex(
    (h) => h.id === hwId
  );

  if (index === -1) return;

  if (direction === "up" && index > 0) {
    [list[index], list[index - 1]] = [
      list[index - 1],
      list[index],
    ];
  }

  if (
    direction === "down" &&
    index < list.length - 1
  ) {
    [list[index], list[index + 1]] = [
      list[index + 1],
      list[index],
    ];
  }

  setHomeworks(list);

  await saveHomeworkOrder(list);
}

  function updateHomework(hwId: string, updates: Partial<Homework>) {
    setHomeworks((prev) => prev.map((h) => (h.id === hwId ? { ...h, ...updates } : h)));
  }

async function saveHomework(
  hwId: string,
  updates: Partial<Homework>
) {
  const { error } = await supabase
    .from("homeworks")
    .update({
      title: updates.title,
      description: updates.description,
      due_date: updates.dueDate || null,
      total_score: updates.totalScore,
      allow_late_submission: updates.allowLateSubmission,
      allowed_types: updates.allowedTypes,
      instruction_text: updates.instructionText,
      is_published: updates.isPublished,
    })
    .eq("id", Number(hwId));

  if (error) {
    console.error(error);
    alert(error.message);
  }
}

  function toggleHomeworkType(hwId: string, type: SubmissionType) {
    setHomeworks((prev) =>
      prev.map((h) => {
        if (h.id !== hwId) return h;
        const exists = h.allowedTypes.includes(type);
        return {
          ...h,
          allowedTypes: exists ? h.allowedTypes.filter((t) => t !== type) : [...h.allowedTypes, type],
        };
      })
    );
  }

async function uploadHomeworkAttachment(
  hwId: string,
  type: "pdf" | "image",
  file: File
) {
  const fileName = `${Date.now()}-${file.name}`;

  const bucket =
    type === "pdf"
      ? "homework-files"
      : "homework-images";

  const { error: uploadError } =
    await supabase.storage
      .from(bucket)
      .upload(fileName, file);

  if (uploadError) {
    console.error(uploadError);
    alert(uploadError.message);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  const updates =
    type === "pdf"
      ? {
          attachmentPdfUrl: publicUrl,
          attachmentPdfName: file.name,
          pdfFile: file,
        }
      : {
          attachmentImageUrl: publicUrl,
          attachmentImageName: file.name,
          imageFile: file,
        };

  updateHomework(hwId, updates);

  const { error } = await supabase
    .from("homeworks")
    .update(
      type === "pdf"
        ? {
            attachment_pdf: publicUrl,
          }
        : {
            attachment_image: publicUrl,
          }
    )
    .eq("id", Number(hwId));

  if (error) {
    console.error(error);
  }
}

  function handleHomeworkAttachment(hwId: string, type: "pdf" | "image", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void uploadHomeworkAttachment(hwId, type, file);
  }

  // ─────────────────────────────────────────
  // DRAG & DROP HELPERS
  // ─────────────────────────────────────────

  function handleVideoDrop(sectionId: string, videoId: string, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;
    void uploadVideo(sectionId, videoId, file);
  }

  function handlePdfDrop(sectionId: string, pdfId: string, e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || file.type !== "application/pdf") return;
    void uploadPdf(sectionId, pdfId, file);
  }

  // ─────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────

  function getUploadStatusBadge(status: UploadStatus) {
    if (status === "idle") return <Badge label="لم يُرفع بعد" color="slate" />;
    if (status === "uploading") return <Badge label="جاري الرفع..." color="blue" />;
    if (status === "done") return <Badge label="تم الرفع" color="green" />;
    if (status === "error") return <Badge label="فشل الرفع" color="red" />;
    return null;
  }

  // ─────────────────────────────────────────
  // LOADING / ERROR STATE
  // ─────────────────────────────────────────

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-sm font-medium text-slate-500">جاري تحميل الكورس...</p>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  if (error) {
    return (
      <InstructorLayout>
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-800">حدث خطأ</h3>
            <p className="mb-6 text-sm text-slate-500">{error}</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => void loadCourse()}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-700 active:scale-95"
              >
                إعادة المحاولة
              </button>
              <button
                type="button"
                onClick={() => navigate("/instructor/courses")}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                العودة
              </button>
            </div>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  // ─────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────

  return (
    <InstructorLayout>
      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-800">حذف الكورس</h3>
            <p className="mb-6 text-sm text-slate-500">
              هذا الإجراء لا يمكن التراجع عنه. اكتب{" "}
              <span className="font-semibold text-slate-700">"{course.title}"</span> للتأكيد.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="اكتب اسم الكورس هنا"
              className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void deleteCourse()}
                disabled={deleteConfirmText !== course.title}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                حذف الكورس نهائيًا
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-8">
          <div className="flex items-center justify-between py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <button
                  type="button"
                  onClick={() => navigate("/instructor/courses")}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  الكورسات
                </button>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs font-medium text-slate-500">تعديل</span>
              </div>
              <h1 className="truncate text-xl font-bold text-slate-900">{course.title || "كورس بدون عنوان"}</h1>
              <p className="text-xs text-slate-400 mt-0.5">آخر تحديث الآن</p>
            </div>
            <div className="flex items-center gap-2.5 mr-6 flex-shrink-0">
              {saveSuccess && (
                <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  تم الحفظ
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                حذف
              </button>
              <button
                type="button"
                onClick={() => navigate("/instructor/courses")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => void saveCourse()}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-700 disabled:opacity-60 active:scale-95"
              >
                {saving ? <Spinner size="sm" /> : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                )}
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-0">
            {(
              [
                { id: "content" as TabId, label: "المحتوى", icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" },
                { id: "exams" as TabId, label: "الاختبارات", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" },
                { id: "homework" as TabId, label: "الواجبات", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" },
                { id: "settings" as TabId, label: "الإعدادات", icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
              ] as { id: TabId; label: string; icon: string }[]
            ).map((tab, i) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none ${
                  activeTab === tab.id
                    ? "text-violet-600"
                    : "text-slate-500 hover:text-slate-700"
                } ${i === 0 ? "" : ""}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-violet-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="mx-auto max-w-5xl px-8 py-10">

        {/* ═══════════════════════════════════ */}
        {/* CONTENT TAB                         */}
        {/* ═══════════════════════════════════ */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">محتوى الكورس</h2>
                <p className="mt-0.5 text-sm text-slate-500">أضف الأقسام والفيديوهات والملفات</p>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-700 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                إضافة قسم
              </button>
            </div>

            {sections.length === 0 && (
              <SectionCard className="p-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-700">لا توجد أقسام بعد</h3>
                <p className="mt-1 text-sm text-slate-400">أضف قسمًا لبدء تنظيم محتوى كورسك</p>
                <button
                  type="button"
                  onClick={addSection}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-700 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  إضافة أول قسم
                </button>
              </SectionCard>
            )}

            {sections.map((section, sIdx) => (
              <SectionCard key={section.id} className="overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center gap-3 bg-gradient-to-l from-slate-50 to-white px-6 py-4 border-b border-slate-100">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">
                    {sIdx + 1}
                  </div>

                  {section.isRenaming ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={section.renameValue}
                        onChange={(e) => updateSectionRenameValue(section.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameSection(section.id, section.renameValue);
                          if (e.key === "Escape") toggleSectionRenaming(section.id);
                        }}
                        className="flex-1 rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-200"
                      />
                      <button
                        type="button"
                        onClick={() => renameSection(section.id, section.renameValue)}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-violet-700"
                      >
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSectionRenaming(section.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <span className="flex-1 text-sm font-semibold text-slate-800">{section.name}</span>
                  )}

                  <div className="flex items-center gap-1">
                    <IconButton onClick={() => toggleSectionRenaming(section.id)} title="إعادة التسمية" variant="primary">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                      </svg>
                    </IconButton>
                    <IconButton onClick={() => moveSectionUp(sIdx)} title="تحريك لأعلى" disabled={sIdx === 0}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </IconButton>
                    <IconButton onClick={() => moveSectionDown(sIdx)} title="تحريك لأسفل" disabled={sIdx === sections.length - 1}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </IconButton>
                    <IconButton onClick={() => toggleSectionCollapse(section.id)} title={section.isCollapsed ? "توسيع" : "طي"}>
                      <svg className={`h-4 w-4 transition-transform duration-200 ${section.isCollapsed ? "-rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </IconButton>
                    <IconButton onClick={() => removeSection(section.id)} title="حذف القسم" variant="danger">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </IconButton>
                  </div>
                </div>

                {/* Section Body */}
                {!section.isCollapsed && (
                  <div className="p-6 space-y-4">
                    {/* Videos */}
                    {section.videos.map((video, vIdx) => (
                      <div key={video.id} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                        {/* Video Card Header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                            <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                          </div>
                          <span className="flex-1 text-sm font-medium text-slate-700">
                            {video.title || `فيديو ${vIdx + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            {getUploadStatusBadge(video.uploadStatus)}
                            <IconButton onClick={() => moveVideo(section.id, video.id, "up")} title="تحريك لأعلى" disabled={vIdx === 0}>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                              </svg>
                            </IconButton>
                            <IconButton onClick={() => moveVideo(section.id, video.id, "down")} title="تحريك لأسفل" disabled={vIdx === section.videos.length - 1}>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </IconButton>
                            <IconButton onClick={() => updateVideo(section.id, video.id, { isExpanded: !video.isExpanded })} title={video.isExpanded ? "طي" : "توسيع"}>
                              <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${video.isExpanded ? "" : "-rotate-90"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </IconButton>
                            <IconButton onClick={() => removeVideo(section.id, video.id)} title="حذف الفيديو" variant="danger">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </IconButton>
                          </div>
                        </div>

                        {/* Video Card Body */}
                        {video.isExpanded && (
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">عنوان الفيديو</label>
                                <input
  type="text"
  value={video.title}
  onChange={async (e) => {
  const value = e.target.value;

  updateVideo(section.id, video.id, {
    title: value,
  });

  await saveVideo(video.id, {
    title: value,
  });
}}
  onBlur={() =>
    saveVideo(video.id, {
      title: video.title,
    })
  }
                                  placeholder="أدخل عنوان الفيديو"
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                />
                              </div>
                             <div className="flex items-end gap-4">

  <Toggle
    label="معاينة مجانية"
    checked={video.freePreview}
    onChange={async (v) => {
      updateVideo(section.id, video.id, {
        freePreview: v,
      });

      await saveVideo(video.id, {
        is_preview: v,
      });
    }}
  />

  <Toggle
    label="تحميل"
    checked={video.allowDownload}
    onChange={async (v) => {
      updateVideo(section.id, video.id, {
        allowDownload: v,
      });

      await saveVideo(video.id, {
        allow_download: v,
      });
    }}
  />

</div>
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">وصف الفيديو</label>
                            <textarea
  value={video.description}
  onChange={async (e) => {
  const value = e.target.value;

  updateVideo(section.id, video.id, {
    description: value,
  });

  await saveVideo(video.id, {
    description: value,
  });
}}
  onBlur={() =>
    saveVideo(video.id, {
      description: video.description,
    })
  }
                                placeholder="وصف مختصر للفيديو..."
                                rows={2}
                                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                              />
                            </div>

                            {/* Upload Area */}
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">ملف الفيديو</label>
                              <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleVideoDrop(section.id, video.id, e)}
                                className="relative rounded-xl border-2 border-dashed border-slate-200 bg-white transition-all hover:border-violet-300 hover:bg-violet-50/30"
                              >
                                {video.uploadStatus === "uploading" ? (
                                  <div className="p-5 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <Spinner size="sm" />
                                      <span className="text-sm font-medium text-slate-600">جاري رفع الفيديو... {video.uploadProgress}%</span>
                                    </div>
                                    <UploadProgressBar progress={video.uploadProgress} />
                                  </div>
                                ) : video.uploadStatus === "done" && video.videoUrl ? (
                                  <div className="p-4 space-y-3">
                                    <div className="flex items-start gap-4">
                                      <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900">
                                        <video
                                          src={video.videoUrl}
                                          className="h-full w-full object-cover"
                                          muted
                                        />
                                      </div>
                                      <div className="flex-1 space-y-1">
                                        <p className="text-sm font-semibold text-slate-800">{video.fileName}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                          <span className="flex items-center gap-1">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                            {formatFileSize(video.fileSize)}
                                          </span>
                                          {video.durationSeconds > 0 && (
                                            <span className="flex items-center gap-1">
                                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                              {formatDuration(video.durationSeconds)}
                                            </span>
                                          )}
                                        </div>
                                        <Badge label="تم الرفع بنجاح" color="green" />
                                      </div>
                                    </div>
                                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-violet-600 transition-colors hover:text-violet-700">
                                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                      </svg>
                                      استبدال الفيديو
                                      <input type="file" accept="video/*" className="sr-only" onChange={(e) => handleVideoFileChange(section.id, video.id, e)} />
                                    </label>
                                  </div>
                                ) : (
                                  <label className="flex cursor-pointer flex-col items-center gap-3 p-8">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                      <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                      </svg>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm font-semibold text-slate-700">اسحب الفيديو هنا أو انقر للاختيار</p>
                                      <p className="mt-1 text-xs text-slate-400">MP4, MOV, AVI, MKV — بحد أقصى 2GB</p>
                                    </div>
                                    {video.uploadStatus === "error" && (
                                      <span className="text-xs font-medium text-red-500">فشل الرفع. حاول مجددًا.</span>
                                    )}
                                    <input type="file" accept="video/*" className="sr-only" onChange={(e) => handleVideoFileChange(section.id, video.id, e)} />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* PDFs */}
                    {section.pdfs.map((pdf, pIdx) => (
                      <div key={pdf.id} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100">
                            <svg className="h-3.5 w-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                          <span className="flex-1 text-sm font-medium text-slate-700">
                            {pdf.title || `ملف PDF ${pIdx + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            {getUploadStatusBadge(pdf.uploadStatus)}
                            <IconButton onClick={() => movePdf(section.id, pdf.id, "up")} title="تحريك لأعلى" disabled={pIdx === 0}>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                              </svg>
                            </IconButton>
                            <IconButton onClick={() => movePdf(section.id, pdf.id, "down")} title="تحريك لأسفل" disabled={pIdx === section.pdfs.length - 1}>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </IconButton>
                            <IconButton onClick={() => updatePdf(section.id, pdf.id, { isExpanded: !pdf.isExpanded })} title={pdf.isExpanded ? "طي" : "توسيع"}>
                              <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${pdf.isExpanded ? "" : "-rotate-90"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </IconButton>
                            <IconButton onClick={() => removePdf(section.id, pdf.id)} title="حذف الملف" variant="danger">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </IconButton>
                          </div>
                        </div>

                        {pdf.isExpanded && (
                          <div className="p-4 space-y-4">
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">عنوان الملف</label>
                              <input
                                type="text"
                                value={pdf.title}
                                onChange={async (e) => {
  const value = e.target.value;

  updatePdf(section.id, pdf.id, {
    title: value,
  });

  await saveVideo(pdf.id, {
    title: value,
  });
}}
                                placeholder="أدخل عنوان الملف"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">ملف PDF</label>
                              <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handlePdfDrop(section.id, pdf.id, e)}
                                className="rounded-xl border-2 border-dashed border-slate-200 bg-white transition-all hover:border-rose-300 hover:bg-rose-50/20"
                              >
                                {pdf.uploadStatus === "uploading" ? (
                                  <div className="p-5 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <Spinner size="sm" />
                                      <span className="text-sm font-medium text-slate-600">جاري الرفع... {pdf.uploadProgress}%</span>
                                    </div>
                                    <UploadProgressBar progress={pdf.uploadProgress} />
                                  </div>
                                ) : pdf.uploadStatus === "done" && pdf.pdfUrl ? (
                                  <div className="flex items-center gap-4 p-4">
                                    <div className="flex h-12 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100">
                                      <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-slate-800">{pdf.fileName}</p>
                                      <p className="text-xs text-slate-500">{formatFileSize(pdf.fileSize)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge label="تم الرفع" color="green" />
                                      <a
                                        href={pdf.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-violet-600 hover:text-violet-700"
                                      >
                                        معاينة
                                      </a>
                                      <label className="cursor-pointer text-xs font-medium text-violet-600 hover:text-violet-700">
                                        استبدال
                                        <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => handlePdfFileChange(section.id, pdf.id, e)} />
                                      </label>
                                    </div>
                                  </div>
                                ) : (
                                  <label className="flex cursor-pointer flex-col items-center gap-3 p-8">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                      <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                      </svg>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm font-semibold text-slate-700">اسحب ملف PDF هنا أو انقر للاختيار</p>
                                      <p className="mt-1 text-xs text-slate-400">PDF فقط — بحد أقصى 100MB</p>
                                    </div>
                                    <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => handlePdfFileChange(section.id, pdf.id, e)} />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Content Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => addVideo(section.id)}
                        className="flex items-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-50 active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                        + إضافة فيديو
                      </button>
                      <button
                        type="button"
                        onClick={() => addPdf(section.id)}
                        className="flex items-center gap-2 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-all hover:border-rose-400 hover:bg-rose-50 active:scale-95"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        + إضافة PDF
                      </button>
                    </div>
                  </div>
                )}
              </SectionCard>
            ))}

            {sections.length > 0 && (
              <button
                type="button"
                onClick={addSection}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 px-6 py-4 text-sm font-semibold text-violet-700 transition-all hover:border-violet-400 hover:bg-violet-50 active:scale-[0.99]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                إضافة قسم جديد
              </button>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════ */}
        {/* EXAMS TAB                           */}
        {/* ═══════════════════════════════════ */}
        {activeTab === "exams" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">الاختبارات</h2>
                <p className="mt-0.5 text-sm text-slate-500">أنشئ اختبارات تفاعلية لطلابك</p>
              </div>
              <button
                type="button"
                onClick={addExam}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-700 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                إضافة اختبار
              </button>
            </div>

            {exams.length === 0 && (
              <SectionCard className="p-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-700">لا توجد اختبارات بعد</h3>
                <p className="mt-1 text-sm text-slate-400">أنشئ أول اختبار لقياس مستوى طلابك</p>
                <button
                  type="button"
                  onClick={addExam}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-700 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  إضافة اختبار
                </button>
              </SectionCard>
            )}

            {exams.map((exam) => (
              <SectionCard key={exam.id} className="overflow-hidden">
                {/* Exam Header */}
                <div className="flex items-center gap-3 bg-gradient-to-l from-slate-50 to-white px-6 py-4 border-b border-slate-100">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-800">{exam.title || "اختبار بدون عنوان"}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{exam.questions.length} سؤال</span>
                      {exam.isPublished && <Badge label="منشور" color="green" />}
                      {!exam.isVisible && <Badge label="مخفي" color="slate" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
  void saveExam(exam.id, {
    title: exam.title,
    description: exam.description,
    passingScore: exam.passingScore,
    totalScore: exam.totalScore,
    durationMinutes: exam.durationMinutes,
    openDate: exam.openDate,
    closeDate: exam.closeDate,
    isVisible: exam.isVisible,
    isPublished: exam.isPublished,
  })
}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
                    >
                      حفظ
                    </button>
                    <IconButton onClick={() => updateExam(exam.id, { isExpanded: !exam.isExpanded })} title={exam.isExpanded ? "طي" : "توسيع"}>
                      <svg className={`h-4 w-4 transition-transform duration-200 ${exam.isExpanded ? "" : "-rotate-90"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </IconButton>
                    <IconButton onClick={() => removeExam(exam.id)} title="حذف الاختبار" variant="danger">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </IconButton>
                  </div>
                </div>

                {exam.isExpanded && (
                  <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">عنوان الاختبار</label>
                        <input
                          type="text"
                          value={exam.title}
                          onChange={async (e) => {
  const value = e.target.value;

  updateExam(exam.id, {
    title: value,
  });

  await saveExam(exam.id, {
    title: value,
  });
}}
                          placeholder="أدخل عنوان الاختبار"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">الوصف</label>
                        <textarea
                          value={exam.description}
                          onChange={async (e) => {
  const value = e.target.value;

  updateExam(exam.id, {
    description: value,
  });

  await saveExam(exam.id, {
    description: value,
  });
}}
                          placeholder="وصف مختصر..."
                          rows={2}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">درجة النجاح</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={exam.passingScore}
                          onChange={async (e) => {
  const value = Number(e.target.value);

  updateExam(exam.id, {
    passingScore: value,
  });

  await saveExam(exam.id, {
    passingScore: value,
  });
}}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">الدرجة الكلية</label>
                        <input
                          type="number"
                          min={1}
                          value={exam.totalScore}
                          onChange={async (e) => {
  const value = Number(e.target.value);

  updateExam(exam.id, {
    totalScore: value,
  });

  await saveExam(exam.id, {
    totalScore: value,
  });
}}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">المدة (دقيقة)</label>
                        <input
                          type="number"
                          min={1}
                          value={exam.durationMinutes}
                          onChange={async (e) => {
  const value = Number(e.target.value);

  updateExam(exam.id, {
    durationMinutes: value,
  });

  await saveExam(exam.id, {
    durationMinutes: value,
  });
}}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">تاريخ الفتح</label>
                        <input
                          type="datetime-local"
                          value={exam.openDate}
                          onChange={async (e) => {
  const value = e.target.value;

  updateExam(exam.id, {
    openDate: value,
  });

  await saveExam(exam.id, {
    openDate: value,
  });
}}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">تاريخ الإغلاق</label>
                        <input
                          type="datetime-local"
                          value={exam.closeDate}
                          onChange={async (e) => {
  const value = e.target.value;

  updateExam(exam.id, {
    closeDate: value,
  });

  await saveExam(exam.id, {
    closeDate: value,
  });
}}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-8">
                        <Toggle
                          checked={exam.isVisible}
                          onChange={async (v) => {
  updateExam(exam.id, {
    isVisible: v,
  });

  await saveExam(exam.id, {
    isVisible: v,
  });
}}
                          label="ظاهر للطلاب"
                        />
                        <Toggle
                          checked={exam.isPublished}
                          onChange={async (v) => {
  updateExam(exam.id, {
    isPublished: v,
  });

  await saveExam(exam.id, {
    isPublished: v,
  });
}}
                          label="منشور"
                        />
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="border-t border-slate-100 pt-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-700">الأسئلة ({exam.questions.length})</h4>
                        <button
                          type="button"
                          onClick={() => addQuestion(exam.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-amber-600 active:scale-95"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          إضافة سؤال
                        </button>
                      </div>

                      <div className="space-y-4">
                        {exam.questions.map((question, qIdx) => (
                          <div key={question.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-amber-100 text-xs font-bold text-amber-700 mt-0.5">
                                {qIdx + 1}
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="text"
                                    value={question.title}
                                    onChange={async (e) => {
  const value = e.target.value;

  updateQuestion(exam.id, question.id, {
    title: value,
  });

  await saveQuestion(question.id, {
    title: value,
  });
}}
                                    placeholder="نص السؤال..."
                                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                  />
                                  <select
                                    value={question.type}
                                   onChange={async (e) => {
  const value = e.target.value as QuestionType;

  updateQuestion(exam.id, question.id, {
    type: value,
    correctAnswer: "",
  });

  await saveQuestion(question.id, {
    type: value,
    correct_answer: "",
  });
}}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                  >
                                    <option value="multiple_choice">اختيار من متعدد</option>
                                    <option value="true_false">صح / خطأ</option>
                                    <option value="essay">سؤال مقالي</option>
                                  </select>
                                  <input
                                    type="number"
                                    min={0}
                                    value={question.points}
                                    onChange={async (e) => {
  const value = Number(e.target.value);

  updateQuestion(exam.id, question.id, {
    points: value,
  });

  await saveQuestion(question.id, {
    points: value,
  });
}}
                                    title="الدرجات"
                                    placeholder="درجة"
                                    className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 text-center outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                  />
                                </div>

                                {question.type === "multiple_choice" && (
                                  <div className="space-y-2">
                                    {question.choices.map((choice) => (
                                      <div key={choice.id} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`correct-${question.id}`}
                                          checked={question.correctAnswer === choice.id}
                                         onChange={async () => {
  updateQuestion(exam.id, question.id, {
    correctAnswer: choice.id,
  });

  await saveQuestion(question.id, {
    correct_answer: choice.id,
  });
}}
                                          className="h-4 w-4 flex-shrink-0 accent-violet-600"
                                        />
                                        <input
                                          type="text"
                                          value={choice.text}
                                          onChange={async (e) => {
  const value = e.target.value;

  updateChoice(
    exam.id,
    question.id,
    choice.id,
    value
  );

  await saveChoice(choice.id, value);
}}
                                          placeholder="نص الخيار..."
                                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                        />
                                        {question.correctAnswer === choice.id && (
                                          <Badge label="الإجابة الصحيحة" color="green" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {question.type === "true_false" && (
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`tf-${question.id}`}
                                        checked={question.correctAnswer === "true"}
                                        onChange={async () => {
  updateQuestion(exam.id, question.id, {
    correctAnswer: "true",
  });

  await saveQuestion(question.id, {
    correct_answer: "true",
  });
}}
                                        className="h-4 w-4 accent-violet-600"
                                      />
                                      <span className="text-sm font-medium text-slate-700">صح</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`tf-${question.id}`}
                                        checked={question.correctAnswer === "false"}
                                        onChange={async () => {
  updateQuestion(exam.id, question.id, {
    correctAnswer: "false",
  });

  await saveQuestion(question.id, {
    correct_answer: "false",
  });
}}
                                        className="h-4 w-4 accent-violet-600"
                                      />
                                      <span className="text-sm font-medium text-slate-700">خطأ</span>
                                    </label>
                                  </div>
                                )}

                                {question.type === "essay" && (
  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
    <div className="flex items-center justify-between">
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
        سؤال مقالي
      </span>

      <span className="text-xs font-medium text-slate-500">
        الدرجة: {question.points}
      </span>
    </div>

    <div className="rounded-lg border border-dashed border-amber-300 bg-white p-3">
      <p className="text-sm font-medium text-slate-700">
        سيقوم الطالب بكتابة إجابة نصية.
      </p>

      <p className="mt-2 text-xs text-slate-500">
        لا توجد إجابة صحيحة محفوظة لهذا النوع من الأسئلة، وسيتم تصحيحه يدويًا بواسطة المدرس بعد إرسال الطالب للإجابة.
      </p>
    </div>
  </div>
)}
                              </div>

                              <div className="flex flex-col gap-1 flex-shrink-0">
                                <IconButton onClick={() => moveQuestion(exam.id, question.id, "up")} title="تحريك لأعلى" disabled={qIdx === 0}>
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                  </svg>
                                </IconButton>
                                <IconButton onClick={() => moveQuestion(exam.id, question.id, "down")} title="تحريك لأسفل" disabled={qIdx === exam.questions.length - 1}>
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </IconButton>
                                <IconButton onClick={() => removeQuestion(exam.id, question.id)} title="حذف" variant="danger">
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </IconButton>
                              </div>
                            </div>
                          </div>
                        ))}

                        {exam.questions.length === 0 && (
                          <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                            <p className="text-sm text-slate-400">لا توجد أسئلة. أضف سؤالًا للبدء.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════ */}
        {/* HOMEWORK TAB                        */}
        {/* ═══════════════════════════════════ */}
        {activeTab === "homework" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">الواجبات</h2>
                <p className="mt-0.5 text-sm text-slate-500">أنشئ واجبات وتكاليف للطلاب</p>
              </div>
              <button
                type="button"
                onClick={addHomework}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-700 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                إضافة واجب
              </button>
            </div>

            {homeworks.length === 0 && (
              <SectionCard className="p-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-700">لا توجد واجبات بعد</h3>
                <p className="mt-1 text-sm text-slate-400">أضف أول واجب لطلابك</p>
                <button
                  type="button"
                  onClick={addHomework}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-700 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  إضافة واجب
                </button>
              </SectionCard>
            )}

            {homeworks.map((hw) => (
              <SectionCard key={hw.id} className="overflow-hidden">
                {/* Homework Header */}
                <div className="flex items-center gap-3 bg-gradient-to-l from-slate-50 to-white px-6 py-4 border-b border-slate-100">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-800">{hw.title || "واجب بدون عنوان"}</span>
                    {hw.dueDate && (
                      <p className="text-xs text-slate-400 mt-0.5">تاريخ التسليم: {new Date(hw.dueDate).toLocaleDateString("ar-SA")}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                     onClick={() =>
  void saveHomework(hw.id, {
    title: hw.title,
    description: hw.description,
    dueDate: hw.dueDate,
    totalScore: hw.totalScore,
    allowLateSubmission: hw.allowLateSubmission,
    allowedTypes: hw.allowedTypes,
    instructionText: hw.instructionText,
    isPublished: hw.isPublished,
  })
}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
                    >
                      حفظ
                    </button>
                    <IconButton onClick={() => updateHomework(hw.id, { isExpanded: !hw.isExpanded })} title={hw.isExpanded ? "طي" : "توسيع"}>
                      <svg className={`h-4 w-4 transition-transform duration-200 ${hw.isExpanded ? "" : "-rotate-90"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </IconButton>
                    <IconButton onClick={() => removeHomework(hw.id)} title="حذف الواجب" variant="danger">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </IconButton>
                  </div>
                </div>

                {hw.isExpanded && (
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">عنوان الواجب</label>
                        <input
                          type="text"
                          value={hw.title}
                          onChange={async (e) => {
  updateHomework(hw.id, {
    title: e.target.value,
  });

  await saveHomework(hw.id, {
    ...hw,
    title: e.target.value,
  });
}}
                          placeholder="أدخل عنوان الواجب"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">الوصف</label>
                        <textarea
                          value={hw.description}
                          onChange={async (e) => {
  updateHomework(hw.id, {
    description: e.target.value,
  });

  await saveHomework(hw.id, {
    ...hw,
    description: e.target.value,
  });
}}
                          placeholder="وصف الواجب والتعليمات..."
                          rows={3}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">تاريخ التسليم</label>
                        <input
                          type="datetime-local"
                          value={hw.dueDate}
                          onChange={async (e) => {
  updateHomework(hw.id, {
    dueDate: e.target.value,
  });

  await saveHomework(hw.id, {
    ...hw,
    dueDate: e.target.value,
  });
}}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">الدرجة الكلية</label>
                        <input
                          type="number"
                          min={0}
                          value={hw.totalScore}
                          onChange={async (e) => {
  const value = Number(e.target.value);

  updateHomework(hw.id, {
    totalScore: value,
  });

  await saveHomework(hw.id, {
    ...hw,
    totalScore: value,
  });
}}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                      </div>
                      <div className="col-span-2">
                        <Toggle
                          checked={hw.allowLateSubmission}
                          onChange={async (v) => {
  updateHomework(hw.id, {
    allowLateSubmission: v,
  });

  await saveHomework(hw.id, {
    ...hw,
    allowLateSubmission: v,
  });
}}
                          label="السماح بالتسليم المتأخر"
                        />
                      </div>
                    </div>

                    {/* Allowed Submission Types */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">أنواع التسليم المسموحة</label>
                      <div className="flex flex-wrap gap-3">
                        {(
                          [
                            { type: "text" as SubmissionType, label: "نص", icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" },
                            { type: "pdf" as SubmissionType, label: "PDF", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
                            { type: "image" as SubmissionType, label: "صورة", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
                            { type: "multiple_files" as SubmissionType, label: "ملفات متعددة", icon: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" },
                          ]
                        ).map(({ type, label, icon }) => {
                          const checked = hw.allowedTypes.includes(type);
                          return (
                            <label
                              key={type}
                              className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                                checked
                                  ? "border-violet-400 bg-violet-50 text-violet-700"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/30"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={checked}
                                onChange={() => toggleHomeworkType(hw.id, type)}
                              />
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                              </svg>
                              {label}
                              {checked && (
                                <svg className="h-3.5 w-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">تعليمات إضافية</label>
                      <textarea
                        value={hw.instructionText}
                        onChange={async (e) => {
  updateHomework(hw.id, {
    instructionText: e.target.value,
  });

  await saveHomework(hw.id, {
    ...hw,
    instructionText: e.target.value,
  });
}}
                        placeholder="تعليمات تفصيلية للطلاب..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                      />
                    </div>

                    {/* Attachments */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* PDF Attachment */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">مرفق PDF</label>
                        {hw.attachmentPdfUrl ? (
                          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex h-10 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100">
                              <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-semibold text-slate-700">{hw.attachmentPdfName}</p>
                              <label className="cursor-pointer text-xs text-violet-600 hover:text-violet-700">
                                استبدال
                                <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => handleHomeworkAttachment(hw.id, "pdf", e)} />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 transition-all hover:border-rose-300 hover:bg-rose-50/30">
                            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <span className="text-xs font-medium text-slate-500">رفع PDF</span>
                            <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => handleHomeworkAttachment(hw.id, "pdf", e)} />
                          </label>
                        )}
                      </div>

                      {/* Image Attachment */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">مرفق صورة</label>
                        {hw.attachmentImageUrl ? (
                          <div className="relative h-24 overflow-hidden rounded-xl border border-slate-200">
                            <img src={hw.attachmentImageUrl} alt="attachment" className="h-full w-full object-cover" />
                            <label className="absolute bottom-1.5 left-1.5 cursor-pointer rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white">
                              استبدال
                              <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleHomeworkAttachment(hw.id, "image", e)} />
                            </label>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 transition-all hover:border-blue-300 hover:bg-blue-50/30">
                            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <span className="text-xs font-medium text-slate-500">رفع صورة</span>
                            <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleHomeworkAttachment(hw.id, "image", e)} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════ */}
        {/* SETTINGS TAB                        */}
        {/* ═══════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">إعدادات الكورس</h2>
              <p className="mt-0.5 text-sm text-slate-500">تحكم في تفاصيل ونشر الكورس</p>
            </div>

            {/* Basic Info Card */}
            <SectionCard className="p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                المعلومات الأساسية
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">عنوان الكورس</label>
                  <input
                    type="text"
                    value={course.title}
                    onChange={(e) => updateCourseField("title", e.target.value)}
                    placeholder="أدخل عنوان الكورس"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">وصف الكورس</label>
                  <textarea
                    value={course.description}
                    onChange={(e) => updateCourseField("description", e.target.value)}
                    placeholder="اكتب وصفًا مفصلًا..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">الصف الدراسي / المرحلة</label>
                  <select
  value={course.grade}
  onChange={(e) => updateCourseField("grade", e.target.value)}
  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
>
  <option value="">اختر الصف الدراسي</option>

  <optgroup label="المرحلة الإعدادية">
    <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
    <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
    <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
  </optgroup>

  <optgroup label="المرحلة الثانوية">
    <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
    <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
    <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
  </optgroup>
</select>
                </div>
              </div>
            </SectionCard>

            {/* Pricing Card */}
            <SectionCard className="p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                التسعير
              </h3>

              <div className="space-y-4">
                <Toggle
                  checked={course.isFree}
                  onChange={(v) => updateCourseField("isFree", v)}
                  label="كورس مجاني"
                />
                {!course.isFree && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
  السعر (جنيه مصري)
</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={course.price}
                        onChange={(e) => updateCourseField("price", Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">ج.م</div>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Thumbnail Card */}
            <SectionCard className="p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                صورة الغلاف
              </h3>

              <div className="flex gap-6 items-start">
                <div className="h-36 w-56 flex-shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt="thumbnail" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <span className="text-xs text-slate-400">لا توجد صورة</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-500">ارفع صورة احترافية بنسبة 16:9 (1280×720 أو أكبر)</p>
                  <p className="text-xs text-slate-400">الصيغ المدعومة: JPG, PNG, WebP — بحد أقصى 5MB</p>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition-all hover:bg-violet-100 active:scale-95">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    {course.thumbnailUrl ? "استبدال الصورة" : "رفع صورة الغلاف"}
                    <input type="file" accept="image/*" className="sr-only" onChange={handleThumbnailChange} />
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* Visibility Card */}
            <SectionCard className="p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                النشر والظهور
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">نشر الكورس</p>
                    <p className="text-xs text-slate-400 mt-0.5">الكورس المنشور متاح للطلاب المسجلين</p>
                  </div>
                  <Toggle
                    checked={course.isPublished}
                    onChange={(v) => updateCourseField("isPublished", v)}
                    label=""
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">إخفاء الكورس</p>
                    <p className="text-xs text-slate-400 mt-0.5">الكورس المخفي لا يظهر في قائمة الكورسات</p>
                  </div>
                  <Toggle
                    checked={course.isHidden}
                    onChange={(v) => updateCourseField("isHidden", v)}
                    label=""
                  />
                </div>
              </div>
            </SectionCard>

            {/* Danger Zone */}
            <SectionCard className="overflow-hidden border-red-100">
              <div className="bg-red-50/50 px-6 py-4 border-b border-red-100">
                <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  منطقة الخطر
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">حذف الكورس نهائيًا</p>
                    <p className="text-xs text-slate-400 mt-0.5">لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع البيانات المرتبطة.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-95"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    حذف الكورس
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
}

import { useEffect, useState, type ReactElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InstructorLayout from "../../layouts/InstructorLayout";
import { supabase } from "../../lib/supabase";
import { uploadToR2 } from "@/lib/r2";
// ============================================================
// TYPES & INTERFACES
// ============================================================

type ItemType = "video" | "pdf" | "quiz" | "homework";

interface VideoItem {
  type: "video";
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  duration: string;
  freePreview: boolean;
  allowDownload: boolean;
  uploadProgress: number;
  uploadedBytes: number;
  totalBytes: number;
  status: "idle" | "uploading" | "done" | "error";
  videoUrl: string;
thumbnailUrl: string;
storagePath: string;
file?: File;
}

interface PdfItem {
  type: "pdf";
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  allowDownload: boolean;
  uploadProgress: number;
  uploadedBytes: number;
  totalBytes: number;
  status: "idle" | "uploading" | "done" | "error";
  pdfUrl: string;
storagePath: string;
file?: File;
}

interface Question {
  id: string;
  title: string;
questionType: "multiple_choice" | "true_false" | "essay";  choices: string[];
  correctAnswer: number;
  points: number;
}

interface QuizItem {
  type: "quiz";
  id: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  attempts: number;
  visibility: "public" | "private";
  published: boolean;
  questions: Question[];
}

interface HomeworkItem {
  type: "homework";
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalScore: number;
  allowLateSubmission: boolean;
  instructionsFile: string;
  instructionsFileName: string;
  submissionTypes: ("text" | "pdf" | "image" | "multiple_files")[];
  visibility: "public" | "private";
  published: boolean;
  attachmentFile?: File;
}

type CourseItem = VideoItem | PdfItem | QuizItem | HomeworkItem;

interface Section {
  id: string;
  title: string;
  collapsed: boolean;
  items: CourseItem[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  thumbnailUrl: string;
  grade: string;
  published: boolean;
  hidden: boolean;
  sections: Section[];
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}



function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 بايت";
  const k = 1024;
  const sizes = ["بايت", "كيلوبايت", "ميغابايت", "غيغابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getVideoDuration(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);

      const totalSeconds = Math.floor(video.duration);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      resolve(formatted);
    };

    video.onerror = () => {
      resolve("");
    };

    video.src = URL.createObjectURL(file);
  });
}

function createDefaultVideo(): VideoItem {
  return {
    type: "video",
    id: generateId(),
    title: "درس فيديو جديد",
    description: "",
    fileName: "",
    fileSize: 0,
    duration: "",
    freePreview: false,
    allowDownload: false,
    uploadProgress: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    status: "idle",
    videoUrl: "",
thumbnailUrl: "",
storagePath: "",
  };
}

function createDefaultPdf(): PdfItem {
  return {
    type: "pdf",
    id: generateId(),
    title: "ملف PDF جديد",
    fileName: "",
    fileSize: 0,
    allowDownload: true,
    uploadProgress: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    status: "idle",
    pdfUrl: "",
storagePath: "",
  };
}

function createDefaultQuestion(): Question {
  return {
    id: generateId(),
    title: "",
    questionType: "multiple_choice",
    choices: ["", "", "", ""],
    correctAnswer: 0,
    points: 1,
  };
}

function createDefaultQuiz(): QuizItem {
  return {
    type: "quiz",
    id: generateId(),
    title: "اختبار جديد",
    description: "",
    duration: 30,
    passingScore: 60,
    attempts: 3,
    visibility: "public",
    published: false,
    questions: [createDefaultQuestion()],
  };
}

function createDefaultHomework(): HomeworkItem {
  return {
    type: "homework",
    id: generateId(),
    title: "واجب منزلي جديد",
    description: "",
    dueDate: "",
    totalScore: 100,
    allowLateSubmission: false,
    instructionsFile: "",
    instructionsFileName: "",
    submissionTypes: ["text"],
    visibility: "public",
    published: false,
  };
}

// ============================================================
// EXPORT COMPONENT
// ============================================================

export function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "settings">("content");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [openDropdownSectionId, setOpenDropdownSectionId] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});
  // ── Load Course ──────────────────────────────────────────
  async function loadCourse() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (supabaseError) throw supabaseError;


      // تحميل الأقسام
const { data: sectionsData, error: sectionsError } = await supabase
  .from("course_sections")
  .select("*")
  .eq("course_id", id)
  .order("sort_order", { ascending: true });

if (sectionsError) throw sectionsError;

// تحميل عناصر الأقسام
const sectionIds = (sectionsData || []).map((section) => section.id);

const { data: itemsData, error: itemsError } = await supabase
  .from("course_items")
  .select("*")
  .in("section_id", sectionIds.length ? sectionIds : ["00000000-0000-0000-0000-000000000000"])
  .order("sort_order", { ascending: true });

if (itemsError) throw itemsError;

const { data: examsData, error: examsError } = await supabase
  .from("exams")
  .select("*");

if (examsError) throw examsError;

const { data: questionsData, error: questionsError } = await supabase
  .from("exam_questions")
  .select("*");

if (questionsError) throw questionsError;

const { data: choicesData, error: choicesError } = await supabase
  .from("question_choices")
  .select("*");

if (choicesError) throw choicesError;

const { data: homeworksData, error: homeworksError } = await supabase
  .from("homeworks")
  .select("*");

if (homeworksError) throw homeworksError;

const loadedCourse: Course = {
  id: data.id,
  title: data.title || "",
  description: data.description || "",
  price: data.price || 0,
  isFree: data.is_free || false,

  thumbnailUrl: data.thumbnail || "",

  grade: data.grade || "",
  published: data.is_published || false,
  hidden: data.is_hidden || false,

  sections: (sectionsData || []).map((section) => ({
    id: section.id,
    title: section.title,
    collapsed: false,
    items: (itemsData || [])
      .filter((item) => item.section_id === section.id)
      .map((item) => {
        switch (item.type) {
case "video":
  return {
    type: "video",
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    fileName: "",
    fileSize: item.file_size || 0,
    duration: item.duration || "",
    freePreview: item.is_preview || false,
    allowDownload: item.allow_download || false,
    uploadProgress: 100,
    uploadedBytes: item.file_size || 0,
    totalBytes: item.file_size || 0,
    status: "done",
    videoUrl: item.url || "",
    thumbnailUrl: item.thumbnail || "",
    storagePath: item.storage_path || "",
  };

case "pdf":
  return {
    type: "pdf",
    id: item.id,
    title: item.title || "",
    fileName: "",
    fileSize: item.file_size || 0,
    allowDownload: item.allow_download || false,
    uploadProgress: 100,
    uploadedBytes: item.file_size || 0,
    totalBytes: item.file_size || 0,
    status: "done",
    pdfUrl: item.url || "",
    storagePath: item.storage_path || "",
  };

  case "quiz": {
    const exam = (examsData || []).find(
      (e) => e.course_item_id === item.id
    );

    const questions = (questionsData || [])
      .filter((q) => q.exam_id === exam?.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((q) => ({
        id: String(q.id),
        title: q.title || "",
        questionType:
          q.type === "true_false"
            ? "true_false"
            : "multiple_choice",
        correctAnswer: Number(q.correct_answer || 0),
        points: q.points || 1,
        choices: (choicesData || [])
          .filter((c) => c.question_id === q.id)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((c) => c.text),
      }));

    return {
      type: "quiz",
      id: item.id,
      title: item.title,
      description: exam?.description || "",
      duration: exam?.duration || 30,
      passingScore: exam?.passing_grade || 60,
      attempts: exam?.max_attempts || 1,
      visibility: exam?.is_visible ? "public" : "private",
      published: exam?.is_published || false,
      questions,
    };
  }

  case "homework": {
    const hw = (homeworksData || []).find(
      (h) => h.course_item_id === item.id
    );

    return {
      type: "homework",
      id: item.id,
      title: item.title,
      description: hw?.description || "",
      dueDate: hw?.due_date || "",
      totalScore: hw?.total_score || 100,
      allowLateSubmission: hw?.allow_late_submission || false,
      instructionsFile: hw?.attachment_pdf || "",
      instructionsFileName: "",
      submissionTypes: hw?.allowed_types || ["text"],
      visibility: "public",
      published: hw?.is_published || false,
    };
  }

  default:
    return null;
}
  

    })
    .filter(Boolean),
})),
      };
                  
      setCourse(loadedCourse);
      if (data.thumbnail)
    setThumbnailPreview(data.thumbnail);
    } catch {
      setError("حدث خطأ أثناء تحميل بيانات الدورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Save Course ──────────────────────────────────────────
async function saveCourse() {
  if (!course) return;

  setSaving(true);
  setSaveSuccess(false);

  try {
    const { error } =
await supabase
  .from("courses")
  .update({
  title: course.title,
  description: course.description,
  price: course.isFree ? 0 : course.price,
  is_free: course.isFree,
  grade: course.grade,

  thumbnail: course.thumbnailUrl,

  is_published: course.published,
  is_hidden: course.hidden,
  updated_at: new Date().toISOString(),
})

      .eq("id", course.id);

    if (error) throw error;

    // =============================
// Save Sections
// =============================
for (let i = 0; i < course.sections.length; i++) {
  const section = course.sections[i];

  // Section جديدة
  if (section.id.length < 30) {
    const { data: newSection, error } = await supabase
      .from("course_sections")
      .insert({
        course_id: course.id,
        title: section.title,
        sort_order: i + 1,
      })
      .select()
      .single();

    if (error) throw error;

    // تحديث الـ id داخل الـ state
    section.id = newSection.id;
  }

  // Section موجودة
  else {
    const { error } = await supabase
      .from("course_sections")
      .update({
        title: section.title,
        sort_order: i + 1,
      })
      .eq("id", section.id);

    if (error) throw error;
  }
}


// =============================
// Delete Removed Sections
// =============================
const { data: dbSections, error: sectionsError } = await supabase
  .from("course_sections")
  .select("id")
  .eq("course_id", course.id);

if (sectionsError) throw sectionsError;

const currentIds = course.sections.map((s) => s.id);

const deletedIds =
  (dbSections || [])
    .filter((s) => !currentIds.includes(s.id))
    .map((s) => s.id);

if (deletedIds.length) {
  const { error } = await supabase
    .from("course_sections")
    .delete()
    .in("id", deletedIds);

  if (error) throw error;
}

// =============================
// Save Course Items
// =============================
for (const section of course.sections) {
  for (let i = 0; i < section.items.length; i++) {
    const item = section.items[i];

    const payload: any = {
      section_id: section.id,
      type: item.type,
      title: item.title,
      sort_order: i + 1,
    };

    // ==========================
    // Video
    // ==========================
    if (item.type === "video") {
Object.assign(payload,{
    description: item.description || "",

    url: item.videoUrl || "",
    storage_path: item.storagePath || "",
    thumbnail: item.thumbnailUrl || "",

    duration: Number(item.duration) || 0,
    file_size: item.fileSize || 0,

    is_preview: item.freePreview,
    allow_download: item.allowDownload,
});
    }

    // ==========================
    // PDF
    // ==========================
    if (item.type === "pdf") {

      Object.assign(payload, {
        url: item.pdfUrl || "",
        storage_path: item.storagePath || "",
        file_size: item.fileSize || 0,
        allow_download: item.allowDownload,
      });
    }

    // ==========================
    // Save Course Item
    // ==========================
    if (item.id.length < 30) {
      const { data: newItem, error } = await supabase
        .from("course_items")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      item.id = newItem.id;
    } else {
      const { error } = await supabase
        .from("course_items")
        .update(payload)
        .eq("id", item.id);

      if (error) throw error;
    }

       // ==========================
    // Quiz
    // ==========================
    if (item.type === "quiz") {
      const examPayload = {
        title: item.title,
        description: item.description || "",
        duration: Number(item.duration) || 30,
        passing_grade: Number(item.passingScore) || 60,
        max_attempts: Number(item.attempts) || 1,
        total_score: item.questions.reduce(
          (sum, q) => sum + (Number(q.points) || 0),
          0
        ),
        is_visible: item.visibility === "public",
        is_published: item.published,
        course_item_id: item.id,
      };

      let examId: number;

      const { data: existingExam } = await supabase
        .from("exams")
        .select("id")
        .eq("course_item_id", item.id)
        .maybeSingle();

      if (!existingExam) {
        const { data: newExam, error } = await supabase
          .from("exams")
          .insert(examPayload)
          .select()
          .single();

        if (error) throw error;

        examId = newExam.id;
      } else {
        examId = existingExam.id;

        const { error } = await supabase
          .from("exams")
          .update(examPayload)
          .eq("id", examId);

        if (error) throw error;
      }

      // حذف الأسئلة القديمة
      const { data: oldQuestions } = await supabase
        .from("exam_questions")
        .select("id")
        .eq("exam_id", examId);

      if (oldQuestions?.length) {
        await supabase
          .from("question_choices")
          .delete()
          .in(
            "question_id",
            oldQuestions.map((q) => q.id)
          );

        await supabase
          .from("exam_questions")
          .delete()
          .eq("exam_id", examId);
      }

for (let qIndex = 0; qIndex < item.questions.length; qIndex++) {
  const question = item.questions[qIndex];

  const isEssay = question.questionType === "essay";

  const { data: newQuestion, error } = await supabase
    .from("exam_questions")
    .insert({
      exam_id: examId,
      title: question.title,
      type: isEssay
        ? "essay"
        : question.questionType === "true_false"
        ? "true_false"
        : "multiple_choice",
      points: Number(question.points) || 1,
      sort_order: qIndex + 1,

      // للمقالي احفظ الإجابة النموذجية
correct_answer: isEssay
  ? ((question as any).correctText || "")
  : question.correctAnswer,
    })
    .select()
    .single();

  if (error) throw error;

  // السؤال المقالي ملوش اختيارات
  if (isEssay) continue;

  for (let cIndex = 0; cIndex < question.choices.length; cIndex++) {
    const { error } = await supabase
      .from("question_choices")
      .insert({
        question_id: newQuestion.id,
        text: question.choices[cIndex],
        sort_order: cIndex + 1,
      });

    if (error) throw error;
  }
}
    }

    // ==========================
    // Homework
    // ==========================
    if (item.type === "homework") {
      const homeworkPayload = {
        title: item.title,
        description: item.description || "",
        course_id: course.id,
        section_id: section.id,
        due_date: item.dueDate || null,
        total_score: Number(item.totalScore) || 100,
        allow_late_submission: item.allowLateSubmission,
        is_published: item.published,
        attachment_pdf: item.instructionsFile || null,
        attachment_image: null,
        allowed_types: item.submissionTypes,
        sort_order: i + 1,
        course_item_id: item.id,
      };

      const { data: existingHomework } = await supabase
        .from("homeworks")
        .select("id")
        .eq("course_item_id", item.id)
        .maybeSingle();

      if (!existingHomework) {
        const { error } = await supabase
          .from("homeworks")
          .insert(homeworkPayload);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("homeworks")
          .update(homeworkPayload)
          .eq("id", existingHomework.id);

        if (error) throw error;
      }
    }
  }
}


// =============================
// Delete Removed Course Items
// =============================
const { data: dbItems, error: itemsError } = await supabase
  .from("course_items")
  .select("id")
  .in(
    "section_id",
    course.sections.map((s) => s.id)
  );

if (itemsError) throw itemsError;

  
const currentItemIds = course.sections.flatMap((section) =>
  section.items
    .filter((item) => item.id.length >= 30) // العناصر المحفوظة فقط
    .map((item) => item.id)
);

const deletedItemIds = (dbItems || [])
  .filter((item) => !currentItemIds.includes(item.id))
  .map((item) => item.id);

if (deletedItemIds.length > 0) {
  // حذف بيانات الامتحان المرتبط (لو العنصر المحذوف كان اختبار)
  const { data: examsToDelete } = await supabase
    .from("exams")
    .select("id")
    .in("course_item_id", deletedItemIds);

  const examIdsToDelete = (examsToDelete || []).map((e) => e.id);

  if (examIdsToDelete.length > 0) {
    const { data: questionsToDelete } = await supabase
      .from("exam_questions")
      .select("id")
      .in("exam_id", examIdsToDelete);

    const questionIdsToDelete = (questionsToDelete || []).map((q) => q.id);

    if (questionIdsToDelete.length > 0) {
      await supabase
        .from("question_choices")
        .delete()
        .in("question_id", questionIdsToDelete);

      await supabase
        .from("exam_questions")
        .delete()
        .in("id", questionIdsToDelete);
    }

    await supabase
      .from("exam_results")
      .delete()
      .in("exam_id", examIdsToDelete);

    await supabase
      .from("exams")
      .delete()
      .in("id", examIdsToDelete);
  }

  // حذف بيانات الواجب المرتبط (لو العنصر المحذوف كان واجب)
  await supabase
    .from("homeworks")
    .delete()
    .in("course_item_id", deletedItemIds);

  const { error } = await supabase
    .from("course_items")
    .delete()
    .in("id", deletedItemIds);

  if (error) throw error;
}

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  } catch (err: any) {


  alert(err?.message || "حدث خطأ أثناء حفظ الدورة");
} finally {
    setSaving(false);
  }
}



  // ── Delete Course ────────────────────────────────────────
  async function deleteCourse() {
    if (!course) return;
    
    try {
      // Placeholder: ready for Supabase integration
      // await supabase.from("courses").delete().eq("id", course.id);
      navigate("/instructor/courses");
    } catch {
      // handle error
    }
  }

  // ── Course Field Updates ─────────────────────────────────
  function updateCourseField<K extends keyof Course>(field: K, value: Course[K]) {
    setCourse((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  // ── Thumbnail ────────────────────────────────────────────
async function handleThumbnailChange(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];
  if (!file || !course) return;

  setThumbnailFile(file);

  try {
    const data = await uploadToR2(file, "course-thumbnails");

    setThumbnailPreview(data.url);

    updateCourseField("thumbnailUrl", data.url);

    (course as any).thumbnailPath = data.key;
  } catch (err) {
    console.error(err);
    alert("فشل رفع الصورة");
  }
}

  // ── Sections ─────────────────────────────────────────────
  function addSection() {
    const newSection: Section = {
      id: generateId(),
      title: "قسم جديد",
      collapsed: false,
      items: [],
    };
    setCourse((prev) =>
      prev ? { ...prev, sections: [...prev.sections, newSection] } : prev
    );
  }

  function removeSection(sectionId: string) {
    setCourse((prev) =>
      prev
        ? { ...prev, sections: prev.sections.filter((s) => s.id !== sectionId) }
        : prev
    );
  }

  function renameSection(sectionId: string, newTitle: string) {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId ? { ...s, title: newTitle } : s
            ),
          }
        : prev
    );
  }

  function toggleCollapseSection(sectionId: string) {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s
            ),
          }
        : prev
    );
  }

  function moveSectionUp(index: number) {
    if (index === 0) return;
    setCourse((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
      return { ...prev, sections };
    });
  }

  function moveSectionDown(index: number) {
    setCourse((prev) => {
      if (!prev) return prev;
      if (index === prev.sections.length - 1) return prev;
      const sections = [...prev.sections];
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      return { ...prev, sections };
    });
  }

  // ── Items ────────────────────────────────────────────────
  function addItem(sectionId: string, itemType: ItemType) {
    let newItem: CourseItem;
    switch (itemType) {
      case "video":
        newItem = createDefaultVideo();
        break;
      case "pdf":
        newItem = createDefaultPdf();
        break;
      case "quiz":
        newItem = createDefaultQuiz();
        break;
      case "homework":
        newItem = createDefaultHomework();
        break;
    }
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
            ),
          }
        : prev
    );
    setOpenDropdownSectionId(null);
  }

  function removeItem(sectionId: string, itemId: string) {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
                : s
            ),
          }
        : prev
    );
  }

  function moveItem(sectionId: string, itemIndex: number, direction: "up" | "down") {
    setCourse((prev) => {
      if (!prev) return prev;
      const sections = prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...s.items];
        if (direction === "up" && itemIndex > 0) {
          [items[itemIndex - 1], items[itemIndex]] = [items[itemIndex], items[itemIndex - 1]];
        } else if (direction === "down" && itemIndex < items.length - 1) {
          [items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]];
        }
        return { ...s, items };
      });
      return { ...prev, sections };
    });
  }

  function toggleItemCollapse(itemId: string) {
  setCollapsedItems((prev) => ({
    ...prev,
    [itemId]: !prev[itemId],
  }));
}

  function updateItem(sectionId: string, itemId: string, updates: Partial<CourseItem>) {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((item) =>
                      item.id === itemId ? ({ ...item, ...updates } as CourseItem) : item
                    ),
                  }
                : s
            ),
          }
        : prev
    );
  }

// ── Video Upload ─────────────────────────────────────────
async function uploadVideo(
  sectionId: string,
  itemId: string,
  file: File
) {
  if (!course) return;

  // ── حساب مدة الفيديو تلقائيًا من الملف نفسه ──
  const autoDuration = await getVideoDuration(file);

setCourse((prev) => {
    if (!prev) return prev;

    return {
      ...prev,
      sections: prev.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id !== itemId || item.type !== "video") return item;

          return {
            ...item,
            fileName: file.name,
            fileSize: file.size,
            duration: autoDuration || item.duration,
            status: "uploading",
            uploadProgress: 0,
            uploadedBytes: 0,
            totalBytes: file.size,
          } as VideoItem;
        }),
      })),
    };
  });

  try {
    const data = await uploadToR2(
      file,
      `course-videos/${course.id}/${sectionId}`,
      (loadedBytes, totalBytes) => {
        const percent = Math.round((loadedBytes / totalBytes) * 100);

        setCourse((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            sections: prev.sections.map((section) => ({
              ...section,
              items: section.items.map((item) => {
                if (item.id !== itemId || item.type !== "video") return item;

                return {
                  ...item,
                  uploadProgress: percent,
                  uploadedBytes: loadedBytes,
                  totalBytes: totalBytes,
                };
              }),
            })),
          };
        });
      }
    );

    setCourse((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id !== itemId) return item;

            return {
              ...item,
              videoUrl: data.url,
              storagePath: data.key,
              fileName: file.name,
              fileSize: file.size,
              uploadProgress: 100,
              uploadedBytes: file.size,
              totalBytes: file.size,
              status: "done",
            };
          }),
        })),
      };
    });
  } catch (err: any) {
    setCourse((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id !== itemId) return item;

            return {
              ...item,
              status: "error",
              uploadProgress: 0,
              uploadedBytes: 0,
            };
          }),
        })),
      };
    });

    console.error("Video Upload Error:", err);
    alert("فشل رفع الفيديو: " + (err?.message || "خطأ غير معروف"));
  }
}

  // ── PDF Upload ───────────────────────────────────────────
async function uploadPdf(
  sectionId: string,
  itemId: string,
  file: File
) {
  if (!course) return;

  setCourse((prev) => {
    if (!prev) return prev;

    return {
      ...prev,
      sections: prev.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id !== itemId) return item;

          return {
            ...item,
            fileName: file.name,
            fileSize: file.size,
            status: "uploading",
            uploadProgress: 0,
            uploadedBytes: 0,
            totalBytes: file.size,
          };
        }),
      })),
    };
  });

  try {
    const data = await uploadToR2(
      file,
      `course-videos/${course.id}/${sectionId}`,
      (loadedBytes, totalBytes) => {
        const percent = Math.round((loadedBytes / totalBytes) * 100);

        setCourse((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            sections: prev.sections.map((section) => ({
              ...section,
              items: section.items.map((item) => {
                if (item.id !== itemId || item.type !== "pdf") return item;

                return {
                  ...item,
                  uploadProgress: percent,
                  uploadedBytes: loadedBytes,
                  totalBytes: totalBytes,
                };
              }),
            })),
          };
        });
      }
    );

    setCourse((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id !== itemId) return item;

            return {
              ...item,
              pdfUrl: data.url,
              storagePath: data.key,
              fileName: file.name,
              fileSize: file.size,
              uploadProgress: 100,
              uploadedBytes: file.size,
              totalBytes: file.size,
              status: "done",
            };
          }),
        })),
      };
    });
  } catch (err: any) {
    setCourse((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id !== itemId) return item;

            return {
              ...item,
              status: "error",
              uploadProgress: 0,
              uploadedBytes: 0,
            };
          }),
        })),
      };
    });

    console.error("PDF Upload Error:", err);
    alert("فشل رفع الملف: " + (err?.message || "خطأ غير معروف"));
  }
}


  // ── Quiz Helpers ─────────────────────────────────────────
  function addQuestion(sectionId: string, quizId: string) {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((item) =>
                      item.id === quizId && item.type === "quiz"
                        ? {
                            ...item,
                            questions: [...item.questions, createDefaultQuestion()],
                          }
                        : item
                    ),
                  }
                : s
            ),
          }
        : prev
    );
  }

  function removeQuestion(sectionId: string, quizId: string, questionId: string) {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((item) =>
                      item.id === quizId && item.type === "quiz"
                        ? {
                            ...item,
                            questions: item.questions.filter((q) => q.id !== questionId),
                          }
                        : item
                    ),
                  }
                : s
            ),
          }
        : prev
    );
  }

  function updateQuestion(
    sectionId: string,
    quizId: string,
    questionId: string,
    updates: Partial<Question>
  ) {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((item) =>
                      item.id === quizId && item.type === "quiz"
                        ? {
                            ...item,
                            questions: item.questions.map((q) =>
                              q.id === questionId ? { ...q, ...updates } : q
                            ),
                          }
                        : item
                    ),
                  }
                : s
            ),
          }
        : prev
    );
  }

  function moveQuestion(
    sectionId: string,
    quizId: string,
    qIndex: number,
    direction: "up" | "down"
  ) {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((item) => {
                      if (item.id !== quizId || item.type !== "quiz") return item;
                      const questions = [...item.questions];
                      if (direction === "up" && qIndex > 0) {
                        [questions[qIndex - 1], questions[qIndex]] = [
                          questions[qIndex],
                          questions[qIndex - 1],
                        ];
                      } else if (direction === "down" && qIndex < questions.length - 1) {
                        [questions[qIndex], questions[qIndex + 1]] = [
                          questions[qIndex + 1],
                          questions[qIndex],
                        ];
                      }
                      return { ...item, questions };
                    }),
                  }
                : s
            ),
          }
        : prev
    );
  }

  // ── Homework helpers ────────────────────────────────────
  function toggleSubmissionType(
    sectionId: string,
    hwId: string,
    type: HomeworkItem["submissionTypes"][number]
  ) {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((item) => {
                      if (item.id !== hwId || item.type !== "homework") return item;
                      const exists = item.submissionTypes.includes(type);
                      const submissionTypes = exists
                        ? item.submissionTypes.filter((t) => t !== type)
                        : [...item.submissionTypes, type];
                      return { ...item, submissionTypes };
                    }),
                  }
                : s
            ),
          }
        : prev
    );
  }

  // ── UI Close Dropdown on outside click ──────────────────
  function handleBackdropClick() {
    setOpenDropdownSectionId(null);
  }

  // ── Render Item Badge ────────────────────────────────────
  function renderItemTypeBadge(type: ItemType) {
    const config = {
      video: {
        label: "فيديو",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        ),
      },
      pdf: {
        label: "PDF",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      quiz: {
        label: "اختبار",
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
      homework: {
        label: "واجب",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
      },
    };
    const c = config[type];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
        {c.icon}
        {c.label}
      </span>
    );
  }

  // ── Render Video Item ────────────────────────────────────
  function renderVideoItem(sectionId: string,  item: VideoItem, itemIndex: number, totalItems: number)  {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-blue-50 to-transparent border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div>
              {renderItemTypeBadge("video")}
            </div>
          </div>
          <div className="flex items-center gap-1">

            <button
  type="button"
  onClick={() => toggleItemCollapse(item.id)}
  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
  title="إظهار / إخفاء"
>
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${
      collapsedItems[item.id] ? "" : "rotate-180"
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    />
  </svg>
</button>

            <button
              onClick={() => moveItem(sectionId, itemIndex, "up")}
              disabled={itemIndex === 0}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="تحريك لأعلى"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button
              onClick={() => moveItem(sectionId, itemIndex, "down")}
              disabled={itemIndex === totalItems - 1}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="تحريك لأسفل"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button
              onClick={() => removeItem(sectionId, item.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="حذف"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        {/* Body */}
        {!collapsedItems[item.id] && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان الفيديو</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(sectionId, item.id, { title: e.target.value } as Partial<VideoItem>)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm"
                placeholder="أدخل عنوان الفيديو"
              />
            </div>
<div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">الوصف</label>
              <textarea
                value={item.description}
                onChange={(e) => updateItem(sectionId, item.id, { description: e.target.value } as Partial<VideoItem>)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm resize-none"
                placeholder="وصف مختصر للفيديو"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">مدة الفيديو</label>
              <input
                type="text"
                value={item.duration}
                onChange={(e) => updateItem(sectionId, item.id, { duration: e.target.value } as Partial<VideoItem>)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm"
                placeholder="مثال: 15:30 أو 15 دقيقة"
              />
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">رفع الفيديو</label>
            {item.status === "idle" || item.status === "error" ? (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all group">
                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium">اسحب الفيديو هنا أو انقر للرفع</span>
                  <span className="text-xs text-slate-400">MP4, MOV, AVI — حجم أقصى 2GB</span>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadVideo(sectionId, item.id, file);
                  }}
                />
              </label>
            ) : item.status === "uploading" ? (
  <div className="w-full p-5 border border-blue-200 rounded-2xl bg-blue-50 space-y-3">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-blue-700 font-medium">
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        جاري الرفع...
      </div>
      <span className="text-blue-600 font-bold">{item.uploadProgress}%</span>
    </div>
    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-200"
        style={{ width: `${item.uploadProgress}%` }}
      />
    </div>
    <div className="flex items-center justify-between text-xs text-blue-600">
      <span className="truncate">{item.fileName}</span>
      <span className="flex-shrink-0 mr-2 font-medium">
        {formatFileSize(item.uploadedBytes)} / {formatFileSize(item.totalBytes)}
      </span>
    </div>
    <p className="text-xs text-blue-500">
      متبقي: {formatFileSize(item.totalBytes - item.uploadedBytes)}
    </p>
  </div>
) : (
              <div className="w-full p-4 border border-emerald-200 rounded-2xl bg-emerald-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-800 truncate">{item.fileName}</p>
                  <p className="text-xs text-emerald-600">{formatFileSize(item.fileSize)}</p>
                </div>
                <label className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer underline underline-offset-2 font-medium">
                  تغيير
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadVideo(sectionId, item.id, file);
                  }} />
                </label>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => updateItem(sectionId, item.id, { freePreview: !item.freePreview } as Partial<VideoItem>)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${item.freePreview ? "bg-blue-600" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${item.freePreview ? "-translate-x-5" : "translate-x-0"}`} />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">معاينة مجانية</span>
            </label>
            
          </div>
        </div>
        )}
      </div>
    );
  }

 // ── Render PDF Item ──────────────────────────────────────
  function renderPdfItem(sectionId: string, item: PdfItem, itemIndex: number, totalItems: number) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-rose-50 to-transparent border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            {renderItemTypeBadge("pdf")}
          </div>
          <div className="flex items-center gap-1">
            <button
  type="button"
  onClick={() => toggleItemCollapse(item.id)}
  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
  title="إظهار / إخفاء"
>
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${
      collapsedItems[item.id] ? "" : "rotate-180"
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    />
  </svg>
</button>
            <button onClick={() => moveItem(sectionId, itemIndex, "up")} disabled={itemIndex === 0} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button onClick={() => moveItem(sectionId, itemIndex, "down")} disabled={itemIndex === totalItems - 1} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button onClick={() => removeItem(sectionId, item.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        {!collapsedItems[item.id] && (

<div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان الملف</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(sectionId, item.id, { title: e.target.value } as Partial<PdfItem>)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm"
              placeholder="أدخل عنوان الملف"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">رفع ملف PDF</label>
            {item.status === "idle" || item.status === "error" ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-rose-50 hover:border-rose-400 transition-all group">
                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-rose-500 transition-colors">
                  <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span className="text-sm font-medium">اسحب ملف PDF هنا أو انقر للرفع</span>
                </div>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPdf(sectionId, item.id, file);
                }} />
              </label>
) : item.status === "uploading" ? (
  <div className="w-full p-5 border border-rose-200 rounded-2xl bg-rose-50 space-y-3">
    <div className="flex items-center justify-between text-sm">
      <span className="text-rose-700 font-medium">جاري الرفع...</span>
      <span className="text-rose-600 font-bold">{item.uploadProgress}%</span>
    </div>
    <div className="w-full bg-rose-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-rose-600 h-2 rounded-full transition-all duration-200"
        style={{ width: `${item.uploadProgress}%` }}
      />
    </div>
    <div className="flex items-center justify-between text-xs text-rose-600">
      <span className="truncate">{item.fileName}</span>
      <span className="flex-shrink-0 mr-2 font-medium">
        {formatFileSize(item.uploadedBytes)} / {formatFileSize(item.totalBytes)}
      </span>
    </div>
    <p className="text-xs text-rose-500">
      متبقي: {formatFileSize(item.totalBytes - item.uploadedBytes)}
    </p>
  </div>
) : (
              <div className="w-full p-4 border border-emerald-200 rounded-2xl bg-emerald-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-800 truncate">{item.fileName}</p>
                  <p className="text-xs text-emerald-600">{formatFileSize(item.fileSize)}</p>
                </div>
                <label className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer underline underline-offset-2 font-medium">
                  تغيير
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPdf(sectionId, item.id, file);
                  }} />
                </label>
              </div>
            )}
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => updateItem(sectionId, item.id, { allowDownload: !item.allowDownload } as Partial<PdfItem>)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${item.allowDownload ? "bg-rose-500" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${item.allowDownload ? "-translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">السماح بتحميل الملف</span>
          </label>
        </div>
        )}
      </div>
      
    );
  }

  // ── Render Quiz Item ─────────────────────────────────────
  function renderQuizItem(sectionId: string, item: QuizItem, itemIndex: number, totalItems: number) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-violet-50 to-transparent border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            {renderItemTypeBadge("quiz")}
          </div>
          <div className="flex items-center gap-1">
            <button
  type="button"
  onClick={() => toggleItemCollapse(item.id)}
  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
  title="إظهار / إخفاء"
>
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${
      collapsedItems[item.id] ? "" : "rotate-180"
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    />
  </svg>
</button>
            <button onClick={() => moveItem(sectionId, itemIndex, "up")} disabled={itemIndex === 0} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button onClick={() => moveItem(sectionId, itemIndex, "down")} disabled={itemIndex === totalItems - 1} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button onClick={() => removeItem(sectionId, item.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        {!collapsedItems[item.id] && (

<div className="p-5 space-y-5">
          {/* Quiz Meta */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان الاختبار</label>
              <input type="text" value={item.title} onChange={(e) => updateItem(sectionId, item.id, { title: e.target.value } as Partial<QuizItem>)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm" placeholder="عنوان الاختبار" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">الوصف</label>
              <textarea value={item.description} onChange={(e) => updateItem(sectionId, item.id, { description: e.target.value } as Partial<QuizItem>)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm resize-none" placeholder="وصف مختصر للاختبار" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">المدة (دقيقة)</label>
              <input type="number" min={1} value={item.duration} onChange={(e) => updateItem(sectionId, item.id, { duration: Number(e.target.value) } as Partial<QuizItem>)} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 bg-slate-50 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">عدد المحاولات</label>
              <input type="number" min={1} value={item.attempts} onChange={(e) => updateItem(sectionId, item.id, { attempts: Number(e.target.value) } as Partial<QuizItem>)} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 bg-slate-50 text-sm" />
            </div>
          </div>
         

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800">الأسئلة ({item.questions.length})</h4>
              <button
                onClick={() => addQuestion(sectionId, item.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                إضافة سؤال
              </button>
            </div>
            <div className="space-y-3">
              {item.questions.map((q, qIdx) => {
                const isExpanded = expandedQuestions[q.id] !== false;
                return (
                  <div key={q.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => setExpandedQuestions((prev) => ({ ...prev, [q.id]: !isExpanded }))}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {qIdx + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-700 truncate max-w-xs">
                          {q.title || "سؤال بدون عنوان"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500">
                          {q.questionType === "multiple_choice" ? "اختيار متعدد" : "صح/خطأ"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => moveQuestion(sectionId, item.id, qIdx, "up")} disabled={qIdx === 0} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button onClick={() => moveQuestion(sectionId, item.id, qIdx, "down")} disabled={qIdx === item.questions.length - 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <button onClick={() => removeQuestion(sectionId, item.id, q.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 bg-white border-t border-slate-100">
                        <div className="pt-3 grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">نص السؤال</label>
                            <textarea
                              value={q.title}
                              onChange={(e) => updateQuestion(sectionId, item.id, q.id, { title: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 bg-slate-50 text-sm resize-none"
                              placeholder="اكتب نص السؤال هنا..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">نوع السؤال</label>
                              <select
                                value={q.questionType}
                                onChange={(e) => {
  const newType = e.target.value as Question["questionType"];

  updateQuestion(sectionId, item.id, q.id, {
    questionType: newType,
    choices:
      newType === "essay"
        ? []
        : newType === "true_false"
        ? ["صح", "خطأ"]
        : ["", "", "", ""],
    correctAnswer: 0,
  });
}}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 bg-slate-50 text-sm"
                              >
                                <option value="multiple_choice">اختيار متعدد</option>
                                <option value="true_false">صح / خطأ</option>
                               
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">الدرجات</label>
                              <input type="number" min={1} value={q.points} onChange={(e) => updateQuestion(sectionId, item.id, q.id, { points: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 bg-slate-50 text-sm" />
                            </div>
                          </div>
             {true && (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-2">
      الخيارات والإجابة الصحيحة
    </label>

    <div className="space-y-2">
      {q.choices.map((choice, cIdx) => (
        <div key={cIdx} className="flex items-center gap-2">
          <button
            onClick={() =>
              updateQuestion(sectionId, item.id, q.id, {
                correctAnswer: cIdx,
              })
            }
            className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              q.correctAnswer === cIdx
                ? "border-emerald-500 bg-emerald-500"
                : "border-slate-300 hover:border-emerald-400"
            }`}
          >
            {q.correctAnswer === cIdx && (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>

          <input
            type="text"
            value={choice}
            disabled={q.questionType === "true_false"}
            onChange={(e) => {
              const newChoices = [...q.choices];
              newChoices[cIdx] = e.target.value;

              updateQuestion(sectionId, item.id, q.id, {
                choices: newChoices,
              });
            }}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 bg-slate-50 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder={`الخيار ${cIdx + 1}`}
          />
        </div>
      ))}
    </div>
  </div>
)}

{false && (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-2">
      الإجابة النموذجية (اختياري)
    </label>

    <textarea
      value={(q as any).correctText || ""}
      onChange={(e) =>
        updateQuestion(sectionId, item.id, q.id, {
          correctText: e.target.value,
        } as any)
      }
      rows={5}
      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 bg-slate-50 text-sm resize-none"
      placeholder="اكتب الإجابة النموذجية هنا..."
    />
  </div>
)}

</div>
</div>
)}
</div>

);
})}

{item.questions.length === 0 && (
  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
    <svg
      className="w-10 h-10 mx-auto mb-2 opacity-40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>

    <p className="text-sm font-medium">لا توجد أسئلة بعد</p>
  </div>
)}
              
              {item.questions.length === 0 && (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm font-medium">لا توجد أسئلة بعد</p>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    );
  }

  // ── Render Homework Item ─────────────────────────────────
  function renderHomeworkItem(sectionId: string, item: HomeworkItem, itemIndex: number, totalItems: number) {
    const submissionOptions: { key: HomeworkItem["submissionTypes"][number]; label: string; icon: ReactElement }[] = [
      {
        key: "text",
        label: "نص",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>,
      },
      {
        key: "pdf",
        label: "PDF",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      },
      {
        key: "image",
        label: "صورة",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      },
      {
        key: "multiple_files",
        label: "ملفات متعددة",
        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
      },
    ];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-amber-50 to-transparent border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            {renderItemTypeBadge("homework")}
          </div>
          <div className="flex items-center gap-1">
            <button
  type="button"
  onClick={() => toggleItemCollapse(item.id)}
  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
  title="إظهار / إخفاء"
>
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${
      collapsedItems[item.id] ? "" : "rotate-180"
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    />
  </svg>
</button>
            <button onClick={() => moveItem(sectionId, itemIndex, "up")} disabled={itemIndex === 0} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button onClick={() => moveItem(sectionId, itemIndex, "down")} disabled={itemIndex === totalItems - 1} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button onClick={() => removeItem(sectionId, item.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        {!collapsedItems[item.id] && (

<div className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان الواجب</label>
              <input type="text" value={item.title} onChange={(e) => updateItem(sectionId, item.id, { title: e.target.value } as Partial<HomeworkItem>)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm" placeholder="عنوان الواجب" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">التعليمات والوصف</label>
              <textarea value={item.description} onChange={(e) => updateItem(sectionId, item.id, { description: e.target.value } as Partial<HomeworkItem>)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm resize-none" placeholder="اكتب تعليمات الواجب هنا..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">الدرجة الكلية</label>
              <input type="number" min={1} value={item.totalScore} onChange={(e) => updateItem(sectionId, item.id, { totalScore: Number(e.target.value) } as Partial<HomeworkItem>)} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 bg-slate-50 text-sm" />
            </div>
          </div>

          {/* Submission Types */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">أنواع التسليم المسموح بها</label>
            <div className="flex flex-wrap gap-2">
              {submissionOptions.map((opt) => {
                const isSelected = item.submissionTypes.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleSubmissionType(sectionId, item.id, opt.key)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      isSelected
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Instructions */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">رفع ملف التعليمات (اختياري)</label>
            {item.instructionsFileName ? (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <span className="text-sm text-amber-800 flex-1 truncate">{item.instructionsFileName}</span>
                <button onClick={() => updateItem(sectionId, item.id, { instructionsFileName: "", instructionsFile: "" } as Partial<HomeworkItem>)} className="text-amber-500 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all group">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="text-sm text-slate-500 group-hover:text-amber-600 transition-colors">رفع ملف التعليمات (PDF أو صورة)</span>
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) updateItem(sectionId, item.id, { instructionsFileName: file.name, instructionsFile: file.name } as Partial<HomeworkItem>);
                }} />
              </label>
            )}
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
           
            
          </div>

        </div>
        )}
      </div>
    );
  }

  // ── Render Single Item ───────────────────────────────────
  function renderItem(sectionId: string, item: CourseItem, itemIndex: number, totalItems: number) {
    switch (item.type) {
      case "video":
        return renderVideoItem(sectionId, item, itemIndex, totalItems);
      case "pdf":
        return renderPdfItem(sectionId, item, itemIndex, totalItems);
      case "quiz":
        return renderQuizItem(sectionId, item, itemIndex, totalItems);
      case "homework":
        return renderHomeworkItem(sectionId, item, itemIndex, totalItems);
    }
  }

  // ── Render Section Card ──────────────────────────────────
  function renderSectionCard(section: Section, sectionIndex: number, totalSections: number) {
    const isDropdownOpen = openDropdownSectionId === section.id;
    return (
      <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible transition-all duration-200 hover:shadow-md">
        {/* Section Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-indigo-200 flex-shrink-0">
            {sectionIndex + 1}
          </div>
          <input
            type="text"
            value={section.title}
            onChange={(e) => renameSection(section.id, e.target.value)}
            className="flex-1 text-base font-bold text-slate-800 bg-transparent border-none outline-none focus:bg-slate-50 focus:px-2 focus:rounded-lg transition-all"
            placeholder="اسم القسم"
          />
          <div className="flex items-center gap-1 mr-auto">
            <button onClick={() => moveSectionUp(sectionIndex)} disabled={sectionIndex === 0} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="تحريك لأعلى">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button onClick={() => moveSectionDown(sectionIndex)} disabled={sectionIndex === totalSections - 1} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="تحريك لأسفل">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
           
            <button onClick={() => removeSection(section.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="حذف القسم">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        {/* Section Content */}
        {!section.collapsed && (
          <div className="p-5 space-y-4">
            {/* Items */}
            {section.items.length > 0 && (
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={item.id}>
                    {renderItem(section.id, item, itemIndex, section.items.length)}
                  </div>
                ))}
              </div>
            )}
            {section.items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm font-medium">لا يوجد محتوى في هذا القسم</p>
                <p className="text-xs mt-1 text-slate-400">انقر على "إضافة محتوى" لإضافة فيديو أو ملف أو اختبار</p>
              </div>
            )}

            {/* Add Item Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdownSectionId(isDropdownOpen ? null : section.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-indigo-300 text-indigo-600 font-semibold text-sm hover:border-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                إضافة محتوى
              </button>
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={handleBackdropClick} />
                  <div className="absolute bottom-full mb-2 right-0 left-0 z-20 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-2 space-y-1">
                      {[
                        {
                          type: "video" as ItemType,
                          label: "فيديو",
                          desc: "رفع درس فيديو",
                          color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
                          iconBg: "bg-blue-100",
                          icon: <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
                        },
                        {
                          type: "pdf" as ItemType,
                          label: "ملف PDF",
                          desc: "رفع مستند PDF",
                          color: "text-rose-600 bg-rose-50 hover:bg-rose-100",
                          iconBg: "bg-rose-100",
                          icon: <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
                        },
                        {
                          type: "quiz" as ItemType,
                          label: "اختبار",
                          desc: "إنشاء اختبار تفاعلي",
                          color: "text-violet-600 bg-violet-50 hover:bg-violet-100",
                          iconBg: "bg-violet-100",
                          icon: <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
                        },
                        {
                          type: "homework" as ItemType,
                          label: "واجب منزلي",
                          desc: "إضافة واجب للطلاب",
                          color: "text-amber-600 bg-amber-50 hover:bg-amber-100",
                          iconBg: "bg-amber-100",
                          icon: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
                        },
                      ].map((opt) => (
                        <button
                          key={opt.type}
                          onClick={() => addItem(section.id, opt.type)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${opt.color}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${opt.iconBg}`}>
                            {opt.icon}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{opt.label}</p>
                            <p className="text-xs opacity-70">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Render Content Tab ───────────────────────────────────
  function renderContentTab() {
    if (!course) return null;
    return (
      <div className="space-y-5">
        {course.sections.map((section, sectionIndex) => (
          <div key={section.id}>
            {renderSectionCard(section, sectionIndex, course.sections.length)}
          </div>
        ))}
        <button
          onClick={addSection}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          إضافة قسم جديد
        </button>
      </div>
    );
  }

  // ── Render Settings Tab ──────────────────────────────────
  function renderSettingsTab() {
    if (!course) return null;
    return (
      <div className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
            <h3 className="text-base font-bold text-slate-800">المعلومات الأساسية</h3>
            <p className="text-sm text-slate-500 mt-0.5">تعديل بيانات الدورة الرئيسية</p>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان الدورة</label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => updateCourseField("title", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors"
                placeholder="أدخل عنوان الدورة"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">وصف الدورة</label>
              <textarea
                value={course.description}
                onChange={(e) => updateCourseField("description", e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors resize-none"
                placeholder="اكتب وصفاً شاملاً للدورة..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">الصف الدراسي / المرحلة</label>
              <select
                value={course.grade}
                onChange={(e) => updateCourseField("grade", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50"
              >
                <option value="">اختر المرحلة الدراسية</option>
<option value="prep_1">الصف الأول الإعدادي</option>
<option value="prep_2">الصف الثاني الإعدادي</option>
<option value="prep_3">الصف الثالث الإعدادي</option>

<option value="sec_1">الصف الأول الثانوي</option>
<option value="sec_2">الصف الثاني الثانوي</option>
<option value="sec_3">الصف الثالث الثانوي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
            <h3 className="text-base font-bold text-slate-800">التسعير</h3>
            <p className="text-sm text-slate-500 mt-0.5">تحديد سعر الدورة أو جعلها مجانية</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-colors">
              <div>
                <p className="text-sm font-semibold text-slate-800">دورة مجانية</p>
                <p className="text-xs text-slate-500 mt-0.5">إتاحة الدورة مجاناً لجميع الطلاب</p>
              </div>
              <div
                onClick={() => updateCourseField("isFree", !course.isFree)}
                className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${course.isFree ? "bg-emerald-500" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${course.isFree ? "-translate-x-6" : "translate-x-0"}`} />
              </div>
            </div>
            {!course.isFree && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">السعر (بالجنيه المصري)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={course.price}
                    onChange={(e) => updateCourseField("price", Number(e.target.value))}
                    className="w-full pl-4 pr-16 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors"
                    placeholder="0"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">ج.م</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
            <h3 className="text-base font-bold text-slate-800">صورة الدورة</h3>
            <p className="text-sm text-slate-500 mt-0.5">الصورة المصغرة للدورة في القوائم</p>
          </div>
          <div className="p-6">
            <div className="flex gap-6 items-start">
              {thumbnailPreview ? (
                <div className="relative flex-shrink-0">
                  <img src={thumbnailPreview} alt="thumbnail" className="w-40 h-28 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                  <button
                    onClick={() => { setThumbnailPreview(""); setThumbnailFile(null); }}
                    className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <div className="w-40 h-28 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              <div className="flex-1 space-y-3">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
                  <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <span className="text-sm font-medium">{thumbnailPreview ? "تغيير الصورة" : "رفع صورة الدورة"}</span>
                    <span className="text-xs">PNG, JPG — الحجم الموصى به 1280×720</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                </label>
                {thumbnailFile && (
                  <p className="text-xs text-slate-500">تم اختيار: {thumbnailFile.name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
            <h3 className="text-base font-bold text-slate-800">حالة النشر والظهور</h3>
            <p className="text-sm text-slate-500 mt-0.5">التحكم في نشر الدورة وإخفائها</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-colors">
              <div>
                <p className="text-sm font-semibold text-slate-800">نشر الدورة</p>
                <p className="text-xs text-slate-500 mt-0.5">جعل الدورة متاحة للطلاب</p>
              </div>
              <div
                onClick={() => updateCourseField("published", !course.published)}
                className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${course.published ? "bg-indigo-600" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${course.published ? "-translate-x-6" : "translate-x-0"}`} />
              </div>
            </div>
           
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h3 className="text-base font-bold text-red-700">منطقة الخطر</h3>
            <p className="text-sm text-red-500 mt-0.5">الإجراءات التالية لا يمكن التراجع عنها</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">حذف الدورة نهائياً</p>
                <p className="text-xs text-slate-500 mt-0.5">سيتم حذف جميع محتويات الدورة بشكل دائم</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold text-sm border-2 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                حذف الدورة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading State ────────────────────────────────────────
  if (loading) {
    return (
      <InstructorLayout>
        <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700">جاري تحميل الدورة...</p>
              <p className="text-sm text-slate-400 mt-1">يرجى الانتظار</p>
            </div>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  // ── Error State ──────────────────────────────────────────
  if (error || !course) {
    return (
      <InstructorLayout>
        <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center max-w-md w-full space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">خطأ في التحميل</h2>
              <p className="text-sm text-slate-500 mt-2">{error || "الدورة غير موجودة"}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={loadCourse} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors">
                إعادة المحاولة
              </button>
              <button onClick={() => navigate("/instructor/courses")} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">
                العودة للدورات
              </button>
            </div>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  // ── MAIN RENDER ──────────────────────────────────────────
  return (
    <InstructorLayout>
      <div dir="rtl" className="min-h-screen bg-slate-50">

        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200 flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-slate-900 truncate">{course.title || "بدون عنوان"}</h1>
                  <p className="text-xs text-slate-500">تعديل محتوى وإعدادات الدورة</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate("/instructor/courses")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 font-semibold text-sm bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  <span className="hidden sm:inline">العودة</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 font-semibold text-sm bg-red-50 hover:bg-red-100 transition-all border border-red-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  <span className="hidden sm:inline">حذف</span>
                </button>
                <button
                  onClick={saveCourse}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all ${
                    saveSuccess
                      ? "bg-emerald-500 text-white shadow-emerald-200"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      جاري الحفظ...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      تم الحفظ
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      حفظ التغييرات
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Page Title */}
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <button onClick={() => navigate("/instructor/courses")} className="hover:text-indigo-600 transition-colors">الدورات</button>
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              <span className="text-slate-800 font-medium truncate max-w-xs">{course.title || "بدون عنوان"}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">تعديل الدورة</h1>
            <p className="text-slate-500 mt-1.5">أدِر محتوى الدورة وأقسامها وإعداداتها من هنا</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "الأقسام",
                value: course.sections.length,
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
                color: "text-indigo-600 bg-indigo-50",
              },
              {
                label: "الفيديوهات",
                value: course.sections.reduce((acc, s) => acc + s.items.filter((i) => i.type === "video").length, 0),
                icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
                color: "text-blue-600 bg-blue-50",
              },
              {
                label: "الاختبارات",
                value: course.sections.reduce((acc, s) => acc + s.items.filter((i) => i.type === "quiz").length, 0),
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
                color: "text-violet-600 bg-violet-50",
              },
              {
                label: "الواجبات",
                value: course.sections.reduce((acc, s) => acc + s.items.filter((i) => i.type === "homework").length, 0),
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
                color: "text-amber-600 bg-amber-50",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1">
            {[
              {
                key: "content" as const,
                label: "المحتوى",
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
              },
              {
                key: "settings" as const,
                label: "الإعدادات",
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "content" ? renderContentTab() : renderSettingsTab()}
          </div>

          {/* Bottom Save Button */}
          <div className="flex justify-start pb-10">
            <button
              onClick={saveCourse}
              disabled={saving}
              className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg transition-all ${
                saveSuccess
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5"
              } disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {saving ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  جاري الحفظ...
                </>
              ) : saveSuccess ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  تم الحفظ بنجاح
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  حفظ جميع التغييرات
                </>
              )}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">تأكيد حذف الدورة</h3>
                  <p className="text-sm text-slate-500 mt-1">هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                <p className="text-sm text-red-700">
                  سيتم حذف دورة <strong className="font-bold">"{course.title}"</strong> وجميع محتوياتها بشكل نهائي، بما في ذلك {course.sections.length} قسم وجميع الفيديوهات والملفات والاختبارات والواجبات.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={deleteCourse}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                >
                  نعم، احذف الدورة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
}

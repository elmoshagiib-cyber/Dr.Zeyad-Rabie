import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { COURSE_CATEGORIES as CATEGORIES } from "../../lib/courseCategories";
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  GraduationCap,
  ImagePlus,
  Layers,
  Lightbulb,
  Loader2,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Constants
──────────────────────────────────────────────────────────── */

const GRADES = [
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
];


const PRICE_PRESETS = [100, 150, 200, 300, 500];

const MAX_TITLE = 80;
const MAX_DESC = 600;
const MAX_IMAGE_MB = 5;

/* ────────────────────────────────────────────────────────────
   Shared class names (نفس ستايل كروت المنصة)
──────────────────────────────────────────────────────────── */

const cardCls =
  "bg-white dark:bg-[#151515] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-sm p-5 sm:p-7";

const inputCls = `
  w-full h-12
  rounded-xl
  border border-slate-200 dark:border-[#2A2A2A]
  bg-slate-50 dark:bg-[#181818]
  px-4
  text-sm sm:text-base font-medium
  text-slate-800 dark:text-white
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  outline-none transition-all duration-300
  focus:border-[#155DFC] dark:focus:border-[#3183FF]
  focus:ring-4 focus:ring-[#155DFC]/15 dark:focus:ring-[#3183FF]/25
  disabled:opacity-50 disabled:cursor-not-allowed
`;

/* ────────────────────────────────────────────────────────────
   Small presentational components (برّه الـ component الرئيسي
   عشان ميتعملهمش remount مع كل كتابة)
──────────────────────────────────────────────────────────── */

function FieldHeader({
  icon,
  label,
  required,
  counter,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  counter?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#0F2147] text-[#155DFC] dark:text-[#93B4FF] flex items-center justify-center">
        {icon}
      </div>
      <span className="font-black text-[#155DFC] dark:text-white">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </span>
      {counter && (
        <span className="mr-auto text-xs font-bold text-slate-400 dark:text-slate-500">
          {counter}
        </span>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-red-600 dark:text-red-400">
      <AlertCircle size={14} className="shrink-0" />
      {message}
    </p>
  );
}

function ChoiceChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-1.5
        min-h-[44px] px-4 py-2 rounded-xl border-2 text-center
        text-[13px] sm:text-sm font-black
        transition-all duration-200 cursor-pointer
        ${
          active
            ? "bg-[#155DFC] border-[#155DFC] text-white dark:bg-[#3183FF] dark:border-[#3183FF]"
            : "bg-transparent border-slate-200 dark:border-[#2A2A2A] text-[#155DFC] dark:text-white hover:border-[#3183FF] hover:text-[#3183FF] dark:hover:border-[#3183FF] dark:hover:text-[#3183FF]"
        }
      `}
    >
      {active && <Check size={15} strokeWidth={3} className="shrink-0" />}
      {children}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────
   Live preview — نفس شكل كارت الطالب
──────────────────────────────────────────────────────────── */

function CoursePreview({
  previewUrl,
  title,
  description,
  grade,
  categoryLabel,
  isFree,
  price,
}: {
  previewUrl: string | null;
  title: string;
  description: string;
  grade: string;
  categoryLabel: string;
  isFree: boolean;
  price: string;
}) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 dark:border-[#262626] bg-white dark:bg-[#151515] shadow-sm">
      <div className="p-3 pb-0">
        <div className="relative aspect-[1000/563] overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#1F1F1F]">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="معاينة صورة الكورس"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
              <ImagePlus size={28} />
              <span className="text-sm font-medium">لا توجد صورة</span>
            </div>
          )}

          {categoryLabel && (
            <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {categoryLabel}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {grade && (
          <span className="self-start text-[11px] font-black text-[#155DFC] dark:text-[#93B4FF] bg-blue-50 dark:bg-[#0F2147] px-2.5 py-1 rounded-full">
            {grade}
          </span>
        )}

        <h3 className="text-[20px] leading-tight font-black text-[#155DFC] dark:text-white line-clamp-2 break-words">
          {title.trim() || (
            <span className="text-slate-300 dark:text-slate-600">
              اسم الكورس
            </span>
          )}
        </h3>

        <div className="flex items-center gap-0">
          <span className="w-[8px] h-[8px] rounded-full bg-[#155DFC] dark:bg-white flex-shrink-0" />
          <span className="flex-1 h-[3px] -mx-px bg-[#155DFC] dark:bg-white" />
          <span className="w-[8px] h-[8px] rounded-full bg-[#155DFC] dark:bg-white flex-shrink-0" />
        </div>

        <p className="text-[13px] leading-6 font-medium text-[#155DFC] dark:text-white whitespace-pre-line break-words line-clamp-3">
          {description.trim() || (
            <span className="text-slate-300 dark:text-slate-600">
              وصف الكورس هيظهر هنا...
            </span>
          )}
        </p>

        <div className="pt-4 border-t border-slate-200 dark:border-[#262626]">
          {isFree ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md px-4 py-[6px] text-[13px] font-black">
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              كورس مجاني
            </span>
          ) : (
            <div className="inline-flex items-center gap-1 rounded-lg p-1 bg-[#155DFC] dark:bg-[#3183FF]">
              <span className="bg-white text-[#111111] rounded-md px-3 py-[5px] min-w-[46px] text-center text-[13px] font-black">
                {Number(price || 0).toFixed(2)}
              </span>
              <span className="px-2 text-[13px] font-black text-white">
                جنيهًا
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
──────────────────────────────────────────────────────────── */

type FieldErrors = Partial<
  Record<"title" | "grade" | "price" | "thumbnail", string>
>;

export function CreateCourse() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState("");
  const [category, setCategory] = useState("term1");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null
  );

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);

  /* ── Toast ── */
  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ id: Date.now(), message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  /* ── Preview URL (مع تنظيف الـ object URL) ── */
  useEffect(() => {
    if (!thumbnail) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(thumbnail);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnail]);

  /* ── تنبيه لو المدرس هيقفل الصفحة وفيه بيانات ── */
  const isDirty = !!(
    title ||
    description ||
    grade ||
    price ||
    isFree ||
    thumbnail
  );

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /* ── Derived ── */
  const categoryLabel =
    CATEGORIES.find((c) => c.value === category)?.label || "";

  const checklist = useMemo(
    () => [
      { label: "اسم الكورس", done: title.trim().length > 0 },
      { label: "وصف واضح للكورس", done: description.trim().length >= 20 },
      { label: "الصف الدراسي", done: !!grade },
      { label: "التصنيف", done: !!category },
      { label: "السعر", done: isFree || Number(price) > 0 },
      { label: "صورة الكورس", done: !!thumbnail },
    ],
    [title, description, grade, category, isFree, price, thumbnail]
  );

  const doneCount = checklist.filter((i) => i.done).length;
  const percent = Math.round((doneCount / checklist.length) * 100);

  /* ── Handlers ── */
  const handleFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, thumbnail: "الملف لازم يكون صورة (PNG أو JPG أو WEBP)" }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((p) => ({
        ...p,
        thumbnail: `حجم الصورة أكبر من ${MAX_IMAGE_MB} ميجا، اختار صورة أصغر`,
      }));
      return;
    }

    setErrors((p) => ({ ...p, thumbnail: undefined }));
    setThumbnail(file);
  };

  const handleCategory = (value: string) => {
    setCategory(value);
    if (value === "free") {
      setIsFree(true);
      setPrice("");
      setErrors((p) => ({ ...p, price: undefined }));
    }
  };

  const toggleFree = () => {
    const next = !isFree;
    setIsFree(next);
    if (next) {
      setPrice("");
      setErrors((p) => ({ ...p, price: undefined }));
    } else if (category === "free") {
      setCategory("term1");
    }
  };

  const validate = () => {
    const e: FieldErrors = {};
    if (!title.trim()) e.title = "اكتب اسم الكورس";
    if (!grade) e.grade = "اختار الصف الدراسي";
    if (!isFree && !(Number(price) > 0)) {
      e.price = "اكتب سعر الكورس أو فعّل خيار الكورس المجاني";
    }
    setErrors(e);

    const first = Object.keys(e)[0];
    if (first) {
      document
        .getElementById(`field-${first}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  };

  const uploadThumbnailWithProgress = (
    file: File,
    fileName: string,
    accessToken: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const uploadUrl = `${supabaseUrl}/storage/v1/object/course-thumbnails/${fileName}`;

      xhr.open("POST", uploadUrl, true);

      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.setRequestHeader("apikey", supabaseAnonKey);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const publicUrl = supabase.storage
            .from("course-thumbnails")
            .getPublicUrl(fileName).data.publicUrl;

          resolve(publicUrl);
        } else {
          reject(
            new Error(`فشل رفع الصورة: ${xhr.responseText || xhr.statusText}`)
          );
        }
      };

      xhr.onerror = () => reject(new Error("حدث خطأ أثناء رفع الصورة"));
      xhr.onabort = () => reject(new Error("تم إلغاء رفع الصورة"));

      xhr.send(file);
    });
  };

  const createCourse = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);
      setUploadProgress(0);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("جلسة المستخدم غير موجودة، سجّل الدخول من جديد");
      }

      let thumbnailUrl = "";

      if (thumbnail) {
        const ext = thumbnail.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;

        thumbnailUrl = await uploadThumbnailWithProgress(
          thumbnail,
          fileName,
          session.access_token
        );

        setUploadProgress(100);
      }

      const slug = `${title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")}-${Date.now()}`;

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) throw new Error("المستخدم غير مسجل دخول");

      const { data: instructor, error: instructorError } = await supabase
        .from("instructors")
        .select("id")
        .eq("auth_id", authUser.id)
        .single();

      if (instructorError) throw instructorError;

      const { data, error } = await supabase
        .from("courses")
        .insert({
          teacher_id: instructor.id,
          title: title.trim(),
          slug,
          description: description.trim(),
          grade,
          category,
          price: isFree ? 0 : Number(price),
          thumbnail: thumbnailUrl,
          is_free: isFree,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;

      submittedRef.current = true;
      navigate(`/instructor/courses/edit/${data.id}`);
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء إنشاء الكورس، حاول مرة أخرى"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────────
     Render
  ──────────────────────────────────────────────────────── */

  return (
    <DashboardLayout
      type="instructor"
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {/* Toast */}
      {toast && (
        <div
          key={toast.id}
          role="alert"
          className="fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[100] w-[92%] sm:w-full max-w-sm bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-red-200 dark:border-red-500/30 overflow-hidden animate-in slide-in-from-top-3 fade-in duration-300"
        >
          <div className="flex items-start gap-3 px-4 py-3">
            <AlertCircle
              size={18}
              className="text-red-500 shrink-0 mt-0.5"
            />
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 text-right flex-1">
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="إغلاق"
            >
              <X size={16} />
            </button>
          </div>
          <div className="h-1 w-full bg-gray-100 dark:bg-[#2A2A2A] overflow-hidden">
            <div
              className="h-full bg-red-500"
              style={{ animation: "toast-shrink 5s linear forwards" }}
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 lg:pt-8 pb-16">
        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-[#155DFC] dark:bg-[#3183FF] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white mb-6 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-white" size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">
                إنشاء كورس جديد
              </h1>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                املا بيانات الكورس الأساسية، وبعدها هتنتقل لإضافة المحاضرات
                والمحتوى.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 w-40">
            <span className="text-xs font-bold text-white/90">
              اكتمال البيانات {percent}%
            </span>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Grid ── */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* البيانات الأساسية */}
            <div className={cardCls}>
              <div id="field-title">
                <FieldHeader
                  icon={<BookOpen size={15} />}
                  label="اسم الكورس"
                  required
                  counter={`${title.length}/${MAX_TITLE}`}
                />
                <input
                  value={title}
                  maxLength={MAX_TITLE}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title)
                      setErrors((p) => ({ ...p, title: undefined }));
                  }}
                  className={`${inputCls} ${
                    errors.title
                      ? "!border-red-400 focus:!ring-red-200 dark:focus:!ring-red-500/20"
                      : ""
                  }`}
                  placeholder="مثال: شرح الباب الأول - الترم الأول"
                />
                <FieldError message={errors.title} />
              </div>

              <div className="my-6 border-t border-slate-200 dark:border-[#262626]" />

              <div>
                <FieldHeader
                  icon={<Layers size={15} />}
                  label="وصف الكورس"
                  counter={`${description.length}/${MAX_DESC}`}
                />
                <textarea
                  rows={5}
                  value={description}
                  maxLength={MAX_DESC}
                  onChange={(e) => setDescription(e.target.value)}
                  className="
                    w-full rounded-xl p-4 resize-none
                    border border-slate-200 dark:border-[#2A2A2A]
                    bg-slate-50 dark:bg-[#181818]
                    text-sm sm:text-base font-medium leading-7
                    text-slate-800 dark:text-white
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    outline-none transition-all duration-300
                    focus:border-[#155DFC] dark:focus:border-[#3183FF]
                    focus:ring-4 focus:ring-[#155DFC]/15 dark:focus:ring-[#3183FF]/25
                  "
                  placeholder="اكتب اللي الطالب هيتعلمه في الكورس، والمنهج اللي بيغطيه، وليه الكورس ده مناسب ليه..."
                />
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  نصيحة: الوصف اللي بيوضح النتيجة للطالب بيزوّد الاشتراكات.
                </p>
              </div>
            </div>

            {/* التصنيف */}
            <div className={cardCls}>
              <div id="field-grade">
                <FieldHeader
                  icon={<GraduationCap size={15} />}
                  label="الصف الدراسي"
                  required
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {GRADES.map((g) => (
                    <ChoiceChip
                      key={g}
                      active={grade === g}
                      onClick={() => {
                        setGrade(g);
                        if (errors.grade)
                          setErrors((p) => ({ ...p, grade: undefined }));
                      }}
                    >
                      {g}
                    </ChoiceChip>
                  ))}
                </div>
                <FieldError message={errors.grade} />
              </div>

              <div className="my-6 border-t border-slate-200 dark:border-[#262626]" />

              <div>
                <FieldHeader icon={<Tag size={15} />} label="تصنيف الكورس" />
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORIES.map((c) => (
                    <ChoiceChip
                      key={c.value}
                      active={category === c.value}
                      onClick={() => handleCategory(c.value)}
                    >
                      {c.label}
                    </ChoiceChip>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  التصنيف بيحدد القسم اللي الكورس هيظهر فيه في صفحة الصف عند
                  الطلاب.
                </p>
              </div>
            </div>

            {/* السعر */}
            <div className={cardCls} id="field-price">
              <FieldHeader
                icon={<DollarSign size={15} />}
                label="سعر الكورس"
                required
              />

              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={price}
                  disabled={isFree}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price)
                      setErrors((p) => ({ ...p, price: undefined }));
                  }}
                  className={`${inputCls} pl-16 ${
                    errors.price
                      ? "!border-red-400 focus:!ring-red-200 dark:focus:!ring-red-500/20"
                      : ""
                  }`}
                  placeholder={isFree ? "الكورس مجاني" : "0"}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 dark:text-slate-500 pointer-events-none">
                  جنيه
                </span>
              </div>
              <FieldError message={errors.price} />

              {!isFree && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPrice(String(p));
                        setErrors((prev) => ({ ...prev, price: undefined }));
                      }}
                      className={`
                        h-9 px-3.5 rounded-lg text-[13px] font-black border-2 cursor-pointer transition-all duration-200
                        ${
                          Number(price) === p
                            ? "bg-[#155DFC] border-[#155DFC] text-white dark:bg-[#3183FF] dark:border-[#3183FF]"
                            : "border-slate-200 dark:border-[#2A2A2A] text-[#155DFC] dark:text-white hover:border-[#3183FF] hover:text-[#3183FF]"
                        }
                      `}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* مجاني toggle */}
              <div className="mt-5 pt-5 border-t border-slate-200 dark:border-[#262626]">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFree}
                  onClick={toggleFree}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <span
                    className={`
                      w-11 h-6 rounded-full transition-colors duration-300 flex items-center px-0.5
                      ${
                        isFree
                          ? "bg-[#155DFC] dark:bg-[#3183FF]"
                          : "bg-slate-200 dark:bg-[#2A2A2A]"
                      }
                    `}
                  >
                    <span
                      className={`
                        w-5 h-5 bg-white rounded-full shadow transition-transform duration-300
                        ${isFree ? "-translate-x-5" : "translate-x-0"}
                      `}
                    />
                  </span>
                  <span className="text-sm font-black text-[#155DFC] dark:text-white group-hover:text-[#3183FF] dark:group-hover:text-[#3183FF] transition-colors">
                    الكورس مجاني
                  </span>
                </button>
              </div>
            </div>

            {/* صورة الكورس */}
            <div className={cardCls} id="field-thumbnail">
              <FieldHeader
                icon={<ImagePlus size={15} />}
                label="صورة الكورس"
                counter="16:9 · حتى 5 ميجا"
              />

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files?.[0] || null);
                }}
                className={`
                  group relative w-full aspect-[1000/563]
                  rounded-2xl overflow-hidden cursor-pointer
                  border-2 border-dashed
                  flex flex-col items-center justify-center
                  transition-all duration-300
                  ${
                    dragOver
                      ? "border-[#3183FF] bg-blue-50 dark:bg-[#0F2147]"
                      : "border-gray-300 dark:border-[#333] bg-slate-50 dark:bg-[#181818] hover:border-[#3183FF] hover:bg-blue-50 dark:hover:bg-[#0F2147]"
                  }
                `}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="معاينة صورة الكورس"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="text-white text-center">
                        <ImagePlus size={32} className="mx-auto mb-2" />
                        <span className="font-bold text-sm sm:text-base">
                          اضغط لتغيير الصورة
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 dark:bg-[#0F2147] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <ImagePlus
                        size={28}
                        className="text-[#155DFC] dark:text-[#93B4FF]"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-[#155DFC] dark:text-white">
                      ارفع صورة الكورس
                    </h3>
                    <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
                      اسحب الصورة هنا أو اضغط لاختيارها من جهازك
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {["PNG", "JPG", "WEBP"].map((fmt) => (
                        <span
                          key={fmt}
                          className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-lg"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0] || null);
                    e.target.value = "";
                  }}
                />
              </label>

              <FieldError message={errors.thumbnail} />

              {thumbnail && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2A2A2A] px-4 py-2.5">
                  <div className="min-w-0 text-right">
                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">
                      {thumbnail.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {(thumbnail.size / 1024 / 1024).toFixed(2)} ميجا
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setThumbnail(null)}
                    className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 size={15} />
                    حذف
                  </button>
                </div>
              )}
            </div>

            {/* زر الإنشاء */}
            <div>
              <button
                onClick={createCourse}
                disabled={loading}
                className="
                  w-full h-14 sm:h-16
                  rounded-2xl
                  font-black text-base sm:text-lg
                  text-white
                  bg-[#155DFC]
                  hover:bg-[#1547D6]
                  active:scale-[0.98]
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  cursor-pointer
                  transition-all duration-300
                  flex items-center justify-center gap-3
                "
              >
                {loading ? (
                  <div className="w-full flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      <span>
                        {thumbnail && uploadProgress < 100
                          ? `جاري رفع الصورة... ${uploadProgress}%`
                          : "جاري إنشاء الكورس..."}
                      </span>
                    </div>

                    {thumbnail && uploadProgress < 100 && (
                      <div className="w-full max-w-xs h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>إنشاء الكورس</span>
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400">
                الكورس هيتحفظ كمسودة ومش هيظهر للطلاب لحد ما تنشره من صفحة
                التعديل.
              </p>
            </div>
          </div>

          {/* ── Right: Preview + Checklist ── */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
            <div>
              <h2 className="text-lg font-black text-[#155DFC] dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3183FF] inline-block" />
                كده هيظهر للطالب
              </h2>

              <CoursePreview
                previewUrl={previewUrl}
                title={title}
                description={description}
                grade={grade}
                categoryLabel={categoryLabel}
                isFree={isFree}
                price={price}
              />
            </div>

            {/* Checklist */}
            <div className={`${cardCls} !p-5`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-[#155DFC] dark:text-white">
                  جاهزية الكورس
                </h3>
                <span className="text-xs font-black text-[#155DFC] dark:text-[#93B4FF] bg-blue-50 dark:bg-[#0F2147] px-2.5 py-1 rounded-full">
                  {doneCount}/{checklist.length}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-[#2A2A2A] overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-[#155DFC] dark:bg-[#3183FF] transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <ul className="space-y-2.5">
                {checklist.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2.5 text-[13px] font-bold"
                  >
                    {item.done ? (
                      <CheckCircle2
                        size={18}
                        className="text-emerald-500 shrink-0"
                      />
                    ) : (
                      <span className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 dark:border-[#3A3A3A] shrink-0" />
                    )}
                    <span
                      className={
                        item.done
                          ? "text-slate-700 dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-500"
                      }
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* تلميح */}
            <div className="flex items-start gap-3 rounded-2xl border border-blue-200 dark:border-[#2A2A2A] bg-blue-50 dark:bg-[#1A1A1A] p-4">
              <Lightbulb
                size={18}
                className="text-[#155DFC] dark:text-[#93B4FF] shrink-0 mt-0.5"
              />
              <p className="text-xs leading-6 font-bold text-[#155DFC] dark:text-[#93B4FF]">
                بعد الإنشاء هتنتقل لصفحة تعديل الكورس عشان تضيف الأقسام
                والمحاضرات، وتقدر تغيّر أي بيانات هنا بعدين.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
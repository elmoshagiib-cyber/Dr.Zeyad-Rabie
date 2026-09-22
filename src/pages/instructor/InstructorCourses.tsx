/* ============================================================
   instructor-courses (COMBINED FILE) — نسخة محسّنة
   يحتوي على كل الكومبوننتس الخاصة بصفحة "كورساتي" للمدرّس

   الجديد في هذه النسخة (بالإضافة لكل الفيتشرز السابقة):
   - 💰 كارت "إجمالي الإيرادات المتوقعة" في الإحصائيات
   - 📊 شريط "نسبة اكتمال الكورس" على كل كارت (صورة + وصف + محتوى)
   - 🏷️ وسام "جديد" للكورسات المُنشأة خلال آخر 7 أيام
   - 🏆 وسام "الأعلى مبيعًا" لأكثر كورس حقق إيرادات
   - ✅ تحديد متعدد + إجراءات جماعية (نشر / إخفاء / حذف) لعدة كورسات دفعة واحدة
   - 💬 نافذة تأكيد أنيقة (بدل alert/confirm الافتراضي في المتصفح) للحذف والنسخ
   - 📄 ترقيم صفحات (Pagination) بدل عرض كل الكورسات دفعة واحدة
   - 🦴 Skeleton تحميل مطابق لشكل العرض الحالي (Grid/List)
   - ⌨️ اختصار لوحة مفاتيح "/" للقفز لخانة البحث مباشرة
   - 🔄 زرار "إعادة ضبط الفلاتر" يظهر لما نتيجة البحث تبقى صفر

   نفس الألوان والهيدر الأصليين اتحافظ عليهم بالكامل.

   ⚙️ طريقة الاستخدام:
   حط الملف ده مكان ملفك الأصلي بنفس المسار
   (يعني src/pages/instructor/InstructorCourses.tsx تقريبًا)
   وامسح ملفات الكومبوننتس المنفصلة (CourseHero, CourseStats,
   CourseAlert, CourseFilters, CourseGrid, CourseCard) من
   مجلد components/instructor-courses لأنها بقت كلها هنا جوه
   نفس الملف. لو مكان الملف مختلف عندك، ظبط مسارات الـ imports
   التالية بس (supabase, DashboardLayout, AppContext, Button)
   حسب مكان الملف الجديد.
============================================================ */

import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  Edit,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Copy,
  Link2,
  Search,
  RotateCcw,
  Plus,
  LayoutGrid,
  Rows3,
  CheckCircle2,
  Sparkles,
  FileClock,
  AlertTriangle,
  Clock,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  CheckSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { useApp } from "../../context/AppContext";
import { Button } from "../../components/ui/Button";

/* ============================================================
   Helpers
============================================================ */

const getGradeLabel = (grade?: string) => grade || "غير محدد";

const formatDate = (date?: string) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  });
};

const formatMoney = (value: number) => Math.round(value || 0).toLocaleString("ar-EG");

const isRecentlyCreated = (dateStr?: string) => {
  if (!dateStr) return false;
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
};

/** نسبة اكتمال بيانات الكورس: صورة + وصف + أبواب + محتوى داخل الأبواب */
const getCompleteness = (course: any) => {
  const sections = course.course_sections || [];
  const hasItems = sections.some((s: any) => (s.course_items?.length || 0) > 0);

  const checks = [
    Boolean(course.thumbnail || course.cover_image),
    Boolean(course.description && course.description.trim().length > 10),
    sections.length > 0,
    hasItems,
  ];

  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
};

const courseRevenue = (course: any) =>
  course.is_free ? 0 : (Number(course.price) || 0) * (course.students_count || 0);

/* ============================================================
   CompletenessBar — شريط صغير يوضح نسبة اكتمال بيانات الكورس
============================================================ */

function CompletenessBar({ value }: { value: number }) {
  const color =
    value === 100 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-400";
  const textColor =
    value === 100 ? "text-emerald-600" : value >= 50 ? "text-amber-600" : "text-red-500";

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold text-slate-400">اكتمال بيانات الكورس</span>
        <span className={`text-[11px] font-bold ${textColor}`}>{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   ConfirmDialog — نافذة تأكيد موحّدة بدل confirm() الافتراضية
============================================================ */

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "إلغاء",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl text-right"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                variant === "danger" ? "bg-red-50 text-red-500" : "bg-blue-50 text-[#155DFC]"
              }`}
            >
              {variant === "danger" ? <Trash2 size={22} /> : <Copy size={22} />}
            </div>

            <h3 className="text-lg font-black text-slate-800">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={onConfirm}
                className={`flex-1 h-11 rounded-xl font-bold text-sm text-white transition ${
                  variant === "danger"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[#155DFC] hover:bg-[#1547D6]"
                }`}
              >
                {confirmLabel}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 h-11 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   BulkActionBar — شريط عائم يظهر عند تحديد أكثر من كورس
============================================================ */

type BulkActionBarProps = {
  count: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  onClear: () => void;
};

function BulkActionBar({ count, onPublish, onUnpublish, onDelete, onClear }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 sm:gap-4 rounded-2xl bg-slate-900 text-white pr-4 pl-3 py-2.5 shadow-2xl max-w-[95vw] overflow-x-auto"
        >
          <span className="text-sm font-bold whitespace-nowrap">{count} كورس محدد</span>

          <div className="w-px h-6 bg-white/20 shrink-0" />

          <button
            onClick={onPublish}
            className="flex items-center gap-1.5 text-sm font-medium hover:text-emerald-300 transition whitespace-nowrap"
          >
            <Eye size={15} /> نشر
          </button>
          <button
            onClick={onUnpublish}
            className="flex items-center gap-1.5 text-sm font-medium hover:text-amber-300 transition whitespace-nowrap"
          >
            <EyeOff size={15} /> إخفاء
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-sm font-medium hover:text-red-300 transition whitespace-nowrap"
          >
            <Trash2 size={15} /> حذف
          </button>

          <div className="w-px h-6 bg-white/20 shrink-0" />

          <button
            onClick={onClear}
            className="text-sm text-white/60 hover:text-white transition whitespace-nowrap"
          >
            إلغاء التحديد
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   CourseHero.tsx  (بدون أي تعديل — نفس الهيدر بالضبط)
============================================================ */

type CourseHeroProps = {
  onCreateCourse: () => void;
  onCreateGeneralCourse?: () => void;
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  view: "grid" | "list";
  setView: Dispatch<SetStateAction<"grid" | "list">>;
};

export function CourseHero({
  onCreateCourse,
  onCreateGeneralCourse,
  totalCourses,
  publishedCourses,
  totalStudents,
  view,
  setView,
}: CourseHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#1547D6] to-[#3183FF] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg"
    >
      {/* Background Blur */}
      <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-[100px]" />
      <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* العنوان + الأيقونة */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-amber-400" size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">إدارة الكورسات والشهور</h1>
            <p className="text-white/60 text-xs sm:text-sm mt-0.5">
              تحكم كامل في المحتوى التعليمي، الأسعار، والمشتركين من مكان واحد.
            </p>
          </div>
        </div>

        {/* الأزرار + View toggle */}
        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
          {/* View toggle */}
          <div className="inline-flex w-fit rounded-2xl border border-white/20 bg-white/10 p-1 backdrop-blur-xl">
            <button
              onClick={() => setView("list")}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-all ${
                view === "list"
                  ? "bg-white text-[#1547D6] shadow"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Rows3 size={16} />
            </button>

            <button
              onClick={() => setView("grid")}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-all ${
                view === "grid"
                  ? "bg-white text-[#1547D6] shadow"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* إنشاء كورس جديد */}
          <Button
            onClick={onCreateCourse}
            className="flex items-center gap-1.5 h-9 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-3 sm:px-4 text-xs sm:text-sm font-bold text-white transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            إنشاء كورس جديد
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   CourseStats.tsx
   (الجديد: كارت خامس "إجمالي الإيرادات المتوقعة")
============================================================ */

type CourseStatsProps = {
  courses: any[];
};

export function CourseStats({ courses }: CourseStatsProps) {
  const totalCourses = courses.length;

  const activeCourses = courses.filter((course) => course.is_published).length;

  const freeCourses = courses.filter((course) => course.is_free).length;

  const draftCourses = courses.filter((course) => !course.is_published).length;

  const totalRevenue = courses.reduce((sum, course) => sum + courseRevenue(course), 0);

  const pct = (value: number) =>
    totalCourses === 0
      ? "لا يوجد كورسات بعد"
      : `${Math.round((value / totalCourses) * 100)}% من الإجمالي`;

  const stats: {
    title: string;
    value: number | string;
    caption: string;
    icon: LucideIcon;
    color: string;
    iconBg: string;
    ring: string;
    bar: string;
  }[] = [
    {
      title: "إجمالي الكورسات",
      value: totalCourses,
      caption: "كل الكورسات اللي أنشأتها",
      icon: BookOpen,
      color: "text-indigo-600",
      iconBg: "bg-gradient-to-br from-indigo-100 to-indigo-50",
      ring: "ring-indigo-100",
      bar: "bg-indigo-500",
    },
    {
      title: "الكورسات النشطة",
      value: activeCourses,
      caption: pct(activeCourses),
      icon: CheckCircle2,
      color: "text-emerald-600",
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
      ring: "ring-emerald-100",
      bar: "bg-emerald-500",
    },
    {
      title: "كورسات مجانية",
      value: freeCourses,
      caption: pct(freeCourses),
      icon: Sparkles,
      color: "text-orange-500",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-50",
      ring: "ring-orange-100",
      bar: "bg-orange-500",
    },
    {
      title: "كورسات في المسودة",
      value: draftCourses,
      caption: pct(draftCourses),
      icon: FileClock,
      color: "text-amber-600",
      iconBg: "bg-gradient-to-br from-amber-100 to-amber-50",
      ring: "ring-amber-100",
      bar: "bg-amber-500",
    },
    {
      title: "إجمالي الإيرادات (تقديري)",
      value: `${formatMoney(totalRevenue)} ج.م`,
      caption: "من كل الكورسات المدفوعة حاليًا",
      icon: TrendingUp,
      color: "text-sky-600",
      iconBg: "bg-gradient-to-br from-sky-100 to-sky-50",
      ring: "ring-sky-100",
      bar: "bg-sky-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
      {stats.map((item) => {
        const Icon = item.icon;
        const isMoney = typeof item.value === "string";

        return (
          <div
            key={item.title}
            className="
              group
              relative
              overflow-hidden
              bg-white
              rounded-3xl
              border
              border-slate-200
              p-6
              shadow-sm
              transition-all
              duration-300
              hover:shadow-lg
              hover:-translate-y-0.5
              hover:border-slate-300
            "
          >
            {/* خط علوي ملوّن */}
            <div className={`absolute top-0 right-0 left-0 h-1 ${item.bar}`} />

            <div className="flex items-start justify-between gap-2">
              <div
                className={`
                  w-14
                  h-14
                  shrink-0
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  ring-4
                  ${item.iconBg}
                  ${item.ring}
                  transition-transform
                  duration-300
                  group-hover:scale-110
                `}
              >
                <Icon className={item.color} size={24} strokeWidth={2.2} />
              </div>

              <div className="text-right min-w-0">
                <p className="text-slate-500 text-sm font-medium">{item.title}</p>
                <h2
                  className={`mt-1 font-black text-slate-800 tabular-nums truncate ${
                    isMoney ? "text-xl sm:text-2xl" : "text-4xl"
                  }`}
                >
                  {item.value}
                </h2>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <span className="text-xs font-medium text-slate-400">{item.caption}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   CourseAlert.tsx  (بدون تغيير جوهري)
============================================================ */

type CourseAlertProps = {
  courses: any[];
};

export function CourseAlert({ courses }: CourseAlertProps) {
  const draftCourses = courses.filter((course) => !course.is_published);

  const hiddenCourses = courses.filter((course) => course.is_hidden);

  const noImageCourses = courses.filter((course) => !course.thumbnail);

  const noDescriptionCourses = courses.filter((course) => !course.description);

  const emptyCourses = courses.filter(
    (course) =>
      course.is_published &&
      (!course.course_sections || course.course_sections.length === 0)
  );

  const hasWarnings =
    draftCourses.length ||
    hiddenCourses.length ||
    noImageCourses.length ||
    noDescriptionCourses.length ||
    emptyCourses.length;

  return (
    <div
      className={`
      rounded-3xl
      border
      p-6
      flex
      flex-col
      sm:flex-row
      items-start
      sm:items-center
      justify-between
      gap-4
      ${hasWarnings ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}
      `}
    >
      <div>
        <p className={`text-sm ${hasWarnings ? "text-amber-700" : "text-emerald-700"}`}>
          حالة الكورسات
        </p>

        {hasWarnings ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {draftCourses.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/60 border border-amber-200 rounded-full px-3 py-1 text-sm text-amber-800 font-medium">
                {draftCourses.length} كورس مسودة
              </span>
            )}

            {hiddenCourses.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/60 border border-amber-200 rounded-full px-3 py-1 text-sm text-amber-800 font-medium">
                {hiddenCourses.length} كورس مخفي
              </span>
            )}

            {noImageCourses.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/60 border border-amber-200 rounded-full px-3 py-1 text-sm text-amber-800 font-medium">
                {noImageCourses.length} كورس بدون صورة
              </span>
            )}

            {noDescriptionCourses.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/60 border border-amber-200 rounded-full px-3 py-1 text-sm text-amber-800 font-medium">
                {noDescriptionCourses.length} كورس بدون وصف
              </span>
            )}

            {emptyCourses.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1 text-sm text-red-700 font-bold">
                ⚠️ {emptyCourses.length} كورس منشور بدون محتوى
              </span>
            )}
          </div>
        ) : (
          <h3 className="font-bold text-lg mt-2">جميع الكورسات مكتملة</h3>
        )}
      </div>

      <div
        className={`
        w-14
        h-14
        shrink-0
        rounded-2xl
        flex
        items-center
        justify-center
        ${hasWarnings ? "bg-amber-100" : "bg-emerald-100"}
        `}
      >
        {hasWarnings ? (
          <AlertTriangle className="text-amber-600" size={24} />
        ) : (
          <CheckCircle2 className="text-emerald-600" size={24} />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CourseFilters.tsx
   (الجديد: زرار "تحديد متعدد" + onReset كـ prop)
============================================================ */

type CourseFiltersProps = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;

  gradeFilter: string;
  setGradeFilter: Dispatch<SetStateAction<string>>;

  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;

  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;

  view: "grid" | "list";
  setView: Dispatch<SetStateAction<"grid" | "list">>;

  resultsCount: number;

  selectionMode: boolean;
  onToggleSelectionMode: () => void;

  onReset: () => void;
};

type SearchableSelectOption = { value: string; label: string };

type SearchableSelectProps = {
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  searchable?: boolean;
};

function SearchableSelect({
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  searchable = true,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`
          relative w-full h-12 rounded-2xl border bg-white
          flex items-center gap-2 pr-11 pl-4
          outline-none transition shadow-sm cursor-pointer
          hover:border-slate-300
          ${isOpen ? "border-[#155DFC] ring-4 ring-blue-100" : "border-slate-200"}
        `}
      >
        <Icon
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <span
          className={`flex-1 text-right text-sm truncate ${
            value ? "text-slate-700 font-medium" : "text-slate-400"
          }`}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 left-0 mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white"
          >
            {searchable && (
              <div className="px-4 py-2.5 border-b border-slate-100">
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث..."
                  className="w-full bg-transparent outline-none text-sm text-right text-slate-700 placeholder-slate-400"
                />
              </div>
            )}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">لا توجد نتائج</div>
              )}
              {filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`px-4 py-3 text-sm text-right cursor-pointer transition-colors ${
                    opt.value === value
                      ? "bg-[#155DFC] text-white font-bold border-r-4 border-blue-300/40"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CourseFilters({
  search,
  setSearch,
  gradeFilter,
  setGradeFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  resultsCount,
  selectionMode,
  onToggleSelectionMode,
  onReset,
}: CourseFiltersProps) {
  const activeFilters = (gradeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 shadow-sm p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
        <div className="text-right">
          <h2 className="text-2xl font-black">فلتر الكورسات</h2>
          <p className="text-slate-500 mt-1">ابحث ورتب واعرض الكورسات بالطريقة المناسبة.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleSelectionMode}
            title="تحديد أكثر من كورس لتنفيذ إجراء جماعي"
            className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-full text-sm font-bold transition-colors ${
              selectionMode
                ? "bg-[#155DFC] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <CheckSquare size={15} />
            {selectionMode ? "إنهاء التحديد" : "تحديد متعدد"}
          </button>

          <div
            className={`inline-flex items-center justify-center min-w-[95px] h-11 rounded-full font-bold transition-colors ${
              resultsCount === 0 ? "bg-red-50 text-red-500" : "bg-blue-100 text-[#155DFC]"
            }`}
          >
            {resultsCount} كورس
          </div>
        </div>
      </div>

      {/* Row */}
      <div
        className="
flex
flex-col
lg:flex-row
gap-4
items-stretch
lg:items-center
"
      >
        {/* Search */}
        <div className="relative w-full lg:flex-1">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            id="course-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الكورس أو الوصف... (اختصار: /)"
            className="
w-full
h-12
rounded-2xl
border
border-slate-200
bg-slate-50/60
pr-11
pl-4
shadow-sm
transition
outline-none
focus:bg-white
focus:border-[#155DFC]
focus:ring-4
focus:ring-blue-100
"
          />
        </div>

        {/* Grade */}
        <div className="w-full lg:w-[210px]">
          <SearchableSelect
            icon={GraduationCap}
            value={gradeFilter}
            onChange={setGradeFilter}
            placeholder="كل الصفوف"
            searchable={false}
            options={[
              { value: "all", label: "كل الصفوف" },
              { value: "الصف الأول الإعدادي", label: "الصف الأول الإعدادي" },
              { value: "الصف الثاني الإعدادي", label: "الصف الثاني الإعدادي" },
              { value: "الصف الثالث الإعدادي", label: "الصف الثالث الإعدادي" },
              { value: "الصف الأول الثانوي", label: "الصف الأول الثانوي" },
              { value: "الصف الثاني الثانوي", label: "الصف الثاني الثانوي" },
              { value: "الصف الثالث الثانوي", label: "الصف الثالث الثانوي" },
            ]}
          />
        </div>

        {/* Status */}
        <div className="w-full lg:w-[180px]">
          <SearchableSelect
            icon={CheckCircle2}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="كل الحالات"
            searchable={false}
            options={[
              { value: "all", label: "كل الحالات" },
              { value: "published", label: "منشور" },
              { value: "draft", label: "مسودة" },
            ]}
          />
        </div>

        {/* Sort */}
        <div className="w-full lg:w-[170px]">
          <SearchableSelect
            icon={Layers}
            value={sortBy}
            onChange={setSortBy}
            placeholder="الأحدث"
            searchable={false}
            options={[
              { value: "latest", label: "الأحدث" },
              { value: "oldest", label: "الأقدم" },
              { value: "price-low", label: "السعر الأقل" },
              { value: "price-high", label: "السعر الأعلى" },
              { value: "revenue-high", label: "الأعلى إيرادًا" },
              { value: "students-high", label: "الأكثر طلابًا" },
            ]}
          />
        </div>

        {/* Reset */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onReset}
            disabled={activeFilters === 0 && search.trim() === ""}
            className={`
      h-11
      px-5
      rounded-xl
      border
      transition
      flex
      items-center
      gap-2
      text-sm
      font-medium
      ${
        activeFilters > 0 || search.trim() !== ""
          ? "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          : "border-slate-100 text-slate-300 cursor-not-allowed"
      }
    `}
          >
            <RotateCcw size={16} />
            إعادة الضبط
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {search.trim() !== "" && (
            <button
              onClick={() => setSearch("")}
              className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm"
            >
              "{search}" ✕
            </button>
          )}

          {gradeFilter !== "all" && (
            <button
              onClick={() => setGradeFilter("all")}
              className="px-3 py-1 rounded-full bg-blue-100 text-[#155DFC] text-sm"
            >
              {gradeFilter} ✕
            </button>
          )}

          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm"
            >
              {statusFilter === "published" ? "منشور" : "مسودة"} ✕
            </button>
          )}
        </div>

        {activeFilters > 0 && (
          <span className="text-sm text-slate-500">{activeFilters} فلتر مفعل</span>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CourseCard.tsx
   (الجديد: تحديد جماعي + شريط اكتمال البيانات + وسام "جديد"
   ووسام "الأعلى مبيعًا")
============================================================ */

type CourseCardProps = {
  course: any;
  onDelete: (id: string) => void;
  onFeature?: (id: string) => void;
  onTogglePublish?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  view: "grid" | "list";
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  isTopSeller?: boolean;
};

export function CourseCard({
  course,
  onDelete,
  onFeature,
  onTogglePublish,
  onDuplicate,
  onCopyLink,
  view,
  selectionMode = false,
  selected = false,
  onToggleSelect,
  isTopSeller = false,
}: CourseCardProps) {
  const navigate = useNavigate();
  const sections = course.course_sections || [];
  const lectures = sections.length;

  const videos = sections.reduce((sum: number, section: any) => {
    return (
      sum + (section.course_items?.filter((item: any) => item.type === "video").length || 0)
    );
  }, 0);

  const files = sections.reduce((sum: number, section: any) => {
    return sum + (section.course_items?.filter((item: any) => item.type === "pdf").length || 0);
  }, 0);

  const completeness = getCompleteness(course);
  const isNew = isRecentlyCreated(course.created_at);

  const actionsDimmed = selectionMode ? "opacity-40 pointer-events-none" : "";

  /* ────────────── LIST VIEW ────────────── */
  if (view === "list") {
    return (
      <div
        className={`bg-white rounded-[24px] border shadow-sm hover:shadow-lg transition p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center ${
          selected ? "border-[#155DFC] ring-2 ring-blue-100" : "border-slate-200"
        }`}
      >
        {selectionMode && (
          <label className="flex items-center justify-center self-start sm:self-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect?.(course.id)}
              className="w-5 h-5 accent-[#155DFC] cursor-pointer"
            />
          </label>
        )}

        <img
          src={
            course.thumbnail
              ? `${import.meta.env.VITE_R2_PUBLIC_URL}/${course.thumbnail}`
              : course.cover_image ||
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
          }
          className="w-full sm:w-52 md:w-64 h-40 rounded-2xl object-cover shrink-0"
        />

        <div className="flex-1 w-full">
          <div className="flex justify-between items-start gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-black">{course.title}</h2>
                {isNew && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    <Sparkles size={11} /> جديد
                  </span>
                )}
                {isTopSeller && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Award size={11} /> الأعلى مبيعًا
                  </span>
                )}
              </div>
              <p className="text-slate-500 mt-1 text-sm sm:text-base line-clamp-2">
                {course.description}
              </p>
            </div>
            <span
              className={`shrink-0 text-white text-xs px-3 py-1 rounded-full ${
                course.is_published ? "bg-green-500" : "bg-amber-500"
              }`}
            >
              {course.is_published ? "منشور" : "مسودة"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-6 mt-4 text-slate-500 text-sm">
            <span>🎥 {videos} فيديو</span>
            <span>📄 {files} PDF</span>
            <span>👨‍🎓 {course.students_count || 0} طالب</span>
            <span>📚 {lectures} باب</span>
            <span>🎓 {getGradeLabel(course.grade)}</span>
            {formatDate(course.updated_at) && (
              <span>🕒 آخر تحديث {formatDate(course.updated_at)}</span>
            )}
          </div>

          <div className="mt-4 max-w-sm">
            <CompletenessBar value={completeness} />
          </div>

          <div className="flex flex-wrap justify-between items-center mt-6 gap-3">
            <span
              className={`text-2xl sm:text-3xl font-black ${
                course.is_free ? "text-emerald-600" : "text-[#155DFC]"
              }`}
            >
              {course.is_free ? "مجاني" : `${course.price} ج.م`}
            </span>

            <div className={`flex flex-wrap justify-end gap-2 transition-opacity ${actionsDimmed}`}>
              {/* نشر / إخفاء */}
              <button
                onClick={() => onTogglePublish?.(course.id)}
                title={course.is_published ? "إخفاء الكورس" : "نشر الكورس"}
                className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition flex items-center justify-center"
              >
                {course.is_published ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>

              {/* نسخ رابط */}
              <button
                onClick={() => onCopyLink?.(course.id)}
                title="نسخ رابط الكورس"
                className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition flex items-center justify-center"
              >
                <Link2 size={17} />
              </button>

              {/* نسخ الكورس */}
              <button
                onClick={() => onDuplicate?.(course.id)}
                title="نسخ الكورس"
                className="h-10 w-10 rounded-xl bg-purple-50 text-purple-500 hover:bg-purple-100 transition flex items-center justify-center"
              >
                <Copy size={17} />
              </button>

              {/* نجمة - تمييز */}
              <button
                onClick={() => onFeature?.(course.id)}
                title="تمييز الكورس"
                className={`h-10 w-10 rounded-xl transition flex items-center justify-center ${
                  course.is_featured
                    ? "bg-yellow-400 text-white hover:bg-yellow-500"
                    : "bg-yellow-50 text-yellow-500 hover:bg-yellow-100"
                }`}
              >
                <Star size={17} fill={course.is_featured ? "currentColor" : "none"} />
              </button>

              {/* تعديل */}
              <button
                onClick={() => navigate(`/instructor/courses/edit/${course.id}`)}
                title="تعديل"
                className="h-10 px-4 rounded-xl bg-blue-50 text-[#155DFC] hover:bg-blue-100 transition flex items-center gap-2 text-sm font-bold"
              >
                <Edit size={15} />
                تعديل
              </button>

              {/* حذف */}
              <button
                onClick={() => onDelete(course.id)}
                title="حذف"
                className="h-10 px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-2 text-sm font-bold"
              >
                <Trash2 size={15} />
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────── GRID VIEW ────────────── */
  return (
    <div
      onClick={() => selectionMode && onToggleSelect?.(course.id)}
      className={`
        group
        relative
        bg-white
        border
        shadow-[0_4px_20px_rgba(0,0,0,.06)]
        hover:shadow-[0_10px_35px_rgba(0,0,0,.1)]
        rounded-[26px]
        overflow-hidden
        transition-all
        duration-300
        flex
        flex-col
        ${selectionMode ? "cursor-pointer" : ""}
        ${selected ? "border-[#155DFC] ring-2 ring-blue-100" : "border-gray-200"}
      `}
    >
      {selectionMode && (
        <label
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 left-3 z-20 flex items-center justify-center w-8 h-8 rounded-xl bg-white shadow-md cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect?.(course.id)}
            className="w-4 h-4 accent-[#155DFC] cursor-pointer"
          />
        </label>
      )}

      {/* ── الصورة ── */}
      <div className="p-2.5 pb-0">
        <div className="relative aspect-[16/9] max-h-[190px] overflow-hidden rounded-2xl">
          <img
            src={
              course.thumbnail
                ? `${import.meta.env.VITE_R2_PUBLIC_URL}/${course.thumbnail}`
                : course.cover_image ||
                  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
            }
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* حالة النشر */}
          <span
            className={`
              absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white
              ${course.is_published ? "bg-green-500" : "bg-amber-500"}
            `}
          >
            {course.is_published ? "منشور" : "مسودة"}
          </span>

          {/* تنبيه: كورس منشور بدون محتوى */}
          {course.is_published && sections.length === 0 && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-red-500">
              <AlertTriangle size={11} />
              بدون محتوى
            </span>
          )}
        </div>
      </div>

      {/* ── المحتوى ── */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* الصف الدراسي + الوسامات */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {getGradeLabel(course.grade)}
          </span>
          {/* نقطة الحالة */}
          <span
            className={`w-2 h-2 rounded-full ${
              course.is_published ? "bg-green-500" : "bg-amber-400"
            }`}
          />
          {isNew && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              <Sparkles size={11} /> جديد
            </span>
          )}
          {isTopSeller && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              <Award size={11} /> الأعلى مبيعًا
            </span>
          )}
        </div>

        {/* العنوان */}
        <h2 className="text-sm sm:text-base font-black line-clamp-2 leading-snug">
          {course.title}
        </h2>

        {/* الوصف */}
        <p className="mt-1 text-xs sm:text-sm text-slate-400 line-clamp-1">
          {course.description}
        </p>

        {/* إحصائيات */}
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
            <Users size={13} />
            {course.students_count || 0} طالب
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
            <BookOpen size={13} />
            {videos} محاضرة
          </div>
          {formatDate(course.updated_at) && (
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
              <Clock size={13} />
              {formatDate(course.updated_at)}
            </div>
          )}
        </div>

        {/* شريط اكتمال البيانات */}
        <CompletenessBar value={completeness} />

        {/* فاصل */}
        <div className="mt-4 border-t border-slate-100" />

        {/* ── الفوتر ── */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {/* أيقونات الأكشن */}
          <div
            className={`flex flex-wrap items-center gap-1.5 transition-opacity ${actionsDimmed}`}
          >
            {/* 👁️ نشر / إخفاء */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePublish?.(course.id);
              }}
              title={course.is_published ? "إخفاء الكورس" : "نشر الكورس"}
              className="h-9 w-9 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition flex items-center justify-center"
            >
              {course.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            {/* 🗑️ حذف */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(course.id);
              }}
              title="حذف الكورس"
              className="h-9 w-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>

            {/* ✏️ تعديل المحتوى */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/instructor/courses/edit/${course.id}`);
              }}
              title="تعديل الكورس"
              className="h-9 w-9 rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-100 transition flex items-center justify-center"
            >
              <Edit size={16} />
            </button>

            {/* 🔗 نسخ رابط */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink?.(course.id);
              }}
              title="نسخ رابط الكورس"
              className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition flex items-center justify-center"
            >
              <Link2 size={16} />
            </button>

            {/* ⭐ تمييز (يظهر في المقترحة) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFeature?.(course.id);
              }}
              title="إضافة للكورسات المقترحة"
              className={`
                h-9 w-9 rounded-xl
                transition
                flex items-center justify-center
                ${
                  course.is_featured
                    ? "bg-yellow-400 text-white hover:bg-yellow-500"
                    : "bg-yellow-50 text-yellow-500 hover:bg-yellow-100"
                }
              `}
            >
              <Star size={16} fill={course.is_featured ? "currentColor" : "none"} />
            </button>
          </div>

          {/* السعر */}
          <span
            className={`text-xl sm:text-2xl font-black whitespace-nowrap ${
              course.is_free ? "text-emerald-600" : "text-[#155DFC]"
            }`}
          >
            {course.is_free ? "مجاني" : `${course.price} ج.م`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CourseGrid.tsx
============================================================ */

type CourseGridProps = {
  courses: any[];
  onDelete: (id: string) => void;
  onFeature?: (id: string) => void;
  onTogglePublish?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  view: "grid" | "list";
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  topSellerId?: string | null;
};

export function CourseGrid({
  courses,
  onDelete,
  onFeature,
  onTogglePublish,
  onDuplicate,
  onCopyLink,
  view,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
  topSellerId = null,
}: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div
        className="
        bg-white
        rounded-3xl
        p-16
        text-center
        border
        "
      >
        <h2 className="text-xl font-bold">لا توجد كورسات</h2>
        <p className="text-slate-500 mt-2">اضغط على إنشاء كورس جديد</p>
      </div>
    );
  }

  return (
    <div
      className={
        view === "grid"
          ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
          : "flex flex-col gap-5"
      }
    >
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onDelete={onDelete}
          onFeature={onFeature}
          onTogglePublish={onTogglePublish}
          onDuplicate={onDuplicate}
          onCopyLink={onCopyLink}
          view={view}
          selectionMode={selectionMode}
          selected={selectedIds?.has(course.id)}
          onToggleSelect={onToggleSelect}
          isTopSeller={topSellerId === course.id}
        />
      ))}
    </div>
  );
}

/* ============================================================
   InstructorCourses.tsx  (الصفحة الرئيسية)
   (الجديد: تحديد جماعي + Pagination + Confirm Dialog + اختصار
   البحث + skeleton مطابق للعرض + حساب أعلى كورس مبيعًا)
============================================================ */

const PAGE_SIZE = 9;

export function InstructorCourses() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [view, setView] = useState<"grid" | "list">("grid");

  const [page, setPage] = useState(1);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: "danger" | "primary";
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  /* اختصار لوحة المفاتيح "/" للقفز لخانة البحث */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        document.getElementById("course-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filteredCourses = courses
    .filter((course) => {
      const keyword = search.trim().toLowerCase();

      const matchSearch =
        keyword === "" ||
        course.title?.toLowerCase().includes(keyword) ||
        course.description?.toLowerCase().includes(keyword) ||
        course.teacher_name?.toLowerCase().includes(keyword) ||
        course.grade?.toLowerCase().includes(keyword);

      const matchGrade = gradeFilter === "all" || course.grade === gradeFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && course.is_published) ||
        (statusFilter === "draft" && !course.is_published);

      return matchSearch && matchGrade && matchStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.id.localeCompare(b.id);

        case "price-low":
          return a.price - b.price;

        case "price-high":
          return b.price - a.price;

        case "revenue-high":
          return courseRevenue(b) - courseRevenue(a);

        case "students-high":
          return (b.students_count || 0) - (a.students_count || 0);

        default:
          return b.id.localeCompare(a.id);
      }
    });

  /* إعادة الصفحة للأولى كل ما الفلاتر أو طريقة العرض تتغير */
  useEffect(() => {
    setPage(1);
  }, [search, gradeFilter, statusFilter, sortBy, view]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedCourses = filteredCourses.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  /* الكورس الأعلى تحقيقًا للإيرادات (لعرض وسام "الأعلى مبيعًا") */
  const topSellerId = useMemo(() => {
    let best: { id: string; revenue: number } | null = null;
    for (const c of courses) {
      const revenue = courseRevenue(c);
      if (revenue > 0 && (!best || revenue > best.revenue)) {
        best = { id: c.id, revenue };
      }
    }
    return best?.id || null;
  }, [courses]);

  const loadCourses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select(
        `
    *,
    course_sections(
      *,
      course_items(*)
    )
  `
      )
      .eq("teacher_id", user?.id)
      .order("created_at", {
        ascending: false,
      });

    const { data: subscriptions } = await supabase
      .from("student_courses")
      .select("student_id, course_id, active");

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }

    const coursesWithStudents = (data || []).map((course) => {
      const students = (subscriptions || []).filter(
        (s: any) => s.active && s.student_id != null && String(s.course_id) === String(course.id)
      );

      const uniqueStudents = new Set(students.map((s: any) => s.student_id));

      return {
        ...course,
        students_count: uniqueStudents.size,
      };
    });

    setCourses(coursesWithStudents);
    setIsLoading(false);
  };

  /* ─────────── فلاتر ─────────── */

  const resetFilters = () => {
    setSearch("");
    setGradeFilter("all");
    setStatusFilter("all");
    setSortBy("latest");
  };

  /* ─────────── تحديد متعدد ─────────── */

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pageIds = paginatedCourses.map((c) => c.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  /* ─────────── إجراءات فردية ─────────── */

  const toggleFeature = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    const newValue = !course.is_featured;

    const { error } = await supabase.from("courses").update({ is_featured: newValue }).eq("id", id);

    if (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تحديث الكورس");
      return;
    }

    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, is_featured: newValue } : c)));
  };

  const togglePublish = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    const newValue = !course.is_published;

    const { error } = await supabase
      .from("courses")
      .update({ is_published: newValue })
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تحديث حالة النشر");
      return;
    }

    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, is_published: newValue } : c)));
    toast.success(newValue ? "تم نشر الكورس" : "تم إخفاء الكورس");
  };

  const copyCourseLink = (id: string) => {
    const link = `${window.location.origin}/course/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("تم نسخ رابط الكورس");
  };

  const closeConfirm = () => setConfirmState(null);

  const requestDelete = (id: string) => {
    const course = courses.find((c) => c.id === id);
    setConfirmState({
      open: true,
      title: "حذف الكورس؟",
      message: `هل أنت متأكد من حذف "${course?.title || "هذا الكورس"}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabel: "حذف نهائي",
      variant: "danger",
      onConfirm: () => {
        deleteCourseConfirmed(id);
        closeConfirm();
      },
    });
  };

  const deleteCourseConfirmed = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }
    loadCourses();
    toast.success("تم حذف الكورس");
  };

  const requestDuplicate = (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    setConfirmState({
      open: true,
      title: "نسخ الكورس؟",
      message: `سيتم إنشاء نسخة جديدة من "${course.title}" كمسودة يمكنك تعديلها قبل النشر.`,
      confirmLabel: "نسخ الكورس",
      variant: "primary",
      onConfirm: () => {
        duplicateCourseConfirmed(id);
        closeConfirm();
      },
    });
  };

  const duplicateCourseConfirmed = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    const {
      id: _id,
      created_at: _created_at,
      course_sections: _sections,
      students_count: _students,
      ...rest
    } = course;

    const { error } = await supabase.from("courses").insert({
      ...rest,
      title: `${course.title} (نسخة)`,
      is_published: false,
      is_featured: false,
    });

    if (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء نسخ الكورس");
      return;
    }

    loadCourses();
    toast.success("تم نسخ الكورس بنجاح");
  };

  /* ─────────── إجراءات جماعية ─────────── */

  const requestBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setConfirmState({
      open: true,
      title: "حذف الكورسات المحددة؟",
      message: `سيتم حذف ${ids.length} كورس نهائيًا. لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabel: "حذف الكل",
      variant: "danger",
      onConfirm: () => {
        bulkDeleteConfirmed(ids);
        closeConfirm();
      },
    });
  };

  const bulkDeleteConfirmed = async (ids: string[]) => {
    const { error } = await supabase.from("courses").delete().in("id", ids);

    if (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء حذف الكورسات");
      return;
    }

    setSelectedIds(new Set());
    setSelectionMode(false);
    loadCourses();
    toast.success(`تم حذف ${ids.length} كورس بنجاح`);
  };

  const bulkTogglePublish = async (value: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const { error } = await supabase.from("courses").update({ is_published: value }).in("id", ids);

    if (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تحديث الكورسات");
      return;
    }

    setCourses((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, is_published: value } : c))
    );
    toast.success(value ? `تم نشر ${ids.length} كورس` : `تم إخفاء ${ids.length} كورس`);
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {/* Hero */}
      <div className="mb-4 sm:mb-6">
        <CourseHero
          onCreateCourse={() => navigate("/instructor/courses/create")}
          onCreateGeneralCourse={() => navigate("/instructor/courses/create?type=general")}
          totalCourses={courses.length}
          publishedCourses={courses.filter((c) => c.is_published).length}
          totalStudents={courses.reduce((sum, c) => sum + (c.students_count || 0), 0)}
          view={view}
          setView={setView}
        />
      </div>

      {/* Stats + Alert + Filters + Grid */}
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        <CourseStats courses={courses} />
        <CourseAlert courses={courses} />
        <CourseFilters
          search={search}
          setSearch={setSearch}
          gradeFilter={gradeFilter}
          setGradeFilter={setGradeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          view={view}
          setView={setView}
          resultsCount={filteredCourses.length}
          selectionMode={selectionMode}
          onToggleSelectionMode={toggleSelectionMode}
          onReset={resetFilters}
        />

        {!isLoading && selectionMode && paginatedCourses.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={toggleSelectAllOnPage}
                className="w-4 h-4 accent-[#155DFC]"
              />
              تحديد كل كورسات هذه الصفحة
            </label>
          </div>
        )}

        {isLoading ? (
          view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-[26px] border border-slate-200 bg-white overflow-hidden"
                >
                  <div className="p-3.5 pb-0">
                    <div className="aspect-[16/9] rounded-2xl bg-slate-100 animate-pulse" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-1/3 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-5 w-3/4 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[24px] border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center"
                >
                  <div className="w-full sm:w-52 md:w-64 h-40 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 w-full space-y-3">
                    <div className="h-3 w-1/4 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-6 w-2/3 bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[30px] border border-slate-200">
            <p className="text-slate-500 text-lg font-medium">
              {courses.length === 0
                ? "لسه معملتش أي كورس، ابدأ بإنشاء أول كورس ليك"
                : "لا توجد كورسات مطابقة لبحثك، جرّب تغيير الفلاتر"}
            </p>
            {courses.length === 0 ? (
              <Button
                onClick={() => navigate("/instructor/courses/create")}
                className="mt-5 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#155DFC] hover:bg-[#1547D6] text-white text-sm font-bold transition-colors"
              >
                <Plus size={16} />
                إنشاء كورس جديد
              </Button>
            ) : (
              <Button
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
              >
                <RotateCcw size={16} />
                إعادة ضبط الفلاتر
              </Button>
            )}
          </div>
        ) : (
          <>
            <CourseGrid
              courses={paginatedCourses}
              onDelete={requestDelete}
              onFeature={toggleFeature}
              onTogglePublish={togglePublish}
              onDuplicate={requestDuplicate}
              onCopyLink={copyCourseLink}
              view={view}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              topSellerId={topSellerId}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <ChevronRight size={16} />
                </button>
                <span className="text-sm font-bold text-slate-600 px-4">
                  صفحة {safePage} من {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* نافذة التأكيد الموحّدة */}
      <ConfirmDialog
        open={!!confirmState?.open}
        title={confirmState?.title || ""}
        message={confirmState?.message || ""}
        confirmLabel={confirmState?.confirmLabel || "تأكيد"}
        variant={confirmState?.variant || "primary"}
        onConfirm={() => confirmState?.onConfirm()}
        onCancel={closeConfirm}
      />

      {/* شريط الإجراءات الجماعية */}
      <BulkActionBar
        count={selectedIds.size}
        onPublish={() => bulkTogglePublish(true)}
        onUnpublish={() => bulkTogglePublish(false)}
        onDelete={requestBulkDelete}
        onClear={() => setSelectedIds(new Set())}
      />
    </DashboardLayout>
  );
}
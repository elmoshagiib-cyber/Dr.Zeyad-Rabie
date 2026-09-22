/* ============================================================
   instructor-courses (COMBINED FILE)
   يحتوي على كل الكومبوننتس الخاصة بصفحة "كورساتي" للمدرّس
   بعد تطبيق كل التعديلات والفيتشرز المتفق عليها:

   - InstructorCourses  (الصفحة الرئيسية)
   - CourseHero
   - CourseStats
   - CourseAlert         (badges + تنبيه كورس بدون محتوى)
   - CourseFilters       (تنظيف imports + shrink-0)
   - CourseGrid          (تمرير props الجديدة)
   - CourseCard          (نشر/إخفاء + نسخ رابط + نسخ كورس + نجمة موحدة)

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
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
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
  Video,
  FileText,
  Clock,
  GraduationCap,
  Layers,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
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

/* ============================================================
   CourseHero.tsx
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
============================================================ */

type CourseStatsProps = {
  courses: any[];
};

export function CourseStats({ courses }: CourseStatsProps) {
  const totalCourses = courses.length;

  const activeCourses = courses.filter((course) => course.is_published).length;

  const freeCourses = courses.filter((course) => course.is_free).length;

  const draftCourses = courses.filter((course) => !course.is_published).length;

  const pct = (value: number) =>
    totalCourses === 0
      ? "لا يوجد كورسات بعد"
      : `${Math.round((value / totalCourses) * 100)}% من الإجمالي`;

  const stats = [
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
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item) => {
        const Icon = item.icon;

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

            <div className="flex items-start justify-between">
              <div
                className={`
                  w-14
                  h-14
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

              <div className="text-right">
                <p className="text-slate-500 text-sm font-medium">{item.title}</p>
                <h2 className="mt-1 text-4xl font-black text-slate-800 tabular-nums">
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
   CourseAlert.tsx
   (بعد التعديل: badges منظمة + تنبيه "كورس منشور بدون محتوى")
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
      items-center
      justify-between
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
   (بعد التعديل: imports نظيفة + shrink-0 لزرار الريست)
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
};

export function CourseFilters({
  search,
  setSearch,
  gradeFilter,
  setGradeFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  view,
  setView,
  resultsCount,
}: CourseFiltersProps) {
  const selectClass = `
w-full
h-12
rounded-2xl
border
border-slate-200
bg-white
pr-11
pl-4
outline-none
transition
shadow-sm
cursor-pointer
hover:border-slate-300
focus:border-[#155DFC]
focus:ring-4
focus:ring-blue-100
`;

  const activeFilters = (gradeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 shadow-sm p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="text-right">
          <h2 className="text-2xl font-black">فلتر الكورسات</h2>
          <p className="text-slate-500 mt-1">ابحث ورتب واعرض الكورسات بالطريقة المناسبة.</p>
        </div>

        <div
          className={`inline-flex items-center justify-center min-w-[95px] h-11 rounded-full font-bold transition-colors ${
            resultsCount === 0
              ? "bg-red-50 text-red-500"
              : "bg-blue-100 text-[#155DFC]"
          }`}
        >
          {resultsCount} كورس
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الكورس أو الوصف..."
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
        <div className="relative w-full lg:w-[210px]">
          <GraduationCap
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">كل الصفوف</option>
            <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
            <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
            <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
            <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
            <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
            <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
          </select>
        </div>

        {/* Status */}
        <div className="relative w-full lg:w-[180px]">
          <CheckCircle2
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">كل الحالات</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
          </select>
        </div>

        {/* Sort */}
        <div className="relative w-full lg:w-[170px]">
          <Layers
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={selectClass}
          >
            <option value="latest">الأحدث</option>
            <option value="oldest">الأقدم</option>
            <option value="price-low">السعر الأقل</option>
            <option value="price-high">السعر الأعلى</option>
          </select>
        </div>

        {/* Reset */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setSearch("");
              setGradeFilter("all");
              setStatusFilter("all");
              setSortBy("latest");
            }}
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
      <div className="mt-6 flex items-center justify-between">
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
   (بعد التعديل: نشر/إخفاء + نسخ رابط + نسخ كورس + نجمة موحدة +
   تاريخ آخر تحديث في List View)
============================================================ */

type CourseCardProps = {
  course: any;
  onDelete: (id: string) => void;
  onFeature?: (id: string) => void;
  onTogglePublish?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  view: "grid" | "list";
};

export function CourseCard({
  course,
  onDelete,
  onFeature,
  onTogglePublish,
  onDuplicate,
  onCopyLink,
  view,
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

  /* ────────────── LIST VIEW ────────────── */
  if (view === "list") {
    return (
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-lg transition p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
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
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <h2 className="text-lg sm:text-2xl font-black">{course.title}</h2>
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

          <div className="flex flex-wrap justify-between items-center mt-6 gap-3">
            <span
              className={`text-2xl sm:text-3xl font-black ${
                course.is_free ? "text-emerald-600" : "text-[#155DFC]"
              }`}
            >
              {course.is_free ? "مجاني" : `${course.price} ج.م`}
            </span>

            <div className="flex gap-2">
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
      className="
        group
        bg-white
        border
        border-gray-200
        shadow-[0_4px_20px_rgba(0,0,0,.06)]
        hover:shadow-[0_10px_35px_rgba(0,0,0,.1)]
        rounded-[26px]
        overflow-hidden
        transition-all
        duration-300
        flex
        flex-col
      "
    >
      {/* ── الصورة ── */}
      <div className="p-3 sm:p-3.5 pb-0">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
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
              absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white
              ${course.is_published ? "bg-green-500" : "bg-amber-500"}
            `}
          >
            {course.is_published ? "منشور" : "مسودة"}
          </span>
        </div>
      </div>

      {/* ── المحتوى ── */}
      <div className="p-4 flex flex-col flex-1">
        {/* الصف الدراسي */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {getGradeLabel(course.grade)}
          </span>
          {/* نقطة الحالة */}
          <span
            className={`w-2 h-2 rounded-full ${
              course.is_published ? "bg-green-500" : "bg-amber-400"
            }`}
          />
        </div>

        {/* العنوان */}
        <h2 className="text-base sm:text-lg font-black line-clamp-2 leading-snug">
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
        </div>

        {/* فاصل */}
        <div className="mt-4 border-t border-slate-100" />

        {/* ── الفوتر ── */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {/* أيقونات الأكشن */}
          <div className="flex items-center gap-1.5">
            {/* 👁️ نشر / إخفاء */}
            <button
              onClick={() => onTogglePublish?.(course.id)}
              title={course.is_published ? "إخفاء الكورس" : "نشر الكورس"}
              className="h-9 w-9 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition flex items-center justify-center"
            >
              {course.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            {/* 🗑️ حذف */}
            <button
              onClick={() => onDelete(course.id)}
              title="حذف الكورس"
              className="h-9 w-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>

            {/* ✏️ تعديل المحتوى */}
            <button
              onClick={() => navigate(`/instructor/courses/edit/${course.id}`)}
              title="تعديل الكورس"
              className="h-9 w-9 rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-100 transition flex items-center justify-center"
            >
              <Edit size={16} />
            </button>

            {/* ⭐ تمييز (يظهر في المقترحة) */}
            <button
              onClick={() => onFeature?.(course.id)}
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
};

export function CourseGrid({
  courses,
  onDelete,
  onFeature,
  onTogglePublish,
  onDuplicate,
  onCopyLink,
  view,
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
        view === "grid" ? "grid xl:grid-cols-3 lg:grid-cols-2 gap-6" : "flex flex-col gap-6"
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
        />
      ))}
    </div>
  );
}

/* ============================================================
   InstructorCourses.tsx  (الصفحة الرئيسية)
   (بعد التعديل: togglePublish + duplicateCourse + copyCourseLink
   + skeleton محسّن وقت التحميل)
============================================================ */

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

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

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

        default:
          return b.id.localeCompare(a.id);
      }
    });

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

  const toggleFeature = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    const newValue = !course.is_featured;

    const { error } = await supabase.from("courses").update({ is_featured: newValue }).eq("id", id);

    if (error) {
      console.error(error);
      alert("حدث خطأ أثناء تحديث الكورس");
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
      alert("حدث خطأ أثناء تحديث حالة النشر");
      return;
    }

    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, is_published: newValue } : c)));
  };

  const duplicateCourse = async (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    if (!confirm(`هل تريد إنشاء نسخة من "${course.title}"؟`)) return;

    const { id: _id, created_at, course_sections, students_count, ...rest } = course;

    const { data, error } = await supabase
      .from("courses")
      .insert({
        ...rest,
        title: `${course.title} (نسخة)`,
        is_published: false,
        is_featured: false,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("حدث خطأ أثناء نسخ الكورس");
      return;
    }

    loadCourses();
  };

  const copyCourseLink = (id: string) => {
    const link = `${window.location.origin}/course/${id}`;
    navigator.clipboard.writeText(link);
    alert("تم نسخ رابط الكورس");
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف الكورس؟")) return;

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }
    loadCourses();
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
        />
        {isLoading ? (
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
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[30px] border border-slate-200">
            <p className="text-slate-500 text-lg font-medium">
              {courses.length === 0
                ? "لسه معملتش أي كورس، ابدأ بإنشاء أول كورس ليك"
                : "لا توجد كورسات مطابقة لبحثك، جرّب تغيير الفلاتر"}
            </p>
          </div>
        ) : (
          <CourseGrid
            courses={filteredCourses}
            onDelete={deleteCourse}
            onFeature={toggleFeature}
            onTogglePublish={togglePublish}
            onDuplicate={duplicateCourse}
            onCopyLink={copyCourseLink}
            view={view}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
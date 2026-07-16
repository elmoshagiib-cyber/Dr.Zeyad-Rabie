import {
  Users,
  BookOpen,
  Edit,
  Trash2,
  Star,
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  course: any;
  onDelete: (id: string) => void;
  onFeature?: (id: string) => void;
  view: "grid" | "list";
};

export function CourseCard({ course, onDelete, onFeature, view }: Props) {
  const navigate = useNavigate();
  const sections = course.course_sections || [];
  const lectures = sections.length;

  const videos = sections.reduce((sum: number, section: any) => {
    return (
      sum +
      (section.course_items?.filter((item: any) => item.type === "video")
        .length || 0)
    );
  }, 0);

  const files = sections.reduce((sum: number, section: any) => {
    return (
      sum +
      (section.course_items?.filter((item: any) => item.type === "pdf")
        .length || 0)
    );
  }, 0);

  /* ────────────── LIST VIEW ────────────── */
  if (view === "list") {
    return (
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm hover:shadow-lg transition p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
        <img
          src={
            course.thumbnail ||
            course.cover_image ||
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
            <span>🎓 {course.grade}</span>
          </div>

          <div className="flex flex-wrap justify-between items-center mt-6 gap-3">
            <span className="text-2xl sm:text-3xl font-black text-violet-700">
              {course.price} ج
            </span>

            <div className="flex gap-2">
              {/* نجمة - تمييز */}
              <button
                onClick={() => onFeature?.(course.id)}
                title="تمييز الكورس"
                className="h-10 w-10 rounded-xl bg-yellow-50 text-yellow-500 hover:bg-yellow-100 transition flex items-center justify-center"
              >
                <Star size={17} />
              </button>

              {/* تعديل */}
              <button
                onClick={() =>
                  navigate(`/instructor/courses/edit/${course.id}`)
                }
                title="تعديل"
                className="h-10 px-4 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition flex items-center gap-2 text-sm font-bold"
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
        overflow-hidden
        rounded-[22px]
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-2xl
        flex
        flex-col
      "
    >
      {/* ── الصورة ── */}
      <div className="relative">
        <img
          src={
            course.thumbnail ||
            course.cover_image ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
          }
          className="w-full aspect-[16/9] object-cover"
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

      {/* ── المحتوى ── */}
      <div className="p-4 flex flex-col flex-1">

        {/* الصف الدراسي */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {course.grade}
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

            {/* 🗑️ حذف */}
            <button
              onClick={() => onDelete(course.id)}
              title="حذف الكورس"
              className="
                w-9 h-9 rounded-xl
                bg-red-50 text-red-500
                hover:bg-red-100
                transition
                flex items-center justify-center
              "
            >
              <Trash2 size={16} />
            </button>

            {/* ✏️ تعديل المحتوى */}
            <button
              onClick={() =>
                navigate(`/instructor/courses/edit/${course.id}`)
              }
              title="تعديل الكورس"
              className="
                w-9 h-9 rounded-xl
                bg-amber-50 text-amber-500
                hover:bg-amber-100
                transition
                flex items-center justify-center
              "
            >
              <Edit size={16} />
            </button>

            {/* ⭐ تمييز (يظهر في المقترحة) */}
            <button
              onClick={() => onFeature?.(course.id)}
              title="إضافة للكورسات المقترحة"
              className={`
                w-9 h-9 rounded-xl
                transition
                flex items-center justify-center
                ${
                  course.is_featured
                    ? "bg-yellow-400 text-white hover:bg-yellow-500"
                    : "bg-yellow-50 text-yellow-500 hover:bg-yellow-100"
                }
              `}
            >
              <Star size={16} />
            </button>

          </div>

          {/* السعر */}
          <span className="text-xl sm:text-2xl font-black text-violet-700 whitespace-nowrap">
            {course.price} ج.م
          </span>

        </div>
      </div>
    </div>
  );
}
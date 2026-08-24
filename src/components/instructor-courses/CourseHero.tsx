import {
  Plus,
  LayoutGrid,
  Rows3,
  BookOpen,
} from "lucide-react";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  onCreateCourse: () => void;
  onCreateGeneralCourse?: () => void;

  totalCourses: number;

  publishedCourses: number;

  totalStudents: number;

  view: "grid" | "list";
  setView: React.Dispatch<React.SetStateAction<"grid" | "list">>;
};

export function CourseHero({
  onCreateCourse,
  onCreateGeneralCourse,
  totalCourses,
  publishedCourses,
  totalStudents,
  view,
  setView,
}: Props) {
  

return (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#0F172A] via-[#1E1B3A] to-[#2A1B4D] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg"
  >
    {/* Background Blur */}
    <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-[#B348FE]/10 blur-[100px]" />
    <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-[#B348FE]/10 blur-[100px]" />

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
                ? "bg-white text-[#1E1B3A] shadow"
                : "text-white hover:bg-white/10"
            }`}
          >
            <Rows3 size={16} />
          </button>

          <button
            onClick={() => setView("grid")}
            className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-all ${
              view === "grid"
                ? "bg-white text-[#1E1B3A] shadow"
                : "text-white hover:bg-white/10"
            }`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        {/* إضافة كورس عام */}
        <Button
          onClick={onCreateGeneralCourse}
          className="flex items-center gap-1.5 h-9 sm:h-10 rounded-xl bg-white/10 backdrop-blur border border-white/10 px-3 sm:px-4 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-white/20 whitespace-nowrap"
        >
          إضافة كورس عام
        </Button>

        {/* إنشاء كورس جديد */}
        <Button
          onClick={onCreateCourse}
          className="flex items-center gap-1.5 h-9 sm:h-10 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 text-xs sm:text-sm font-bold text-white transition-colors whitespace-nowrap"
        >
          <Plus size={16} />
          إنشاء كورس جديد
        </Button>
      </div>
    </div>
  </motion.div>
);
}
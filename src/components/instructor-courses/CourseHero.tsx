import {
  Plus,
  LayoutGrid,
  Rows3,
  BookOpen,
} from "lucide-react";

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
  <div
    className="
  relative
  overflow-hidden
  rounded-[32px]
  bg-gradient-to-r
from-[#C65CFF]
via-[#B348FE]
to-[#9E2FFF]
  py-5
px-5

lg:px-7
lg:py-6
  text-white
  shadow-[0_18px_45px_rgba(179,72,254,.22)]
"
  >
    {/* Background Blur */}
<div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
<div className="absolute -right-24 bottom-0 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">

      {/* الأزرار + View toggle — يمين في RTL يبقى شمال بصرياً */}
      <div className="flex w-full lg:w-auto items-center gap-3 order-2 lg:order-1">
        {/* View toggle */}
        <div
          className="
            inline-flex
            w-fit
            rounded-2xl
            border
            border-white/20
            bg-white/10
            p-1
            backdrop-blur-xl
          "
        >
          <button
            onClick={() => setView("list")}
            className={`
              flex
              h-10
              w-10
              md:h-11
              md:w-11
              items-center
              justify-center
              rounded-xl
              transition-all
              ${
                view === "list"
                  ? "bg-white text-violet-700 shadow"
                  : "text-white hover:bg-white/10"
              }
            `}
          >
            <Rows3 size={18} />
          </button>

          <button
            onClick={() => setView("grid")}
            className={`
              flex
              h-10
              w-10
              md:h-11
              md:w-11
              items-center
              justify-center
              rounded-xl
              transition-all
              ${
                view === "grid"
                  ? "bg-white text-violet-700 shadow"
                  : "text-white hover:bg-white/10"
              }
            `}
          >
            <LayoutGrid size={18} />
          </button>
        </div>

        {/* إضافة كورس عام — outline */}
        <Button
          onClick={onCreateGeneralCourse}
          className="
            h-10 md:h-11
            rounded-2xl
            border
            border-white/30
            bg-white/10
            px-4 md:px-5
            font-bold
            text-white
            backdrop-blur-xl
            transition-all
            hover:bg-white/20
            hover:-translate-y-0.5
            active:scale-95
            whitespace-nowrap
          "
        >
          إضافة كورس عام
        </Button>

        {/* إنشاء كورس جديد للمراحل — primary */}
        <Button
          onClick={onCreateCourse}
          className="
            h-10 md:h-11
            rounded-2xl
            bg-white
            px-4 md:px-5
            font-bold
            text-violet-700
            shadow-xl
            transition-all
            hover:-translate-y-0.5
            hover:scale-105
            hover:shadow-2xl
            active:scale-95
            whitespace-nowrap
          "
        >
          <Plus size={18} />
          كورس جديد للمراحل
        </Button>
      </div>

      {/* المعلومات — يمين */}
      <div className="flex items-center gap-3 order-1 lg:order-2 text-right w-full lg:w-auto justify-end">
        <div className="flex-1 lg:flex-none">
          <h1 className="flex items-center justify-end gap-2 text-xl md:text-2xl lg:text-3xl font-black text-white">
            إدارة الكورسات والشهور
            <BookOpen size={22} className="text-white" />
          </h1>

          <p className="mt-1.5 max-w-md text-xs md:text-sm text-white/90">
            تحكم كامل في المحتوى التعليمي، الأسعار، والمشتركين من مكان واحد.
          </p>
        </div>
      </div>
    </div>
  </div>
);
}
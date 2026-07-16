import {
  Plus,
  LayoutGrid,
  Rows3,
} from "lucide-react";

import { Button } from "../ui/Button";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  onCreateCourse: () => void;


  totalCourses: number;

  publishedCourses: number;

  totalStudents: number;

  view: "grid" | "list";

  setView: React.Dispatch<
    React.SetStateAction<"grid" | "list">
  >;
};

export function CourseHero({
  onCreateCourse,
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
  bg-[#4C1D95]
  p-5 md:p-7 lg:p-8
  text-white
  shadow-xl
"
  >
    {/* Background Blur */}
<div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
<div className="absolute -right-24 bottom-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

    <div className="relative z-10 flex flex-col-reverse lg:flex-row items-start justify-between gap-6">
      {/* المعلومات */}
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black">
          إدارة الكورسات
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <span
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-emerald-500/20
              px-3
              py-1
              text-sm
              text-emerald-100
            "
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            متصل بقاعدة البيانات
          </span>
        </div>

        <p className="mt-3 max-w-xl text-sm md:text-base text-violet-100">
          تحكم في جميع الكورسات والمحاضرات والطلاب
          من مكان واحد بسهولة.
        </p>


        {/* Divider */}
        <div className="mt-8 h-px bg-white/10" />

        {/* حالة النظام */}
        <div className="mt-6 flex items-center gap-6 text-sm text-violet-100">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            جميع البيانات متزامنة
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold">
              {publishedCourses}
            </span>

            <span>من</span>

            <span className="font-bold">
              {totalCourses}
            </span>

            <span>كورس منشور</span>
          </div>
        </div>
      </div>

      {/* الأزرار */}
      <div className="flex w-full lg:w-auto flex-row lg:flex-col justify-end gap-3">
        <Button
          onClick={onCreateCourse}
          className="
            h-12 md:h-14
            rounded-2xl
            bg-white
            px-8
            font-bold
            text-violet-700
            shadow-xl
            transition-all
            hover:-translate-y-1
            hover:scale-105
            hover:shadow-2xl
            active:scale-95
          "
        >
          <Plus size={20} />
          إنشاء كورس جديد
        </Button>


        {/* View */}
        <div
          className="
            flex
            rounded-2xl
            border
            border-white/10
            bg-white/10
            p-1
            backdrop-blur
          "
        >
          <button
            onClick={() => setView("grid")}
            className={`
              flex
              h-12
              w-12
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
            <LayoutGrid size={20} />
          </button>

          <button
            onClick={() => setView("list")}
            className={`
              flex
              h-12
              w-12
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
            <Rows3 size={20} />
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
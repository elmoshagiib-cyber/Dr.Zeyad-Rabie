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
  bg-gradient-to-r
from-[#C65CFF]
via-[#B348FE]
to-[#9E2FFF]
  py-6
px-6

lg:px-8
lg:py-7
  text-white
  shadow-[0_18px_45px_rgba(179,72,254,.22)]
"
  >
    {/* Background Blur */}
<div className="absolute -left-24 -top-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
<div className="absolute -right-24 bottom-0 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

    <div className="relative z-10 flex flex-col-reverse lg:flex-row items-start justify-between gap-6">
      {/* المعلومات */}
      <div className="flex-1">
        <h1 className="text-3xl lg:text-4xl font-black">
          إدارة الكورسات
        </h1>



        <p className="mt-3 max-w-xl text-sm md:text-base text-violet-100">
         أنشئ الكورسات، نظّم المحتوى، وتابع جميع المواد التعليمية الخاصة بك.
        </p>


      </div>

      {/* الأزرار */}
      <div className="flex w-full lg:w-auto flex-row lg:flex-col justify-end gap-3">
        <Button
          onClick={onCreateCourse}
          className="
            h-12 md:h-14
            rounded-[20px]
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
    inline-flex
    w-fit
    rounded-2xl
    border
    border-white/10
    bg-white/10
    p-1
    backdrop-blur-xl
    self-end
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
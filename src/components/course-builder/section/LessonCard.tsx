import {
  FileVideo,
  FileText,
  ClipboardList,
  FileCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { LessonPreview } from "../preview/LessonPreview";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";

type Props = {
  lesson: any;

  sectionId: string;

  lessonIndex: number;

  deleteLesson: (
    sectionId: string,
    lessonIndex: number
  ) => void;
};

export function LessonCard({
  lesson,
  sectionId,
  lessonIndex,
  deleteLesson,
}: Props) {

   const [showPreview, setShowPreview] =
    useState(false);

 return (
<>
<div
  onClick={() => setShowPreview(true)}
  className="cursor-pointer"
>

<Card
  className="rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
>
    <CardContent className="p-6">

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-4">

  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">

    <FileVideo className="text-violet-700" />

  </div>

  <div>

    <h3 className="text-xl font-black">
      {lesson.title}
    </h3>

    <p className="text-slate-500 mt-1">
      محتويات الدرس
    </p>

  </div>

</div>

    <Button
  variant="destructive"
  size="icon"
  className="rounded-xl"
  onClick={(e) => {
    e.stopPropagation();

    deleteLesson(
      sectionId,
      lessonIndex
    );
  }}
>
          <Trash2 size={16} />
        </Button>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

        <div className="
rounded-2xl
border
bg-violet-50
p-5
transition-all
hover:-translate-y-1
hover:shadow-lg
cursor-default
">

          <FileVideo className="text-violet-600 mb-3" />

          <h4 className="font-bold">
            الفيديوهات
          </h4>

          <p className="text-slate-500 text-sm mt-1">
            {lesson.videos?.length || 0} فيديو
          </p>

        </div>

        <div className="
rounded-2xl
border
bg-blue-50
p-5
transition-all
hover:-translate-y-1
hover:shadow-lg
cursor-default
">

          <FileText className="text-blue-600 mb-3" />

          <h4 className="font-bold">
            ملفات PDF
          </h4>

          <p className="text-slate-500 text-sm mt-1">
            {lesson.pdfs?.length || 0} ملف
          </p>

        </div>

        <div className="
rounded-2xl
border
bg-orange-50
p-5
transition-all
hover:-translate-y-1
hover:shadow-lg
cursor-default
">

          <ClipboardList className="text-orange-600 mb-3" />

          <h4 className="font-bold">
            الواجب
          </h4>

          <p className="text-slate-500 text-sm mt-1">
            {lesson.homework ? "تمت إضافته" : "لا يوجد"}
          </p>

        </div>

        <div className="
rounded-2xl
border
bg-green-50
p-5
transition-all
hover:-translate-y-1
hover:shadow-lg
cursor-default
">

          <FileCheck className="text-green-600 mb-3" />

          <h4 className="font-bold">
            الامتحان
          </h4>

          <p className="text-slate-500 text-sm mt-1">
            {lesson.exam ? "تمت إضافته" : "لا يوجد"}
          </p>

        </div>
        </div>
        

<div className="mt-6 flex items-center justify-between border-t pt-5">

  <p className="text-sm text-slate-400">

    آخر تعديل الآن

  </p>

  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">

    مكتمل

  </span>

</div>


</CardContent>

</Card>

</div>

{showPreview && (
  <LessonPreview
    lesson={lesson}
    onClose={() => setShowPreview(false)}
  />
)}

</>
);
}
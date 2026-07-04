import { useState } from "react";
import { ExamBuilder } from "../exam-builder/ExamBuilder";
import { HomeworkBuilder } from "../homework-builder/HomeworkBuilder";

import {
  Video,
  FileText,
  ClipboardList,
  FileCheck,
  Save,
} from "lucide-react";

import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

type Props = {
onSave: (
  lesson: {
    title: string;
    videos: File[];
    pdfs: File[];
    exam: any;
    homework: any;
  }
) => void;
};

export function LessonEditor({ onSave }: Props) {
  const [title, setTitle] = useState("");

  const [videos, setVideos] = useState<File[]>([]);
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [exam, setExam] = useState<any>(null);
const [openExam, setOpenExam] = useState(false);
const [homework, setHomework] = useState<any>(null);
const [openHomework, setOpenHomework] = useState(false);
  return (
    <Card className="w-full rounded-3xl border border-slate-200 shadow-xl">

      <CardContent className="p-8 space-y-8">

        <div>
          <h3 className="text-2xl font-bold">
            إنشاء درس جديد
          </h3>


<div className="grid grid-cols-4 gap-3 mt-8">

  <div className="rounded-2xl bg-violet-50 p-4 text-center">
    <p className="text-2xl font-black text-violet-700">
      {videos.length}
    </p>

    <p className="text-sm text-slate-500">
      فيديو
    </p>
  </div>

  <div className="rounded-2xl bg-blue-50 p-4 text-center">
    <p className="text-2xl font-black text-blue-700">
      {pdfs.length}
    </p>

    <p className="text-sm text-slate-500">
      PDF
    </p>
  </div>

  <div className="rounded-2xl bg-orange-50 p-4 text-center">
    <p className="text-2xl font-black text-orange-700">
      0
    </p>

    <p className="text-sm text-slate-500">
      واجب
    </p>
  </div>

  <div className="rounded-2xl bg-green-50 p-4 text-center">
    <p className="text-2xl font-black text-green-700">
      0
    </p>

    <p className="text-sm text-slate-500">
      امتحان
    </p>
  </div>

</div>

          <p className="text-slate-500 mt-2">
            أضف جميع محتويات الدرس من فيديوهات وملفات وامتحانات وواجبات.
          </p>
        </div>

        <div className="space-y-2">
          <label>اسم الدرس</label>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال : الدرس الأول"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <label className="
group
rounded-3xl
border-2
border-dashed
border-slate-200
bg-slate-50
h-44
cursor-pointer
transition-all
duration-300
hover:border-violet-500
hover:bg-violet-50
flex
flex-col
items-center
justify-center
">

            <Video
  size={42}
  className="
  text-violet-600
  mb-4
  group-hover:scale-110
  transition
  "
/>

            <span>رفع فيديوهات</span>
            <p className="text-xs text-slate-400 mt-2">
MP4 • MOV • AVI
</p>

{videos.length > 0 && (
  <p className="mt-2 text-sm font-medium text-violet-600">
    تم اختيار {videos.length} فيديو
  </p>
)}
            <input
              hidden
              multiple
              type="file"
              accept="video/*"
              onChange={(e) =>
                setVideos(
                  Array.from(e.target.files || [])
                )
              }
            />

          </label>

          <label className="border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500">

            <FileText className="text-blue-600 mb-3" />

            <span>رفع ملفات PDF</span>
            <p className="text-xs text-slate-400 mt-2">
PDF فقط
</p>

{pdfs.length > 0 && (
  <p className="mt-2 text-sm font-medium text-blue-600">
    تم اختيار {pdfs.length} ملف
  </p>
)}
            <input
              hidden
              multiple
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setPdfs(
                  Array.from(e.target.files || [])
                )
              }
            />

          </label>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

<Button
  variant="outline"
  className="h-28 rounded-2xl text-lg"
  onClick={() => setOpenExam(true)}
>
    <FileCheck className="mr-2" />

    إنشاء امتحان
  </Button>

 <Button
  variant="outline"
  className="h-28 rounded-2xl text-lg"
  onClick={() => setOpenHomework(true)}
>
    <ClipboardList className="mr-2" />

    إنشاء واجب
  </Button>

{openHomework && (
  <HomeworkBuilder
    onClose={() => setOpenHomework(false)}
    onSave={(data) => {
      setHomework(data);
      setOpenHomework(false);
    }}
  />
)}

</div>

{openExam && (
  <ExamBuilder
    onClose={() => setOpenExam(false)}
    onSave={(examData) => {
      setExam(examData);
      setOpenExam(false);
    }}
  />
)}
        <div className="flex justify-end">

          <Button
  disabled={!title.trim()}
  onClick={() =>
    onSave({
      title,
      videos,
      pdfs,
       exam,
        homework,
    })
  }
>
  <Save size={18} />
  حفظ الدرس
</Button>

        </div>

      </CardContent>

    </Card>
  );
}
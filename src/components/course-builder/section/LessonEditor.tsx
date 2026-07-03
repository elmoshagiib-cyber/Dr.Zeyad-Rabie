import { useState } from "react";
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
    }
  ) => void;
};

export function LessonEditor({ onSave }: Props) {
  const [title, setTitle] = useState("");

  const [videos, setVideos] = useState<File[]>([]);
  const [pdfs, setPdfs] = useState<File[]>([]);
const [openExam, setOpenExam] = useState(false);

const [openHomework, setOpenHomework] = useState(false);
  return (
    <Card className="rounded-3xl border border-slate-200 shadow-sm">

      <CardContent className="p-8 space-y-8">

        <div>
          <h3 className="text-2xl font-bold">
            إنشاء درس جديد
          </h3>

          <p className="text-slate-500 mt-2">
            أضف الفيديوهات والملفات الخاصة بالدرس.
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

          <label className="border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500">

            <Video className="text-violet-600 mb-3" />

            <span>رفع فيديوهات</span>

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

</div>

        <div className="flex justify-end">

          <Button
            onClick={() =>
              onSave({
                title,
                videos,
                pdfs,
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
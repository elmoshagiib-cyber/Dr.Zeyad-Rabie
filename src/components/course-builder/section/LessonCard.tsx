import {
  FileVideo,
  FileText,
  ClipboardList,
  FileCheck,
  Trash2,
} from "lucide-react";

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
  return (
    <Card className="rounded-2xl border border-slate-200 bg-slate-50">

      <CardContent className="p-5">

        <div className="flex items-center justify-between">

          <div>

            <h4 className="font-bold text-lg">
              {lesson.title}
            </h4>

            <p className="text-slate-500 text-sm mt-1">
              محتوى المحاضرة
            </p>

          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              deleteLesson(sectionId, lessonIndex)
            }
          >
            <Trash2 size={16} />
          </Button>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

          <div className="rounded-xl bg-white border p-4 text-center">

            <FileVideo
              className="mx-auto text-violet-600"
            />

            <p className="mt-2 font-semibold">
              فيديو
            </p>

          </div>

          <div className="rounded-xl bg-white border p-4 text-center">

            <FileText
              className="mx-auto text-blue-600"
            />

            <p className="mt-2 font-semibold">
              PDF
            </p>

          </div>

          <div className="rounded-xl bg-white border p-4 text-center">

            <ClipboardList
              className="mx-auto text-orange-500"
            />

            <p className="mt-2 font-semibold">
              واجب
            </p>

          </div>

          <div className="rounded-xl bg-white border p-4 text-center">

            <FileCheck
              className="mx-auto text-green-600"
            />

            <p className="mt-2 font-semibold">
              امتحان
            </p>

          </div>

        </div>

      </CardContent>

    </Card>
  );
}
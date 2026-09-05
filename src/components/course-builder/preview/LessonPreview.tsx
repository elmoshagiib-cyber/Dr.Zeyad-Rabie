import {
  Video,
  FileText,
  ClipboardList,
  FileCheck,
  X,
} from "lucide-react";

import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";

type Props = {
  lesson: any;
  onClose: () => void;
};

export function LessonPreview({
  lesson,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-8">

      <Card className="w-full max-w-5xl rounded-3xl shadow-2xl">

        <CardContent className="p-8">

          <div className="mb-8 flex items-center justify-between">

            <div>

              <h2 className="text-3xl font-black">
                {lesson.title}
              </h2>

              <p className="mt-2 text-slate-500">
                معاينة الدرس
              </p>

            </div>

            <Button
              variant="outline"
              onClick={onClose}
            >
              <X size={18} />
            </Button>

          </div>

          {/* Stats */}

          <div className="grid grid-cols-4 gap-5 mb-8">

            <div className="rounded-2xl bg-violet-50 p-5 text-center">

              <Video className="mx-auto mb-3 text-violet-700" />

              <p className="text-2xl font-black">
                {lesson.videos?.length || 0}
              </p>

              <span className="text-slate-500">
                فيديو
              </span>

            </div>

            <div className="rounded-2xl bg-blue-50 p-5 text-center">

              <FileText className="mx-auto mb-3 text-blue-700" />

              <p className="text-2xl font-black">
                {lesson.pdfs?.length || 0}
              </p>

              <span className="text-slate-500">
                PDF
              </span>

            </div>

            <div className="rounded-2xl bg-orange-50 p-5 text-center">

              <ClipboardList className="mx-auto mb-3 text-orange-700" />

              <p className="text-2xl font-black">
                {lesson.homework ? 1 : 0}
              </p>

              <span className="text-slate-500">
                واجب
              </span>

            </div>

            <div className="rounded-2xl bg-green-50 p-5 text-center">

              <FileCheck className="mx-auto mb-3 text-green-700" />

              <p className="text-2xl font-black">
                {lesson.exam ? 1 : 0}
              </p>

              <span className="text-slate-500">
                امتحان
              </span>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Videos */}

            <Card>

              <CardContent className="p-6">

                <h3 className="mb-5 text-xl font-black">
                  الفيديوهات
                </h3>

                {lesson.videos?.length ? (

                  lesson.videos.map(
                    (video: File, index: number) => (

                      <div
                        key={index}
                        className="mb-3 rounded-xl border p-3"
                      >
                        <div className="flex items-center justify-between rounded-xl border p-3">

  <span>{video.name}</span>

  <span className="text-xs text-slate-400">
    {(video.size / 1024 / 1024).toFixed(2)} MB
  </span>

</div>
                      </div>

                    )
                  )

                ) : (

                  <p className="text-slate-400">
                    لا يوجد فيديوهات
                  </p>

                )}

              </CardContent>

            </Card>

            {/* PDF */}

            <Card>

              <CardContent className="p-6">

                <h3 className="mb-5 text-xl font-black">
                  ملفات PDF
                </h3>

                {lesson.pdfs?.length ? (

                  lesson.pdfs.map(
                    (pdf: File, index: number) => (

                      <div
                        key={index}
                        className="mb-3 rounded-xl border p-3"
                      >
                        {pdf.name}
                      </div>

                    )
                  )

                ) : (

                  <p className="text-slate-400">
                    لا يوجد ملفات
                  </p>

                )}

              </CardContent>

            </Card>

          </div>

        </CardContent>

      </Card>

<Card>
  <CardContent className="p-6">

    <h3 className="mb-5 text-xl font-black">
      الواجب
    </h3>

    {lesson.homework ? (

      <div className="space-y-3">

        <p>
          <b>الاسم:</b> {lesson.homework.title}
        </p>

        <p>
          <b>الدرجة:</b> {lesson.homework.score}
        </p>

        <p>
          <b>آخر موعد:</b> {lesson.homework.deadline}
        </p>

      </div>

    ) : (

      <p className="text-slate-400">
        لا يوجد واجب
      </p>

    )}

  </CardContent>
</Card>

<Card>
  <CardContent className="p-6">

    <h3 className="mb-5 text-xl font-black">
      الامتحان
    </h3>

    {lesson.exam ? (

      <div className="space-y-3">

        <p>
          <b>الاسم:</b> {lesson.exam.title}
        </p>

        <p>
          <b>عدد الأسئلة:</b> {lesson.exam.questions.length}
        </p>

        <p>
          <b>مدة الامتحان:</b> {lesson.exam.duration} دقيقة
        </p>

      </div>

    ) : (

      <p className="text-slate-400">
        لا يوجد امتحان
      </p>

    )}

  </CardContent>
</Card>

<div className="mt-8 flex items-center justify-end gap-3 border-t pt-6">

  <Button variant="outline">
    تعديل
  </Button>

  <Button variant="destructive">
    حذف
  </Button>

</div>

    </div>
  );
}
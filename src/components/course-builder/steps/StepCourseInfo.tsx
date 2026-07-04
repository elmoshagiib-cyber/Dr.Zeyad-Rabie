import { UploadCloud } from "lucide-react";
import { Card, CardContent } from "../../ui/Card";
import { Input } from "../../ui/Input";

type Props = {
  courseTitle: string;
  setCourseTitle: React.Dispatch<React.SetStateAction<string>>;

  courseDescription: string;
  setCourseDescription: React.Dispatch<React.SetStateAction<string>>;

  coursePrice: string;
  setCoursePrice: React.Dispatch<React.SetStateAction<string>>;

  courseGrade: string;
  setCourseGrade: React.Dispatch<React.SetStateAction<string>>;

  thumbnailFile: File | null;
  setThumbnailFile: React.Dispatch<React.SetStateAction<File | null>>;
};

export function StepCourseInfo({
  courseTitle,
  setCourseTitle,
  courseDescription,
  setCourseDescription,
  coursePrice,
  setCoursePrice,
  courseGrade,
  setCourseGrade,
  thumbnailFile,
  setThumbnailFile,
}: Props) {
  return (
    <Card
  className="
    rounded-[32px]
    border
    border-slate-200
    bg-white
    shadow-sm
    hover:shadow-xl
    transition-all
    duration-300
  "
>
      <CardContent className="p-10 space-y-10">

        <div className="flex items-start justify-between border-b border-slate-100 pb-8">

  <div>

    <h2 className="text-3xl font-black text-slate-900">
      بيانات الكورس
    </h2>

    <p className="mt-2 text-slate-500 text-lg">
      أضف جميع المعلومات الأساسية الخاصة بالكورس قبل البدء بإضافة المحتوى.
    </p>

  </div>

  <div className="h-14 w-14 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl">
    📚
  </div>

</div>

        <div className="space-y-2">
          <label>الصف الدراسي</label>

          <select
            value={courseGrade}
            onChange={(e) => setCourseGrade(e.target.value)}
            className="w-full h-12 rounded-xl border border-slate-200 px-4"
          >
            <option value="">اختر الصف</option>
            <option>الأول الثانوي</option>
            <option>الثاني الثانوي</option>
            <option>الثالث الثانوي</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">
  اسم الكورس
</label>

          <Input
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="اسم الكورس"
          />
        </div>

        <div className="space-y-2">
          <label>وصف الكورس</label>

          <textarea
            rows={5}
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-4 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label>السعر</label>

          <Input
            type="number"
            value={coursePrice}
            onChange={(e) => setCoursePrice(e.target.value)}
          />
        </div>

        <div className="space-y-3">

          <label>صورة الكورس</label>

          <label
            className="
            border-2
            border-dashed
            rounded-2xl
            h-56
            flex
            flex-col
            justify-center
            items-center
            cursor-pointer
            hover:border-violet-500
            "
          >
            <UploadCloud
              size={45}
              className="text-violet-600"
            />

            <p className="mt-3">
              اضغط لاختيار صورة
            </p>

            {thumbnailFile && (
              <p className="text-green-600 mt-2">
                {thumbnailFile.name}
              </p>
            )}

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) =>
                setThumbnailFile(
                  e.target.files?.[0] || null
                )
              }
            />
          </label>

        </div>

      </CardContent>
    </Card>
  );
}
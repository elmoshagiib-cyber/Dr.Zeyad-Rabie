import {
  BookOpen,
  PlayCircle,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
type Props = {
  sections: number;
  lessons: number;
  price: string;
  ready: boolean;
};

export function BuilderHero({
  sections,
  lessons,
  price,
  ready,
}: Props) {
  return (
    <div className="overflow-hidden rounded-[32px] bg-gradient-to-l from-violet-700 via-violet-600 to-indigo-600 p-10 text-white shadow-xl">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

        <div>

          <h1 className="text-4xl font-black">
            إنشاء كورس جديد
          </h1>

          <p className="mt-4 max-w-xl text-white/90 leading-8">
            أنشئ الكورس بالكامل من مكان واحد،
            أضف الأبواب والدروس والفيديوهات
            والواجبات والامتحانات ثم انشره
            مباشرة للطلاب.
          </p>

        </div>

        <div className="grid grid-cols-2 gap-4 min-w-[340px]">

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

            <BookOpen className="mb-3" />

            <p className="text-3xl font-black">
              {sections}
            </p>

            <span className="text-white/80">
              الأبواب
            </span>

          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

            <PlayCircle className="mb-3" />

            <p className="text-3xl font-black">
              {lessons}
            </p>

            <span className="text-white/80">
              درس مضاف
            </span>

          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

            <DollarSign className="mb-3" />

            <p className="text-3xl font-black">
              {price || 0}
            </p>

            <span className="text-white/80">
              جنيه
            </span>

          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

            <CheckCircle2 className="mb-3" />

            <p className="text-xl font-bold">
              {ready ? "جاهز" : "مسودة"}
            </p>

            <span className="text-white/80">
              حالة الكورس
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}
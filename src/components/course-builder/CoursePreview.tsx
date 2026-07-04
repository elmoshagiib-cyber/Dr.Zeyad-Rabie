type Props = {
  title: string;
  grade: string;
  price: string;
  thumbnail: File | null;
  sections: any[];
};

export function CoursePreview({
  title,
  grade,
  price,
  thumbnail,
  sections,
}: Props) {
  const lessons = sections.reduce(
    (acc, s) => acc + s.lessons.length,
    0
  );
const ready =
  !!title &&
  !!grade &&
  !!price &&
  thumbnail;

  return (
    <div className="sticky top-24">

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

<div className="mb-5 flex items-center justify-between">

  <h2 className="text-xl font-black">
    معاينة الكورس
  </h2>

  <span
    className={`rounded-full px-4 py-2 text-sm font-bold ${
      ready
        ? "bg-green-100 text-green-700"
        : "bg-orange-100 text-orange-700"
    }`}
  >
    {ready ? "جاهز للنشر" : "مسودة"}
  </span>

</div>

        <div className="aspect-video rounded-2xl bg-slate-100 overflow-hidden">

          {thumbnail ? (
            <img
              src={URL.createObjectURL(thumbnail)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              صورة الكورس
            </div>
          )}

        </div>

        <div className="mt-5">

  <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
    {grade || "الصف الدراسي"}
  </span>

  <h3 className="mt-4 text-2xl font-black text-slate-900">
    {title || "اسم الكورس"}
  </h3>

</div>

<div className="mt-6 rounded-2xl bg-gradient-to-l from-violet-600 to-indigo-600 p-5 text-white">

  <p className="text-sm text-white/80">
    سعر الكورس
  </p>

  <p className="mt-2 text-3xl font-black">
    {price || 0} ج.م
  </p>

</div>

        <div className="mt-6 grid grid-cols-2 gap-3">

  <div className="rounded-2xl bg-slate-100 p-4 text-center">

    <p className="text-2xl font-black">
      {sections.length}
    </p>

    <span className="text-slate-500 text-sm">
      باب
    </span>

  </div>

  <div className="rounded-2xl bg-slate-100 p-4 text-center">

    <p className="text-2xl font-black">
      {lessons}
    </p>

    <span className="text-slate-500 text-sm">
      درس
    </span>

  </div>

</div>
      </div>

    </div>
  );
}
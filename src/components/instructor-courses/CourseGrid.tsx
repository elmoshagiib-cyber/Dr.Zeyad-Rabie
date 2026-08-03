import { CourseCard } from "./CourseCard";

type Props = {
  courses: any[];
  onDelete: (id: string) => void;
  onFeature?: (id: string) => void;
  view: "grid" | "list";
};

export function CourseGrid({
  courses,
  onDelete,
  onFeature,
  view,
}: Props) {

  if (courses.length === 0) {
    return (
      <div
        className="
        bg-white
        rounded-3xl
        p-16
        text-center
        border
        "
      >
        <h2 className="text-xl font-bold">
          لا توجد كورسات
        </h2>

        <p className="text-slate-500 mt-2">
          اضغط على إنشاء كورس جديد
        </p>
      </div>
    );
  }

  return (
    <div
  className={
    view === "grid"
      ? "grid xl:grid-cols-3 lg:grid-cols-2 gap-6"
      : "flex flex-col gap-6"
  }
>
      {courses.map((course) => (
<CourseCard
    key={course.id}
    course={course}
    onDelete={onDelete}
    onFeature={onFeature}
    view={view}
/>
      ))}
    </div>
  );
}
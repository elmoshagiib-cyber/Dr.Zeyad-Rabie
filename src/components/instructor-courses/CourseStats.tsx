import {
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

type Props = {
  courses: any[];
};

export function CourseStats({
  courses,
}: Props) {
  const totalCourses = courses.length;

const activeCourses = courses.filter(
  (course) => course.is_published
).length;

  const freeCourses = courses.filter(
    (course) =>
      Number(course.price) === 0
  ).length;


  const stats = [
    {
      title: "إجمالي الكورسات",
      value: totalCourses,
      icon: BookOpen,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "الكورسات النشطة",
      value: activeCourses,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "كورسات مجانية",
      value: freeCourses,
      icon: Sparkles,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="
              bg-white
              rounded-3xl
              border
              border-slate-200
              p-6
              shadow-sm
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  {item.value}
                </h2>
              </div>

              <div
                className={`
                  w-12
                  h-12
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  ${item.bg}
                `}
              >
                <Icon
                  className={item.color}
                  size={22}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
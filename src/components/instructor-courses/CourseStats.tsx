import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  FileClock,
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
    (course) => course.is_free
  ).length;

  const draftCourses = courses.filter(
    (course) => !course.is_published
  ).length;

  const pct = (value: number) =>
    totalCourses === 0
      ? "لا يوجد كورسات بعد"
      : `${Math.round((value / totalCourses) * 100)}% من الإجمالي`;

  const stats = [
    {
      title: "إجمالي الكورسات",
      value: totalCourses,
      caption: "كل الكورسات اللي أنشأتها",
      icon: BookOpen,
      color: "text-indigo-600",
      iconBg: "bg-gradient-to-br from-indigo-100 to-indigo-50",
      ring: "ring-indigo-100",
      bar: "bg-indigo-500",
    },
    {
      title: "الكورسات النشطة",
      value: activeCourses,
      caption: pct(activeCourses),
      icon: CheckCircle2,
      color: "text-emerald-600",
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
      ring: "ring-emerald-100",
      bar: "bg-emerald-500",
    },
    {
      title: "كورسات مجانية",
      value: freeCourses,
      caption: pct(freeCourses),
      icon: Sparkles,
      color: "text-orange-500",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-50",
      ring: "ring-orange-100",
      bar: "bg-orange-500",
    },
    {
      title: "كورسات في المسودة",
      value: draftCourses,
      caption: pct(draftCourses),
      icon: FileClock,
      color: "text-amber-600",
      iconBg: "bg-gradient-to-br from-amber-100 to-amber-50",
      ring: "ring-amber-100",
      bar: "bg-amber-500",
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
              group
              relative
              overflow-hidden
              bg-white
              rounded-3xl
              border
              border-slate-200
              p-6
              shadow-sm
              transition-all
              duration-300
              hover:shadow-lg
              hover:-translate-y-0.5
              hover:border-slate-300
            "
          >
            {/* خط علوي ملوّن */}
            <div
              className={`absolute top-0 right-0 left-0 h-1 ${item.bar}`}
            />

            <div className="flex items-start justify-between">
              <div
                className={`
                  w-14
                  h-14
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  ring-4
                  ${item.iconBg}
                  ${item.ring}
                  transition-transform
                  duration-300
                  group-hover:scale-110
                `}
              >
                <Icon className={item.color} size={24} strokeWidth={2.2} />
              </div>

              <div className="text-right">
                <p className="text-slate-500 text-sm font-medium">
                  {item.title}
                </p>

                <h2 className="mt-1 text-4xl font-black text-slate-800 tabular-nums">
                  {item.value}
                </h2>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <span className="text-xs font-medium text-slate-400">
                {item.caption}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
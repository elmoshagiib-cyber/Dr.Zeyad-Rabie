type StatsSection = {
  items: { type: string }[];
};

type Props = {
  sectionsCount: number;
  sections: StatsSection[];
};

export function EditCourseStats({ sectionsCount, sections }: Props) {
  const stats = [
    {
      label: "الأقسام",
      value: sectionsCount,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      color: "text-[#155DFC]",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-50",
      ring: "ring-blue-100",
      bar: "bg-[#155DFC]",
    },
    {
      label: "الفيديوهات",
      value: sections.reduce((acc, s) => acc + s.items.filter((i) => i.type === "video").length, 0),
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
      color: "text-blue-600",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-50",
      ring: "ring-blue-100",
      bar: "bg-blue-500",
    },
    {
      label: "ملفات PDF",
      value: sections.reduce((acc, s) => acc + s.items.filter((i) => i.type === "pdf").length, 0),
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      color: "text-rose-600",
      iconBg: "bg-gradient-to-br from-rose-100 to-rose-50",
      ring: "ring-rose-100",
      bar: "bg-rose-500",
    },
    {
      label: "الاختبارات",
      value: sections.reduce((acc, s) => acc + s.items.filter((i) => i.type === "quiz").length, 0),
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
      color: "text-violet-600",
      iconBg: "bg-gradient-to-br from-violet-100 to-violet-50",
      ring: "ring-violet-100",
      bar: "bg-violet-500",
    },
    {
      label: "الواجبات",
      value: sections.reduce((acc, s) => acc + s.items.filter((i) => i.type === "homework").length, 0),
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      color: "text-amber-600",
      iconBg: "bg-gradient-to-br from-amber-100 to-amber-50",
      ring: "ring-amber-100",
      bar: "bg-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="
            group
            relative
            overflow-hidden
            bg-white
            rounded-2xl
            border
            border-slate-200
            p-4
            shadow-sm
            transition-all
            duration-300
            hover:shadow-md
            hover:-translate-y-0.5
            hover:border-slate-300
          "
        >
          <div className={`absolute top-0 right-0 left-0 h-1 ${stat.bar}`} />

          <div className="flex items-center gap-3">
            <div
              className={`
                w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
                ring-4 ${stat.iconBg} ${stat.ring}
                transition-transform duration-300 group-hover:scale-110
              `}
            >
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800 tabular-nums">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
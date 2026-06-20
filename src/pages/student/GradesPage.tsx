import { useNavigate, useParams } from "react-router-dom";

export default function GradesPage() {
const { stage } = useParams();
const navigate = useNavigate();

const grades =
stage === "secondary"
? [
{
id: "first_sec",
title: "الصف الأول الثانوي",
image: "/images/course-science1.jpg",
},
{
id: "second_sec",
title: "الصف الثاني الثانوي",
image: "/images/course-chemistry2.jpg",
},
{
id: "third_sec",
title: "الصف الثالث الثانوي",
image: "/images/course-chemistry3.jpg",
},
]
: [
{
id: "first_prep",
title: "الصف الأول الإعدادي",
image: "/images/prep1.jpg",
},
{
id: "second_prep",
title: "الصف الثاني الإعدادي",
image: "/images/prep2.jpg",
},
{
id: "third_prep",
title: "الصف الثالث الإعدادي",
image: "/images/prep3.jpg",
},
];

return ( <div className="max-w-7xl mx-auto py-20 px-6">

```
  <h1 className="text-5xl font-black text-center mb-16">
    {stage === "secondary"
      ? "المرحلة الثانوية"
      : "المرحلة الإعدادية"}
  </h1>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

    {grades.map((grade) => (
      <div
        key={grade.id}
        onClick={() => navigate(`/grade/${grade.id}`)}
        className="
          cursor-pointer
          rounded-3xl
          overflow-hidden
          shadow-xl
          group
        "
      >
        <img
          src={grade.image}
          alt={grade.title}
          className="
            w-full
            h-64
            object-cover
            group-hover:scale-105
            transition-all
          "
        />

        <div className="bg-white p-6 text-center">
          <h3 className="text-2xl font-black">
            {grade.title}
          </h3>
        </div>
      </div>
    ))}

  </div>
</div>

);
}
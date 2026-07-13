import {
  Users,
  BookOpen,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";




type Props = {
  course: any;
  onDelete: (id: string) => void;
  view: "grid" | "list";
};


export function CourseCard({
  course,
  onDelete,
  view,
}: Props) {
const navigate = useNavigate();
  const lectures = course.course_lectures?.length || 0;

const videos =
  course.course_lectures?.reduce(
    (sum: number, lecture: any) =>
      sum + (lecture.lecture_videos?.length || 0),
    0
  ) || 0;

const files =
  course.course_lectures?.reduce(
    (sum: number, lecture: any) =>
      sum + (lecture.lecture_files?.length || 0),
    0
  ) || 0;

  if (view === "list") {
  return (
    <div
      className="
      bg-white
      rounded-[28px]
      border
      border-slate-200
      shadow-sm
      hover:shadow-lg
      transition
      p-5
      flex
      gap-6
      items-center
      "
    >
      <img
        src={
          course.thumbnail ||
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
        }
        className="
        w-64
        h-40
        rounded-2xl
        object-cover
        shrink-0
        "
      />

      <div className="flex-1">

        <div className="flex justify-between">

          <div>

            <h2 className="text-2xl font-black">
              {course.title}
            </h2>

            <p className="text-slate-500 mt-2">
              {course.description}
            </p>

          </div>

          <span
           className={`
absolute
top-4
left-4
text-white
text-xs
px-3
py-1
rounded-full
${course.active ? "bg-green-500" : "bg-amber-500"}
`}
          >
            {course.active ? "منشور" : "مسودة"}
          </span>

        </div>

        <div className="flex gap-8 mt-6 text-slate-500">
<div className="flex items-center gap-2">
  🎥
  <span>{videos} فيديو</span>
</div>

<div className="flex items-center gap-2">
  📄
  <span>{files} PDF</span>
</div>
          <span>
            👨‍🎓 {course.students_count || 0} طالب
          </span>

          <span>
            📚 {lectures} باب
          </span>

          <span>
            🎓 {course.grade}
          </span>

        </div>

        <div className="flex justify-between items-center mt-8">

          <span className="text-3xl font-black text-violet-700">
            {course.price} ج
          </span>

          <div className="flex gap-3">

           <button
  onClick={() =>
    navigate(`/instructor/courses/edit/${course.id}`)
  }
  className="
  h-11
  px-5
  rounded-xl
  bg-violet-50
  hover:bg-violet-100
  "
>
  تعديل
</button>

            <button
              onClick={() => onDelete(course.id)}
              className="
              h-11
              px-5
              rounded-xl
              bg-red-50
              text-red-600
              hover:bg-red-100
              "
            >
              حذف
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

  return (
    <div
      className="
      bg-white
      rounded-[28px]
      overflow-hidden
      border
      border-slate-200
      shadow-sm
      hover:shadow-xl
      duration-300
      "
    >
      {/* الصورة */}

      <div className="relative">

        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
          }
          className="w-full h-52 object-cover"
        />

       <span
  className={`
    absolute
    top-4
    left-4
    text-white
    text-xs
    px-3
    py-1
    rounded-full
    ${course.active ? "bg-green-500" : "bg-amber-500"}
  `}
>
  {course.active ? "منشور" : "مسودة"}
</span>

      </div>

      {/* المحتوى */}

      <div className="p-6">

        <h2 className="text-xl font-black line-clamp-2">
          {course.title}
        </h2>

        <p
          className="
          mt-2
          text-slate-500
          line-clamp-2
          "
        >
          {course.description}
        </p>

        {/* معلومات */}

        <div
          className="
          flex
          items-center
          justify-between
          mt-6
          text-slate-500
          "
        >

          <div className="flex items-center gap-2">
            <Users size={17} />
            <span>{course.students_count || 0} طالب</span>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen size={17} />
            <span>{lectures} باب</span>
          </div>

        </div>

        {/* Footer */}

        <div
          className="
          flex
          items-center
          justify-between
          mt-6
          pt-5
          border-t
          "
        >

          <span
            className="
            text-2xl
            font-black
            text-violet-700
            "
          >
            {course.price} ج
          </span>

          <div className="flex gap-2">

           <button
  onClick={() =>
    navigate(`/instructor/courses/edit/${course.id}`)
  }
  className="
  w-10
  h-10
  rounded-xl
  bg-slate-100
  hover:bg-violet-100
  flex
  items-center
  justify-center
  "
>
  <Edit size={18} />
</button>

            <button
              onClick={() => onDelete(course.id)}
              className="
              w-10
              h-10
              rounded-xl
              bg-red-50
              hover:bg-red-100
              text-red-600
              flex
              items-center
              justify-center
              "
            >
              <Trash2 size={18} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
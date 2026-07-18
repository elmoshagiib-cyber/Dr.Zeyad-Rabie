import {
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

type Props = {
  courses: any[];
};

export function CourseAlert({
  courses,
}: Props) {
const draftCourses = courses.filter(
  (course) => !course.is_published
);

const hiddenCourses = courses.filter(
  (course) => course.is_hidden
);

const noImageCourses = courses.filter(
  (course) => !course.thumbnail
);

  const noDescriptionCourses = courses.filter(
    (course) => !course.description
  );

  const hasWarnings =
    draftCourses.length ||
    noImageCourses.length ||
    noDescriptionCourses.length;

  return (
    <div
      className={`
      rounded-3xl
      border
      p-6
      flex
      items-center
      justify-between
      ${
        hasWarnings
          ? "bg-amber-50 border-amber-200"
          : "bg-emerald-50 border-emerald-200"
      }
      `}
    >
      <div>

        <p
          className={`text-sm ${
            hasWarnings
              ? "text-amber-700"
              : "text-emerald-700"
          }`}
        >
          حالة الكورسات
        </p>

        {hasWarnings ? (

          <div className="mt-2 space-y-1">

            {draftCourses.length > 0 && (
              <p>
                • يوجد {draftCourses.length} كورس
                في وضع المسودة.
              </p>
            )}

            {noImageCourses.length > 0 && (
              <p>
                • يوجد {noImageCourses.length} كورس
                بدون صورة.
              </p>
            )}

            {noDescriptionCourses.length > 0 && (
              <p>
                • يوجد {noDescriptionCourses.length} كورس
                بدون وصف.
              </p>
            )}

          </div>

        ) : (

          <h3 className="font-bold text-lg mt-2">
            جميع الكورسات مكتملة ✅
          </h3>

        )}

      </div>

      <div
        className={`
        w-14
        h-14
        rounded-2xl
        flex
        items-center
        justify-center
        ${
          hasWarnings
            ? "bg-amber-100"
            : "bg-emerald-100"
        }
        `}
      >
        {hasWarnings ? (
          <AlertTriangle
            className="text-amber-600"
            size={24}
          />
        ) : (
          <CheckCircle2
            className="text-emerald-600"
            size={24}
          />
        )}
      </div>
    </div>
  );
}
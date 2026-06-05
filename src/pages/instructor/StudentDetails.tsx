import {
  User,
  Phone,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
export function StudentDetails() {
  const { id } = useParams();
const navigate = useNavigate();
  const students = [
    {
  id: 1,
  name: "أحمد محمد",
  code: "ZR-5821",

  phone: "01012345678",
  parentPhone: "01098765432",

  grade: "الصف الثالث الثانوي",

  status: "نشط",
  type: "سنتر",

  joinDate: "2026-06-01",
  lastLogin: "2026-06-04",

  watchedLessons: 25,
  totalLessons: 40,

  completedHomework: 8,
  totalHomework: 10,

  exams: [
    {
      title: "اختبار الباب الأول",
      score: 18,
      total: 20,
    },
    {
      title: "اختبار الباب الثاني",
      score: 17,
      total: 20,
    },
  ],

  subscriptionStatus: "مفعل",
  subscriptionEnd: "2026-09-01",

  coursesList: [
    {
      name: "الكيمياء العضوية",
      active: true,
    },
    {
      name: "الهيدروكربونات",
      active: true,
    },
    {
      name: "المراجعة النهائية",
      active: false,
    },
  ],

  activity: [
    "شاهد محاضرة الباب الأول",
    "حل اختبار الكيمياء العضوية",
    "رفع واجب الهيدروكربونات",
  ],
},

   {
  id: 2,
  name: "محمد علي",
  code: "ZR-1947",

  phone: "01022222222",
  parentPhone: "01033333333",

  grade: "الصف الثالث الثانوي",

  status: "نشط",
  type: "أونلاين",

  joinDate: "2026-06-02",
  lastLogin: "2026-06-04",

  watchedLessons: 18,
  totalLessons: 40,

  completedHomework: 6,
  totalHomework: 10,

  exams: [
  {
    title: "اختبار الباب الأول",
    score: 15,
    total: 20,
  },
],

subscriptionStatus: "مفعل",
subscriptionEnd: "2026-09-01",

coursesList: [
  {
    name: "الكيمياء العضوية",
    active: true,
  },
  {
    name: "الهيدروكربونات",
    active: true,
  },
  {
    name: "المراجعة النهائية",
    active: false,
  },
],

activity: [
  "شاهد محاضرة الهيدروكربونات",
  "حل اختبار الباب الأول",
],
},
 {
  id: 3,
  name: "محمود أحمد",
  code: "ZR-7632",

  phone: "01044444444",
  parentPhone: "01055555555",

  grade: "الصف الثاني الثانوي",

  status: "موقوف",
  type: "سنتر",

  joinDate: "2026-05-15",
  lastLogin: "2026-06-01",

  watchedLessons: 10,
  totalLessons: 40,

  completedHomework: 3,
  totalHomework: 10,

  exams: [],

  coursesList: [
    {
      name: "الكيمياء العضوية",
      active: true,
    },
    {
      name: "الهيدروكربونات",
      active: false,
    },
  ],

  subscriptionStatus: "موقوف",
  subscriptionEnd: "2026-07-01",

  activity: [
    "شاهد محاضرة الباب الأول",
    "رفع واجب الكيمياء العضوية",
  ],
},
];
  const student = students.find(
    (s) => s.id === Number(id)
  );

  const [courses, setCourses] = useState(() => {
  if (!student) return [];

  const savedCourses =
    localStorage.getItem(
      `student-courses-${student.id}`
    );

  return savedCourses
    ? JSON.parse(savedCourses)
    : student.coursesList;
});

const [selectedCourse, setSelectedCourse] =
  useState("");

const addCourse = () => {
  if (!selectedCourse) return;

  const exists = courses.find(
    (course: any) =>
      course.name === selectedCourse
  );

  if (exists) {
    alert("الكورس مضاف بالفعل");
    return;
  }

  setCourses([
    ...courses,
    {
      name: selectedCourse,
      active: false,
    },
  ]);

  setSelectedCourse("");
};


const toggleCourse = (index: number) => {
  setCourses(
    courses.map((course: any, i: number) =>
      i === index
        ? {
            ...course,
            active: !course.active,
          }
        : course
    )
  );
};
const deleteCourse = (index: number) => {
  setCourses(
    courses.filter(
      (_: any, i: number) =>
        i !== index
    )
  );
};
useEffect(() => {
  if (!student) return;

  localStorage.setItem(
    `student-courses-${student.id}`,
    JSON.stringify(courses)
  );
}, [courses, student]);
const availableCourses = [
  "الكيمياء العضوية",
  "الهيدروكربونات",
  "المراجعة النهائية",
  "الباب الأول",
  "الباب الثاني",
];

  if (!student) {
    
    return (
      <div className="p-10 text-center">
        الطالب غير موجود
      </div>
    );
  }

  const lessonsPercent = Math.round(
    (student.watchedLessons /
      student.totalLessons) *
      100
  );

  const homeworkPercent = Math.round(
    (student.completedHomework /
      student.totalHomework) *
      100
  );

 return (
  <div
    className="flex h-screen bg-slate-50 overflow-hidden"
    dir="rtl"
  >
    <div className="hidden lg:block flex-shrink-0">
      <DashboardSidebar type="instructor" />
    </div>

    <main className="flex-1 overflow-y-auto p-6 space-y-6">

      <Card>
        <CardContent>
          <h1 className="text-3xl font-black">
            {student.name}
            <Button
  onClick={() =>
    navigate(
      `/instructor/students/edit/${student.id}`
    )
  }
>
  تعديل الطالب
</Button>
          </h1>

          <p className="text-slate-500 mt-2">
            الكود: {student.code}
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">

        <Card>
          <CardContent className="space-y-4">

            <div className="flex items-center gap-2">
              <User size={18} />
              {student.grade}
            </div>

            <div className="flex items-center gap-2">
              <Phone size={18} />
              {student.phone}
            </div>

            <div className="flex items-center gap-2">
              <Phone size={18} />
              {student.parentPhone}
            </div>

            <div>
              الحالة:
              <span className="font-bold mr-2">
                {student.status}
              </span>
            </div>

            <div>
              النوع:
              <span className="font-bold mr-2">
                {student.type}
              </span>
            </div>

            <div>
              تاريخ التسجيل:
              <span className="font-bold mr-2">
                {student.joinDate}
              </span>
            </div>

            <div>
              آخر دخول:
              <span className="font-bold mr-2">
                {student.lastLogin}
              </span>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5">

            <div>
              <div className="flex justify-between mb-2">
                <span>المحاضرات</span>

                <span>
                  {student.watchedLessons}/
                  {student.totalLessons}
                </span>
              </div>

              <div className="w-full h-3 bg-slate-200 rounded-full">
                <div
                  className="h-3 bg-blue-600 rounded-full"
                  style={{
                    width: `${lessonsPercent}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>الواجبات</span>

                <span>
                  {student.completedHomework}/
                  {student.totalHomework}
                </span>
              </div>

              <div className="w-full h-3 bg-slate-200 rounded-full">
                <div
                  className="h-3 bg-emerald-600 rounded-full"
                  style={{
                    width: `${homeworkPercent}%`,
                  }}
                />
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      <Card>
        <CardContent>

          <h2 className="font-black text-xl mb-4">
            درجات الاختبارات
          </h2>

          <div className="space-y-3">

            {student.exams.map((exam, index) => (
              <div
                key={index}
                className="flex justify-between border rounded-xl p-4"
              >
                <span>{exam.title}</span>

                <span className="font-bold">
                  {exam.score}/{exam.total}
                </span>
              </div>
            ))}

          </div>

        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">

        <Card>
          <CardContent>

            <h2 className="font-black text-xl mb-4">
  الكورسات المشترك بها
</h2>

<div className="mb-4 flex gap-2">

  <select
  value={selectedCourse}
  onChange={(e) =>
    setSelectedCourse(e.target.value)
  }
  className="border rounded-xl px-3 py-2 flex-1"
>
  <option value="">
    اختر كورس
  </option>

  {availableCourses.map((course, index) => (
    <option
      key={index}
      value={course}
    >
      {course}
    </option>
  ))}
</select>
 <Button
  onClick={addCourse}
>
  إضافة كورس
</Button>
</div>

<div className="space-y-3">

  {courses.map(
  (course: any, index: number) => (
    <div
      key={index}
      className="border rounded-xl p-3 flex justify-between items-center"
    >
      <span>
        {course.name}
      </span>

      <div className="flex gap-2 items-center">

        <span
          className={`font-bold ${
            course.active
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {course.active
            ? "مفعل"
            : "غير مفعل"}
        </span>

        <Button
          size="sm"
          variant={
            course.active
              ? "danger"
              : "outline"
          }
          onClick={() =>
            toggleCourse(index)
          }
        >
          {course.active
            ? "إلغاء التفعيل"
            : "تفعيل"}
        </Button>

        <Button
          size="sm"
          variant="danger"
          onClick={() =>
            deleteCourse(index)
          }
        >
          حذف
        </Button>

      </div>

    </div>
  )
)}
</div>
            <h2 className="font-black text-xl mb-4">
              بيانات الاشتراك
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between">
                <span>نوع الاشتراك</span>
                <span>{student.type}</span>
              </div>

              <div className="flex justify-between">
                <span>الحالة</span>

                <span
                  className={
                    student.subscriptionStatus === "مفعل"
                      ? "text-emerald-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                >
                  {student.subscriptionStatus}
                </span>
              </div>

              <div className="flex justify-between">
                <span>ينتهي في</span>
                <span>{student.subscriptionEnd}</span>
              </div>

            </div>

          </CardContent>
        </Card>

      </div>

      <Card>
        <CardContent>

          <h2 className="font-black text-xl mb-4">
            سجل النشاط
          </h2>

          <div className="space-y-3">

            {(student.activity || []).map(
              (item: string, index: number) => (
                <div
                  key={index}
                  className="border rounded-xl p-3"
                >
                  {item}
                </div>
              )
            )}

          </div>

        </CardContent>
      </Card>

    </main>
  </div>
);
}
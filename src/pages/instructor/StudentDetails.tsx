import {
  BookOpen,
  Monitor,
  Activity,
  BarChart3,
} from "lucide-react";

import { User } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";

export function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<any[]>([]);
  const [examResults, setExamResults] =
  useState<any[]>([]);

  const toggleStudentStatus = async () => {
  const newStatus =
    student?.status === "نشط"
      ? "موقوف"
      : "نشط";

  const { error } = await supabase
    .from("students")
    .update({
      status: newStatus,
    })
    .eq("id", student.id);

  if (!error) {
    loadStudent();
  }
};


const [showCourseModal, setShowCourseModal] =
  useState(false);
  
  const [showNotificationModal, setShowNotificationModal] =
  useState(false);

const [notificationType, setNotificationType] =
  useState("student");

const [notificationTitle, setNotificationTitle] =
  useState("");

const [notificationMessage, setNotificationMessage] =
  useState("");

const [notificationReason, setNotificationReason] =
  useState("");
  useEffect(() => {

  if (notificationReason === "غياب محاضرة") {

  setNotificationTitle("تنبيه غياب محاضرة");

  if (notificationType === "student") {

    setNotificationMessage(
`مرحباً ${student?.full_name}،

لاحظنا أنك لم تحضر إحدى المحاضرات المقررة.

يرجى مشاهدة المحاضرة في أقرب وقت حتى لا يفوتك المحتوى الدراسي.`
    );

  } else {

    setNotificationMessage(
`نحيطكم علماً بأن الطالب ${student?.full_name}
لم يقم بحضور إحدى المحاضرات المقررة.

يرجى المتابعة والتأكد من مشاهدة المحاضرة في أقرب وقت.`
    );

  }

}

  if (notificationReason === "غياب امتحان") {

  setNotificationTitle("تنبيه غياب امتحان");

  if (notificationType === "student") {

    setNotificationMessage(
`مرحباً ${student?.full_name}،

لقد تم تسجيل غيابك عن الامتحان المقرر.

يرجى التواصل مع إدارة المنصة لمعرفة الخطوات المطلوبة.`
    );

  } else {

    setNotificationMessage(
`نحيطكم علماً بأن الطالب ${student?.full_name}
لم يحضر الامتحان المقرر.

يرجى المتابعة معه ومعرفة سبب الغياب.`
    );

  }

}

  if (notificationReason === "عدم تسليم واجب") {

  setNotificationTitle("تنبيه عدم تسليم واجب");

  if (notificationType === "student") {

    setNotificationMessage(
`مرحباً ${student?.full_name}،

لم تقم بتسليم الواجب المطلوب حتى الآن.

يرجى رفع الواجب في أقرب وقت لتجنب فقدان الدرجة.`
    );

  } else {

    setNotificationMessage(
`نحيطكم علماً بأن الطالب ${student?.full_name}
لم يقم بتسليم الواجب المطلوب حتى الآن.

يرجى المتابعة معه واستكمال التسليم في أسرع وقت.`
    );

  }

}

  if (notificationReason === "تنبيه عام") {

    setNotificationTitle("");
    setNotificationMessage("");

  }

  if (notificationReason === "رسالة مخصصة") {

    setNotificationTitle("");
    setNotificationMessage("");

  }

}, [notificationReason, student]);

const [homeworkResults, setHomeworkResults] =
  useState<any[]>([]);


  const loadStudent = async () => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (!error && data) {
    setStudent(data);
  }

  setLoading(false);
};


const loadCourses = async () => {
  const { data, error } = await supabase
    .from("student_courses")
    .select("*")
    .eq("student_id", Number(id));

  if (error) {
    console.log(error);
    return;
  }

  const courseIds = data.map(
    (item: any) => item.course_id
  );

  const { data: coursesData } = await supabase
    .from("courses")
    .select("*")
    .in("id", courseIds);

  const mergedData = data.map((item: any) => ({
    ...item,
    courseData: coursesData?.find(
      (c: any) => c.id === item.course_id
    ),
  }));
  
mergedData.sort(
  (a, b) =>
    new Date(b.created_at).getTime() -
    new Date(a.created_at).getTime()
);
  setCourses(mergedData);
};

const [selectedCourse, setSelectedCourse] =
  useState("");

const [availableCourses, setAvailableCourses] =
  useState<any[]>([]);

const loadAvailableCourses = async () => {
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("active", true);

  if (data) {
    setAvailableCourses(data);
  }
};


useEffect(() => {
  loadAvailableCourses();
}, []);


const deleteCourse = async (courseId:number) => {

  const confirmed = window.confirm(
    "هل أنت متأكد من حذف الكورس؟"
  );

  if (!confirmed) return;

  await supabase
    .from("student_courses")
    .delete()
    .eq("id", courseId);

  loadCourses();
};

const addCourse = async () => {

  if (!selectedCourse) return;

  const alreadyExists = courses.some(
  (c) =>
    String(c.course_id) ===
    String(selectedCourse)
);
const courseInfo = availableCourses.find(
  (c) => c.id === selectedCourse
);

if (
  courseInfo &&
  courseInfo.grade !== student.grade
) {
  alert(
    "لا يمكن إضافة كورس من صف مختلف"
  );
  return;
}

  if (alreadyExists) {
    alert("الطالب مشترك بالفعل في هذا الكورس");
    return;
  }

  const { data, error } = await supabase
    .from("student_courses")
    .insert({
      student_id: Number(id),
      course_id: selectedCourse,
      active: true,
    })
    .select();

  console.log(data);
  console.log(error);

  if (error) {
    alert(error.message);
    return;
  }

  setShowCourseModal(false);
  setSelectedCourse("");

  await loadCourses();
};

const loadExamResults = async () => {
const { data } = await supabase
  .from("exam_results")
  .select(`
    *,
    exams (
      title
    )
  `)
  .eq("student_id", Number(id));
  if (data) {
    setExamResults(data);
  }
};

const sendNotification = async () => {

  if (!notificationTitle || !notificationMessage) {
    alert("أكمل بيانات الإشعار");
    return;
  }

  const { error } = await supabase
    .from("notifications")
    .insert({
      student_id: student.id,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationReason,
      target: notificationType,
      is_read: false,
    });

  if (error) {
    console.log(error);
    alert("حدث خطأ أثناء الإرسال");
    return;
  }

  alert("تم إرسال الإشعار بنجاح");

  setShowNotificationModal(false);

  setNotificationTitle("");
  setNotificationMessage("");
  setNotificationReason("");
};

const loadHomeworkResults = async () => {
  const { data } = await supabase
    .from("homework_submissions")
    .select("*")
    .eq("student_id", Number(id));

  if (data) {
    setHomeworkResults(data);
  }
};



useEffect(() => {
  loadStudent();
  loadCourses();
  loadExamResults();
  loadHomeworkResults();
}, [id]);

if (loading) {
    

  return (
    <div className="p-10 text-center">
      جاري تحميل بيانات الطالب...
    </div>
  );
}

if (!student) {
  return (
    <div className="p-10 text-center">
      الطالب غير موجود
    </div>
  );
}
const daysSinceJoin =
  student?.join_date
    ? Math.floor(
        (
          Date.now() -
          new Date(
            student.join_date
          ).getTime()
        ) /
        (1000 * 60 * 60 * 24)
      )
    : 0;
const lessonsPercent =
  student.total_lessons > 0
    ? Math.round(
        (student.watched_lessons /
          student.total_lessons) *
          100
      )
    : 0;

  const homeworkPercent =
  student.total_homework > 0
    ? Math.round(
        (student.completed_homework /
          student.total_homework) *
          100
      )
    : 0;

    const totalScores = examResults.reduce(
  (sum: number, exam: any) =>
    sum + (exam.score || 0),
  0
);



    const overallProgress = Math.round(
  (lessonsPercent + homeworkPercent) / 2
);

const averageScore =
  examResults.length > 0
    ? Math.round(
        totalScores /
          examResults.length
      )
    : 0;

const highestScore =
  examResults.length > 0
    ? Math.max(
        ...examResults.map(
          (e: any) => e.score || 0
        )
      )
    : 0;

    const uniqueCourses = [
  ...new Set(
    courses.map((c) => c.course_id)
  ),
];

 return (
  <div
    className="flex h-screen bg-slate-50 overflow-hidden"
    dir="rtl"
  >
    <div className="hidden lg:block flex-shrink-0">
      <DashboardSidebar type="instructor" />
    </div>

    <main className="flex-1 overflow-y-auto p-6 space-y-6">

      <Card className="overflow-hidden border-0 shadow-xl">
  <div className="bg-gradient-to-l from-blue-600 via-indigo-600 to-violet-700 p-8">

    <div className="flex items-center justify-between">

      <div>

        <div className="flex items-center gap-4">

          <div
            className="
            w-20 h-20
            rounded-full
            bg-white/20
            flex items-center justify-center
            text-white
            text-3xl
            font-black
          "
          >
            {student.avatar_url ? (
  <img
    src={student.avatar_url}
    alt=""
    className="w-full h-full object-cover rounded-full"
  />
) : (
  student.full_name?.charAt(0)
)}
          </div>

          <div>

            <h1 className="text-3xl font-black text-white">
              {student.full_name}
            </h1>

            <p className="text-blue-100 mt-1">
              {student.student_code}
            </p>

<div className="flex flex-wrap gap-4 mt-4 text-white/90 text-sm">

  <span className="flex items-center gap-2">

  <div
    className={`w-2 h-2 rounded-full ${
      student?.status === "نشط"
        ? "bg-emerald-400"
        : "bg-red-400"
    }`}
  />

  {student.status}

</span>

<span className="bg-white/10 px-3 py-1 rounded-full">
  {uniqueCourses.length} كورس
</span>

  <span>
    {student.watched_lessons || 0} محاضرة
  </span>

  <span>
    {examResults.length} اختبار
  </span>

<span>
{student.grade}
</span>

</div>

          </div>

        </div>

      </div>

      <Button
        variant="outline"
        className="
bg-white
text-slate-900
rounded-xl
font-bold
px-6
hover:bg-slate-100
"
        onClick={() =>
          navigate(
            `/instructor/students/edit/${student.id}`
          )
        }
      >
        تعديل الطالب
      </Button>

    </div>

  </div>
</Card>

<Card className="border border-slate-200 shadow-sm rounded-3xl">
  <CardContent className="p-5">

    <div className="flex flex-wrap gap-3">

      <Button
  onClick={() =>
    setShowCourseModal(true)
  }
>
  + إضافة كورس
</Button>

      <Button
  variant="outline"
  onClick={() => setShowNotificationModal(true)}
>
  إرسال إشعار
</Button>

      

      <Button
  variant="outline"
  onClick={toggleStudentStatus}
  className={
    student.status === "نشط"
      ? "text-red-600 border-red-200"
      : "text-emerald-600 border-emerald-200"
  }
>
  {student.status === "نشط"
    ? "إيقاف الطالب"
    : "تفعيل الطالب"}
</Button>

    </div>

  </CardContent>
</Card>

<div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

  <Card className="border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
  <CardContent className="p-6">

    <div className="flex items-center justify-between">

      <div>

        <p className="text-slate-500 text-sm">
          محاضرة مشاهدة
        </p>

        <h3 className="text-4xl font-black text-blue-600 mt-2">
          {student.watched_lessons || 0}
        </h3>

      </div>

      <div className="
        w-14
        h-14
        rounded-2xl
        bg-blue-100
        flex
        items-center
        justify-center
      ">
        📺
      </div>

    </div>

  </CardContent>
</Card>

  <Card className="border border-slate-200 shadow-sm rounded-3xl hover:shadow-lg transition-all duration-300">
  <CardContent className="p-6">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-slate-500 text-sm">
          واجب محلول
        </p>

        <h3 className="text-4xl font-black text-emerald-600 mt-2">
          {student.completed_homework || 0}
        </h3>
      </div>

      <div className="
        w-14 h-14
        rounded-2xl
        bg-emerald-100
        flex items-center justify-center
        text-2xl
      ">
        📝
      </div>

    </div>

  </CardContent>
</Card>

<Card className="border border-slate-200 shadow-sm rounded-3xl hover:shadow-lg transition-all duration-300">
  <CardContent className="p-6">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-slate-500 text-sm">
          كورس مشترك
        </p>

        <h3 className="text-4xl font-black text-orange-500 mt-2">
          {uniqueCourses.length}
        </h3>
      </div>

      <div className="
        w-14 h-14
        rounded-2xl
        bg-orange-100
        flex items-center justify-center
        text-2xl
      ">
        📚
      </div>

    </div>

  </CardContent>
</Card>

<Card className="border border-slate-200 shadow-sm rounded-3xl hover:shadow-lg transition-all duration-300">
  <CardContent className="p-6">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-slate-500 text-sm">
          نسبة الإنجاز
        </p>

        <h3 className="text-4xl font-black text-violet-600 mt-2">
          {lessonsPercent}%
        </h3>
      </div>

      <div className="
        w-14 h-14
        rounded-2xl
        bg-violet-100
        flex items-center justify-center
        text-2xl
      ">
        📈
      </div>

    </div>

  </CardContent>
</Card>

</div>

<Card className="border border-slate-200 shadow-sm rounded-3xl">
  <CardContent className="p-6">

    <div className="flex justify-between items-center">

      <div className="mb-8">
  <h2 className="text-3xl font-black">
    بيانات الطالب
  </h2>

  <p className="text-slate-500 mt-2">
    معلومات الطالب الأساسية
  </p>
</div>

      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center text-white text-2xl font-black">
  <User className="w-10 h-10 text-white" />
</div>

    </div>

    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mt-6">

      <div className="
bg-slate-50
rounded-2xl
p-5
border
border-slate-100
hover:border-violet-200
transition-all
">
        <p className="text-slate-500 text-sm">
          اسم الطالب
        </p>

        <p className="font-bold mt-1">
          {student.full_name}
        </p>
      </div>

      <div className="
bg-slate-50
rounded-2xl
p-5
border
border-slate-100
hover:border-violet-200
transition-all
">
        <p className="text-slate-500 text-sm">
          كود الطالب
        </p>

        <p className="font-bold mt-1">
          {student.student_code}
        </p>
      </div>

      <div className="
bg-slate-50
rounded-2xl
p-5
border
border-slate-100
hover:border-violet-200
transition-all
">
        <p className="text-slate-500 text-sm">
          الصف الدراسي
        </p>

        <p className="font-bold mt-1">
          {student.grade}
        </p>
      </div>

      <div className="
bg-slate-50
rounded-2xl
p-5
border
border-slate-100
hover:border-violet-200
transition-all
">
        <p className="text-slate-500 text-sm">
          رقم الطالب
        </p>

        <p className="font-bold mt-1">
          {student.phone}
        </p>
      </div>

      <div className="
bg-slate-50
rounded-2xl
p-5
border
border-slate-100
hover:border-violet-200
transition-all
">
  <p className="text-slate-500 text-sm">
    رقم ولي الأمر
  </p>

  <p className="font-bold mt-1">
    {student.parent_phone || "-"}
  </p>
</div>

<div className="
bg-slate-50
rounded-2xl
p-5
border
border-slate-100
hover:border-violet-200
transition-all
">
  <p className="text-slate-500 text-sm">
    تاريخ التسجيل
  </p>

  <p className="font-bold mt-1">
    {student.join_date
      ? new Date(student.last_login)
.toLocaleString("ar-EG")
      : "-"}
  </p>
</div>

<div className="
bg-slate-50
rounded-2xl
p-5
border
border-slate-100
hover:border-violet-200
transition-all
">
  <p className="text-slate-500 text-sm">
    آخر دخول
  </p>

  <p className="font-bold mt-1">
    {student.last_login
      ? new Date(
          student.last_login
        ).toLocaleDateString("ar-EG")
      : "-"}
  </p>
</div>

     <div className="bg-slate-50 rounded-xl p-4">

  <p className="text-slate-500 text-sm">
    الحالة
  </p>

  <span
    className={`
      inline-flex
      items-center
      gap-2
      px-3
      py-1
      rounded-full
      text-sm
      font-bold
      mt-2
      ${
        student?.status === "نشط"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
      }
    `}
  >

    <div
      className={`
        w-2 h-2 rounded-full
        ${
          student?.status === "نشط"
            ? "bg-emerald-500"
            : "bg-red-500"
        }
      `}
    />

    {student.status}

  </span>

</div>

    </div>

  </CardContent>
</Card>

<Card className="
rounded-3xl
border
border-slate-200
shadow-sm
overflow-hidden
">
  <CardContent className="p-8">

    {/* Header */}
    <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">

  <div className="text-right">
    <h2 className="text-[42px] font-black text-slate-900">
      تقدم الطالب
    </h2>

    <p className="text-slate-500 text-lg mt-2">
      نظرة شاملة على إنجاز ومتابعة الطالب
    </p>
  </div>

  <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center text-xl shadow-lg">
    ↗
  </div>

</div>
    {/* Progress Box */}
    <div className="bg-slate-50 rounded-3xl p-8 max-w-full">

      <div className="flex items-center gap-3 mb-6">

  <h3 className="text-3xl font-black text-slate-900">
    التقدم الكلي في جميع الكورسات
  </h3>

  <span className="text-4xl font-black bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
    {overallProgress}%
  </span>

</div>

      <div className="w-full h-6 bg-slate-200 rounded-full overflow-hidden">

        <div
          className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full transition-all duration-500"
          style={{
            width: `${overallProgress}%`,
          }}
        />

      </div>

      <div className="flex justify-between mt-5 text-lg text-slate-500">

        <span>
          أكمل {student.watched_lessons || 0}
          {" "}من أصل{" "}
          {student.total_lessons || 0}
          {" "}محاضرة
        </span>

        <span>
          {student.watched_lessons || 0}
          {" "}محاضرة مكتملة
        </span>

<span>
{student.completed_homework || 0}
 واجب مكتمل
</span>

      </div>

    </div>

  </CardContent>
</Card>

<Card className="rounded-3xl border border-slate-200">
  <CardContent className="p-6">

    <h3 className="text-2xl font-black mb-6">
      ملخص الأداء
    </h3>

    <div className="grid lg:grid-cols-4 gap-4">

<Card className="border border-slate-200 shadow-sm">
    <CardContent className="py-6 text-center">
      <h3 className="text-3xl font-black text-blue-600">
        {examResults.length}
      </h3>

      <p className="text-slate-500 mt-2">
        عدد الاختبارات
      </p>
    </CardContent>
  </Card>

  <Card className="border border-slate-200 shadow-sm">
    <CardContent className="py-6 text-center">
      <h3 className="text-3xl font-black text-violet-600">
        {averageScore}%
      </h3>

      <p className="text-slate-500 mt-2">
        متوسط الدرجات
      </p>
    </CardContent>
  </Card>

  <Card className="border border-slate-200 shadow-sm">
    <CardContent className="py-6 text-center">
      <h3 className="text-3xl font-black text-emerald-600">
        {highestScore}%
      </h3>

      <p className="text-slate-500 mt-2">
        أعلى درجة
      </p>
    </CardContent>
  </Card>

  <Card className="border border-slate-200 shadow-sm">
    <CardContent className="py-6 text-center">
      <h3 className="text-3xl font-black text-orange-500">
        {totalScores}
      </h3>

      <p className="text-slate-500 mt-2">
        مجموع الدرجات
      </p>
    </CardContent>
  </Card>
<div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">

</div>
</div>

  </CardContent>
</Card>

<div className="space-y-6">

  {/* الاشتراكات والكورسات */}
<Card className="rounded-3xl border border-slate-200 shadow-sm overflow-hidden bg-white">

  <CardContent className="p-0">

    {/* Header */}
    <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">

      <h3 className="font-black text-slate-900 flex items-center gap-2">
        <BookOpen
          size={18}
          className="text-violet-500"
        />
        الاشتراكات والكورسات
      </h3>

      <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-bold">
        {uniqueCourses.length} كورس
      </span>

    </div>

    {uniqueCourses.length > 0 ? (

      <div className="p-6">

        {/* Table Header */}
        <div
          className="
          grid
          grid-cols-5
          bg-slate-50
          rounded-2xl
          px-5
          py-5
          text-sm
          font-bold
          text-slate-500
          mb-2
        "
        >
          <div>الكورس</div>
          <div>الصف الدراسي</div>
          <div>تاريخ الاشتراك</div>
          <div>الحالة</div>
          <div>إجراءات</div>
        </div>

        {/* Rows */}
        <div className="space-y-2">

          {uniqueCourses.map((courseId) => {

            const course = courses.find(
              (c) => c.course_id === courseId
            );

            if (!course) return null;

            return (

              <div
                key={course.id}
                className="
                grid
                grid-cols-5
                items-center
                px-5
                py-5
                rounded-2xl
                border
                border-slate-100
                hover:border-violet-200
                hover:bg-violet-50/40
                transition-all
                duration-200
              "
              >

                {/* اسم الكورس */}
                <div className="font-bold text-slate-800">
                  <div>
  <div className="font-bold">
    {course.courseData?.title}
  </div>

  <div className="text-xs text-slate-500 mt-1">
    ID: {course.course_id}
  </div>
</div>
                </div>

                {/* الصف */}
                <div className="text-slate-600">
                  {course.courseData?.grade}
                </div>

                {/* التاريخ */}
                <div className="text-slate-600">
                  {new Date(
                    course.created_at
                  ).toLocaleDateString("ar-EG")}
                </div>

                {/* الحالة */}
                <div>
                  <span
                    className={`
                      inline-flex
                      items-center
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      ${
                        course.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {course.active
                      ? "مفعل"
                      : "غير مفعل"}
                  </span>
                </div>

                {/* الإجراءات */}
                <div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="
                    text-red-600
                    border-red-200
                    hover:bg-red-50
                  "
                    onClick={() =>
                      deleteCourse(course.id)
                    }
                  >
                    حذف
                  </Button>

                </div>

              </div>

            );

          })}

        </div>

      </div>

    ) : (

      <div className="py-16 text-center">

        <BookOpen
          size={40}
          className="mx-auto text-slate-300 mb-3"
        />

        <p className="text-slate-400">
          لا توجد اشتراكات حالياً
        </p>

      </div>

    )}

  </CardContent>

</Card>

  {/* إدارة أجهزة الطالب */}
  <Card className="rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

    <CardContent className="p-0">

      <div className="flex items-center justify-between px-6 py-5">

        <h3 className="font-black text-slate-900 flex items-center gap-2">
  <Monitor
    size={18}
    className="text-violet-500"
  />
  إدارة أجهزة الطالب
</h3>

      </div>

      <div className="px-6 pb-4">

        <div className="grid grid-cols-4 bg-slate-50 rounded-2xl px-5 py-6 text-sm font-bold text-slate-500">

          <div>اسم الجهاز</div>
          <div>النظام / المتصفح</div>
          <div>الحالة</div>
          <div>آخر نشاط</div>

        </div>

      </div>

      <div className="px-6 pb-6">

        <div className="grid grid-cols-4 items-center px-5 py-5">

          <div>Unknown Device</div>

          <div>macOS / Safari</div>

          <div>
            <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
              متصل
            </span>
          </div>

          <div>2026-05-21</div>

        </div>

      </div>

    </CardContent>

  </Card>

<Card className="rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

  <CardContent className="p-0">

    <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">

      <h3 className="font-black text-slate-900 flex items-center gap-2">
        <BarChart3
          size={18}
          className="text-violet-500"
        />
        سجل الامتحانات والدرجات
      </h3>

    </div>

    <div className="p-6">

      <div
        className="
        grid
        grid-cols-6
        bg-slate-50
        rounded-2xl
        px-5
        py-6
        text-sm
        font-bold
        text-slate-500
      "
      >
        <div>الصف</div>
        <div>الامتحان</div>
        <div>الدرجة</div>
        <div>الكلية</div>
        <div>النسبة</div>
        <div>التاريخ</div>
      </div>

      {examResults.length > 0 ? (

        <div className="mt-2">

          {examResults.map((exam:any) => (

            <div
              key={exam.id}
              className="
              grid
              grid-cols-6
              px-5
              py-5
              border-t
              border-slate-100
              hover:bg-slate-50
              transition-all
            "
            >

              <div>{student.grade}</div>

              <div>
                {exam.exams?.title}
              </div>

              <div>
                {exam.score}
              </div>

              <div>100</div>

              <div>
                {exam.score}%
              </div>

              <div>
                {new Date(
                  exam.submitted_at
                ).toLocaleDateString("ar-EG")}
              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="py-12 text-center text-slate-400">
          لم يتم أداء أي امتحانات
        </div>

      )}

    </div>

  </CardContent>

</Card>

<Card className="rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

  <CardContent className="p-0">

    <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">

      <h3 className="font-black text-slate-900 flex items-center gap-2">
        <Activity
          size={18}
          className="text-violet-500"
        />
        سجل مشاهدة المحاضرات
      </h3>

    </div>

    <div className="p-6">

      <div
        className="
        grid
        grid-cols-4
        bg-slate-50
        rounded-2xl
        px-5
        py-6
        text-sm
        font-bold
        text-slate-500
      "
      >
        <div>الصف</div>
        <div>المحاضرة</div>
        <div>مدة المشاهدة (دقائق)</div>
        <div>آخر مشاهدة</div>
      </div>

      <div className="py-12 text-center text-slate-400">
        لا يوجد سجل مشاهدات
      </div>

    </div>

  </CardContent>

</Card>

  {/* سجل النشاط التفصيلي */}
  <Card className="rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

    <CardContent className="p-0">

      <div className="flex items-center justify-between px-6 py-5">

        <h3 className="font-black text-slate-900 flex items-center gap-2">
  <Activity
    size={18}
    className="text-violet-500"
  />
  سجل النشاط التفصيلي
</h3>

      </div>

      <div className="px-6 pb-4">

        <div className="grid grid-cols-5 bg-slate-50 rounded-2xl px-5 py-6 text-sm font-bold text-slate-500">

          <div>المحاضرة</div>
          <div>الكورس</div>
          <div>مدة المشاهدة</div>
          <div>تاريخ المشاهدة</div>
          <div>الحالة</div>

        </div>

      </div>

      <div className="py-10 text-center text-slate-400">
        لا يوجد سجل نشاط بعد
      </div>

    </CardContent>

  </Card>

</div>
{showNotificationModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">

    <div
  className="
    bg-white
    rounded-3xl
    w-full
    max-w-[700px]
    shadow-2xl
    overflow-hidden
    max-h-[90vh]
    flex
    flex-col
  "
>

      <div className="p-6 border-b">

       <div className="flex items-center gap-3">

  <div className="
    w-12 h-12
    rounded-2xl
    bg-gradient-to-r
    from-violet-600
    to-blue-600
    flex
    items-center
    justify-center
    text-white
  ">
    🔔
  </div>

  <div>
    <h3 className="text-2xl font-black">
      إرسال إشعار
    </h3>

    <p className="text-slate-500">
      إرسال إشعار للطالب أو ولي الأمر
    </p>
  </div>

</div>

        <p className="text-slate-500 mt-2">
          إرسال إشعار للطالب أو ولي الأمر
        </p>

      </div>

      <div className="p-6 space-y-5 overflow-y-auto">

        <div>

          <label className="font-bold mb-2 block">
            جهة الإرسال
          </label>

          <select
            value={notificationType}
            onChange={(e) =>
              setNotificationType(e.target.value)
            }
            className="w-full border rounded-xl p-3"
          >
            <option value="student">
              الطالب فقط
            </option>

            <option value="parent">
              ولي الأمر فقط
            </option>

            <option value="both">
              الطالب + ولي الأمر
            </option>
          </select>

<div className="mt-3 bg-slate-50 rounded-xl p-3 text-sm">

  {notificationType === "student" && (
    <span>
      📱 {student.phone}
    </span>
  )}

  {notificationType === "parent" && (
    <span>
      📱 {student.parent_phone}
    </span>
  )}

  {notificationType === "both" && (
    <div className="space-y-1">
      <div>📱 {student.phone}</div>
      <div>📱 {student.parent_phone}</div>
    </div>
  )}

</div>

        </div>

        <div>

          <label className="font-bold mb-2 block">
            سبب الإشعار
          </label>

          <select
            value={notificationReason}
            onChange={(e) =>
              setNotificationReason(e.target.value)
            }
            className="w-full border rounded-xl p-3"
          >
            <option value="">
              اختر السبب
            </option>

           <option value="غياب محاضرة">
  غياب محاضرة
</option>

<option value="غياب امتحان">
  غياب امتحان
</option>

<option value="عدم تسليم واجب">
  عدم تسليم واجب
</option>

<option value="تنبيه عام">
  تنبيه عام
</option>

<option value="رسالة مخصصة">
  رسالة مخصصة
</option>

          </select>

        </div>

        <div>

          <label className="font-bold mb-2 block">
            عنوان الإشعار
          </label>

          <input
            value={notificationTitle}
            onChange={(e) =>
              setNotificationTitle(e.target.value)
            }
            className="w-full border rounded-xl p-3"
            placeholder="عنوان الإشعار"
          />

        </div>

        <div>

          <label className="font-bold mb-2 block">
            الرسالة
          </label>

          <textarea
            rows={5}
            value={notificationMessage}
            onChange={(e) =>
              setNotificationMessage(e.target.value)
            }
            className="w-full border rounded-xl p-3 resize-none"
            placeholder="اكتب الرسالة..."
          />
<div className="mt-5">

  <h4 className="font-black mb-3">
    معاينة الإشعار
  </h4>

  <div
    className="
    border
    border-violet-200
    bg-violet-50
    rounded-2xl
    p-4
    "
  >

    <div className="flex items-center gap-2 mb-3">

      <div
        className="
        w-10 h-10
        rounded-xl
        bg-violet-600
        text-white
        flex items-center justify-center
        "
      >
        🔔
      </div>

      <div>

        <p className="font-black">
          {notificationTitle || "عنوان الإشعار"}
        </p>

        <p className="text-xs text-slate-500">
          سيتم إرساله للطالب أو ولي الأمر
        </p>

      </div>

    </div>

    <p className="text-slate-700 whitespace-pre-line">
      {notificationMessage || "سيظهر نص الإشعار هنا"}
    </p>

  </div>

</div>
        </div>

      </div>

      <div className="p-6 border-t flex gap-3">

        <Button
  onClick={sendNotification}
>
  إرسال الإشعار
</Button>

        <Button
          variant="outline"
          onClick={() =>
            setShowNotificationModal(false)
          }
        >
          إلغاء
        </Button>

      </div>

    </div>

  </div>
)}
{showCourseModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl p-6 w-[500px]">

      <h3 className="text-2xl font-black mb-6">
        إضافة كورس للطالب
      </h3>

      <select
        value={selectedCourse}
        onChange={(e) =>
          setSelectedCourse(e.target.value)
        }
        className="
          w-full
          border
          rounded-xl
          p-3
          mb-6
        "
      >
        <option value="">
          اختر الكورس
        </option>

        {availableCourses
  .filter(
    (course) =>
      course.grade === student.grade
  )
  .map((course) => (
          <option
            key={course.id}
            value={course.id}
          >
            {course.title}
          </option>
        ))}
      </select>

      <div className="flex gap-3">

        <Button onClick={addCourse}>
          إضافة
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            setShowCourseModal(false)
          }
        >
          إلغاء
        </Button>

      </div>

    </div>

  </div>
)}
    </main>
  </div>
);
}
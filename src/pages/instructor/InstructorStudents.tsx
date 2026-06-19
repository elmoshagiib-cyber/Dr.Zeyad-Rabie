import {
  Search,
  Users,
  UserCheck,
  GraduationCap,
  Plus,
  Trash2,
  Eye,
  Power,
  UsersRound,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Avatar } from "../../components/ui/Avatar";
import { supabase } from "../../lib/supabase";

const grades = [
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",

  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
];

export function InstructorStudents() {

  const navigate = useNavigate();

  
const [students, setStudents] = useState<any[]>([]);
const [addStudentOpen, setAddStudentOpen] =
  useState(false);
const [sidebarOpen, setSidebarOpen] = useState(false);
useEffect(() => {
  loadStudents();
}, []);

const loadStudents = async () => {

  const { data, error } =
    await supabase
      .from("students")
      .select("*")
      .order("id", {
        ascending: false,
      });

  

  if (!error) {
    setStudents(data || []);
  }
};

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const newStudentsThisMonth =
  students.filter((student) => {

    if (!student.created_at)
      return false;

    const date =
      new Date(student.created_at);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  }).length;

  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [studentGrade, setStudentGrade] = useState("");

  const [studentType, setStudentType] =
    useState("سنتر");

  const generateStudentCode = () => {

  const zrStudents = students.filter(
    (s) =>
      s.student_code &&
      s.student_code.startsWith("ZR-")
  );

  if (zrStudents.length === 0) {
    return "ZR-000001";
  }

  const maxCode = Math.max(
    ...zrStudents.map((s) =>
      Number(
        s.student_code.replace(
          "ZR-",
          ""
        )
      )
    )
  );

  return `ZR-${String(
    maxCode + 1
  ).padStart(6, "0")}`;
};

  const [generatedCode, setGeneratedCode] =
    useState(generateStudentCode());

const [searchTerm, setSearchTerm] =
  useState("");

const [gradeFilter, setGradeFilter] =
  useState("");

const [statusFilter, setStatusFilter] =
  useState("");

const [typeFilter, setTypeFilter] =
  useState("");

  const [phoneFilter, setPhoneFilter] =
  useState("");

const createStudent = async () => {
  if (!studentName.trim()) return;

  const { data, error } = await supabase
    .from("students")
    .insert([
      {
        full_name: studentName,
        student_code: generatedCode,
        phone: studentPhone,
        parent_phone: parentPhone,
        grade: studentGrade,
        type: studentType,
        status: "نشط",
        is_activated: false,
        password: null,
      },
    ])
    .select();

  if (error) {
    alert(error.message);
    return;
  }

  await loadStudents();

  // هنا فقط
  setStudentName("");
  setStudentPhone("");
  setParentPhone("");
  setStudentGrade("");
  setStudentType("سنتر");

  setGeneratedCode(
    generateStudentCode()
  );
};

  const deleteStudent = async (
  id: number
) => {

  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", id);

console.log(error);

  if (!error) {
    await loadStudents();
  }

setGeneratedCode(
  generateStudentCode()
);
  
};

const toggleStudentStatus = async (
  
  id: number,
  currentStatus: string
) => {

  

  const newStatus =
    currentStatus === "نشط"
      ? "موقوف"
      : "نشط";

  

  const { data, error } = await supabase
  .from("students")
  .update({
    status: newStatus,
  })
  .eq("id", id)
  .select();




  console.log(error);

  await loadStudents();
};

  const filteredStudents =
  students.filter((student) => {

    const matchesSearch =
      student.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.student_code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.phone
        ?.includes(searchTerm);

    const matchesGrade =
      !gradeFilter ||
      student.grade === gradeFilter;

    const matchesStatus =
      !statusFilter ||
      student.status === statusFilter;

    const matchesType =
      !typeFilter ||
      student.type === typeFilter;

    return (
      matchesSearch &&
      matchesGrade &&
      matchesStatus &&
      matchesType
    );
  });
  
  return (
  <div
    className="
    flex
    min-h-screen
    bg-[#f5f7fb]
    "
    dir="rtl"
  >

    <DashboardSidebar type="instructor" />

    <main
  className="
  flex-1
  overflow-y-auto
  px-4
  py-4
  "
>

{/* Header */}
<div
  className="
  relative
  overflow-hidden
  rounded-[36px]
  bg-gradient-to-r
  from-blue-700
  via-blue-600
  to-blue-500
  px-10
  py-6
  text-white
  shadow-[0_10px_40px_rgba(37,99,235,0.25)]
  mb-8
  "
>
  <div className="relative z-10 flex flex-row-reverse items-center justify-between">

    {/* زر إضافة طالب */}
    <Button
      onClick={() => setAddStudentOpen(!addStudentOpen)}
      className="
      bg-white
      text-blue-700
      hover:bg-blue-50
      rounded-[28px]
      px-8
      h-20
      min-w-[210px]
      font-bold
      shadow-lg
      border-0
      "
    >
      <Plus size={18} />

      {
        addStudentOpen
          ? "إغلاق النموذج"
          : "إضافة طالب"
      }
    </Button>

    {/* العنوان */}
    <div className="flex flex-row-reverse items-center gap-6">

      <div className="text-right">

        <h1 className="text-6xl font-black leading-none">
          الطلاب
        </h1>

        <p className="text-blue-100 mt-3 text-2xl">
          إدارة ومتابعة جميع الطلاب بالمنصة
        </p>

      </div>

      <div
        className="
        w-16
h-16
        rounded-[28px]
        bg-white/10
        backdrop-blur-md
        flex
        items-center
        justify-center
        "
      >
        <UsersRound
          size={32}
          className="text-white"
        />
      </div>

    </div>

  </div>

  {/* تأثيرات الخلفية */}
  <div
    className="
    absolute
    -top-20
    -left-20
    w-72
    h-72
    bg-white/10
    rounded-full
    blur-3xl
    "
  />

  <div
    className="
    absolute
    -bottom-20
    right-0
    w-80
    h-80
    bg-blue-300/20
    rounded-full
    blur-3xl
    "
  />
</div>

<div className="space-y-8">
          {/* Stats */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

  {/* إجمالي الطلاب */}
  <Card
    className="
    bg-white
    rounded-[32px]
    border
    border-slate-100
    shadow-[0_4px_20px_rgba(15,23,42,0.05)]
    hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]
    transition-all
    duration-300
    "
  >
    <CardContent className="px-7 py-5 flex items-center justify-between">

      <div
        className="
        w-16
        h-16
        rounded-[24px]
        bg-violet-100
        flex
        items-center
        justify-center
        "
      >
        <Users
          size={30}
          className="text-violet-600"
        />
      </div>

      <div className="text-right">

        <p className="text-slate-500 text-sm mb-2">
          إجمالي الطلاب
        </p>

        <p className="text-6xl font-black leading-none">
          {students.length}
        </p>

        <p className="text-slate-400 text-sm mt-3">
          جميع الطلاب المسجلين
        </p>

      </div>

    </CardContent>
  </Card>

  {/* الطلاب النشطون */}
  <Card
    className="
    bg-white
    rounded-[32px]
    border
    border-slate-100
    shadow-[0_4px_20px_rgba(15,23,42,0.05)]
    hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]
    transition-all
    duration-300
    "
  >
    <CardContent className="px-7 py-5 flex items-center justify-between">

      <div
        className="
        w-20
h-20
        rounded-[24px]
        bg-emerald-100
        flex
        items-center
        justify-center
        "
      >
        <UserCheck
          size={30}
          className="text-emerald-600"
        />
      </div>

      <div className="text-right">

        <p className="text-slate-500 text-sm mb-2">
          الطلاب النشطون
        </p>

        <p className="text-6xl font-black leading-none">
          {
            students.filter(
              (student) =>
                student.status === "نشط" ||
                student.status === "active"
            ).length
          }
        </p>

        <p className="text-emerald-500 text-sm mt-3">
          100% من إجمالي الطلاب
        </p>

      </div>

    </CardContent>
  </Card>

  {/* طلاب هذا الشهر */}
  <Card
    className="
    bg-white
    rounded-[32px]
    border
    border-slate-100
    shadow-[0_4px_20px_rgba(15,23,42,0.05)]
    hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]
    transition-all
    duration-300
    "
  >
    <CardContent className="px-7 py-5 flex items-center justify-between">

      <div
        className="
        w-20
        h-20
        rounded-[24px]
        bg-orange-100
        flex
        items-center
        justify-center
        "
      >
        <GraduationCap
          size={30}
          className="text-orange-500"
        />
      </div>

      <div className="text-right">

        <p className="text-slate-500 text-sm mb-2">
          طلاب هذا الشهر
        </p>

        <p className="text-6xl font-black leading-none">
          {newStudentsThisMonth}
        </p>

        <p className="text-emerald-500 text-sm mt-3">
          +100% عن الشهر الماضي
        </p>

      </div>

    </CardContent>
  </Card>

</div>
          
<Card
className={`
border
border-slate-200
rounded-[28px]
bg-gradient-to-b
from-white
to-slate-50
shadow-none
overflow-hidden
transition-all
duration-300
${!addStudentOpen ? "hidden" : ""}
`}
>
  <CardContent className="p-6 space-y-5">

    <div className="flex items-center gap-3">

  <div
    className="
    w-11 h-11
    rounded-2xl
    bg-violet-100
    flex items-center justify-center
    "
  >
    <Plus
      size={20}
      className="text-violet-600"
    />
  </div>

  <div>
    <h2 className="font-black text-lg">
      إضافة طالب جديد
    </h2>

    <p className="text-sm text-slate-500">
      إنشاء حساب طالب جديد بالمنصة
    </p>
  </div>

</div>

    <div className="grid md:grid-cols-2 gap-3">

      <Input
        placeholder="اسم الطالب"
        value={studentName}
        onChange={(e) =>
          setStudentName(e.target.value)
        }
      />

      <Input
        placeholder="رقم الطالب"
        value={studentPhone}
        onChange={(e) =>
          setStudentPhone(e.target.value)
        }
      />

      <Input
        placeholder="رقم ولي الأمر"
        value={parentPhone}
        onChange={(e) =>
          setParentPhone(e.target.value)
        }
      />

     <select
  className="w-full border rounded-2xl px-5 py-4"
  value={studentGrade}
  onChange={(e) =>
    setStudentGrade(e.target.value)
  }
>
  <option value="">
    اختر الصف الدراسي
  </option>

  {grades.map((grade) => (
    <option
      key={grade}
      value={grade}
    >
      {grade}
    </option>
  ))}
</select>
<select
  className="w-full border rounded-2xl px-5 py-4"
  value={studentType}
  onChange={(e) =>
    setStudentType(e.target.value)
  }
>
  <option value="سنتر">
    سنتر
  </option>

  <option value="أونلاين">
    أونلاين
  </option>
</select>
    </div>
<div
className="
border
border-violet-100
rounded-2xl
p-5
bg-gradient-to-r from-violet-100 to-fuchsia-100/40
"
>

  <p className="text-sm text-slate-500 mb-2">
    كود الطالب
  </p>

  <div className="flex items-center justify-between flex-row-reverse">

    <span className="font-black text-lg">
      {generatedCode}
    </span>

    <Button
      type="button"
      variant="outline"
      onClick={() =>
        setGeneratedCode(
          generateStudentCode()
        )
      }
    >
      توليد كود
    </Button>

  </div>

</div>
    <Button onClick={createStudent}>
      <Plus size={16} />
      إضافة الطالب
    </Button>

  </CardContent>
</Card>
          {/* Search */}
<Card
  className="
  bg-white
  rounded-[32px]
  border
  border-slate-100
  shadow-[0_4px_20px_rgba(15,23,42,0.05)]
  "
>
  <CardContent className="p-8">

    <div className="flex items-start justify-between mb-6">

      <div className="text-right">

        <h3 className="text-2xl font-black mb-1">
          البحث والفلاتر
        </h3>

        <p className="text-slate-500">
          ابحث عن طالب معين أو استخدم الفلاتر
        </p>

      </div>

      <Button
        variant="outline"
        onClick={() => {
          setSearchTerm("");
          setGradeFilter("");
          setStatusFilter("");
          setTypeFilter("");
        }}
        className="
        h-12
        px-6
        rounded-2xl
        "
      >
        إعادة تعيين
      </Button>

    </div>

    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">

      <Input
        placeholder="اسم الطالب أو الكود..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
        icon={<Search size={20} />}
      />

      <select
        className="
        w-full
        border
        border-slate-200
        rounded-2xl
        px-5
        py-4
        bg-white
        "
        value={gradeFilter}
        onChange={(e) =>
          setGradeFilter(e.target.value)
        }
      >
        <option value="">
          كل الصفوف
        </option>

        {grades.map((grade) => (
          <option
            key={grade}
            value={grade}
          >
            {grade}
          </option>
        ))}
      </select>

      <select
        className="
        w-full
        border
        border-slate-200
        rounded-2xl
        px-5
        py-4
        bg-white
        "
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
      >
        <option value="">
          جميع الحالات
        </option>

        <option value="نشط">
          نشط
        </option>

        <option value="موقوف">
          موقوف
        </option>

      </select>

      <select
        className="
        w-full
        border
        border-slate-200
        rounded-2xl
        px-5
        py-4
        bg-white
        "
        value={typeFilter}
        onChange={(e) =>
          setTypeFilter(e.target.value)
        }
      >
        <option value="">
          جميع الأنواع
        </option>

        <option value="سنتر">
          سنتر
        </option>

        <option value="أونلاين">
          أونلاين
        </option>

      </select>

    </div>

  </CardContent>
</Card>

<div className="flex items-center justify-between mt-8">

  <div className="flex items-center gap-3">

    <h2 className="text-4xl font-black">
      قائمة الطلاب
    </h2>

    <span
      className="
      px-3
      py-1
      rounded-full
      bg-blue-50
      text-blue-600
      text-sm
      font-bold
      "
    >
      {students.length} طالب
    </span>

  </div>

</div>
        {/* Students List */}
<div className="space-y-4">

  <Card
    className="
    bg-white
    border
    border-slate-100
    rounded-[32px]
    overflow-hidden
    shadow-[0_4px_20px_rgba(15,23,42,0.05)]
    "
  >
    <CardContent className="p-0 overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="bg-[#f8f9fc] border-b border-slate-100">

              <th className="px-8 py-4 text-right text-sm font-bold text-slate-500">
                الطالب
              </th>

              <th className="px-6 py-4 text-right text-sm font-bold text-slate-500">
                الكود
              </th>

              <th className="px-6 py-4 text-right text-sm font-bold text-slate-500">
                الصف الدراسي
              </th>

              <th className="px-6 py-4 text-right text-sm font-bold text-slate-500">
                النوع
              </th>

              <th className="px-6 py-4 text-right text-sm font-bold text-slate-500">
                الحالة
              </th>

              <th className="px-6 py-4 text-right text-sm font-bold text-slate-500">
                الكورسات
              </th>

              <th className="px-6 py-4 text-center text-sm font-bold text-slate-500">
                الإجراءات
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredStudents.map((student) => (

              <tr
                key={student.id}
                className="
                border-b
                border-slate-100
                hover:bg-[#f8fbff]
                transition-all
                duration-200
                "
              >

                {/* الطالب */}
                <td className="px-8 py-5">

                  <div className="flex items-center gap-4">

                    <Avatar
                      name={student.full_name || student.name}
                      size="sm"
                    />

                    <div>

                      <p className="font-semibold text-slate-900 text-[17px]">
                        {student.full_name || student.name}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {student.phone || "لا يوجد رقم"}
                      </p>

                    </div>

                  </div>

                </td>

                {/* الكود */}
                <td className="px-6 py-5 text-slate-700 font-medium whitespace-nowrap">
                  {student.student_code}
                </td>

                {/* الصف */}
                <td className="px-6 py-5">

                  <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                    {student.grade}
                  </span>

                </td>

                {/* النوع */}
                <td className="px-6 py-5">

                  <span
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      student.type === "أونلاين"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {student.type || "سنتر"}
                  </span>

                </td>

                {/* الحالة */}
                <td className="px-6 py-5">

                  <span
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      student.status === "نشط" ||
                      student.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {student.status === "نشط" ||
                    student.status === "active"
                      ? "نشط"
                      : "موقوف"}
                  </span>

                </td>

                {/* الكورسات */}
                <td className="px-6 py-5">

                  <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                    {student.courses || 0} كورس
                  </span>

                </td>

                {/* الإجراءات */}
                <td className="px-6 py-5">

                  <div className="flex justify-center gap-2 flex-row-reverse">

                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/instructor/students/${student.id}`
                        )
                      }
                      className="
                      w-10
                      h-10
                      rounded-2xl
bg-violet-100
text-violet-600
hover:bg-violet-200
                      border-0
                      shadow-none
                      "
                    >
                      <Eye size={15} />
                    </Button>

                    <Button
                      size="sm"
                      onClick={() =>
                        toggleStudentStatus(
                          student.id,
                          student.status
                        )
                      }
                      className="
                      w-10
                      h-10
                      rounded-2xl
bg-orange-100
text-orange-600
hover:bg-orange-200
                      border-0
                      shadow-none
                      "
                    >
                      <Power size={15} />
                    </Button>

                    <Button
                      size="sm"
                      className="
                      w-10
                      h-10
                      rounded-2xl
bg-red-100
text-red-600
hover:bg-red-200
                      border-0
                      shadow-none
                      "
                      onClick={() => {
                        if (
                          confirm(
                            "هل أنت متأكد من حذف الطالب؟"
                          )
                        ) {
                          deleteStudent(student.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </CardContent>
  </Card>

          </div>

        </div>
        
      </main>
      
    </div>
  );
}
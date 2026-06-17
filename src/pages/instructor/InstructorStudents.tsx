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
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
className="
relative
overflow-hidden
rounded-3xl
bg-gradient-to-l
from-blue-700
via-blue-600
to-blue-500
p-8
text-white
shadow-lg
mb-6
"
>

  <div className="flex items-center justify-between">

    <div className="flex items-center gap-4">

  <div
    className="
    w-14 h-14
    rounded-2xl
    bg-white/10
    backdrop-blur-sm
    flex
    items-center
    justify-center
    "
  >
    <UsersRound size={28} />
  </div>

  <div>
    <h1 className="text-4xl font-black">
      الطلاب
    </h1>

    <p className="text-blue-100 mt-1">
      إدارة ومتابعة جميع الطلاب بالمنصة
    </p>
  </div>

</div>

    <Button
onClick={() =>
  setAddStudentOpen(!addStudentOpen)
}
className="
bg-white
text-blue-700
hover:bg-blue-50
rounded-xl
px-5
h-12
font-bold
"
>
<Plus size={18}/>
{
addStudentOpen
? "إغلاق النموذج"
: "إضافة طالب"
}
</Button>

  </div>

<div
className="
absolute
top-0
left-0
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
bottom-0
right-0
w-80
h-80
bg-blue-400/20
rounded-full
blur-3xl
"
/>

</div>
        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">

           <Card
className="
group
bg-white
border
border-slate-200
rounded-3xl
shadow-sm
hover:shadow-lg
hover:-translate-y-1
transition-all
duration-300
"
>
              <CardContent className="
flex
items-center
justify-between
p-6
group
">
                <Users size={32} className="text-blue-600" />
                <div>
                  <p className="text-sm text-slate-500">
                    إجمالي الطلاب
                  </p>
                  <p className="text-2xl font-black">
                    {students.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
className="
group
border
border-slate-200
rounded-3xl
hover:border-emerald-200
hover:-translate-y-1
transition-all
duration-300
"
>
              <CardContent className="flex items-center gap-4">
                <UserCheck size={32} className="text-emerald-600" />
                <div>
                  <p className="text-sm text-slate-500">
                    الطلاب النشطون
                  </p>
                  <p className="text-2xl font-black">
                    {
  students.filter(
  (student) =>
    student.status === "نشط" ||
    student.status === "active"
).length
}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
className="
border
border-slate-200
rounded-3xl
shadow-none
hover:border-violet-200
transition-all
duration-300
"
>
              <CardContent className="
flex
items-center
justify-between
p-6
">
                <GraduationCap size={32} className="text-orange-500" />
                <div>
                  <p className="text-sm text-slate-500">
                    طلاب هذا الشهر
                  </p>
                  <p className="text-2xl font-black">
                    {newStudentsThisMonth}
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
<Card
className={`
border
border-slate-200
rounded-3xl
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
  className="w-full border rounded-xl px-4 py-3"
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
  className="w-full border rounded-xl px-4 py-3"
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
bg-violet-50/40
"
>

  <p className="text-sm text-slate-500 mb-2">
    كود الطالب
  </p>

  <div className="flex items-center justify-between">

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
bg-white/80
backdrop-blur-xl
border
border-slate-200
rounded-3xl
shadow-sm
hover:shadow-md
transition-all
duration-300
"
>
  <CardContent className="space-y-5 p-6">

    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-black text-lg">
          البحث والفلاتر
        </h3>

        <p className="text-sm text-slate-500">
          ابحث عن الطلاب وقم بتصفية النتائج
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
      >
        إعادة تعيين
      </Button>
    </div>

    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-3">

      <Input
        placeholder="اسم الطالب أو الكود"
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
        icon={<Search size={18} />}
      />

      <select
        className="border rounded-xl px-4 py-3"
        value={gradeFilter}
        onChange={(e) =>
          setGradeFilter(e.target.value)
        }
      >
        <option value="">كل الصفوف</option>

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
        className="border rounded-xl px-4 py-3"
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
      >
        <option value="">جميع الحالات</option>
        <option value="نشط">نشط</option>
        <option value="موقوف">موقوف</option>
      </select>

      <select
        className="border rounded-xl px-4 py-3"
        value={typeFilter}
        onChange={(e) =>
          setTypeFilter(e.target.value)
        }
      >
        <option value="">جميع الأنواع</option>
        <option value="سنتر">سنتر</option>
        <option value="أونلاين">أونلاين</option>
      </select>

    </div>

  </CardContent>
</Card>
<div className="flex items-end justify-between">

  <div className="flex items-center gap-3">

<h2 className="text-xl font-black">
قائمة الطلاب
</h2>

<span
className="
px-3
py-1
rounded-full
bg-blue-50
text-blue-600
text-xs
font-bold
"
>
{students.length} طالب
</span>

</div>

  <div
className="
flex items-center gap-3
px-5 py-4
rounded-2xl
bg-white
border
border-slate-200
shadow-sm
"
>
    <div className="flex items-center gap-2">

  <div
className="
w-14
h-14
rounded-2xl
bg-blue-50
flex
items-center
justify-center
"
>
<Users
size={28}
className="text-blue-600"
/>
</div>

  <div>
    <p className="font-black text-lg">
      {filteredStudents.length}
    </p>

    <p className="text-slate-500">
عرض {filteredStudents.length} طالب
</p>
  </div>

</div>
  </div>

</div>
          {/* Students List */}
          <div className="space-y-4">
             <Card
className="
bg-white
border
border-slate-200
rounded-3xl
overflow-hidden
shadow-sm
hover:shadow-md
transition-all
duration-300
"
>
  <CardContent className="p-0 overflow-hidden">

    <div className="overflow-x-auto">

      <table className="w-full">

        <thead>
  <tr className="bg-slate-50 border-b border-slate-200">

    <th className="
px-6
py-5
text-xs
font-bold
text-slate-500
">
      الطالب
    </th>

    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">
      الكود
    </th>

    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">
      الصف الدراسي
    </th>

    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">
      النوع
    </th>

    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">
      الحالة
    </th>

    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase">
      الكورسات
    </th>

    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase">
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
hover:bg-slate-50
transition-all
duration-200
"
>

  {/* الطالب */}
  <td className="px-6 py-4">
    <div className="flex items-center gap-3">

      <Avatar
        name={student.full_name || student.name}
        size="sm"
      />

      <div>

        <p className="
font-black
text-slate-900
tracking-tight
whitespace-nowrap
">
          {student.full_name || student.name}
        </p>

        <p className="text-xs text-slate-400">
          {student.phone || "لا يوجد رقم"}
        </p>

      </div>

    </div>

  </td>

  {/* الكود */}
  <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
  {student.student_code}
</td>

  {/* الصف */}
  <td className="px-6 py-4">

    <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
  {student.grade}
</span>

  </td>

  {/* النوع */}
  <td className="px-6 py-4">

    <span
  className={`px-3 py-1 rounded-full text-xs font-bold ${
    student.type === "أونلاين"
      ? "bg-violet-100 text-violet-700"
      : "bg-orange-100 text-orange-700"
  }`}
>
  {student.type || "سنتر"}
</span>

  </td>

  {/* الحالة */}
  <td className="px-6 py-4">

    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${
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
  <td className="px-6 py-4">

    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
      {student.courses || 0} كورس
    </span>

  </td>

  {/* الإجراءات */}
  <td className="px-6 py-4">

    <div className="flex justify-center gap-2">

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
rounded-xl
bg-violet-50
text-violet-600
hover:bg-violet-100
border-0
shadow-none
transition-all
duration-200
hover:scale-105
"
>

<Eye size={15}/>
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
rounded-xl
bg-orange-50
text-orange-600
hover:bg-orange-100
border-0
shadow-none
transition-all
duration-200
hover:scale-105
"
>
<Power size={15}/>
</Button>

      <Button
        size="sm"
        variant="danger"
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
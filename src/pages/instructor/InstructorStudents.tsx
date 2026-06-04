import {
  Search,
  Users,
  UserCheck,
  GraduationCap,
  Plus,
  Trash2,
  Eye,
  Power,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useState } from "react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useNavigate } from "react-router-dom";

export function InstructorStudents() {

  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([
    {
      id: 1,
      name: "أحمد محمد",
      code: "ZR-5821",

      grade: "الصف الثالث الثانوي",
      courses: 3,

      status: "نشط",
      type: "سنتر",
      joinDate: "2026-06-01",
    },

    {
      id: 2,
      name: "محمد علي",
      code: "ZR-1947",

      grade: "الصف الثالث الثانوي",
      courses: 2,

      status: "نشط",
      type: "أونلاين",
      joinDate: "2026-06-02",
    },

    {
      id: 3,
      name: "محمود أحمد",
      code: "ZR-7632",

      grade: "الصف الثاني الثانوي",
      courses: 1,

      status: "موقوف",
      type: "سنتر",
      joinDate: "2026-05-15",
    },
  ]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const newStudentsThisMonth =
    students.filter((student) => {
      if (!student.joinDate) return false;

      const date = new Date(student.joinDate);

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
    return (
      "ZR-" +
      Math.floor(1000 + Math.random() * 9000)
    );
  };

  const [generatedCode, setGeneratedCode] =
    useState(generateStudentCode());

const [searchTerm, setSearchTerm] =
  useState("");

  const createStudent = () => {
    if (!studentName.trim()) return;

    setStudents([
      ...students,
      {
        id: Date.now(),
        name: studentName,
        code: generatedCode,

        grade: studentGrade,
        phone: studentPhone,
        parentPhone,

        courses: 0,
        status: "نشط",

        type: studentType,

        joinDate: new Date()
          .toISOString()
          .split("T")[0],
      },
    ]);

    setStudentName("");
    setStudentPhone("");
    setParentPhone("");
    setStudentGrade("");
    setStudentType("سنتر");

    setGeneratedCode(
      generateStudentCode()
    );
  };

  const deleteStudent = (id: number) => {
    setStudents(
      students.filter(
        (student) => student.id !== id
      )
    );
  };

  const toggleStudentStatus = (id: number) => {
    setStudents(
      students.map((student) =>
        student.id === id
          ? {
              ...student,
              status:
                student.status === "نشط"
                  ? "موقوف"
                  : "نشط",
            }
          : student
      )
    );
  };

  const filteredStudents =
  students.filter((student) =>
    student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||

    student.code
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-black text-slate-900">
            الطلاب
          </h1>
          <p className="text-slate-500 text-sm">
            إدارة ومتابعة جميع الطلاب
          </p>
        </div>

        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">

            <Card>
              <CardContent className="flex items-center gap-4">
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

            <Card>
              <CardContent className="flex items-center gap-4">
                <UserCheck size={32} className="text-emerald-600" />
                <div>
                  <p className="text-sm text-slate-500">
                    الطلاب النشطون
                  </p>
                  <p className="text-2xl font-black">
                    {
  students.filter(
    (student) => student.status === "نشط"
  ).length
}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4">
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
<Card>
  <CardContent className="space-y-4">

    <h2 className="font-black text-lg">
      إضافة طالب جديد
    </h2>

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

      <Input
        placeholder="الصف الدراسي"
        value={studentGrade}
        onChange={(e) =>
          setStudentGrade(e.target.value)
        }
      />
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
<div className="border rounded-xl p-4 bg-slate-50">

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
          <Card>
            <CardContent>
              <Input
  placeholder="ابحث باسم الطالب أو الكود..."
  value={searchTerm}
  onChange={(e) =>
    setSearchTerm(e.target.value)
  }
  icon={<Search size={18} />}
/>
            </CardContent>
          </Card>

          {/* Students List */}
          <div className="space-y-4">
            {filteredStudents.map((student) => ( 
              <Card key={student.id}>
                <CardContent>
                  <div className="flex justify-between items-center">

                    <div>
                      <h2 className="font-black text-lg">
                        {student.name}
                      </h2>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                        <span>الكود: {student.code}</span>
                        <span>{student.grade}</span>
                        <span>
  النوع: {student.type}
</span>
                        <span>
                          الكورسات: {student.courses}
                        </span>
                      </div>
                    </div>

                    <span
                    
                      className={`px-3 py-1 rounded-xl text-sm font-bold ${
                        student.status === "نشط"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.status}
                    </span>
<div className="flex gap-2">

<Button
  size="sm"
  variant="outline"
  onClick={() =>
    navigate(
      `/instructor/students/${student.id}`
    )
  }
>    <Eye size={14} />
    عرض
  </Button><Button
  size="sm"
  variant="outline"
  onClick={() =>
    navigate(`/instructor/students/${student.id}`)
  }
>
  <Eye size={14} />
  عرض
</Button>

  <Button
    size="sm"
    variant="outline"
    onClick={() =>
      toggleStudentStatus(student.id)
    }
  >
    <Power size={14} />

    {student.status === "نشط"
      ? "إيقاف"
      : "تفعيل"}
  </Button>

  <Button
    size="sm"
    variant="danger"
    onClick={() =>
      deleteStudent(student.id)
    }
  >
    <Trash2 size={14} />
    حذف
  </Button>

</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
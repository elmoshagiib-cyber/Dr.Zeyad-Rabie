import { Search, Users, UserCheck, GraduationCap } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

export function InstructorStudents() {
  const students = [
    {
      id: 1,
      name: "أحمد محمد",
      code: "STD001",
      grade: "الصف الثالث الثانوي",
      courses: 3,
      status: "نشط",
    },
    {
      id: 2,
      name: "محمد علي",
      code: "STD002",
      grade: "الصف الثالث الثانوي",
      courses: 2,
      status: "نشط",
    },
    {
      id: 3,
      name: "محمود أحمد",
      code: "STD003",
      grade: "الصف الثاني الثانوي",
      courses: 1,
      status: "معلق",
    },
  ];

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
                    325
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
                    281
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
                    42
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Search */}
          <Card>
            <CardContent>
              <Input
                placeholder="ابحث باسم الطالب أو الكود..."
                icon={<Search size={18} />}
              />
            </CardContent>
          </Card>

          {/* Students List */}
          <div className="space-y-4">
            {students.map((student) => (
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
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";

export function InstructorAnalytics() {
  const stats = [
    {
      title: "إجمالي الطلاب",
      value: "325",
      icon: <Users size={28} className="text-blue-600" />,
    },
    {
      title: "إجمالي الكورسات",
      value: "12",
      icon: <BookOpen size={28} className="text-emerald-600" />,
    },
    {
      title: "إجمالي الإيرادات",
      value: "45,000 ج",
      icon: <DollarSign size={28} className="text-orange-500" />,
    },
    {
      title: "متوسط النجاح",
      value: "87%",
      icon: <TrendingUp size={28} className="text-purple-600" />,
    },
  ];

  const topCourses = [
    {
      name: "الكيمياء العضوية",
      students: 120,
      completion: "92%",
    },
    {
      name: "الهيدروكربونات",
      students: 95,
      completion: "84%",
    },
    {
      name: "الأحماض والقواعد",
      students: 78,
      completion: "80%",
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
            التحليلات
          </h1>

          <p className="text-slate-500 text-sm">
            متابعة أداء الكورسات والطلاب
          </p>
        </div>

        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((item) => (
              <Card key={item.title}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {item.title}
                    </p>

                    <p className="text-2xl font-black mt-1">
                      {item.value}
                    </p>
                  </div>

                  {item.icon}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Courses */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={20} />
                <h2 className="font-black text-lg">
                  أفضل الكورسات أداءً
                </h2>
              </div>

              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold">
                        {course.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {course.students} طالب
                      </p>
                    </div>

                    <div className="text-emerald-600 font-black">
                      {course.completion}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardContent>
              <h2 className="font-black text-lg mb-4">
                نشاط آخر 7 أيام
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>مشاهدات الدروس</span>
                  <span className="font-bold">1,245</span>
                </div>

                <div className="flex justify-between">
                  <span>الامتحانات المكتملة</span>
                  <span className="font-bold">318</span>
                </div>

                <div className="flex justify-between">
                  <span>الواجبات المسلمة</span>
                  <span className="font-bold">271</span>
                </div>

                <div className="flex justify-between">
                  <span>طلاب جدد</span>
                  <span className="font-bold">42</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
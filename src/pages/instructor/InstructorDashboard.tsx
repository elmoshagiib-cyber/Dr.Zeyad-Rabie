import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, TrendingUp, Star, Plus, Eye, Edit, Trash2, BarChart2, MessageSquare, Bell, ChevronRight, Play, FileText } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useApp } from "../../context/AppContext";
import { COURSES, STUDENTS, ANNOUNCEMENTS } from "../../data/mockData";

export function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "analytics">("overview");

  const myCourses = COURSES.slice(0, 4);
  const recentStudents = STUDENTS.filter(s => s.status === "approved").slice(0, 5);

  const stats = [
    { label: "إجمالي الطلاب", value: "980", change: "+24 هذا الأسبوع", icon: <Users size={20} />, color: "bg-blue-500" },
    { label: "الكورسات النشطة", value: "4", change: "1 مسودة", icon: <BookOpen size={20} />, color: "bg-violet-500" },
    { label: "متوسط التقييم", value: "4.9", change: "من 5.0", icon: <Star size={20} />, color: "bg-amber-500" },
    { label: "معدل الإكمال", value: "67%", change: "+5% هذا الشهر", icon: <TrendingUp size={20} />, color: "bg-emerald-500" },
  ];

  const performanceData = [
    { course: "كيمياء ت.3", students: 980, completion: 67, rating: 4.9, revenue: 441000 },
    { course: "كيمياء ت.2", students: 720, completion: 54, rating: 4.8, revenue: 273600 },
    { course: "علوم أولى", students: 560, completion: 71, rating: 4.7, revenue: 179200 },
    { course: "علوم ابتدائي", students: 340, completion: 82, rating: 4.9, revenue: 68000 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-slate-900 text-lg">لوحة تحكم المدرس</h1>
            <p className="text-slate-500 text-xs">مرحباً {user?.name || "د. زياد ربيع"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
              <Bell size={18} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Button size="sm" onClick={() => navigate("/instructor/courses/create")}>
              <Plus size={16} />
              إنشاء كورس
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={i} className="p-5">
                <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-0.5">{stat.value}</p>
                <p className="text-slate-500 text-xs mb-2">{stat.label}</p>
                <p className="text-emerald-600 text-xs font-medium">{stat.change}</p>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
            {[
              { key: "overview", label: "نظرة عامة" },
              { key: "students", label: "الطلاب" },
              { key: "analytics", label: "التحليلات" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* My Courses */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-slate-900">كورساتي</h2>
                  <Button size="sm" variant="outline" onClick={() => navigate("/instructor/courses")}>
                    إدارة الكورسات
                  </Button>
                </div>
                {myCourses.map(course => (
                  <Card key={course.id}>
                    <CardContent className="flex gap-4">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=80&h=80&fit=crop`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-bold text-slate-900 text-sm truncate">{course.title}</p>
                          <Badge variant={course.status === "published" ? "emerald" : "slate"}>
                            {course.status === "published" ? "نشط" : "مسودة"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <span><Users size={11} className="inline mr-1" />{course.studentsCount} طالب</span>
                          <span><Play size={11} className="inline mr-1" />{course.lessonsCount} درس</span>
                          <span><Star size={11} className="inline mr-1 fill-amber-400 text-amber-400" />{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => navigate(`/courses/${course.slug}`)} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:text-blue-700">
                            <Eye size={12} /> عرض
                          </button>
                          <button className="text-slate-500 text-xs font-bold flex items-center gap-1 hover:text-slate-700">
                            <Edit size={12} /> تعديل
                          </button>
                          <button className="text-rose-500 text-xs font-bold flex items-center gap-1 hover:text-rose-700">
                            <Trash2 size={12} /> حذف
                          </button>
                          <span className="mr-auto text-sm font-black text-emerald-600">
                            {(course.price * course.studentsCount).toLocaleString("ar-EG")} ج
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Right sidebar */}
              <div className="space-y-5">
                {/* Quick Actions */}
                <Card>
                  <CardContent>
                    <h3 className="font-black text-slate-900 mb-4">الإجراءات السريعة</h3>
                    <div className="space-y-2">
                      {[
                        { label: "إنشاء كورس جديد", icon: <BookOpen size={15} />, color: "text-blue-600 bg-blue-50", action: () => navigate("/instructor/courses/create") },
                        { label: "إضافة اختبار", icon: <FileText size={15} />, color: "text-violet-600 bg-violet-50", action: () => {} },
                        { label: "نشر إعلان", icon: <MessageSquare size={15} />, color: "text-amber-600 bg-amber-50", action: () => {} },
                        { label: "عرض التحليلات", icon: <BarChart2 size={15} />, color: "text-emerald-600 bg-emerald-50", action: () => setActiveTab("analytics") },
                      ].map((action, i) => (
                        <button
                          key={i}
                          onClick={action.action}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-right"
                        >
                          <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                            {action.icon}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{action.label}</span>
                          <ChevronRight size={14} className="text-slate-400 mr-auto" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Latest Announcements */}
                <Card>
                  <CardContent>
                    <h3 className="font-black text-slate-900 mb-4">إعلاناتي الأخيرة</h3>
                    <div className="space-y-3">
                      {ANNOUNCEMENTS.slice(0, 3).map(ann => (
                        <div key={ann.id} className="border-r-2 border-blue-500 pr-3">
                          <p className="text-xs font-bold text-slate-800 leading-tight mb-0.5">{ann.title}</p>
                          <p className="text-[10px] text-slate-400">{ann.publishedAt}</p>
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 text-blue-600 text-xs font-bold">+ نشر إعلان جديد</button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-slate-900">طلابي المسجلون</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{recentStudents.length} طالب</span>
                    <Button size="sm" variant="outline">تصدير</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {["الطالب", "الصف", "المحافظة", "الكورسات", "الدرجة", "الحالة"].map(h => (
                          <th key={h} className="text-right text-xs font-bold text-slate-500 pb-3 px-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={s.name} size="sm" />
                              <div>
                                <p className="text-sm font-bold text-slate-900">{s.name}</p>
                                <p className="text-xs text-slate-400 font-mono">{s.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3"><span className="text-sm text-slate-600">{s.gradeLabel}</span></td>
                          <td className="py-3 px-3"><span className="text-sm text-slate-600">{s.governorate}</span></td>
                          <td className="py-3 px-3"><span className="text-sm font-bold text-slate-900">{s.enrolledCourses}</span></td>
                          <td className="py-3 px-3">
                            <span className={`text-sm font-black ${s.score >= 90 ? "text-emerald-600" : s.score >= 75 ? "text-blue-600" : "text-slate-600"}`}>
                              {s.score > 0 ? `${s.score}%` : "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant={s.status === "approved" ? "emerald" : "amber"}>
                              {s.status === "approved" ? "نشط" : "منتظر"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Card>
                  <CardContent>
                    <h3 className="font-black text-slate-900 mb-5">أداء الكورسات</h3>
                    <div className="space-y-4">
                      {performanceData.map((data, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700">{data.course}</span>
                            <span className="text-sm font-black text-slate-900">{data.completion}%</span>
                          </div>
                          <ProgressBar value={data.completion} size="sm" />
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400">{data.students} طالب</span>
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs text-slate-400">{data.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <h3 className="font-black text-slate-900 mb-5">الإيرادات</h3>
                    <div className="space-y-4">
                      {performanceData.map((data, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{data.course}</span>
                          <span className="text-sm font-black text-emerald-600">{data.revenue.toLocaleString("ar-EG")} ج</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                        <span className="font-black text-slate-900">الإجمالي</span>
                        <span className="font-black text-xl text-emerald-600">
                          {performanceData.reduce((s, d) => s + d.revenue, 0).toLocaleString("ar-EG")} ج
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

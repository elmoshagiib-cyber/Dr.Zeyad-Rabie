import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, DollarSign, CheckCircle, XCircle, Clock, Bell, Search, BarChart2, Shield } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { STUDENTS, COURSES, ADMIN_STATS } from "../../data/mockData";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"overview" | "approvals" | "users" | "courses">("overview");
  const [approvals, setApprovals] = useState(STUDENTS.filter(s => s.status === "pending"));
  const [search, setSearch] = useState("");

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.filter(s => s.id !== id));
  };
  const handleReject = (id: string) => {
    setApprovals(prev => prev.filter(s => s.id !== id));
  };

  const stats = [
    { label: "إجمالي الطلاب", value: ADMIN_STATS.totalStudents.toLocaleString("ar-EG"), change: "+47 هذا الأسبوع", icon: <Users size={20} />, color: "bg-blue-500" },
    { label: "الكورسات النشطة", value: ADMIN_STATS.totalCourses.toString(), change: "2 مسودة", icon: <BookOpen size={20} />, color: "bg-violet-500" },
    { label: "بانتظار الموافقة", value: approvals.length.toString(), change: "يحتاج مراجعة", icon: <Clock size={20} />, color: "bg-amber-500" },
    { label: "الإيراد الشهري", value: `${(ADMIN_STATS.monthlyRevenue / 1000).toFixed(0)}K ج`, change: "+12% هذا الشهر", icon: <DollarSign size={20} />, color: "bg-emerald-500" },
  ];

  const allStudents = STUDENTS.filter(s =>
    s.name.includes(search) || s.phone.includes(search) || s.code.includes(search)
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="admin" />
      </div>
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#130726]/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <Shield size={16} className="text-red-600" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-lg">لوحة الإدارة</h1>
              <p className="text-slate-500 text-xs">إدارة منصة د. زياد ربيع</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
              <Bell size={18} className="text-slate-600" />
              {approvals.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{approvals.length}</span>
              )}
            </button>
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
                <p className="text-slate-500 text-xs mb-1">{stat.label}</p>
                <p className="text-emerald-600 text-xs font-medium">{stat.change}</p>
              </Card>
            ))}
          </div>

          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "overview", label: "نظرة عامة" },
              { key: "approvals", label: `الموافقات (${approvals.length})` },
              { key: "users", label: "المستخدمون" },
              { key: "courses", label: "الكورسات" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeSection === tab.key
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-white dark:bg-[#130726] text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeSection === "overview" && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Platform Stats */}
                <Card>
                  <CardContent>
                    <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2">
                      <BarChart2 size={18} className="text-blue-500" />
                      إحصائيات المنصة
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: "المشتركون النشطون", value: ADMIN_STATS.activeEnrollments.toLocaleString("ar-EG"), icon: "👥" },
                        { label: "معدل النجاح", value: `${ADMIN_STATS.successRate}%`, icon: "📈" },
                        { label: "إجمالي الإيرادات", value: `${(ADMIN_STATS.totalRevenue / 1000).toFixed(0)}K`, icon: "💰" },
                        { label: "التقييم العام", value: "4.9/5", icon: "⭐" },
                      ].map((s, i) => (
                        <div key={i} className="bg-slate-50 rounded-2xl p-4 text-center">
                          <div className="text-2xl mb-1">{s.icon}</div>
                          <p className="text-xl font-black text-slate-900">{s.value}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Mini Charts — Progress bars as chart replacement */}
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-slate-700">توزيع الطلاب حسب الصف</p>
                      {[
                        { label: "الصف الثالث الثانوي", value: 40, color: "from-rose-400 to-rose-500" },
                        { label: "الصف الثاني الثانوي", value: 30, color: "from-violet-400 to-violet-500" },
                        { label: "الصف الأول الثانوي", value: 20, color: "from-blue-400 to-blue-500" },
                        { label: "المرحلة الابتدائية", value: 10, color: "from-emerald-400 to-emerald-500" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-slate-600 w-40 truncate">{item.label}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.value}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-slate-900 w-8">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Pending */}
                {approvals.length > 0 && (
                  <Card className="border-amber-200">
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-slate-900 flex items-center gap-2">
                          <Clock size={16} className="text-amber-500" />
                          طلبات التسجيل المعلقة
                        </h3>
                        <button onClick={() => setActiveSection("approvals")} className="text-blue-600 text-sm font-bold">عرض الكل</button>
                      </div>
                      <div className="space-y-3">
                        {approvals.slice(0, 3).map(s => (
                          <div key={s.id} className="flex items-center gap-4 bg-amber-50 rounded-xl p-3">
                            <Avatar name={s.name} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                              <p className="text-xs text-slate-500">{s.gradeLabel} — {s.governorate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleApprove(s.id)} className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-600 transition-colors">
                                <CheckCircle size={15} />
                              </button>
                              <button onClick={() => handleReject(s.id)} className="w-8 h-8 bg-rose-100 hover:bg-rose-200 rounded-lg flex items-center justify-center text-rose-600 transition-colors">
                                <XCircle size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right */}
              <div className="space-y-5">
                <Card>
                  <CardContent>
                    <h3 className="font-black text-slate-900 mb-4">أفضل الكورسات</h3>
                    <div className="space-y-4">
                      {COURSES.slice(0, 4).map((course, i) => (
                        <div key={course.id} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{course.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <ProgressBar value={course.studentsCount} max={1200} size="sm" className="flex-1" />
                              <span className="text-xs text-slate-500 w-8">{course.studentsCount}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <h3 className="font-black text-slate-900 mb-4">آخر التسجيلات</h3>
                    <div className="space-y-3">
                      {STUDENTS.slice(0, 4).map(s => (
                        <div key={s.id} className="flex items-center gap-3">
                          <Avatar name={s.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                            <p className="text-[10px] text-slate-400">{s.joinedAt}</p>
                          </div>
                          <Badge variant={s.status === "approved" ? "emerald" : "amber"}>
                            {s.status === "approved" ? "نشط" : "معلق"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Approvals */}
          {activeSection === "approvals" && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-slate-900">طلبات الموافقة المعلقة</h2>
                  <Badge variant="amber">{approvals.length} طلب معلق</Badge>
                </div>
                {approvals.length === 0 ? (
                  <div className="text-center py-14">
                    <div className="text-5xl mb-3">✅</div>
                    <p className="text-lg font-bold text-slate-700 mb-1">تم مراجعة جميع الطلبات</p>
                    <p className="text-slate-500 text-sm">لا توجد طلبات معلقة حالياً</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvals.map(s => (
                      <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                        <Avatar name={s.name} size="md" />
                        <div className="flex-1 grid sm:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-slate-400 mb-0.5">الاسم</p>
                            <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-0.5">الهاتف</p>
                            <p className="font-mono text-sm text-slate-700">{s.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-0.5">الصف</p>
                            <p className="text-sm text-slate-700">{s.gradeLabel}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-0.5">المحافظة</p>
                            <p className="text-sm text-slate-700">{s.governorate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="success" onClick={() => handleApprove(s.id)}>
                            <CheckCircle size={14} />
                            قبول
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleReject(s.id)}>
                            <XCircle size={14} />
                            رفض
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Users */}
          {activeSection === "users" && (
            <Card>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                  <h2 className="font-black text-slate-900">جميع المستخدمين</h2>
                  <div className="relative sm:mr-auto">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="ابحث عن طالب..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-64"
                    />
                  </div>
                  <Button size="sm">تصدير البيانات</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {["الطالب", "كود الطالب", "الهاتف", "الصف", "المحافظة", "التسجيل", "الحالة", "الإجراءات"].map(h => (
                          <th key={h} className="text-right text-xs font-bold text-slate-500 pb-3 px-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allStudents.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Avatar name={s.name} size="sm" />
                              <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{s.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2"><span className="text-xs font-mono text-blue-600">{s.code}</span></td>
                          <td className="py-3 px-2"><span className="text-xs font-mono text-slate-600">{s.phone}</span></td>
                          <td className="py-3 px-2"><span className="text-xs text-slate-600 whitespace-nowrap">{s.gradeLabel}</span></td>
                          <td className="py-3 px-2"><span className="text-xs text-slate-600">{s.governorate}</span></td>
                          <td className="py-3 px-2"><span className="text-xs text-slate-400">{s.joinedAt}</span></td>
                          <td className="py-3 px-2">
                            <Badge variant={s.status === "approved" ? "emerald" : "amber"}>
                              {s.status === "approved" ? "نشط" : "معلق"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {s.status === "pending" && (
                                <>
                                  <button onClick={() => handleApprove(s.id)} className="text-emerald-600 hover:text-emerald-700 transition-colors" title="قبول">
                                    <CheckCircle size={15} />
                                  </button>
                                  <button onClick={() => handleReject(s.id)} className="text-rose-500 hover:text-rose-600 transition-colors" title="رفض">
                                    <XCircle size={15} />
                                  </button>
                                </>
                              )}
                              <button className="text-slate-400 hover:text-red-500 transition-colors" title="تعليق">
                                <Shield size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses */}
          {activeSection === "courses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-slate-900">إدارة الكورسات</h2>
                <Button size="sm" onClick={() => navigate("/instructor/courses/create")}>
                  + كورس جديد
                </Button>
              </div>
              {COURSES.map(course => (
                <Card key={course.id}>
                  <CardContent className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=80&h=80&fit=crop`; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-black text-slate-900">{course.title}</p>
                        <Badge variant={course.status === "published" ? "emerald" : "slate"}>
                          {course.status === "published" ? "منشور" : "مسودة"}
                        </Badge>
                        {course.isFree && <Badge variant="blue">مجاني</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>{course.gradeLabel}</span>
                        <span>{course.studentsCount.toLocaleString("ar-EG")} طالب</span>
                        <span>{course.lessonsCount} درس</span>
                        <span className="font-black text-emerald-600">{course.isFree ? "مجاني" : `${course.price} ج`}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/courses/${course.slug}`)}>عرض</Button>
                      <Button size="sm" variant="ghost">تعديل</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

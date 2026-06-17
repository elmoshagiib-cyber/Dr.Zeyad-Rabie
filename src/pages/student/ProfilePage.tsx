import { useState } from "react";
import { Camera, Edit2, CheckCircle, Star, Trophy, BookOpen, Award, Shield } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Avatar } from "../../components/ui/Avatar";
import { useApp } from "../../context/AppContext";
import { CURRENT_STUDENT, COURSES, LEADERBOARD } from "../../data/mockData";

export function ProfilePage() {
  const { user } = useApp();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || CURRENT_STUDENT.name);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const enrolledCourses = CURRENT_STUDENT.enrolledCourses.map(ec => ({
    ...ec,
    course: COURSES.find(c => c.id === ec.courseId),
  }));

  const myRank = LEADERBOARD.find(l => l.rank === 12);

  const achievements = [
    { icon: "🏆", title: "متفوق", desc: "حصلت على 90%+ في 3 اختبارات", earned: true },
    { icon: "🔥", title: "مثابر", desc: "7 أيام متواصلة في الدراسة", earned: true },
    { icon: "📚", title: "قارئ نشط", desc: "شاهدت 20 درس هذا الأسبوع", earned: true },
    { icon: "⭐", title: "متميز", desc: "ترتيب ضمن أفضل 10 طلاب", earned: false },
    { icon: "🎯", title: "دقيق", desc: "أجبت صح على 50 سؤال متتالي", earned: false },
    { icon: "🚀", title: "سريع التعلم", desc: "أتممت كورس في أسبوع واحد", earned: false },
  ];

  const displayUser = user || { name: CURRENT_STUDENT.name, code: CURRENT_STUDENT.code, grade: CURRENT_STUDENT.grade, gradeLabel: CURRENT_STUDENT.gradeLabel, governorate: CURRENT_STUDENT.governorate, phone: CURRENT_STUDENT.phone };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle size={18} className="text-emerald-600" />
              <p className="text-emerald-700 font-medium text-sm">تم حفظ التغييرات بنجاح!</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20">
                  <Avatar name={displayUser.name} size="xl" className="w-full h-full rounded-2xl" />
                </div>
                <button className="absolute -bottom-2 -left-2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera size={14} className="text-white" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-right">
                {editing ? (
                  <div className="mb-2">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="bg-white dark:bg-[#130726]/20 border border-white/30 rounded-xl px-4 py-2 text-white text-xl font-black focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-black text-white mb-1">{editName}</h1>
                )}
                <p className="text-blue-300 text-sm mb-3">{displayUser.gradeLabel}</p>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <Badge variant="blue" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    <Shield size={10} /> {displayUser.code || CURRENT_STUDENT.code}
                  </Badge>
                  <Badge variant="emerald" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    ✓ حساب مفعل
                  </Badge>
                  <Badge variant="amber" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    🏆 الترتيب #12
                  </Badge>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl bg-white dark:bg-[#130726]/10 text-white text-sm hover:bg-white dark:bg-[#130726]/20 transition-colors">إلغاء</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">حفظ</button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#130726]/10 text-white text-sm hover:bg-white dark:bg-[#130726]/20 transition-colors border border-white/20">
                    <Edit2 size={14} />
                    تعديل
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Stats + Info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <BookOpen size={18} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{enrolledCourses.length}</p>
                    <p className="text-xs text-slate-500 mt-0.5">كورسات</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Trophy size={18} className="text-amber-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">#12</p>
                    <p className="text-xs text-slate-500 mt-0.5">الترتيب</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Star size={18} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{CURRENT_STUDENT.totalPoints}</p>
                    <p className="text-xs text-slate-500 mt-0.5">نقطة</p>
                  </CardContent>
                </Card>
              </div>

              {/* Personal Info */}
              <Card>
                <CardContent>
                  <h2 className="font-black text-slate-900 mb-4">البيانات الشخصية</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: "الاسم بالكامل", value: editName },
                      { label: "رقم الهاتف", value: displayUser.phone || "01012345678" },
                      { label: "هاتف ولي الأمر", value: "01098765432" },
                      { label: "الصف الدراسي", value: displayUser.gradeLabel || "الصف الثالث الثانوي" },
                      { label: "المحافظة", value: displayUser.governorate || "القاهرة" },
                      { label: "كود الطالب", value: displayUser.code || CURRENT_STUDENT.code },
                    ].map((field, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">{field.label}</p>
                        <p className="font-bold text-slate-900 text-sm">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* My Courses Progress */}
              <Card>
                <CardContent>
                  <h2 className="font-black text-slate-900 mb-4">تقدمي في الكورسات</h2>
                  <div className="space-y-4">
                    {enrolledCourses.map(({ course, progress }) => course && (
                      <div key={course.id}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-slate-800 truncate flex-1">{course.title}</p>
                          <span className="text-sm font-black text-blue-600 mr-2">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} size="md" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Achievements */}
            <div className="space-y-5">
              <Card>
                <CardContent>
                  <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Award size={18} className="text-amber-500" />
                    الإنجازات
                  </h2>
                  <div className="space-y-3">
                    {achievements.map((ach, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          ach.earned
                            ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
                            : "bg-slate-50 border border-slate-200 opacity-50"
                        }`}
                      >
                        <span className="text-2xl">{ach.icon}</span>
                        <div>
                          <p className={`text-sm font-bold ${ach.earned ? "text-slate-900" : "text-slate-500"}`}>{ach.title}</p>
                          <p className="text-xs text-slate-400">{ach.desc}</p>
                        </div>
                        {ach.earned && (
                          <CheckCircle size={14} className="text-amber-500 mr-auto flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardContent>
                  <h2 className="font-black text-slate-900 mb-4">الأمان</h2>
                  <div className="space-y-3">
                    <Button variant="outline" fullWidth size="sm">تغيير كلمة المرور</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

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
            <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-8 min-h-[150px]">
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
<div className="flex-1 flex flex-col justify-center text-center sm:text-right">
                {editing ? (
                  <div className="mb-2">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="bg-white dark:bg-[#1E244F]/20 border border-white/30 rounded-xl px-4 py-2 text-white text-xl font-black focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-black text-white mb-1">{editName}</h1>
                )}
               <p className="text-slate-300 text-sm">
مرحبا بك في منصة مستر زياد ربيع
</p>

              </div>

             
                
             
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Stats + Info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4">
              
            
            
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
                     
                    ].map((field, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">{field.label}</p>
                        <p className="font-bold text-slate-900 text-sm">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              
            </div>

            {/* Right: Achievements */}
            <div className="space-y-5">
             <Card>
  <CardContent className="py-16 text-center">
    <Award
      size={48}
      className="mx-auto text-amber-500 mb-4"
    />

    <h3 className="text-2xl font-black text-slate-900 mb-3">
      الإنجازات
    </h3>

    <p className="text-slate-500 leading-8 mb-5">
      سيتم إضافة نظام الإنجازات والشارات
      قريبًا بعد إطلاق نظام النقاط.
    </p>

    <Badge variant="amber">
      🚧 تحت التطوير
    </Badge>
  </CardContent>
</Card>

              {/* Security */}
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

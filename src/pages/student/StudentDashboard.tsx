import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Trophy, TrendingUp, ChevronRight, Bell, FileText, Play, Star, ArrowUpRight, Flame, Target } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Avatar } from "../../components/ui/Avatar";
import { useApp } from "../../context/AppContext";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { COURSES, LEADERBOARD, CURRENT_STUDENT } from "../../data/mockData";
export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useApp();
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const [announcements, setAnnouncements] = useState<any[]>([]);
const [studentCourses, setStudentCourses] = useState<any[]>([]);
const [homeworks, setHomeworks] = useState<any[]>([]);
useEffect(() => {
  loadAnnouncements();
}, []);

useEffect(() => {
  if (user?.id) {
    loadStudentCourses();
  }
}, [user]);

const loadAnnouncements = async () => {
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  setAnnouncements(data || []);
};
const loadHomeworks = async () => {
  const { data, error } = await supabase
    .from("homeworks")
    .select("*")
    .order("due_date", { ascending: true });

  console.log("HOMEWORKS ERROR:", error);
  console.log("HOMEWORKS DATA:", data);

  if (!error && data) {
    setHomeworks(data);
  }
};
useEffect(() => {
  loadHomeworks();
}, []);
useEffect(() => {
  console.log("STATE HOMEWORKS:", homeworks);
}, [homeworks]);
const loadStudentCourses = async () => {
  if (!user?.id) return;

  const { data: enrollments, error } = await supabase
    .from("student_courses")
    .select("course_id")
    .eq("student_id", Number(user.id))
    .eq("active", true);
    console.log("USER ID:", user.id);
console.log("ENROLLMENTS:", enrollments);

  if (error || !enrollments) return;

  const courseIds = enrollments.map((c: any) => c.course_id);

  const { data: courses, error: coursesError } = await supabase
  .from("courses")
  .select("*");

console.log("COURSES ERROR:", coursesError);
console.log("ALL COURSES:", courses);
  setStudentCourses(courses || []);
};

const stats = [
  {
    label: "الكورسات المشترك بها",
    value: studentCourses.length.toString(),
    icon: <BookOpen size={20} />,
    color: "bg-blue-500",
    light: "bg-blue-50 text-blue-700",
  },
  {
    label: "نسبة الإكمال",
    value: "0%",
    icon: <TrendingUp size={20} />,
    color: "bg-violet-500",
    light: "bg-violet-50 text-violet-700",
  },
  {
    label: "الترتيب في الصف",
    value: "#--",
    icon: <Trophy size={20} />,
    color: "bg-amber-500",
    light: "bg-amber-50 text-amber-700",
  },
  {
    label: "النقاط المكتسبة",
    value: "0",
    icon: <Star size={20} />,
    color: "bg-emerald-500",
    light: "bg-emerald-50 text-emerald-700",
  },
];

const topThree = LEADERBOARD.slice(0, 3);
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64">
            <DashboardSidebar type="student" onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
              <div className="w-5 h-0.5 bg-slate-700 mb-1 rounded"></div>
              <div className="w-5 h-0.5 bg-slate-700 mb-1 rounded"></div>
              <div className="w-5 h-0.5 bg-slate-700 rounded"></div>
            </button>
            <div>
              <h1 className="font-black text-slate-900 text-lg">لوحة التحكم</h1>
              <p className="text-slate-500 text-xs">أهلاً بك، {user?.name?.split(" ")[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard/announcements")} className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
              <Bell size={18} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Avatar name={user?.name} size="sm" />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-blue-200 text-sm mb-1">مرحباً بك 👋</p>
                  <h2 className="text-2xl font-black text-white mb-2">{user?.name}</h2>
                  <p className="text-blue-200 text-sm">{user?.gradeLabel} — {user?.governorate}</p>
                </div>
                <div className="bg-white/20 rounded-2xl p-3 text-center min-w-[80px]">
                  <p className="text-white font-black text-2xl">#12</p>
                  <p className="text-blue-200 text-xs">ترتيبك</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <Flame size={16} className="text-orange-300" />
                  <span className="text-white text-sm font-bold">7 أيام متواصلة</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <Target size={16} className="text-emerald-300" />
                  <span className="text-white text-sm font-bold">هدفك: 90%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={i} className="p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-slate-900 text-lg">كورساتي</h2>
                <button onClick={() => navigate("/dashboard/courses")} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  عرض الكل <ChevronRight size={14} />
                </button>
              </div>
              {studentCourses.map((course: any) => (
                <Card key={course.id}>
                  <CardContent className="flex gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=80&h=80&fit=crop`; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">{course.title}</h3>
                        <Badge variant="blue" className="flex-shrink-0">
  0%
</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 truncate">
 وصف الكورس: {course.description}
</p>
                      <ProgressBar value={0} size="sm" />
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={e => { e.stopPropagation(); navigate("/dashboard/lesson/l1"); }}
                          className="flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:text-blue-700"
                        >
                          <Play size={12} /> متابعة
                        </button>
                        <span className="text-xs text-slate-400">0 درس</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <button
                onClick={() => navigate("/courses")}
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-6 text-slate-400 text-sm font-medium hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                + اشترك في كورس جديد
              </button>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Upcoming */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    المهام القادمة
                  </h3>
                  <div className="space-y-3">
                    {homeworks.map((hw) => (
  <div key={hw.id} className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
      <FileText size={14} />
    </div>

    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-700 truncate">
        {hw.title}
      </p>

      <p className="text-xs text-slate-400">
        {new Date(hw.due_date).toLocaleDateString("ar-EG", {
  day: "numeric",
  month: "short",
})}
      </p>
    </div>
  </div>
))}
                  </div>
                </CardContent>
              </Card>

              {/* Mini Leaderboard */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                      <Trophy size={16} className="text-amber-500" />
                      المتصدرون
                    </h3>
                    <button onClick={() => navigate("/dashboard/leaderboard")} className="text-blue-500 text-xs font-bold flex items-center gap-1">
                      الكل <ArrowUpRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {topThree.map(s => (
                      <div key={s.rank} className="flex items-center gap-3">
                        <span className="text-lg">{s.badge || `#${s.rank}`}</span>
                        <Avatar name={s.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.grade}</p>
                        </div>
                        <span className="text-sm font-black text-blue-600">{s.score}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-black text-slate-900 mb-4">آخر النشاطات</h3>
                  <div className="space-y-3">
                    {CURRENT_STUDENT.recentActivity.map((act, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {act.type === "lesson" ? <Play size={12} className="text-blue-500" /> :
                           act.type === "quiz" ? <FileText size={12} className="text-violet-500" /> :
                           <BookOpen size={12} className="text-emerald-500" />}
                        </div>
                        <div>
                          <p className="text-xs text-slate-700 leading-relaxed">{act.text}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{act.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Latest Announcements */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-slate-900 flex items-center gap-2">
                  <Bell size={18} className="text-blue-500" />
                  آخر الإشعارات
                </h2>
                <button onClick={() => navigate("/dashboard/announcements")} className="text-blue-600 text-sm font-bold">عرض الكل</button>
              </div>
             <div className="grid sm:grid-cols-2 gap-3">
  {announcements.slice(0, 4).map((ann: any) => (
    <div
      key={ann.id}
      className={`p-4 rounded-xl border-r-4 ${
        ann.type === "exam"
          ? "border-rose-500 bg-rose-50"
          : ann.type === "lesson"
          ? "border-blue-500 bg-blue-50"
          : ann.type === "homework"
          ? "border-amber-500 bg-amber-50"
          : "border-slate-300 bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-2">
        {ann.is_new && (
          <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">
            جديد
          </span>
        )}

        <div>
          <p className="text-sm text-slate-600 mt-2">
  {ann.content}
</p>

          <p className="text-xs text-slate-500">
            {new Date(ann.created_at).toLocaleDateString("ar-EG")}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

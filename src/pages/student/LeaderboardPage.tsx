import { useState } from "react";
import { Trophy, Star, TrendingUp } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { LEADERBOARD } from "../../data/mockData";

export function LeaderboardPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "alltime">("monthly");
  const [grade, setGrade] = useState("all");
  const myRank = 12;

  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const podiumHeights = ["h-24", "h-32", "h-20"];
  const podiumBgs = ["bg-slate-400", "bg-amber-400", "bg-amber-600"];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 px-6 py-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
              <Trophy size={20} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">لوحة المتصدرين</h1>
              <p className="text-slate-400 text-sm">تنافس مع أفضل الطلاب وحقق مكانتك</p>
            </div>
          </div>

          {/* My rank banner */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
              <Star size={24} className="text-blue-300" />
            </div>
            <div>
              <p className="text-slate-300 text-sm">ترتيبك الحالي</p>
              <p className="text-white font-black text-2xl">#{myRank}</p>
            </div>
            <div className="mr-auto text-right">
              <p className="text-slate-400 text-xs">نقاطك</p>
              <p className="text-white font-black text-xl">1,240</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl">
              {[
                { key: "weekly", label: "أسبوعي" },
                { key: "monthly", label: "شهري" },
                { key: "alltime", label: "الكل" },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key as any)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    period === p.key ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl">
              {[
                { key: "all", label: "جميع الصفوف" },
                { key: "third_sec", label: "تالتة ثانوي" },
                { key: "second_sec", label: "تانية ثانوي" },
              ].map(g => (
                <button
                  key={g.key}
                  onClick={() => setGrade(g.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    grade === g.key ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Podium */}
          <Card>
            <CardContent>
              <h2 className="font-black text-slate-900 mb-6 text-center">🏆 منصة التتويج</h2>
              <div className="flex items-end justify-center gap-4 mb-6">
                {podiumOrder.map((student, i) => (
                  student && (
                    <div key={student.rank} className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{student.badge}</span>
                      <Avatar name={student.name} size={student.rank === 1 ? "lg" : "md"} />
                      <p className="text-xs font-bold text-slate-900 text-center max-w-[80px] leading-tight">{student.name.split(" ")[0]}</p>
                      <p className="text-xs font-black text-blue-600">{student.score}%</p>
                      <div className={`w-20 ${podiumHeights[i]} ${podiumBgs[i]} rounded-t-xl flex items-center justify-center`}>
                        <span className="text-white font-black text-2xl">#{student.rank}</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Rankings */}
          <Card>
            <CardContent>
              <h2 className="font-black text-slate-900 mb-4">جدول الترتيب الكامل</h2>
              <div className="space-y-2">
                {/* Top 3 */}
                {top3.map(student => (
                  <div
                    key={student.rank}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      student.rank === 1 ? "bg-amber-50 border border-amber-200" :
                      student.rank === 2 ? "bg-slate-50 border border-slate-200" :
                      "bg-orange-50 border border-orange-200"
                    }`}
                  >
                    <span className="text-2xl w-8 text-center">{student.badge}</span>
                    <Avatar name={student.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.grade}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${student.score}%` }}></div>
                      </div>
                      <span className="text-sm font-black text-slate-900 w-10 text-left">{student.score}%</span>
                    </div>
                  </div>
                ))}

                {/* Rest */}
                {rest.map((student) => {
                  const isMe = student.rank === myRank;
                  return (
                    <div
                      key={student.rank}
                      className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${
                        isMe ? "bg-blue-50 border-2 border-blue-300" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm font-black text-slate-500 w-8 text-center">#{student.rank}</span>
                      <Avatar name={student.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm truncate">{student.name}</p>
                          {isMe && <Badge variant="blue" className="text-[10px]">أنت</Badge>}
                        </div>
                        <p className="text-xs text-slate-400">{student.grade}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${student.score}%` }}></div>
                        </div>
                        <span className="text-sm font-black text-slate-900 w-10 text-left">{student.score}%</span>
                      </div>
                    </div>
                  );
                })}

                {/* My position (always show) */}
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-600 rounded-xl">
                    <span className="text-white font-black w-8 text-center">#{myRank}</span>
                    <Avatar name="أحمد محمد علي" size="sm" />
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">أحمد محمد علي</p>
                      <p className="text-blue-200 text-xs">موقعك الحالي</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-emerald-300" />
                      <span className="text-white font-black">84%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

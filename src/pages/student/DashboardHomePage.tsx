import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Lightbulb, CheckSquare, ArrowRight, PlayCircle, Clock3, ClipboardList, CheckCircle2 } from "lucide-react";
import StudentLayout from "./StudentLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";

const WEEKDAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function DashboardHomePage() {
  const navigate = useNavigate();
  const { user } = useApp();

  const [loading, setLoading] = useState(true);
  const [activeCoursesCount, setActiveCoursesCount] = useState(0);
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [weeklyData, setWeeklyData] = useState<
    { day: string; current: number; previous: number }[]
  >([]);

  // ── إحصائيات إضافية ──────────────────────────
  const [videoWatchCount, setVideoWatchCount] = useState(0);
  const [totalWatchSeconds, setTotalWatchSeconds] = useState(0);
  const [examOpenCount, setExamOpenCount] = useState(0);
  const [examFinishCount, setExamFinishCount] = useState(0);
  const [examsAvailableCount, setExamsAvailableCount] = useState(0);
  const [avgExamScores, setAvgExamScores] = useState<{ day: string; score: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!student) {
        setLoading(false);
        return;
      }

      const { data: studentCourses } = await supabase
        .from("student_courses")
        .select("id, course_id, active, expires_at")
        .eq("student_id", student.id);

      const courses = studentCourses || [];
      const now = new Date();
      const active = courses.filter(
        (c) => c.active && (!c.expires_at || new Date(c.expires_at) > now)
      );
      setActiveCoursesCount(active.length);

      const courseIds = courses.map((c) => c.course_id);

      let totalLessons = 0;
      let completedLessons = 0;
      let completedCoursesTemp = 0;

      if (courseIds.length > 0) {
        const { data: sections } = await supabase
          .from("course_sections")
          .select("id, course_id")
          .in("course_id", courseIds);

        const sectionIds = (sections || []).map((s: any) => s.id);

        const { data: lessons } = sectionIds.length
          ? await supabase
              .from("course_items")
              .select("id, section_id")
              .in("section_id", sectionIds)
              .eq("type", "video")
          : { data: [] as any[] };

        const lessonIds = (lessons || []).map((l: any) => l.id);

        const { data: progress } = lessonIds.length
          ? await supabase
              .from("lesson_progress")
              .select("lesson_id, is_completed, last_watched_at, watch_count, watched_seconds")
              .eq("student_id", student.id)
              .in("lesson_id", lessonIds)
          : { data: [] as any[] };

        totalLessons = (lessons || []).length;
        completedLessons = (progress || []).filter((p: any) => p.is_completed).length;

        courseIds.forEach((cid) => {
          const sIds = (sections || [])
            .filter((s: any) => s.course_id === cid)
            .map((s: any) => s.id);
          const cLessons = (lessons || []).filter((l: any) => sIds.includes(l.section_id));
          if (cLessons.length === 0) return;
          const cCompleted = cLessons.every((l: any) =>
            (progress || []).some((p: any) => p.lesson_id === l.id && p.is_completed)
          );
          if (cCompleted) completedCoursesTemp++;
        });

        const dayBuckets: Record<string, { current: number; previous: number }> = {};
        WEEKDAYS_AR.forEach((d) => (dayBuckets[d] = { current: 0, previous: 0 }));

        (progress || []).forEach((p: any) => {
          if (!p.last_watched_at) return;
          const date = new Date(p.last_watched_at);
          const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          const dayName = WEEKDAYS_AR[date.getDay()];
          if (diffDays >= 0 && diffDays < 7) {
            dayBuckets[dayName].current += 1;
          } else if (diffDays >= 7 && diffDays < 14) {
            dayBuckets[dayName].previous += 1;
          }
        });

        setWeeklyData(
          WEEKDAYS_AR.map((d) => ({
            day: d,
            current: dayBuckets[d].current,
            previous: dayBuckets[d].previous,
          }))
        );

        // ── عدد مرات مشاهدة الفيديوهات + إجمالي مدة المشاهدة ──
        const totalWatchCount = (progress || []).reduce(
          (sum: number, p: any) => sum + (p.watch_count || 0),
          0
        );
        const totalSeconds = (progress || []).reduce(
          (sum: number, p: any) => sum + (p.watched_seconds || 0),
          0
        );
        setVideoWatchCount(totalWatchCount);
        setTotalWatchSeconds(totalSeconds);

        // ── عدد الاختبارات المتاحة في كورسات الطالب ──
        const { data: quizItems } = sectionIds.length
          ? await supabase
              .from("course_items")
              .select("id")
              .in("section_id", sectionIds)
              .eq("type", "quiz")
          : { data: [] as any[] };
        setExamsAvailableCount((quizItems || []).length);
      }

      // ── عدد مرات فتح الاختبارات ──
      const { count: opensCount } = await supabase
        .from("exam_opens")
        .select("id", { count: "exact", head: true })
        .eq("student_id", student.id);
      setExamOpenCount(opensCount || 0);

      // ── عدد الاختبارات المنتهية + متوسط النتائج اليومي ──
      const { data: examRows } = await supabase
        .from("exam_results")
        .select("percentage, submitted_at")
        .eq("student_id", student.id);
      setExamFinishCount((examRows || []).length);

      const scoreBuckets: Record<string, { sum: number; count: number }> = {};
      WEEKDAYS_AR.forEach((d) => (scoreBuckets[d] = { sum: 0, count: 0 }));
      (examRows || []).forEach((r: any) => {
        if (!r.submitted_at) return;
        const date = new Date(r.submitted_at);
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          const dayName = WEEKDAYS_AR[date.getDay()];
          scoreBuckets[dayName].sum += Number(r.percentage) || 0;
          scoreBuckets[dayName].count += 1;
        }
      });
      setAvgExamScores(
        WEEKDAYS_AR.map((d) => ({
          day: d,
          score: scoreBuckets[d].count > 0 ? Math.round(scoreBuckets[d].sum / scoreBuckets[d].count) : 0,
        }))
      );

      setCompletedCoursesCount(completedCoursesTemp);
      setOverallProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
      setLoading(false);
    };

    load();
  }, [user?.id]);

  const maxValue = Math.max(1, ...weeklyData.flatMap((d) => [d.current, d.previous]));

  const formatWatchTime = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds <= 0) return "00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const pad = (n: number) => String(n).padStart(2, "0");
    return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#B348FE] bg-[#F6EEFF] dark:bg-[#2B103D] hover:bg-[#EAD8FF] dark:hover:bg-[#3A1652] transition-all duration-300 font-bold text-xs sm:text-sm"
          >
            <ArrowRight size={16} />
            الرجوع للموقع الرئيسي
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 font-bold">جاري التحميل...</div>
        ) : (
          <>
            {/* ── إحصائيات إضافية (4 كروت) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-[#B348FE]">{videoWatchCount} مرة</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">
                      إجمالي عدد مرات مشاهدة الفيديوهات على الموقع
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="text-[#B348FE]" size={22} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-[#B348FE]" dir="ltr">{formatWatchTime(totalWatchSeconds)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">
                      إجمالي مدة فتح المحاضرات على الموقع
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center flex-shrink-0">
                    <Clock3 className="text-[#B348FE]" size={22} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-[#B348FE]">{examOpenCount} مرة</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">
                      إجمالي عدد مرات فتح الاختبار
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="text-[#B348FE]" size={22} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black text-[#B348FE]">{examFinishCount} مرة</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">
                      إجمالي عدد مرات إنهاء الاختبارات
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="text-[#B348FE]" size={22} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#B348FE] rounded-2xl p-5 flex items-center justify-between text-white shadow-md">
                <div>
                  <p className="text-3xl font-black">0</p>
                  <p className="text-xs sm:text-sm font-bold mt-1">الفيديوهات المحفوظة</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bookmark size={20} />
                </div>
              </div>

              <div className="bg-[#B348FE] rounded-2xl p-5 flex items-center justify-between text-white shadow-md">
                <div>
                  <p className="text-3xl font-black">{activeCoursesCount}</p>
                  <p className="text-xs sm:text-sm font-bold mt-1">كورساتك الحالية</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                  <Lightbulb size={20} />
                </div>
              </div>

              <div className="bg-[#B348FE] rounded-2xl p-5 flex items-center justify-between text-white shadow-md">
                <div>
                  <p className="text-3xl font-black">{completedCoursesCount}</p>
                  <p className="text-xs sm:text-sm font-bold mt-1">كورسات مكتملة</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckSquare size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="relative bg-[#B348FE] text-white rounded-tr-3xl rounded-br-3xl rounded-bl-3xl rounded-tl-[70px] shadow-sm overflow-hidden">
                <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                  <p className="text-sm font-bold text-white/80 mb-3">تقدمك</p>
                  <p className="text-4xl font-black text-white mb-4">% {overallProgress}</p>
                  <div className="w-full h-2.5 bg-white/25 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-white/70 to-white rounded-full transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/80 leading-6">
                    مقياس لكمية الدروس السابقة والمتبقية في كورساتك الحالية!
                  </p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#B348FE]" />
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">الأسبوع الحالي</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#7C3AED]" />
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">الأسبوع الماضي</span>
                    </div>
                  </div>

                  {/* ─── Dot Grid Chart (0-100) ─── */}
                  <div className="flex">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between h-48 pr-2 text-[10px] text-gray-400 font-bold">
                      {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((v) => (
                        <span key={v}>{v}</span>
                      ))}
                    </div>

                    {/* Grid + dots */}
                    <div className="flex-1 relative h-48 border-r border-gray-100 dark:border-[#2A2A2A]">
                      {/* horizontal grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((v) => (
                          <div key={v} className="w-full border-t border-gray-100 dark:border-[#232323]" />
                        ))}
                      </div>

                      {/* dots row */}
                      <div className="absolute inset-0 flex items-end justify-between px-2 pb-0">
                        {weeklyData.map((d) => (
                          <div key={d.day} className="flex-1 h-full relative flex justify-center">
                            <span
                              className="absolute w-2.5 h-2.5 rounded-full bg-[#B348FE] -translate-x-1/2"
                              style={{ bottom: `${(d.current / 100) * 100}%`, left: "50%" }}
                            />
                            <span
                              className="absolute w-2.5 h-2.5 rounded-full bg-[#7C3AED] -translate-x-1/2"
                              style={{ bottom: `${(d.previous / 100) * 100}%`, left: "50%" }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* X-axis day labels */}
                  <div className="flex justify-between px-2 mt-2 pr-8">
                    {weeklyData.map((d) => (
                      <span key={d.day} className="flex-1 text-center text-[10px] text-gray-400 font-bold">
                        {d.day}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-5 text-center">
                    *ابدأ أول كورس علشان نعرضلك بيانات نشاطك التعليمية بشكل دقيق!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ── احصائيات كورساتك ── */}
            <div className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">احصائيات كورساتك</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DonutStat
                  label="عدد الإختبارات اللي خلصها"
                  value={examFinishCount}
                  total={examsAvailableCount}
                  subLabel="تقدمك في الكورسات"
                />
                <DonutStat
                  label="عدد الفيديوهات اللي شافها"
                  value={0}
                  total={0}
                  subLabel="تقدمك في الكورسات"
                  fallbackPercent={overallProgress}
                />
              </div>

              <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">متوسط النتائج اللي جيبتها</p>
                    {!avgExamScores.some((d) => d.score > 0) && (
                      <span className="text-lg font-black text-[#B348FE]">ممتحنتش خالص!</span>
                    )}
                  </div>

                  <div className="flex items-end h-40 relative">
                    <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible">
                      <polyline
                        fill="none"
                        stroke="#B348FE"
                        strokeWidth="3"
                        points={avgExamScores
                          .map((d, i) => {
                            const x = (i / (avgExamScores.length - 1 || 1)) * 680 + 10;
                            const y = 150 - (d.score / 100) * 140;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                      {avgExamScores.map((d, i) => {
                        const x = (i / (avgExamScores.length - 1 || 1)) * 680 + 10;
                        const y = 150 - (d.score / 100) * 140;
                        return <circle key={d.day} cx={x} cy={y} r="5" fill="#B348FE" />;
                      })}
                    </svg>
                  </div>
                  <div className="flex justify-between mt-2">
                    {avgExamScores.map((d) => (
                      <span key={d.day} className="flex-1 text-center text-[10px] text-gray-400 font-bold">
                        {d.day}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}

function DonutStat({
  label,
  value,
  total,
  subLabel,
  fallbackPercent,
}: {
  label: string;
  value: number;
  total: number;
  subLabel: string;
  fallbackPercent?: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : fallbackPercent ?? 0;
  const hasData = total > 0 || (fallbackPercent ?? 0) > 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold mb-1">
            {hasData ? "" : "بلا أبدأ"}
          </p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">{subLabel}</p>
          <p className="text-sm font-black text-gray-900 dark:text-white">
            {value} / {total}
          </p>
        </div>
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#F6EEFF" strokeWidth="8" />
            {hasData && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#B348FE"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black text-[#B348FE]">{hasData ? `${percent}%` : "—"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
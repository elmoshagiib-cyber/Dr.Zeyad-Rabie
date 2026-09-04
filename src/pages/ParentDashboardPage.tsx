import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Award,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function ParentDashboardPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("parent_students");
    if (!raw) {
      navigate("/");
      return;
    }
    const parsed = JSON.parse(raw);
    setStudents(parsed);
    setSelectedId(parsed[0]?.id ?? null);
  }, [navigate]);

  const student = students.find((s) => s.id === selectedId);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalLessons = student.lessonProgress?.length || 0;
  const completedLessons = (student.lessonProgress || []).filter((l: any) => l.is_completed).length;
  const totalWatchMinutes = Math.round(
    (student.lessonProgress || []).reduce((sum: number, p: any) => sum + (p.watched_seconds || 0), 0) / 60
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] pt-28 pb-16" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {students.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  s.id === selectedId
                    ? "bg-[#B348FE] text-white"
                    : "bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#2A2A2A]"
                }`}
              >
                {s.full_name}
              </button>
            ))}
          </div>
        )}

        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B3A] to-[#2A1B4D] rounded-3xl p-6 sm:p-8 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-2xl font-black overflow-hidden">
              {student.avatar_url ? (
                <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover" />
              ) : (
                student.full_name?.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">{student.full_name}</h1>
              <p className="text-white/60 text-sm mt-1">{student.grade}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<BookOpen size={22} />} label="محاضرات مكتملة" value={`${completedLessons} / ${totalLessons}`} />
          <StatCard icon={<CheckCircle2 size={22} />} label="واجبات مسلّمة" value={String(student.homeworkResults?.length || 0)} />
          <StatCard icon={<GraduationCap size={22} />} label="كورسات مشترك بها" value={String(student.courses?.length || 0)} />
          <StatCard icon={<Clock size={22} />} label="وقت المشاهدة" value={`${Math.floor(totalWatchMinutes / 60)}س ${totalWatchMinutes % 60}د`} />
        </div>

        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="text-[#B348FE]" size={20} />
              نتائج الامتحانات
            </h2>
            {(!student.examResults || student.examResults.length === 0) ? (
              <p className="text-center text-gray-400 py-6 font-bold">لم يدخل أي امتحان بعد</p>
            ) : (
              <div className="space-y-2">
                {student.examResults.map((exam: any) => (
                  <div key={exam.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1A1A1A] rounded-xl px-4 py-3">
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{exam.exams?.title || "امتحان"}</span>
                    <span className="font-black text-[#B348FE]">{exam.score ?? "-"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl">
          <CardContent className="p-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="text-[#B348FE]" size={20} />
              الواجبات
            </h2>
            {(!student.homeworkResults || student.homeworkResults.length === 0) ? (
              <p className="text-center text-gray-400 py-6 font-bold">لا توجد واجبات مسلّمة</p>
            ) : (
              <div className="space-y-2">
                {student.homeworkResults.map((hw: any) => (
                  <div key={hw.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1A1A1A] rounded-xl px-4 py-3">
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{hw.homeworks?.title || "واجب"}</span>
                    <span className="font-black text-[#B348FE]">
                      {hw.grade !== null ? `${hw.grade} / ${hw.homeworks?.total_score || 100}` : "بانتظار التصحيح"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          onClick={() => {
            sessionStorage.removeItem("parent_students");
            sessionStorage.removeItem("parent_phone");
            navigate("/");
          }}
          className="mt-6 text-gray-500 dark:text-gray-400"
        >
          <ArrowRight size={16} className="ml-1" />
          خروج
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-4">
      <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center text-[#B348FE] mb-2">
        {icon}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1">{label}</p>
      <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
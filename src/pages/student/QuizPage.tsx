import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  RotateCcw,
  Flag,
  BookOpen,
  Timer,
  Award,
  Target,
  Play
} from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type QuizState = "intro" | "active" | "submitted" | "result" | "already-completed";

interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  score: number;
  percentage: number;
  passed: boolean;
  submitted_at: string;
  correct_answers?: number;
  wrong_answers?: number;
  total_questions?: number;
}

export function QuizPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const examId = Number(id);

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [state, setState] = useState<QuizState>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingResult, setExistingResult] = useState<ExamResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [examStartTime, setExamStartTime] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: student, error } = await supabase
      .from("students")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setStudentId(student.id);
  };

  useEffect(() => {
    if (studentId) {
      loadExam();
    }
  }, [studentId]);

  useEffect(() => {
    if (id && state === "active") {
      const savedAnswers = localStorage.getItem(`exam_${id}_answers`);
      if (savedAnswers) {
        try {
          setAnswers(JSON.parse(savedAnswers));
        } catch (e) {
          console.error("Failed to parse saved answers", e);
        }
      }
    }
  }, [id, state]);

  useEffect(() => {
    if (id && state === "active" && Object.keys(answers).length > 0) {
      localStorage.setItem(`exam_${id}_answers`, JSON.stringify(answers));
    }
  }, [answers, id, state]);

  const loadExam = async () => {
    try {
      setLoading(true);
      setError(null);

      if (studentId) {
        const { data: existingAttempt, error: resultError } = await supabase
          .from("exam_results")
          .select("*")
          .eq("exam_id", examId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (resultError && resultError.code !== 'PGRST116') {
          console.error("Error checking existing attempt:", resultError);
        }

        if (existingAttempt) {
          setExistingResult(existingAttempt);
          setState("already-completed");
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          exam_questions (
            *,
            question_choices!question_choices_question_id_fkey (
              *
            )
          )
        `)
        .eq("id", Number(id))
        .single();

      if (error) {
        console.error(error);
        setError("فشل تحميل الاختبار. حاول مرة أخرى.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("الاختبار غير موجود.");
        setLoading(false);
        return;
      }

      setQuiz(data);
      setQuestions(data.exam_questions || []);
      setTimeLeft((data.duration || 0) * 60);
      setLoading(false);
    } catch (err) {
      console.error("Error loading exam:", err);
      setError("حدث خطأ أثناء تحميل الاختبار.");
      setLoading(false);
    }
  };

  const calcScore = useCallback(() => {
    let correct = 0;
    let wrong = 0;

    questions.forEach((q) => {
      const selected = answers[String(q.id)];

      if (selected) {
        const correctChoice = (q.question_choices || []).find(
          (c: any) => String(c.sort_order - 1) === String(q.correct_answer)
        );

        if (correctChoice && selected === correctChoice.id) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    return {
      percentage:
        questions.length > 0
          ? Math.round((correct / questions.length) * 100)
          : 0,
      correct,
      wrong,
      total: questions.length,
    };
  }, [answers, questions]);

  useEffect(() => {
    if (state !== "active") return;
    const timer = setInterval(() => {
      setTimeLeft((t: number) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmitConfirmed();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  const handleSubmitClick = () => {
    setShowConfirmModal(true);
  };

  const handleSubmitConfirmed = async () => {
    setShowConfirmModal(false);

    const result = calcScore();

    setScore(result.percentage);
    setCorrectAnswers(result.correct);
    setWrongAnswers(result.wrong);

    const passed = result.percentage >= (quiz.passing_grade || 50);

    if (studentId && id) {
      try {
        const nowIso = new Date().toISOString();

        const resultData = {
          exam_id: quiz.id,
          student_id: studentId,
          score: result.percentage,
          percentage: result.percentage,
          passed,
          correct_answers: result.correct,
          wrong_answers: result.wrong,
          total_questions: result.total,
          answered_questions: answeredCount,
          started_at: examStartTime || nowIso,
          completed_at: nowIso,
          submitted_at: nowIso,
        };

        const { error: insertError } = await supabase
          .from("exam_results")
          .insert([resultData]);

        if (insertError) {
          console.error("Error saving exam result:", insertError);
          alert("حدث خطأ أثناء حفظ نتيجة الامتحان: " + insertError.message);
        } else {
          localStorage.removeItem(`exam_${id}_answers`);
        }
      } catch (err) {
        console.error("Error submitting exam:", err);
        alert("حدث خطأ غير متوقع أثناء حفظ النتيجة");
      }
    }

    setState("result");
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const q = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  // Loading State
  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              <div className="bg-gradient-to-br from-[#B348FE] via-purple-600 to-[#9E2FFF] p-6 sm:p-12">
                <div className="h-8 sm:h-10 bg-white/20 rounded-2xl animate-pulse mb-4"></div>
                <div className="h-4 sm:h-5 bg-white/20 rounded-xl animate-pulse w-2/3 mx-auto"></div>
              </div>
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-5">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 dark:bg-[#0B0B0B] rounded-2xl p-3 sm:p-5">
                      <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mb-3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>
                <div className="h-32 sm:h-40 bg-gray-50 dark:bg-[#0B0B0B] rounded-2xl animate-pulse"></div>
                <div className="h-12 sm:h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] p-6 sm:p-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F6EEFF] dark:bg-[#2B103D] rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <AlertCircle className="text-[#B348FE]" size={32} />
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">حدث خطأ</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={loadExam} className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF]">
                  <RotateCcw size={18} />
                  إعادة المحاولة
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                  العودة للداشبورد
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz) {
    return <div>Loading...</div>;
  }

  // ── مكوّن موحّد لعرض النتيجة (متستخدم في "already-completed" و"result") ──
  const ScoreSummary = ({
    percentage,
    correct,
    wrong,
    total,
    submittedAt,
  }: {
    percentage: number;
    correct?: number;
    wrong?: number;
    total: number;
    submittedAt?: string;
  }) => (
    <>
      {/* Score Circle */}
      <div className="flex justify-center -mt-12 sm:-mt-16 mb-6 sm:mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[#B348FE] rounded-full blur-2xl opacity-20"></div>
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[6px] sm:border-8 border-[#B348FE] bg-[#F6EEFF] dark:bg-[#2B103D] flex flex-col items-center justify-center shadow-2xl">
            <p className="text-3xl sm:text-5xl font-black text-[#B348FE]">
              {correct ?? 0}
              <span className="text-lg sm:text-2xl text-gray-400 dark:text-gray-500">/{total}</span>
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">إجابة صحيحة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="bg-[#F6EEFF] dark:bg-[#2B103D] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-[#EAD8FF] dark:border-[#3A1650]">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <CheckCircle className="text-[#B348FE]" size={16} />
            <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 font-bold">إجابات صحيحة</p>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#B348FE]">{correct ?? 0}</p>
        </div>

        <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <XCircle className="text-gray-400" size={16} />
            <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 font-bold">إجابات خاطئة</p>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-700 dark:text-gray-300">{wrong ?? 0}</p>
        </div>
      </div>

      {submittedAt && (
        <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-200 dark:border-[#2A2A2A] mt-2.5 sm:mt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="text-[#B348FE]" size={16} />
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-bold">تاريخ التسليم</span>
            </div>
            <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white text-left">{formatDate(submittedAt)}</span>
          </div>
        </div>
      )}
    </>
  );

  // ── مكوّن مراجعة الأسئلة: يوضح إجابتك مقابل الإجابة الصحيحة لكل سؤال غلط ──
  const AnswersReview = () => (
    <div className="bg-gray-50 dark:bg-[#0B0B0B] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-[#2A2A2A]">
      <h3 className="font-black text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base flex items-center gap-2">
        <BookOpen size={18} className="text-[#B348FE]" />
        مراجعة الإجابات
      </h3>

      <div className="space-y-2.5 sm:space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {questions.map((question: any, i: number) => {
          const selectedId = answers[String(question.id)];
          const choices = question.question_choices || [];
          const correctChoice = choices.find(
            (c: any) => String(c.sort_order - 1) === String(question.correct_answer)
          );
          const selectedChoice = choices.find((c: any) => c.id === selectedId);
          const isRight = selectedId && correctChoice && selectedId === correctChoice.id;

          return (
            <div
              key={question.id}
              className={`rounded-xl sm:rounded-2xl border-2 p-3.5 sm:p-4 ${
                isRight
                  ? "bg-[#F6EEFF] dark:bg-[#2B103D] border-[#EAD8FF] dark:border-[#3A1650]"
                  : "bg-white dark:bg-[#111111] border-gray-200 dark:border-[#2A2A2A]"
              }`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isRight ? "bg-[#B348FE]" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {isRight ? (
                    <CheckCircle size={14} className="text-white" />
                  ) : (
                    <XCircle size={14} className="text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mb-1">
                    السؤال {i + 1}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-relaxed mb-2">
                    {question.title}
                  </p>

                  {!isRight && (
                    <div className="space-y-1.5 mt-2">
                      <div className="flex items-start gap-1.5 text-[11px] sm:text-xs">
                        <span className="text-gray-400 dark:text-gray-500 font-bold shrink-0">إجابتك:</span>
                        <span className="text-gray-600 dark:text-gray-400 break-words">
                          {selectedChoice?.text || "لم تُجب"}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[11px] sm:text-xs">
                        <span className="text-[#B348FE] font-bold shrink-0">الصحيحة:</span>
                        <span className="text-[#B348FE] font-bold break-words">
                          {correctChoice?.text || "-"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Already Completed Screen
  if (state === "already-completed" && existingResult) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              <div className="p-6 sm:p-12 text-center relative overflow-hidden bg-gradient-to-br from-[#B348FE] via-purple-600 to-[#9E2FFF]">
                <div className="relative z-10">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-xl">
                    <BookOpen className="text-white" size={32} />
                  </div>
                  <h2 className="text-lg sm:text-3xl font-black text-white mb-2">تم إتمام هذا الاختبار</h2>
                  <p className="text-white/90 text-xs sm:text-base">لا يمكن إعادة الاختبار مرة أخرى</p>
                </div>
              </div>

              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                <ScoreSummary
                  percentage={existingResult.percentage}
                  correct={existingResult.correct_answers}
                  wrong={existingResult.wrong_answers}
                  total={existingResult.total_questions || questions.length}
                  submittedAt={existingResult.submitted_at}
                />

                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg hover:shadow-xl transition-all"
                >
                  <Trophy size={18} />
                  العودة للداشبورد
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Confirmation Modal
  if (showConfirmModal) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] max-w-md w-full overflow-hidden">
              <div className="bg-[#B348FE] p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                  <Flag className="text-white" size={28} />
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white">تأكيد التسليم</h3>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div className="bg-gray-50 dark:bg-[#0B0B0B] rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 border border-gray-200 dark:border-[#2A2A2A]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#F6EEFF] dark:bg-[#2B103D] rounded-xl flex items-center justify-center">
                        <CheckCircle className="text-[#B348FE]" size={18} />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">الأسئلة المجابة</span>
                    </div>
                    <span className="text-lg sm:text-2xl font-black text-[#B348FE]">{answeredCount} / {questions.length}</span>
                  </div>

                  {unansweredCount > 0 && (
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 dark:bg-[#1A1A1A] rounded-xl flex items-center justify-center">
                          <AlertCircle className="text-gray-500 dark:text-gray-400" size={18} />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">أسئلة لم تُجب عليها</span>
                      </div>
                      <span className="text-lg sm:text-2xl font-black text-gray-600 dark:text-gray-300">{unansweredCount}</span>
                    </div>
                  )}
                </div>

                {unansweredCount > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-4">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="text-amber-600 dark:text-amber-400" size={18} />
                      </div>
                      <div>
                        <p className="font-black text-amber-900 dark:text-amber-400 mb-1 text-xs sm:text-sm">⚠️ تحذير</p>
                        <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-500 leading-relaxed">لديك {unansweredCount} أسئلة لم تُجب عليها. ستُحسب كإجابات خاطئة.</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-center text-gray-700 dark:text-gray-300 font-bold text-sm sm:text-base">
                  هل أنت متأكد من تسليم الاختبار؟
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="flex-1">
                    إلغاء
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg"
                    onClick={handleSubmitConfirmed}
                  >
                    <Flag size={18} />
                    تسليم الاختبار
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Intro Screen
  if (state === "intro") {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              <div className="bg-gradient-to-br from-[#B348FE] via-purple-600 to-[#9E2FFF] p-6 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-xl">
                  <BookOpen className="text-white" size={32} />
                </div>
                <h1 className="text-lg sm:text-3xl font-black text-white mb-2 sm:mb-3 px-2 break-words">{quiz.title}</h1>
                <p className="text-purple-100 text-xs sm:text-base">{quiz.courseTitle}</p>
              </div>

              <div className="p-4 sm:p-8 space-y-4 sm:space-y-5">
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                  <div className="bg-[#F6EEFF] dark:bg-[#2B103D] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-[#EAD8FF] dark:border-[#3A1650] text-center">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white dark:bg-[#1A1A1A] rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <BookOpen className="text-[#B348FE]" size={18} />
                    </div>
                    <p className="text-lg sm:text-3xl font-black text-[#B348FE]">{questions.length}</p>
                    <p className="text-[10px] sm:text-xs text-[#B348FE] mt-1 font-bold">سؤال</p>
                  </div>

                  <div className="bg-[#F6EEFF] dark:bg-[#2B103D] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-[#EAD8FF] dark:border-[#3A1650] text-center">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white dark:bg-[#1A1A1A] rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Timer className="text-[#B348FE]" size={18} />
                    </div>
                    <p className="text-lg sm:text-3xl font-black text-[#B348FE]">{quiz.duration}</p>
                    <p className="text-[10px] sm:text-xs text-[#B348FE] mt-1 font-bold">دقيقة</p>
                  </div>

                  <div className="bg-[#F6EEFF] dark:bg-[#2B103D] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-[#EAD8FF] dark:border-[#3A1650] text-center">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white dark:bg-[#1A1A1A] rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Trophy className="text-[#B348FE]" size={18} />
                    </div>
                    <p className="text-lg sm:text-3xl font-black text-[#B348FE]">{quiz.passing_grade}%</p>
                    <p className="text-[10px] sm:text-xs text-[#B348FE] mt-1 font-bold">للنجاح</p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <div className="flex items-start gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="text-amber-600 dark:text-amber-400" size={18} />
                    </div>
                    <p className="font-black text-amber-900 dark:text-amber-400 text-xs sm:text-base">⚠️ تعليمات مهمة</p>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-sm text-amber-800 dark:text-amber-500 mr-10 sm:mr-13">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">•</span>
                      <span>لا يمكنك إيقاف المؤقت بعد بدء الاختبار</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">•</span>
                      <span>يمكنك التنقل بين الأسئلة بحرية</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">•</span>
                      <span>لديك {quiz.duration} دقيقة للإجابة على جميع الأسئلة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">•</span>
                      <span>درجة النجاح المطلوبة {quiz.passing_grade}%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">•</span>
                      <span>سيتم حفظ إجاباتك تلقائياً أثناء الاختبار</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">•</span>
                      <span>سيتم تسليم الاختبار تلقائياً عند انتهاء الوقت</span>
                    </li>
                  </ul>
                </div>

                <Button
                  size="lg"
                  onClick={() => {
                    setExamStartTime(new Date().toISOString());
                    setState("active");
                  }}
                  className="w-full bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg hover:shadow-xl transition-all"
                >
                  <Play className="mr-2" size={20} />
                  ابدأ الاختبار الآن
                </Button>

                <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                  العودة للداشبورد
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Result Screen
  if (state === "result") {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              <div className="p-6 sm:p-10 text-center bg-gradient-to-br from-[#B348FE] via-purple-600 to-[#9E2FFF]">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-xl">
                  <Trophy className="text-white" size={32} />
                </div>
                <h2 className="text-lg sm:text-3xl font-black text-white mb-2">تم تسليم الاختبار</h2>
                <p className="text-white/90 text-xs sm:text-base">تم حفظ نتيجتك بنجاح</p>
              </div>

              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                <ScoreSummary
                  percentage={score}
                  correct={correctAnswers}
                  wrong={wrongAnswers}
                  total={questions.length}
                />

                <AnswersReview />

                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg hover:shadow-xl transition-all"
                >
                  <Trophy size={18} />
                  العودة للداشبورد
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active Quiz
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
      <main className="flex-1 overflow-y-auto">
        {/* Quiz Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border-b border-gray-200 dark:border-[#2A2A2A] px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                <p className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">{quiz.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold flex-shrink-0">
                  {currentQ + 1} / {questions.length}
                </p>
              </div>
              <ProgressBar value={currentQ + 1} max={questions.length} size="sm" />
            </div>

            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-mono font-black text-xs sm:text-sm flex-shrink-0 border-2 transition-all ${
              timeLeft < 120
                ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse"
                : "bg-gray-50 dark:bg-[#0B0B0B] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#2A2A2A]"
            }`}>
              <Clock size={14} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Question */}
          <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-[#2A2A2A] shadow-xl p-4 sm:p-8">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#B348FE] text-white font-black text-sm sm:text-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                {currentQ + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] text-[10px] sm:text-xs font-bold rounded-lg">
                    {q.type === "mcq" ? "اختيار من متعدد" : "سؤال"}
                  </span>
                </div>
                <h2 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white leading-relaxed break-words">
                  {q.title}
                </h2>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {(q.question_choices || []).map((choice: any) => {
                const selected = answers[String(q.id)] === choice.id;

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswer(String(q.id), choice.id)}
                    className={`w-full text-right p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all font-medium text-xs sm:text-base group ${
                      selected
                        ? "border-[#B348FE] bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] shadow-md"
                        : "border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#111111] text-gray-700 dark:text-gray-300 hover:border-[#B348FE]/50 hover:bg-[#F6EEFF]/30 dark:hover:bg-[#2B103D]/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        selected
                          ? "border-[#B348FE] bg-[#B348FE]"
                          : "border-gray-300 dark:border-gray-600 group-hover:border-[#B348FE]"
                      }`}>
                        {selected && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"></div>}
                      </div>

                      <span className="flex-1 break-words">{choice.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <ChevronRight size={18} />
              السابق
            </Button>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center order-1 sm:order-2">
              {questions.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                    i === currentQ
                      ? "bg-[#B348FE] text-white shadow-lg scale-110"
                      : answers[String(questions[i].id)]
                      ? "bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] border border-[#EAD8FF] dark:border-[#3A1650]"
                      : "bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B348FE]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQ < questions.length - 1 ? (
              <Button onClick={() => setCurrentQ(currentQ + 1)} className="w-full sm:w-auto order-3 bg-[#B348FE] hover:bg-[#9E2FFF]">
                التالي
                <ChevronLeft size={18} />
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full sm:w-auto order-3 bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg"
                onClick={handleSubmitClick}
              >
                <Flag size={18} />
                تسليم الاختبار
              </Button>
            )}
          </div>

          {/* Progress Card */}
          <div className="bg-white dark:bg-[#111111] rounded-xl sm:rounded-2xl border border-gray-200 dark:border-[#2A2A2A] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5 sm:mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-[#B348FE]" size={16} />
                <span className="font-bold text-gray-900 dark:text-white">تقدم الإجابات</span>
              </div>
              <span className="font-black text-gray-900 dark:text-white">
                {answeredCount} / {questions.length}
              </span>
            </div>
            <ProgressBar value={answeredCount} max={questions.length} size="sm" />
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #B348FE;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9E2FFF;
        }
      `}</style>
    </div>
  );
}
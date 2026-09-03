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
import { DashboardSidebar } from "../../components/layout/dashboard/DashboardSidebar";
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
  const [showStartConfirmModal, setShowStartConfirmModal] = useState(false);
  const [showQuickReviewModal, setShowQuickReviewModal] = useState(false);  const [studentId, setStudentId] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [examStartTime, setExamStartTime] = useState<string | null>(null);
  const [openedQuestions, setOpenedQuestions] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    if (state === "active") {
      setOpenedQuestions(prev => new Set(prev).add(currentQ));
    }
  }, [currentQ, state]);

 const handleSubmitClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmEndClick = () => {
    setShowConfirmModal(false);
    setShowQuickReviewModal(true);
  };

  const handleBackToReview = () => {
    setShowQuickReviewModal(false);
    setCurrentQ(0);
  };

  const handleFinalSubmit = () => {
    setShowQuickReviewModal(false);
    handleSubmitConfirmed();
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
  }) => {
    const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0);
    const earnedPoints = questions.reduce((sum, q) => {
      const selectedId = answers[String(q.id)];
      const choices = q.question_choices || [];
      const correctChoice = choices.find((c: any) => String(c.sort_order - 1) === String(q.correct_answer));
      const isRight = selectedId && correctChoice && selectedId === correctChoice.id;
      return sum + (isRight ? Number(q.points) || 1 : 0);
    }, 0);

    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* النتائج */}
          <div className="bg-white dark:bg-[#111111] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-gray-200 dark:border-[#2A2A2A]">
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold mb-2 text-center">النتائج</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 rounded-lg px-2.5 py-1.5">
                <CheckCircle className="text-emerald-500" size={14} />
                <span className="text-sm font-black text-emerald-600">{correct ?? 0}</span>
              </div>
              <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/20 rounded-lg px-2.5 py-1.5">
                <XCircle className="text-rose-500" size={14} />
                <span className="text-sm font-black text-rose-600">{wrong ?? 0}</span>
              </div>
            </div>
          </div>

          {/* المحلولة */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-amber-200 dark:border-amber-900 flex flex-col items-center justify-center">
            <p className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-400 font-bold mb-2">المحلولة</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-600">{(correct ?? 0) + (wrong ?? 0)}</p>
          </div>

          {/* النتيجة */}
          <div className="bg-teal-50 dark:bg-teal-950/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-teal-200 dark:border-teal-900 flex flex-col items-center justify-center">
            <p className="text-[11px] sm:text-xs text-teal-700 dark:text-teal-400 font-bold mb-2 flex items-center gap-1">
              <Trophy size={12} className="text-teal-500" />
              النتيجة
            </p>
            <p className="text-2xl sm:text-3xl font-black text-teal-600">{percentage}%</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-center">({earnedPoints} درجة من {totalPoints} درجات)</p>
          </div>

          {/* عدد الأسئلة */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-blue-200 dark:border-blue-900 flex flex-col items-center justify-center">
            <p className="text-[11px] sm:text-xs text-blue-700 dark:text-blue-400 font-bold mb-2">عدد الأسئلة</p>
            <p className="text-2xl sm:text-3xl font-black text-blue-600">{total}</p>
          </div>
        </div>

        {submittedAt && (
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-200 dark:border-[#2A2A2A] mt-2.5 sm:mt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="text-teal-500" size={16} />
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-bold">تاريخ التسليم</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white text-left">{formatDate(submittedAt)}</span>
            </div>
          </div>
        )}
      </>
    );
  };

  // ── مكوّن مراجعة الأسئلة: يوضح إجابتك مقابل الإجابة الصحيحة لكل سؤال ──
  const AnswersReview = () => (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex justify-center">
        <span className="px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 text-xs sm:text-sm font-black">
          الإجابات
        </span>
      </div>

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
            className={`rounded-2xl border-2 p-4 sm:p-5 bg-white dark:bg-[#111111] ${
              isRight
                ? "border-emerald-200 dark:border-emerald-900"
                : "border-gray-200 dark:border-[#2A2A2A]"
            }`}
          >
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs font-bold">
                {question.points === 1 ? "درجة واحدة" : `${question.points} درجات`}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                  isRight
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                }`}
              >
                {isRight ? "إجابة صحيحة" : "إجابة خاطئة"}
              </span>
            </div>

            {/* Question Title */}
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-relaxed mb-4">
              {i + 1}. {question.title}
            </p>

            <div className={question.image_url ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-start" : ""}>
            {/* Choices */}
            <div className="space-y-2">
              {choices.map((choice: any) => {
                const isCorrectChoice = correctChoice && choice.id === correctChoice.id;
                const isSelectedWrongChoice = !isRight && selectedId && choice.id === selectedId;

                return (
                  <div
                    key={choice.id}
                    className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold ${
                      isCorrectChoice
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400"
                        : isSelectedWrongChoice
                        ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400"
                        : "bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <span className="break-words">{choice.text}</span>
                    {isCorrectChoice && (
                      <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    )}
                    {isSelectedWrongChoice && (
                      <XCircle size={16} className="text-rose-600 dark:text-rose-400 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

              {question.image_url && (
                <div className="flex justify-center md:justify-start">
                  <img
                    src={question.image_url}
                    alt="صورة السؤال"
                    className="max-w-full max-h-56 rounded-xl border border-gray-200 dark:border-[#2A2A2A] object-contain"
                  />
                </div>
              )}
            </div>

           {/* Footer: correct vs your answer (only when wrong) */}
            {!isRight && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-bold">
                  الصحيحة: {correctChoice?.text || "-"}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-300 text-[10px] sm:text-xs font-bold">
                  إجابتك: {selectedChoice?.text || "لم تُجب"}
                </span>
              </div>
            )}

            {/* Explanation / Note */}
            {question.explanation && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                <p className="text-[11px] sm:text-xs font-black text-gray-500 dark:text-gray-400 mb-1.5">
                  ملاحظة:
                </p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}
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

  // Start Confirmation Modal
  if (showStartConfirmModal) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] max-w-md w-full overflow-hidden">
              <div className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F6EEFF] dark:bg-[#2B103D] rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-[#B348FE]" size={28} />
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-3">تأكيد بدء الاختبار !</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  بمجرد الضغط على بدء الاختبار سيتم تسجيل الوقت ولا يمكنك الرجوع للخلف والاستفادة من الوقت السابق
                </p>
              </div>
              <div className="p-4 sm:p-6 pt-0 flex gap-3">
                <Button variant="outline" onClick={() => setShowStartConfirmModal(false)} className="flex-1">
                  الرجوع
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg"
                  onClick={() => {
                    setShowStartConfirmModal(false);
                    setExamStartTime(new Date().toISOString());
                    setState("active");
                  }}
                >
                  <Play size={18} />
                  بدء الاختبار
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Quick Review Reminder Modal
  if (showQuickReviewModal) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] max-w-md w-full overflow-hidden">
              <div className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F6EEFF] dark:bg-[#2B103D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-[#B348FE]" size={28} />
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-3">عارفين إنك شاطر!</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  مفيش مانع من مراجعة سريعة لإجاباتك وتشوف بسرعة كل إجاباتك. كده هتتأكد إن كل حاجة تمام قبل التسليم!
                </p>
              </div>
              <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleFinalSubmit}
                  className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/20"
                >
                  تسليم الاختبار علطول
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg"
                  onClick={handleBackToReview}
                >
                  هراجع إجاباتي على السريع
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Confirmation Modal
  if (showConfirmModal) {    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] max-w-md w-full overflow-hidden">
              <div className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flag className="text-blue-500" size={28} />
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">تأكيد التسليم</h3>
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

                <p className="text-center text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  لو دوست على تسليم الاختبار .. الاختبار هيتصحح ومش مسموح لك إنك تعيده مرة تانية وهتظهر نتيجتك ودرجتك ..
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="flex-1">
                    الرجوع
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] shadow-lg"
                    onClick={handleConfirmEndClick}
                  >
                    <Flag size={18} />
                    تأكيد إنهاء الاختبار
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
                  onClick={() => setShowStartConfirmModal(true)}
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
      <div className="flex h-screen bg-[#F7F5EF] dark:bg-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto bg-[#F7F5EF] dark:bg-[#0B0B0B] flex items-start justify-center p-3 sm:p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              <div className="p-6 sm:p-8 text-center border-b border-gray-100 dark:border-[#2A2A2A]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-50 dark:bg-teal-950/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Trophy className="text-teal-500" size={28} />
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white mb-1">تم تسليم الاختبار</h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">تم حفظ نتيجتك بنجاح</p>
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
                  className="w-full bg-teal-500 hover:bg-teal-600 shadow-lg hover:shadow-xl transition-all"
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
    <div className="flex h-screen bg-[#F7F5EF] dark:bg-[#0B0B0B] overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
      <main className="flex-1 overflow-y-auto bg-[#F7F5EF] dark:bg-[#0B0B0B]">
        {/* Control Panel (scrolls normally with the page) */}
        <div className="px-3 sm:px-4 py-4">
          <div className="max-w-md mx-auto space-y-2.5">

            {/* Timer */}
            <div className={`rounded-xl py-2.5 text-center text-white ${timeLeft < 120 ? "bg-rose-500" : "bg-emerald-600"}`}>
              <p className="text-[11px] font-bold mb-0.5 opacity-90">باقي من الزمن :</p>
              <p className="text-xl font-black font-mono">{formatTime(timeLeft)}</p>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleSubmitClick}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
            >
              إنهاء الاختبار
            </button>


            <button
              onClick={() => setShowQuickReviewModal(true)}
              className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
            >
              عرض الإجابات
            </button>

            {/* Stats */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-bold">اجمالي درجات الامتحان :</span>
                <span className="w-9 h-8 flex items-center justify-center bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2A2A2A] rounded-lg font-black text-sm">
                  {questions.reduce((sum, qq) => sum + (Number(qq.points) || 1), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-bold">عدد الاسئلة :</span>
                <span className="w-9 h-8 flex items-center justify-center bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2A2A2A] rounded-lg font-black text-sm">
                  {questions.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-bold">عدد الاسئلة الي تم فتحها :</span>
                <span className="w-9 h-8 flex items-center justify-center bg-amber-400 text-white rounded-lg font-black text-sm">
                  {openedQuestions.size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-bold">عدد الاسئلة غير المحلولة :</span>
                <span className="w-9 h-8 flex items-center justify-center bg-emerald-700 text-white rounded-lg font-black text-sm">
                  {unansweredCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-bold">عدد الاسئلة المحلولة :</span>
                <span className="w-9 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg font-black text-sm">
                  {answeredCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-bold">السؤال الحالي :</span>
                <span className="w-9 h-8 flex items-center justify-center border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 rounded-lg font-black text-sm">
                  {currentQ + 1}
                </span>
              </div>
            </div>

            {/* Question Number Grid */}
            <div className="flex flex-wrap gap-1.5 justify-center pt-2">
              {questions.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                    i === currentQ
                      ? "bg-emerald-600 text-white"
                      : answers[String(questions[i].id)]
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                      : "bg-gray-300 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Next / Prev */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="flex-1 bg-teal-400 hover:bg-teal-500 disabled:opacity-40 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
              >
                السابق
              </button>
              <button
                onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                disabled={currentQ === questions.length - 1}
                className="flex-1 bg-teal-400 hover:bg-teal-500 disabled:opacity-40 text-white font-bold text-sm py-2.5 rounded-xl transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Question */}
          <div className="p-2 sm:p-4">
            {/* Points badge */}
            <div className="flex justify-center mb-4 sm:mb-5">
              <span className="px-5 sm:px-6 py-2 rounded-full bg-amber-400 text-white text-xs sm:text-sm font-black shadow-sm">
                {(!q.points || q.points === 1) ? "درجة واحدة" : `${q.points} درجات`}
              </span>
            </div>

            {/* Question title */}
            <div className="flex items-start gap-2.5 sm:gap-3 mb-5 sm:mb-6">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-blue-300 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold mt-1">
                ؟
              </div>
              <h2 className="flex-1 text-base sm:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed break-words text-right">
                {q.title}
              </h2>
            </div>

            <div className={q.image_url ? "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start" : ""}>
              <div className="space-y-2.5 sm:space-y-3">
                {(q.question_choices || []).map((choice: any) => {
                  const selected = answers[String(q.id)] === choice.id;

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswer(String(q.id), choice.id)}
                      className={`w-full text-right px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border transition-all font-medium text-xs sm:text-base ${
                        selected
                          ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 text-gray-900 dark:text-white"
                          : "border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#111111] text-gray-700 dark:text-gray-300 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          selected
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}>
                          {selected && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <span className="flex-1 break-words">{choice.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {q.image_url && (
                <div className="flex justify-center md:justify-start">
                  <img
                    src={q.image_url}
                    alt="صورة السؤال"
                    className="max-w-full max-h-64 sm:max-h-80 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-[#2A2A2A] object-contain"
                  />
                </div>
              )}
            </div>
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

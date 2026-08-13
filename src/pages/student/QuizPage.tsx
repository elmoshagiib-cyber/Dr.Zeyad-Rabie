import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, ChevronLeft, Trophy, RotateCcw } from "lucide-react";
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
  console.log("QUIZ PAGE LOADED");
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

  // Get current user
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

  // Load exam and check for existing attempt
  useEffect(() => {
    if (studentId) {
      console.log("URL ID =", id);
console.log("TYPE =", typeof id);
console.log("NUMBER =", Number(id));
      loadExam();
    }
  }, [studentId]);

  // Load answers from localStorage
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

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (id && state === "active" && Object.keys(answers).length > 0) {
      localStorage.setItem(`exam_${id}_answers`, JSON.stringify(answers));
    }
  }, [answers, id, state]);

  const loadExam = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if student already completed this exam
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

      // Load exam data
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

  // Timer effect with auto-submit
  useEffect(() => {
    if (state !== "active") return;
    const timer = setInterval(() => {
      setTimeLeft((t: number) => {
        if (t <= 1) {
          clearInterval(timer);
          // Auto submit when timer reaches zero
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

    // Save to Supabase
    if (studentId && id) {
      try {
const resultData = {
   exam_id: quiz.id,
student_id: Number(studentId),
    score: result.percentage,
    percentage: result.percentage,
    passed,
    correct_answers: result.correct,
    wrong_answers: result.wrong,
    total_questions: result.total,
};
        const { error: insertError } = await supabase
          .from("exam_results")
          .insert([resultData]);

        if (insertError) {
          console.error("Error saving exam result:", insertError);
        } else {
          // Clear localStorage after successful submission
          localStorage.removeItem(`exam_${id}_answers`);
        }
      } catch (err) {
        console.error("Error submitting exam:", err);
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
      <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white dark:bg-[#1E244F] rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-violet-600 to-blue-600 p-8">
                <div className="h-8 bg-white/20 rounded-lg animate-pulse mb-4"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse w-2/3 mx-auto"></div>
              </div>
              <div className="p-8 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-4">
                      <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
                <div className="h-32 bg-slate-50 rounded-2xl animate-pulse"></div>
                <div className="h-12 bg-slate-200 rounded-xl animate-pulse"></div>
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
      <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white dark:bg-[#1E244F] rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">حدث خطأ</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <div className="flex gap-3">
                <Button onClick={loadExam} className="w-full">
                  إعادة المحاولة
                </Button>
                <Button  variant="outline" onClick={() => navigate("/dashboard")}>
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

  // Already Completed Screen
  if (state === "already-completed" && existingResult) {
    const passed = existingResult.passed;
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white dark:bg-[#1E244F] rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className={`p-8 text-center ${passed ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-slate-500 to-slate-600"}`}>
                <div className="text-6xl mb-3">{passed ? "✅" : "📋"}</div>
                <h2 className="text-2xl font-black text-white mb-1">لقد أكملت هذا الاختبار</h2>
                <p className="text-white/80 text-sm">لا يمكنك إعادة الاختبار مرة أخرى</p>
              </div>
              <div className="p-8 space-y-6">
                {/* Score Circle */}
                <div className="flex justify-center">
                  <div className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${passed ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50"}`}>
                    <p className={`text-4xl font-black ${passed ? "text-emerald-600" : "text-rose-600"}`}>{existingResult.percentage}%</p>
                    <p className="text-xs text-slate-500">نتيجتك</p>
                  </div>
                </div>

                {/* Result Details */}
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600">النتيجة</span>
                    <span className={`text-lg font-black ${passed ? "text-emerald-600" : "text-rose-600"}`}>
                      {passed ? "ناجح ✓" : "راسب ✗"}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600">النسبة المئوية</span>
                    <span className="text-lg font-black text-slate-900">{existingResult.percentage}%</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600">الدرجة</span>
                    <span className="text-lg font-black text-slate-900">{existingResult.score}</span>
                  </div>

                  {existingResult.correct_answers !== undefined && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-emerald-600">{existingResult.correct_answers}</p>
                        <p className="text-xs text-emerald-600">إجابات صحيحة</p>
                      </div>
                      <div className="bg-rose-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-rose-600">{existingResult.wrong_answers}</p>
                        <p className="text-xs text-rose-600">إجابات خاطئة</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600">تاريخ التسليم</span>
                    <span className="text-sm font-bold text-slate-900">{formatDate(existingResult.submitted_at)}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                  <p className="font-bold mb-1">ℹ️ ملاحظة</p>
                  <p className="text-xs">لقد قمت بإتمام هذا الاختبار مسبقاً ولا يمكنك إعادته مرة أخرى. يمكنك العودة للداشبورد لمتابعة دراستك.</p>
                </div>

                <Button onClick={() => navigate("/dashboard")}>
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
      <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-[#1E244F] rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-center">
                <div className="text-5xl mb-3">⚠️</div>
                <h3 className="text-xl font-black text-white">تأكيد التسليم</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">الأسئلة المجابة</span>
                    <span className="text-lg font-black text-emerald-600">{answeredCount} / {questions.length}</span>
                  </div>
                  
                  {unansweredCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">أسئلة لم تُجب عليها</span>
                      <span className="text-lg font-black text-rose-600">{unansweredCount}</span>
                    </div>
                  )}
                </div>

                {unansweredCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                    <p className="font-bold mb-1">⚠️ تحذير</p>
                    <p className="text-xs">لديك {unansweredCount} أسئلة لم تُجب عليها. ستُحسب كإجابات خاطئة.</p>
                  </div>
                )}

                <p className="text-center text-slate-700 font-medium">
                  هل أنت متأكد من تسليم الاختبار؟
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    إلغاء
                  </Button>                   
<Button
  variant="default"
  className="bg-green-600 hover:bg-green-700"
  onClick={handleSubmitConfirmed}
>
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
      <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white dark:bg-[#1E244F] rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-violet-600 to-blue-600 p-8 text-center">
                <div className="text-6xl mb-4">🧪</div>
                <h1 className="text-2xl font-black text-white mb-2">{quiz.title}</h1>
                <p className="text-violet-200 text-sm">{quiz.courseTitle}</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-2xl font-black text-slate-900">{questions.length}</p>
                    <p className="text-xs text-slate-500 mt-1">سؤال</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-2xl font-black text-slate-900">{quiz.duration * 60 / 60}</p>
                    <p className="text-xs text-slate-500 mt-1">دقيقة</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-2xl font-black text-slate-900">{quiz.passing_grade}%</p>
                    <p className="text-xs text-slate-500 mt-1">للنجاح</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                  <p className="font-bold mb-1">⚠️ تعليمات مهمة</p>
                  <ul className="space-y-1 text-xs">
                    <li>• لا يمكنك إيقاف المؤقت بعد بدء الاختبار</li>
                    <li>• يمكنك التنقل بين الأسئلة بحرية</li>
                    <li>• لديك {Math.floor(quiz.duration * 60 / 60)} دقيقة للإجابة</li>
                    <li>• درجة النجاح {quiz.passing_grade}%</li>
                    <li>• سيتم حفظ إجاباتك تلقائياً</li>
                    <li>• سيتم تسليم الاختبار تلقائياً عند انتهاء الوقت</li>
                  </ul>
                </div>
                <Button  size="lg" onClick={() => setState("active")}>
                  ابدأ الاختبار الآن
                </Button>
                <Button  size="lg" variant="ghost" onClick={() => navigate("/dashboard")}>
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
    const passed = score >= quiz.passing_grade;
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white dark:bg-[#1E244F] rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-8 text-center border-b border-slate-200">
  <h2 className="text-2xl font-black text-slate-900">
    نتيجة الاختبار
  </h2>

  <p className="text-slate-500 mt-2 text-sm">
    تم تسليم الاختبار بنجاح
  </p>
</div>
              <div className="p-8 space-y-6">
                {/* Score Circle */}
                <div className="flex justify-center">
                  <div className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${passed ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50"}`}>
                    <p className={`text-4xl font-black ${passed ? "text-emerald-600" : "text-rose-600"}`}>{score}%</p>
                    <p className="text-xs text-slate-500">نتيجتك</p>
                  </div>
                </div>

                {/* Detail stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-xl font-black text-emerald-600">{correctAnswers}</p>
                    <p className="text-xs text-emerald-600">إجابات صحيحة</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-3">
                    <p className="text-xl font-black text-rose-600">{wrongAnswers}</p>
                    <p className="text-xs text-rose-600">إجابات خاطئة</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xl font-black text-blue-600">{questions.length}</p>
                    <p className="text-xs text-blue-600">إجمالي الأسئلة</p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-slate-600">درجة النجاح المطلوبة</span>
                  <span className="text-lg font-black text-slate-900">{quiz.passing_grade}%</span>
                </div>

              {/* Question Review */}
<div>
  <h3 className="font-black text-slate-900 mb-3 text-sm">
    مراجعة الإجابات
  </h3>

  <div className="space-y-2 max-h-48 overflow-y-auto">
    {questions.map((q: any, i: number) => {
      const selected = answers[String(q.id)];

      const correctChoice = (q.question_choices || []).find(
        (c: any) => String(c.sort_order - 1) === String(q.correct_answer)
      );

      const isRight = selected === correctChoice?.id;

      return (
        <div
          key={q.id}
          className={`flex items-center gap-3 p-3 rounded-xl ${
            isRight ? "bg-emerald-50" : "bg-rose-50"
          }`}
        >
          {isRight ? (
            <CheckCircle
              size={15}
              className="text-emerald-500 flex-shrink-0"
            />
          ) : (
            <XCircle
              size={15}
              className="text-rose-500 flex-shrink-0"
            />
          )}

          <p className="text-xs text-slate-700 flex-1 truncate">
            س{i + 1}: {q.title}
          </p>

          <span
            className={`text-xs font-bold ${
              isRight ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {isRight ? "✓" : "✗"}
          </span>
        </div>
      );
    })}
  </div>
</div>

                <div className="flex gap-3">
                  <Button  onClick={() => navigate("/dashboard")}>
                    <Trophy size={16} />
                    العودة للداشبورد
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active Quiz
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
      <main className="flex-1 overflow-y-auto">
        {/* Quiz Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#1E244F] border-b border-slate-200 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-900">{quiz.title}</p>
                <p className="text-xs text-slate-500">السؤال {currentQ + 1} من {questions.length}</p>
              </div>
              <ProgressBar value={currentQ + 1} max={questions.length} size="sm" />
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-sm flex-shrink-0 ${
              timeLeft < 120 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-700"
            }`}>
              <Clock size={15} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-6 space-y-6">

{/* Question */}
<div className="bg-white dark:bg-[#1E244F] rounded-2xl border border-slate-200 shadow-sm p-8">
  <div className="flex items-start gap-3 mb-6">
    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
      {currentQ + 1}
    </div>

    <div>
      <p className="text-xs text-slate-400 mb-1">
        {q.type === "mcq" ? "اختيار من متعدد" : "سؤال"}
      </p>

      <h2 className="text-lg font-bold text-slate-900 leading-relaxed">
        {q.title}
      </h2>
    </div>
  </div>

  <div className="space-y-3">
    {(q.question_choices || []).map((choice: any) => {
      const selected = answers[String(q.id)] === choice.id;

      return (
        <button
          key={choice.id}
          onClick={() => handleAnswer(String(q.id), choice.id)}
          className={`w-full text-right p-4 rounded-xl border-2 transition-all font-medium text-sm ${
            selected
              ? "border-blue-600 bg-blue-50 text-blue-900"
              : "border-slate-200 bg-white dark:bg-[#1E244F] text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                selected
                  ? "border-blue-600 bg-blue-600"
                  : "border-slate-300"
              }`}
            >
              {selected && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>

            <span>{choice.text}</span>
          </div>
        </button>
      );
    })}
  </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
            >
              <ChevronRight size={16} />
              السابق
            </Button>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {questions.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold ${
                    i === currentQ
                      ? "bg-blue-600 text-white"
                      : answers[String(questions[i].id)]
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQ < questions.length - 1 ? (
              <Button onClick={() => setCurrentQ(currentQ + 1)}>
                التالي
                <ChevronLeft size={16} />
              </Button>
            ) : (
<Button
  variant="default"
  className="w-full bg-green-600 hover:bg-green-700"
  onClick={handleSubmitClick}
>
  تسليم الاختبار
</Button>
            )}
          </div>

          <div className="bg-white dark:bg-[#1E244F] rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>تقدم الإجابات</span>

              <span className="font-bold">
                {answeredCount} / {questions.length}
              </span>
            </div>

            <ProgressBar
              value={answeredCount}
              max={questions.length}
              size="sm"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
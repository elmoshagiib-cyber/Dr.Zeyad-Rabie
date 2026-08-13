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
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              <div className="bg-gradient-to-br from-[#B348FE] via-purple-600 to-[#9E2FFF] p-8 sm:p-12">
                <div className="h-10 bg-white/20 rounded-2xl animate-pulse mb-4"></div>
                <div className="h-5 bg-white/20 rounded-xl animate-pulse w-2/3 mx-auto"></div>
              </div>
              <div className="p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B0B0B] dark:to-[#1A1A1A] rounded-2xl p-5">
                      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mb-3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>
                <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B0B0B] dark:to-[#1A1A1A] rounded-2xl animate-pulse"></div>
                <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
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
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] p-8 sm:p-10 text-center">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-rose-500" size={40} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">حدث خطأ</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{error}</p>
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

  // Already Completed Screen
  if (state === "already-completed" && existingResult) {
    const passed = existingResult.passed;
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              <div className={`p-8 sm:p-12 text-center relative overflow-hidden ${passed ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600" : "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800"}`}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
                    <span className="text-6xl">{passed ? "✅" : "📋"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">تم إتمام هذا الاختبار</h2>
                  <p className="text-white/90 text-sm sm:text-base">لا يمكن إعادة الاختبار مرة أخرى</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Score Circle - Enhanced */}
                <div className="flex justify-center -mt-16 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#B348FE] to-purple-600 rounded-full blur-2xl opacity-20"></div>
                    <div className={`relative w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center shadow-2xl ${passed ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50" : "border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50"}`}>
                      <p className={`text-5xl font-black ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{existingResult.percentage}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">نتيجتك النهائية</p>
                    </div>
                  </div>
                </div>

                {/* Result Details - Enhanced */}
                <div className="space-y-3">
                  <div className={`rounded-2xl p-5 border-2 ${passed ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800" : "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200 dark:border-rose-800"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${passed ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-rose-100 dark:bg-rose-900/50"}`}>
                          {passed ? <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} /> : <XCircle className="text-rose-600 dark:text-rose-400" size={24} />}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">النتيجة النهائية</p>
                          <p className={`text-2xl font-black ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {passed ? "ناجح ✓" : "راسب ✗"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B0B0B] dark:to-[#1A1A1A] rounded-2xl p-5 border border-gray-200 dark:border-[#2A2A2A]">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="text-[#B348FE]" size={18} />
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">النسبة المئوية</p>
                      </div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{existingResult.percentage}%</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B0B0B] dark:to-[#1A1A1A] rounded-2xl p-5 border border-gray-200 dark:border-[#2A2A2A]">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="text-[#B348FE]" size={18} />
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">الدرجة</p>
                      </div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{existingResult.score}</p>
                    </div>
                  </div>

                  {existingResult.correct_answers !== undefined && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center justify-between mb-2">
                          <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
                          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{existingResult.correct_answers}</p>
                        </div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">إجابات صحيحة</p>
                      </div>
                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-2xl p-5 border border-rose-200 dark:border-rose-800">
                        <div className="flex items-center justify-between mb-2">
                          <XCircle className="text-rose-600 dark:text-rose-400" size={20} />
                          <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{existingResult.wrong_answers}</p>
                        </div>
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">إجابات خاطئة</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B0B0B] dark:to-[#1A1A1A] rounded-2xl p-5 border border-gray-200 dark:border-[#2A2A2A]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="text-[#B348FE]" size={18} />
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">تاريخ التسليم</span>
                      </div>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{formatDate(existingResult.submitted_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div>
                      <p className="font-black text-amber-900 dark:text-amber-400 mb-1 text-sm">ℹ️ ملاحظة مهمة</p>
                      <p className="text-xs text-amber-800 dark:text-amber-500 leading-relaxed">لقد قمت بإتمام هذا الاختبار مسبقاً ولا يمكنك إعادته مرة أخرى. يمكنك العودة للداشبورد لمتابعة دراستك.</p>
                    </div>
                  </div>
                </div>

                <Button onClick={() => navigate("/dashboard")} className="w-full bg-gradient-to-r from-[#B348FE] to-purple-600 hover:from-[#9E2FFF] hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
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

  // Confirmation Modal - Enhanced
  if (showConfirmModal) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto">
          {/* Backdrop with blur */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] max-w-md w-full overflow-hidden transform transition-all">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Flag className="text-white" size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-white">تأكيد التسليم</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B0B0B] dark:to-[#1A1A1A] rounded-2xl p-5 space-y-4 border border-gray-200 dark:border-[#2A2A2A]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">الأسئلة المجابة</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{answeredCount} / {questions.length}</span>
                  </div>
                  
                  {unansweredCount > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                          <AlertCircle className="text-rose-600 dark:text-rose-400" size={20} />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">أسئلة لم تُجب عليها</span>
                      </div>
                      <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{unansweredCount}</span>
                    </div>
                  )}
                </div>

                {unansweredCount > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
                      </div>
                      <div>
                        <p className="font-black text-amber-900 dark:text-amber-400 mb-1 text-sm">⚠️ تحذير</p>
                        <p className="text-xs text-amber-800 dark:text-amber-500 leading-relaxed">لديك {unansweredCount} أسئلة لم تُجب عليها. ستُحسب كإجابات خاطئة.</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-center text-gray-700 dark:text-gray-300 font-bold text-base">
                  هل أنت متأكد من تسليم الاختبار؟
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>                   
                  <Button
                    variant="default"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
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

  // Intro Screen - Enhanced
  if (state === "intro") {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              <div className="bg-gradient-to-br from-[#B348FE] via-purple-600 to-[#9E2FFF] p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
                    <BookOpen className="text-white" size={48} />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">{quiz.title}</h1>
                  <p className="text-purple-100 text-sm sm:text-base">{quiz.courseTitle}</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl p-4 sm:p-5 border border-blue-200 dark:border-blue-800 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{questions.length}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-bold">سؤال</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-2xl p-4 sm:p-5 border border-purple-200 dark:border-purple-800 text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Timer className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">{quiz.duration}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-bold">دقيقة</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 rounded-2xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-800 text-center">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Trophy className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{quiz.passing_grade}%</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">للنجاح</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div>
                      <p className="font-black text-amber-900 dark:text-amber-400 mb-1">⚠️ تعليمات مهمة</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-amber-800 dark:text-amber-500 mr-13">
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

                <Button size="lg" onClick={() => setState("active")} className="w-full bg-gradient-to-r from-[#B348FE] to-purple-600 hover:from-[#9E2FFF] hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
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

  // Result Screen - Enhanced
  if (state === "result") {
    const passed = score >= quiz.passing_grade;
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              <div className={`p-8 sm:p-10 text-center relative overflow-hidden ${passed ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600" : "bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600"}`}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
                    {passed ? <Trophy className="text-white" size={48} /> : <XCircle className="text-white" size={48} />}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                    {passed ? "مبروك! نجحت في الاختبار 🎉" : "للأسف، لم تنجح هذه المرة"}
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base">تم تسليم الاختبار وحفظ النتيجة بنجاح</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Score Circle - Enhanced */}
                <div className="flex justify-center -mt-16 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#B348FE] to-purple-600 rounded-full blur-2xl opacity-20"></div>
                    <div className={`relative w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center shadow-2xl ${passed ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50" : "border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50"}`}>
                      <p className={`text-5xl font-black ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{score}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">نتيجتك النهائية</p>
                    </div>
                  </div>
                </div>

                {/* Detail stats - Enhanced */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 text-center">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{correctAnswers}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">إجابات صحيحة</p>
                  </div>

                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-2xl p-4 border border-rose-200 dark:border-rose-800 text-center">
                    <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <XCircle className="text-rose-600 dark:text-rose-400" size={24} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{wrongAnswers}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-bold">إجابات خاطئة</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{questions.length}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-bold">إجمالي الأسئلة</p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B0B0B] dark:to-[#1A1A1A] rounded-2xl p-5 border border-gray-200 dark:border-[#2A2A2A]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F6EEFF] dark:bg-[#2B103D] rounded-xl flex items-center justify-center">
                        <Target className="text-[#B348FE]" size={20} />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">درجة النجاح المطلوبة</span>
                    </div>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{quiz.passing_grade}%</span>
                  </div>
                </div>

                {/* Question Review - Enhanced */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B0B0B] dark:to-[#1A1A1A] rounded-2xl p-5 border border-gray-200 dark:border-[#2A2A2A]">
                  <h3 className="font-black text-gray-900 dark:text-white mb-4 text-base flex items-center gap-2">
                    <BookOpen size={20} className="text-[#B348FE]" />
                    مراجعة الإجابات
                  </h3>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {questions.map((q: any, i: number) => {
                      const selected = answers[String(q.id)];
                      const correctChoice = (q.question_choices || []).find(
                        (c: any) => String(c.sort_order - 1) === String(q.correct_answer)
                      );
                      const isRight = selected === correctChoice?.id;

                      return (
                        <div
                          key={q.id}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                            isRight 
                              ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800" 
                              : "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isRight ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-rose-100 dark:bg-rose-900/50"}`}>
                            {isRight ? (
                              <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <XCircle size={18} className="text-rose-600 dark:text-rose-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">السؤال {i + 1}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{q.title}</p>
                          </div>

                          <span className={`text-sm font-black flex-shrink-0 ${isRight ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {isRight ? "✓" : "✗"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={() => navigate("/dashboard")} className="w-full bg-gradient-to-r from-[#B348FE] to-purple-600 hover:from-[#9E2FFF] hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
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

  // Active Quiz - Enhanced
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
      <main className="flex-1 overflow-y-auto">
        {/* Quiz Header - Enhanced */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border-b border-gray-200 dark:border-[#2A2A2A] px-4 sm:px-6 py-4 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-black text-gray-900 dark:text-white truncate">{quiz.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold flex-shrink-0 mr-2">
                  السؤال {currentQ + 1} / {questions.length}
                </p>
              </div>
              <div className="relative">
                <ProgressBar value={currentQ + 1} max={questions.length} size="sm" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#B348FE] to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-black text-sm flex-shrink-0 border-2 transition-all ${
              timeLeft < 120 
                ? "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse shadow-lg" 
                : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B0B0B] dark:to-[#1A1A1A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#2A2A2A]"
            }`}>
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Question - Enhanced */}
          <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-200 dark:border-[#2A2A2A] shadow-xl p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B348FE] to-purple-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                {currentQ + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] text-xs font-bold rounded-lg">
                    {q.type === "mcq" ? "اختيار من متعدد" : "سؤال"}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
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
                    className={`w-full text-right p-4 sm:p-5 rounded-2xl border-2 transition-all font-medium text-sm sm:text-base group ${
                      selected
                        ? "border-[#B348FE] bg-gradient-to-r from-[#F6EEFF] to-purple-50 dark:from-[#2B103D] dark:to-purple-950/30 text-[#B348FE] shadow-lg scale-[1.02]"
                        : "border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#111111] text-gray-700 dark:text-gray-300 hover:border-[#B348FE] hover:bg-[#F6EEFF]/30 dark:hover:bg-[#2B103D]/30 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        selected
                          ? "border-[#B348FE] bg-[#B348FE] shadow-lg"
                          : "border-gray-300 dark:border-gray-600 group-hover:border-[#B348FE]"
                      }`}>
                        {selected && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>

                      <span className="flex-1">{choice.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation - Enhanced */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="w-full sm:w-auto"
            >
              <ChevronRight size={18} />
              السابق
            </Button>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {questions.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                    i === currentQ
                      ? "bg-gradient-to-br from-[#B348FE] to-purple-600 text-white shadow-lg scale-110"
                      : answers[String(questions[i].id)]
                      ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B348FE]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQ < questions.length - 1 ? (
              <Button onClick={() => setCurrentQ(currentQ + 1)} className="w-full sm:w-auto bg-gradient-to-r from-[#B348FE] to-purple-600 hover:from-[#9E2FFF] hover:to-purple-700">
                التالي
                <ChevronLeft size={18} />
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                onClick={handleSubmitClick}
              >
                <Flag size={18} />
                تسليم الاختبار
              </Button>
            )}
          </div>

          {/* Progress Card - Enhanced */}
          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-[#B348FE]" size={18} />
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
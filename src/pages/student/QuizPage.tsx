import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, ChevronLeft, Trophy, RotateCcw } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { QUIZ_DATA } from "../../data/mockData";

type QuizState = "intro" | "active" | "submitted" | "result";

export function QuizPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<QuizState>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DATA.timeLimit);
  const [score, setScore] = useState(0);

  const quiz = QUIZ_DATA;
  const questions = quiz.questions;

  const calcScore = useCallback(() => {
    let correct = 0;
    questions.forEach(q => {
      const selected = answers[q.id];
      const correctOpt = q.options.find(o => o.isCorrect);
      if (selected === correctOpt?.id) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  }, [answers, questions]);

  useEffect(() => {
    if (state !== "active") return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); setState("submitted"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  const handleSubmit = () => {
    const s = calcScore();
    setScore(s);
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

  const q = questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  // Intro Screen
  if (state === "intro") {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-violet-600 to-blue-600 p-8 text-center">
                <div className="text-6xl mb-4">🧪</div>
                <h1 className="text-2xl font-black text-white mb-2">{quiz.title}</h1>
                <p className="text-violet-200 text-sm">{quiz.courseTitle}</p>
              </div>
              <div className="p-8 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-2xl font-black text-slate-900">{quiz.totalQuestions}</p>
                    <p className="text-xs text-slate-500 mt-1">سؤال</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-2xl font-black text-slate-900">{quiz.timeLimit / 60}</p>
                    <p className="text-xs text-slate-500 mt-1">دقيقة</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-2xl font-black text-slate-900">{quiz.passingScore}%</p>
                    <p className="text-xs text-slate-500 mt-1">للنجاح</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                  <p className="font-bold mb-1">⚠️ تعليمات مهمة</p>
                  <ul className="space-y-1 text-xs">
                    <li>• لا يمكنك إيقاف المؤقت بعد بدء الاختبار</li>
                    <li>• يمكنك التنقل بين الأسئلة بحرية</li>
                    <li>• لديك {Math.floor(quiz.timeLimit / 60)} دقيقة للإجابة</li>
                    <li>• درجة النجاح {quiz.passingScore}%</li>
                  </ul>
                </div>
                <Button fullWidth size="lg" onClick={() => setState("active")}>
                  ابدأ الاختبار الآن
                </Button>
                <Button fullWidth size="lg" variant="ghost" onClick={() => navigate("/dashboard")}>
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
    const passed = score >= quiz.passingScore;
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
        <div className="hidden lg:block flex-shrink-0"><DashboardSidebar type="student" /></div>
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className={`p-8 text-center ${passed ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-rose-500 to-rose-600"}`}>
                <div className="text-6xl mb-3">{passed ? "🏆" : "😔"}</div>
                <h2 className="text-2xl font-black text-white mb-1">{passed ? "أحسنت! نجحت!" : "لم تنجح هذه المرة"}</h2>
                <p className="text-white/80 text-sm">{passed ? "نتيجة رائعة، استمر في التميز" : "راجع المادة وحاول مرة أخرى"}</p>
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
                    <p className="text-xl font-black text-emerald-600">{Math.round(score / 10)}</p>
                    <p className="text-xs text-emerald-600">إجابات صحيحة</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-3">
                    <p className="text-xl font-black text-rose-600">{10 - Math.round(score / 10)}</p>
                    <p className="text-xs text-rose-600">إجابات خاطئة</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xl font-black text-blue-600">+{score}</p>
                    <p className="text-xs text-blue-600">نقطة مكتسبة</p>
                  </div>
                </div>

                {/* Question Review */}
                <div>
                  <h3 className="font-black text-slate-900 mb-3 text-sm">مراجعة الإجابات</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {questions.map((q, i) => {
                      const selected = answers[q.id];
                      const correctOpt = q.options.find(o => o.isCorrect);
                      const isRight = selected === correctOpt?.id;
                      return (
                        <div key={q.id} className={`flex items-center gap-3 p-3 rounded-xl ${isRight ? "bg-emerald-50" : "bg-rose-50"}`}>
                          {isRight ? <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" /> : <XCircle size={15} className="text-rose-500 flex-shrink-0" />}
                          <p className="text-xs text-slate-700 flex-1 truncate">س{i + 1}: {q.text.substring(0, 50)}...</p>
                          <span className={`text-xs font-bold ${isRight ? "text-emerald-600" : "text-rose-600"}`}>
                            {isRight ? "✓" : "✗"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" fullWidth onClick={() => { setAnswers({}); setCurrentQ(0); setTimeLeft(quiz.timeLimit); setState("intro"); }}>
                    <RotateCcw size={16} />
                    إعادة الاختبار
                  </Button>
                  <Button fullWidth onClick={() => navigate("/dashboard")}>
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
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                {currentQ + 1}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{q.type === "mcq" ? "اختيار من متعدد" : "صح أو خطأ"}</p>
                <h2 className="text-lg font-bold text-slate-900 leading-relaxed">{q.text}</h2>
              </div>
            </div>

            <div className="space-y-3">
              {q.options.map(option => {
                const selected = answers[q.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(q.id, option.id)}
                    className={`w-full text-right p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                      selected
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        selected ? "border-blue-600 bg-blue-600" : "border-slate-300"
                      }`}>
                        {selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      {option.text}
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

            <div className="flex items-center gap-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    i === currentQ ? "bg-blue-600 text-white" :
                    answers[questions[i].id] ? "bg-emerald-100 text-emerald-700" :
                    "bg-slate-100 text-slate-500 hover:bg-slate-200"
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
                variant="success"
                onClick={handleSubmit}
                className="relative"
              >
                {answeredCount < questions.length && (
                  <AlertCircle size={15} className="text-amber-300" />
                )}
                تسليم الاختبار
              </Button>
            )}
          </div>

          {/* Answer progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">تقدم الإجابات</span>
              <span className="font-bold text-slate-900">{answeredCount} / {questions.length}</span>
            </div>
            <ProgressBar value={answeredCount} max={questions.length} size="sm" barClassName="from-emerald-400 to-emerald-500" />
            {answeredCount < questions.length && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle size={12} />
                لديك {questions.length - answeredCount} أسئلة لم تُجب عليها
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

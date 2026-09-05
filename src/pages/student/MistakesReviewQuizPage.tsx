import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";

type WrongQuestion = { id: number; type: "exam" | "homework" };

export function MistakesReviewQuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questionIds = [], count = 10 } = (location.state as any) || {};

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!questionIds.length) {
      navigate("/dashboard/mistakes");
      return;
    }
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuestions = async () => {
    setLoading(true);

    const shuffled = [...(questionIds as WrongQuestion[])].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const examIds = selected.filter((q) => q.type === "exam").map((q) => q.id);
    const hwIds = selected.filter((q) => q.type === "homework").map((q) => q.id);

    const combined: any[] = [];

    if (examIds.length > 0) {
      const { data, error } = await supabase
        .from("exam_questions")
        .select(`*, question_choices!question_choices_question_id_fkey (*)`)
        .in("id", examIds);

      if (error) console.error(error);
      else
        combined.push(
          ...(data || []).map((q: any) => ({
            ...q,
            __key: `exam-${q.id}`,
            question_choices: q.question_choices,
          }))
        );
    }

    if (hwIds.length > 0) {
      const { data, error } = await supabase
        .from("homework_questions")
        .select(`*, homework_question_choices (*)`)
        .in("id", hwIds);

      if (error) console.error(error);
      else
        combined.push(
          ...(data || []).map((q: any) => ({
            ...q,
            __key: `homework-${q.id}`,
            question_choices: q.homework_question_choices,
          }))
        );
    }

    setQuestions(combined);
    setLoading(false);
  };

  const handleAnswer = (questionKey: string, choiceId: string) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: choiceId }));
  };

  const q = questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  const calcResults = () => {
    let correct = 0;
    questions.forEach((question) => {
      const selected = answers[question.__key];
      const correctChoice = (question.question_choices || []).find(
        (c: any) => String(c.sort_order - 1) === String(question.correct_answer)
      );
      if (selected && correctChoice && selected === correctChoice.id) correct++;
    });
    return { correct, total: questions.length };
  };

  if (loading) {
    return (
      <StudentLayout>
        <main className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin" />
        </main>
      </StudentLayout>
    );
  }

  if (finished) {
    const { correct, total } = calcResults();
    return (
      <StudentLayout>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-[#2A2A2A] p-6 sm:p-8 text-center">
              <Trophy className="mx-auto text-teal-500 mb-3" size={40} />
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">خلصت المراجعة!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                جاوبت صح في {correct} من {total} سؤال
              </p>
              <Button onClick={() => navigate("/dashboard/mistakes")} className="w-full bg-[#B348FE] hover:bg-[#9E2FFF]">
                العودة لمراجعة أخطائي
              </Button>
            </div>

            {questions.map((question, i) => {
              const selectedId = answers[question.__key];
              const correctChoice = (question.question_choices || []).find(
                (c: any) => String(c.sort_order - 1) === String(question.correct_answer)
              );
              const isRight = selectedId && correctChoice && selectedId === correctChoice.id;

              return (
                <div key={question.__key} className="bg-white dark:bg-[#111111] rounded-2xl border-2 p-5 border-gray-200 dark:border-[#2A2A2A]">
                  <p className="font-bold text-gray-900 dark:text-white mb-3">{i + 1}. {question.title}</p>
                  <div className="space-y-2">
                    {(question.question_choices || []).map((choice: any) => {
                      const isCorrectChoice = correctChoice && choice.id === correctChoice.id;
                      const isSelectedWrong = !isRight && choice.id === selectedId;
                      return (
                        <div
                          key={choice.id}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold ${
                            isCorrectChoice
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : isSelectedWrong
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        >
                          <span>{choice.text}</span>
                          {isCorrectChoice && <CheckCircle size={16} />}
                          {isSelectedWrong && <XCircle size={16} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] p-4 flex items-center justify-between">
            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
              سؤال {currentQ + 1} من {questions.length}
            </span>
            <span className="font-black text-[#B348FE]">{answeredCount} / {questions.length} تم الإجابة</span>
          </div>

          {q && (
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] p-5 sm:p-6">
              <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-5">{q.title}</h2>
              <div className="space-y-2.5">
                {(q.question_choices || []).map((choice: any) => {
                  const selected = answers[q.__key] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleAnswer(q.__key, choice.id)}
                      className={`w-full text-right px-4 py-3.5 rounded-xl border font-medium ${
                        selected
                          ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                          : "border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#111111]"
                      }`}
                    >
                      {choice.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
              disabled={currentQ === 0}
              className="flex-1 bg-teal-400 hover:bg-teal-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl"
            >
              السابق
            </button>
            {currentQ === questions.length - 1 ? (
              <button
                onClick={() => setFinished(true)}
                className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] text-white font-bold py-3 rounded-xl"
              >
                إنهاء المراجعة
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ((c) => Math.min(questions.length - 1, c + 1))}
                className="flex-1 bg-teal-400 hover:bg-teal-500 text-white font-bold py-3 rounded-xl"
              >
                التالي
              </button>
            )}
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
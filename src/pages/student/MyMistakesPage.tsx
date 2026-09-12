import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertTriangle } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";

type WrongQuestion = { id: number; type: "exam" | "homework" };

export function MyMistakesPage() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<WrongQuestion[]>([]);
  const [selectedCount, setSelectedCount] = useState<number>(0);

  useEffect(() => {
    if (user?.studentId) loadMistakes();
  }, [user]);

  const loadMistakes = async () => {
    if (!user?.studentId) return;
    setLoading(true);

    // الأسئلة اللي اتحلت صح في مراجعة سابقة، عشان نستبعدها من قايمة الأخطاء
    const { data: resolvedData, error: resolvedError } = await supabase
      .from("resolved_mistakes")
      .select("question_id, question_type, resolved_at")
      .eq("student_id", user.studentId);

    if (resolvedError) console.error(resolvedError);

    const resolvedMap = new Map<string, string>();
    (resolvedData || []).forEach((row: any) => {
      resolvedMap.set(`${row.question_type}-${row.question_id}`, row.resolved_at);
    });

    // لو اتحل صح بعد آخر مرة غلط فيها، يتستبعد. لو غلط فيه تاني بعد الحل، يرجع يظهر.
    const isStillResolved = (type: "exam" | "homework", qId: number | string, wrongAt: string) => {
      const resolvedAt = resolvedMap.get(`${type}-${qId}`);
      if (!resolvedAt) return false;
      return new Date(resolvedAt) > new Date(wrongAt);
    };

    // 1) أسئلة الامتحانات اللي غلط فيها
    const { data: examData, error: examError } = await supabase
      .from("exam_answers")
      .select("question_id, is_correct, created_at")
      .eq("student_id", user.studentId)
      .order("created_at", { ascending: false });

    if (examError) console.error(examError);

    const latestExamStatus = new Map<number, { isCorrect: boolean; createdAt: string }>();
    (examData || []).forEach((row: any) => {
      if (!latestExamStatus.has(row.question_id)) {
        latestExamStatus.set(row.question_id, { isCorrect: row.is_correct, createdAt: row.created_at });
      }
    });

    const wrongExam: WrongQuestion[] = Array.from(latestExamStatus.entries())
      .filter(([qId, v]) => !v.isCorrect && !isStillResolved("exam", qId, v.createdAt))
      .map(([qId]) => ({ id: qId, type: "exam" }));

    // 2) أسئلة الواجبات اللي غلط فيها
    const { data: hwSubmissions, error: hwError } = await supabase
      .from("homework_submissions")
      .select("answers, created_at")
      .eq("student_id", user.studentId)
      .order("created_at", { ascending: false });

    if (hwError) console.error(hwError);

    const latestHwChoiceByQuestion = new Map<number, { choiceIndex: number; createdAt: string }>();
    (hwSubmissions || []).forEach((row: any) => {
      const ans = row.answers || {};
      Object.keys(ans).forEach((qIdStr) => {
        const qId = Number(qIdStr);
        if (latestHwChoiceByQuestion.has(qId)) return;
        const choiceIndex = ans[qIdStr]?.choiceIndex;
        if (choiceIndex !== undefined && choiceIndex !== null) {
          latestHwChoiceByQuestion.set(qId, { choiceIndex, createdAt: row.created_at });
        }
      });
    });

    let wrongHomework: WrongQuestion[] = [];

    if (latestHwChoiceByQuestion.size > 0) {
      const hwQuestionIds = Array.from(latestHwChoiceByQuestion.keys());
      const { data: hwQuestions, error: hwQError } = await supabase
        .from("homework_questions")
        .select("id, correct_answer")
        .in("id", hwQuestionIds);

      if (hwQError) {
        console.error(hwQError);
      } else {
        wrongHomework = (hwQuestions || [])
          .filter((q: any) => {
            const entry = latestHwChoiceByQuestion.get(q.id);
            if (!entry) return false;
            const isWrong = entry.choiceIndex !== q.correct_answer;
            return isWrong && !isStillResolved("homework", q.id, entry.createdAt);
          })
          .map((q: any) => ({ id: q.id, type: "homework" }));
      }
    }

    const allWrong = [...wrongExam, ...wrongHomework];
    setWrongQuestionIds(allWrong);
    setSelectedCount(allWrong.length);
    setLoading(false);
  };

  const startReview = () => {
    const shuffled = [...wrongQuestionIds].sort(() => Math.random() - 0.5);
    const questionsToReview = shuffled.slice(0, selectedCount);
    navigate("/dashboard/mistakes-review", {
      state: { questionIds: questionsToReview, count: questionsToReview.length },
    });
  };

  return (
    <StudentLayout>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6">

          {/* Header */}
          <div
            className="
              relative overflow-hidden
              mb-5 sm:mb-6
              rounded-2xl sm:rounded-3xl
              px-4 sm:px-6 md:px-8
              py-5 sm:py-6 md:py-7
              flex items-center justify-between gap-4
              bg-[#5800a9] dark:bg-[#b600d7]
            "
          >
            <div className="relative z-10 text-right">
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-1.5">
                أخطائي
              </h1>
              <p className="text-white/80 text-[11px] xs:text-xs sm:text-sm leading-5">
                راجع أسئلتك اللي غلطت فيها في امتحان خاص بيك
              </p>
            </div>

            <div
              className="
                relative z-10 flex-shrink-0
                w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11
                rounded-xl sm:rounded-2xl
                bg-white/15
                flex items-center justify-center
              "
            >
              <AlertTriangle className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-[#2A2A2A] p-6 sm:p-10">
            <div className="text-center mb-6">
              <h2 className="text-lg sm:text-xl font-black text-[#5800a9] dark:text-white mb-2">
                 مفيش عندك أي أسئلة غلط دلوقتي.
              </h2>
              <div className="w-16 h-1 bg-[#5800a9] dark:bg-[#b600d7] rounded-full mx-auto" />
            </div>

            {wrongQuestionIds.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 font-bold">
                هنا هتلاقي كل الأسئلة اللي غلطت فيها في الامتحانات والواجبات السابقة، وتقدر تعمل امتحان خاص بيك عشان تراجعها وتتأكد إنك فهمتها كويس
                </p>
              </div>
            ) : (
              <>
                <p className="text-center text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  عندك <span className="font-black text-[#5800a9] dark:text-[#b600d7]">{wrongQuestionIds.length} أسئلة</span> محتاج تراجعهم. يلا نبدأ مراجعة عشان اجمد واحد وسط العيلة
                </p>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-5 mb-6 text-center">
                  <p className="font-black text-[#5800a9] dark:text-white mb-2">
                    ازاي بتشتغل؟
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    هنجيبلك الأسئلة اللي غلطت فيها في امتحاناتك السابقة، وانت تختار عدد الأسئلة اللي عايز تراجعها. هنديك امتحان خاص بيك من غير وقت، عشان تستفيد من اخطائك وتتأكد إنك فهمت صح ومش هترجع تغلط تاني — كده هتبقى اجمد واحد وسط العيلة.
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-center font-black text-[#5800a9] dark:text-white mb-3">
                    اختار عدد الأسئلة اللي عايز تراجعها
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[5, 10, 15, 20, wrongQuestionIds.length]
                      .filter((n, i, arr) => n > 0 && n <= wrongQuestionIds.length && arr.indexOf(n) === i)
                      .sort((a, b) => a - b)
                      .map((n) => (
                        <button
                          key={n}
                          onClick={() => setSelectedCount(n)}
                          className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                            selectedCount === n
                              ? "bg-[#5800a9] dark:bg-[#b600d7] text-white"
                              : "bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#2A2A2A]"
                          }`}
                        >
                          {n === wrongQuestionIds.length ? `الكل (${n})` : n}
                        </button>
                      ))}
                  </div>
                </div>

                <Button
                  onClick={startReview}
                  disabled={selectedCount === 0}
                  className="w-full bg-[#5800a9] dark:bg-[#b600d7] hover:opacity-90 text-white font-black py-3 text-base disabled:opacity-50"
                >
                  <Sparkles size={18} />
                  امتحان خاص بيك ({selectedCount} سؤال)
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
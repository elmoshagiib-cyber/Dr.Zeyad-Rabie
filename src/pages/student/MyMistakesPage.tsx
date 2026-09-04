import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, BookOpen, Sparkles } from "lucide-react";
import StudentLayout from "./StudentLayout";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";

type WrongQuestion = { id: number; type: "exam" | "homework" };

export function MyMistakesPage() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<WrongQuestion[]>([]);
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    if (user?.studentId) loadMistakes();
  }, [user]);

  const loadMistakes = async () => {
    if (!user?.studentId) return;
    setLoading(true);

    // 1) أسئلة الامتحانات اللي غلط فيها
    const { data: examData, error: examError } = await supabase
      .from("exam_answers")
      .select("question_id, is_correct, created_at")
      .eq("student_id", user.studentId)
      .order("created_at", { ascending: false });

    if (examError) console.error(examError);

    const latestExamStatus = new Map<number, boolean>();
    (examData || []).forEach((row: any) => {
      if (!latestExamStatus.has(row.question_id)) {
        latestExamStatus.set(row.question_id, row.is_correct);
      }
    });

    const wrongExam: WrongQuestion[] = Array.from(latestExamStatus.entries())
      .filter(([, isCorrect]) => !isCorrect)
      .map(([qId]) => ({ id: qId, type: "exam" }));

    // 2) أسئلة الواجبات اللي غلط فيها
    const { data: hwSubmissions, error: hwError } = await supabase
      .from("homework_submissions")
      .select("answers, created_at")
      .eq("student_id", user.studentId)
      .order("created_at", { ascending: false });

    if (hwError) console.error(hwError);

    // آخر اختيار للطالب لكل سؤال واجب (أحدث تسليم أولاً)
    const latestHwChoiceByQuestion = new Map<number, number>();
    (hwSubmissions || []).forEach((row: any) => {
      const ans = row.answers || {};
      Object.keys(ans).forEach((qIdStr) => {
        const qId = Number(qIdStr);
        if (latestHwChoiceByQuestion.has(qId)) return;
        const choiceIndex = ans[qIdStr]?.choiceIndex;
        if (choiceIndex !== undefined && choiceIndex !== null) {
          latestHwChoiceByQuestion.set(qId, choiceIndex);
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
          .filter((q: any) => latestHwChoiceByQuestion.get(q.id) !== q.correct_answer)
          .map((q: any) => ({ id: q.id, type: "homework" }));
      }
    }

    const allWrong = [...wrongExam, ...wrongHomework];
    setWrongQuestionIds(allWrong);
    setQuestionCount(Math.min(10, allWrong.length || 1));
    setLoading(false);
  };

  const startReview = () => {
    navigate("/dashboard/mistakes-review", {
      state: { questionIds: wrongQuestionIds, count: questionCount },
    });
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

  return (
    <StudentLayout>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-[#2A2A2A] p-6 sm:p-10">
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
                خليك أقوى واحد وسط عيلتنا
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-pink-400 rounded-full mx-auto" />
            </div>

            {wrongQuestionIds.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400 font-bold">
                  مفيش عندك أي أسئلة غلط دلوقتي، أنت شاطر! 🎉
                </p>
              </div>
            ) : (
              <>
                <p className="text-center text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  عندك <span className="font-black text-[#B348FE]">{wrongQuestionIds.length} أسئلة</span> محتاج تراجعهم. يلا نبدأ مراجعة عشان اجمد واحد وسط العيلة
                </p>

                <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-5 mb-6">
                  <p className="font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertCircle size={18} className="text-[#B348FE]" />
                    ازاي بتشتغل؟
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    هنجيبلك الأسئلة اللي غلطت فيها في امتحاناتك وواجباتك السابقة، وانت تختار عدد الأسئلة اللي عايز تراجعها. هنديك امتحان خاص بيك من غير وقت، عشان تستفيد من اخطائك وتتأكد إنك فهمت صح ومش هترجع تغلط تاني.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2 block">
                    عدد الأسئلة اللي عايز تراجعها
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={wrongQuestionIds.length}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full accent-[#B348FE]"
                  />
                  <p className="text-center font-black text-[#B348FE] mt-1">{questionCount} سؤال</p>
                </div>

                <Button
                  onClick={startReview}
                  className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-black py-3 text-base"
                >
                  <Sparkles size={18} />
                  امتحان خاص بيك
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
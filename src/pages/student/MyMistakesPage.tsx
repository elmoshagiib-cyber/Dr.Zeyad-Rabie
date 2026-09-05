import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Target, RefreshCw, Trophy } from "lucide-react";
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
    setLoading(false);
  };

  const startReview = () => {
    navigate("/dashboard/mistakes-review", {
      state: { questionIds: wrongQuestionIds, count: wrongQuestionIds.length },
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

  const steps = [
    {
      icon: Target,
      title: "بنجمّعلك أسئلتك الغلط",
      desc: "من كل امتحاناتك وواجباتك السابقة، من غير ما تدور عليها بنفسك.",
    },
    {
      icon: RefreshCw,
      title: "تختار وتراجع براحتك",
      desc: "امتحان خاص بيك من غير وقت، تراجع فيه لحد ما تتأكد إنك فاهم صح.",
    },
    {
      icon: Trophy,
      title: "متكررش نفس الغلطة",
      desc: "كل مرة تراجع، هتبقى أقرب إنك تبقى أجمد واحد وسط العيلة.",
    },
  ];

  return (
    <StudentLayout>
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#0B0B0B] dark:via-[#111111] dark:to-[#0B0B0B] min-h-screen">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-10">
          <div
            className="
              relative overflow-hidden
              bg-white dark:bg-[#111111]
              rounded-[28px] sm:rounded-[32px]
              border border-[#EAD8FF] dark:border-[#2A2A2A]
              shadow-[0_10px_40px_rgba(179,72,254,.10)]
              p-6 sm:p-10
            "
          >
            {/* توهج خلفية خفيف */}
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#B348FE]/10 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-pink-400/10 blur-[90px] pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B348FE] to-[#9E2FFF] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#B348FE]/30">
                  <Sparkles className="text-white" size={28} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">
                  خليك أقوى واحد وسط عيلتنا
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  راجع أخطائك السابقة وحوّلها لنقاط قوة
                </p>
              </div>

              {wrongQuestionIds.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mx-auto mb-5">
                    <BookOpen className="text-emerald-500" size={32} />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-black text-lg mb-1">
                    مفيش عندك أي أسئلة غلط دلوقتي
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">أنت شاطر، كمّل كده!</p>
                </div>
              ) : (
                <>
                  {/* عداد الأسئلة */}
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="bg-[#F6EEFF] dark:bg-[#2B103D] border border-[#EAD8FF] dark:border-[#3A1854] rounded-2xl px-6 py-4 text-center">
                      <p className="text-3xl font-black text-[#B348FE] leading-none mb-1">
                        {wrongQuestionIds.length}
                      </p>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">سؤال محتاج مراجعة</p>
                    </div>
                  </div>

                  {/* خطوات الشرح */}
                  <div className="space-y-3 mb-8">
                    {steps.map((step) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.title}
                          className="flex items-start gap-4 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-4"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                            <Icon className="text-[#B348FE]" size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-gray-900 dark:text-white text-sm mb-1">
                              {step.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    onClick={startReview}
                    className="
                      w-full
                      bg-gradient-to-r from-[#B348FE] to-[#9E2FFF]
                      hover:from-[#9E2FFF] hover:to-[#8B1FEF]
                      text-white font-black py-3.5 text-base
                      shadow-lg shadow-[#B348FE]/30
                      hover:shadow-xl hover:shadow-[#B348FE]/40
                      transition-all duration-300
                    "
                  >
                    <Sparkles size={18} />
                    امتحان خاص بيك
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
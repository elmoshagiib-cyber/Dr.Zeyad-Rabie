import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  ArrowRight,
  Image as ImageIcon,
  FileType,
  ClipboardList,
  Send,
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";

interface HwQuestion {
  id: number;
  title: string;
  type: "multiple_choice" | "true_false" | "essay";
  points: number;
  image_url?: string;
  explanation?: string;
  correct_answer?: number | null;
  choices: { id: number; text: string; sort_order: number }[];
}

export function HomeworkDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [homework, setHomework] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [questions, setQuestions] = useState<HwQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState<string>("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    loadHomework();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadHomework = async () => {
    if (!id || !user?.studentId) return;

    setLoading(true);

    const { data: hw, error } = await supabase
      .from("homeworks")
      .select(`
        *,
        course_sections (
          id,
          course_id,
          courses ( id, title )
        )
      `)
      .eq("course_item_id", id)
      .single();

    if (hw) {
      setHomework(hw);

      const { data: sub } = await supabase
        .from("homework_submissions")
        .select("*")
        .eq("homework_id", hw.id)
        .eq("student_id", user.studentId)
        .maybeSingle();

      setSubmission(sub);

      const { data: qData } = await supabase
        .from("homework_questions")
        .select("*")
        .eq("homework_id", hw.id)
        .order("sort_order", { ascending: true });

      if (qData && qData.length > 0) {
        const questionIds = qData.map((q) => q.id);
        const { data: choicesData } = await supabase
          .from("homework_question_choices")
          .select("*")
          .in("question_id", questionIds)
          .order("sort_order", { ascending: true });

        const mapped: HwQuestion[] = qData.map((q) => ({
          id: q.id,
          title: q.title,
          type: q.type,
          points: q.points || 1,
          image_url: q.image_url,
          explanation: q.explanation,
          correct_answer: q.correct_answer,
          choices: (choicesData || []).filter((c) => c.question_id === q.id),
        }));

        setQuestions(mapped);

        // لو في إجابات محفوظة قبل كده (استكمال لاحقًا) نرجّعها
        if (sub?.answers) {
          const savedMc: Record<number, number> = {};
          const savedEssay: Record<number, string> = {};
          Object.entries(sub.answers as Record<string, any>).forEach(([qId, val]) => {
            if (typeof val === "object" && val !== null) {
              if ("choiceIndex" in val) savedMc[Number(qId)] = val.choiceIndex;
              if ("text" in val) savedEssay[Number(qId)] = val.text;
            }
          });
          setAnswers(savedMc);
          setEssayAnswers(savedEssay);
        }
      }
    }

    setLoading(false);
  };

  // ── تسليم الواجب التفاعلي (أسئلة واختيارات) ──
  const handleAnswerSelect = (questionId: number, choiceIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceIndex }));
  };

  const handleEssayChange = (questionId: number, text: string) => {
    setEssayAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const answeredCount =
    questions.filter((q) => q.type !== "essay").filter((q) => answers[q.id] !== undefined).length +
    questions.filter((q) => q.type === "essay").filter((q) => (essayAnswers[q.id] || "").trim().length > 0).length;

  const submitInteractiveAnswers = async () => {
    if (!homework || !user?.studentId) return;
    setSubmittingAnswers(true);
    setShowConfirmSubmit(false);

    try {
      const mcQuestions = questions.filter((q) => q.type !== "essay");
      const essayQuestions = questions.filter((q) => q.type === "essay");
      const hasEssay = essayQuestions.length > 0;

      let correctCount = 0;
      let autoScore = 0;

      const answersPayload: Record<string, any> = {};

      mcQuestions.forEach((q) => {
        const selected = answers[q.id];
        answersPayload[String(q.id)] = { choiceIndex: selected ?? null };
        if (selected !== undefined && selected === q.correct_answer) {
          correctCount++;
          autoScore += Number(q.points) || 1;
        }
      });

      essayQuestions.forEach((q) => {
        answersPayload[String(q.id)] = { text: essayAnswers[q.id] || "" };
      });

      const submissionData: any = {
        homework_id: homework.id,
        student_id: user.studentId,
        answers: answersPayload,
        auto_score: autoScore,
        correct_count: correctCount,
        total_auto_questions: mcQuestions.length,
        has_essay: hasEssay,
        submitted_at: new Date().toISOString(),
        submitted_answers_at: new Date().toISOString(),
        // لو مفيش أسئلة مقالية، التصحيح تلقائي بالكامل والدرجة تتحط فورًا
        grade: hasEssay ? null : autoScore,
      };

      const { data: existing } = await supabase
        .from("homework_submissions")
        .select("id")
        .eq("homework_id", homework.id)
        .eq("student_id", user.studentId)
        .maybeSingle();

      if (existing) {
        const { error: updErr } = await supabase
          .from("homework_submissions")
          .update(submissionData)
          .eq("id", existing.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from("homework_submissions")
          .insert(submissionData);
        if (insErr) throw insErr;
      }

      await loadHomework();
    } catch (err: any) {
      console.error(err);
      alert("حدث خطأ أثناء تسليم الواجب: " + (err?.message || "خطأ غير معروف"));
    } finally {
      setSubmittingAnswers(false);
    }
  };

  // ── الواجب القديم (رفع ملف) ──
  const uploadHomework = async (file: File) => {
    if (!user?.studentId || !homework?.id) return;

    const isReplacement = !!submission;

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadSuccess("");
      setUploadError("");

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 30) {
            clearInterval(progressInterval);
            return 30;
          }
          return prev + 5;
        });
      }, 100);

      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadErr } = await supabase.storage
        .from("homework-files")
        .upload(fileName, file);

      clearInterval(progressInterval);
      setUploadProgress(60);

      if (uploadErr) {
        setUploadError("حدث خطأ أثناء رفع الملف");
        console.error(uploadErr);
        setUploadProgress(0);
        return;
      }

      const { data } = supabase.storage.from("homework-files").getPublicUrl(fileName);

      setUploadProgress(75);

      const { data: existing } = await supabase
        .from("homework_submissions")
        .select("*")
        .eq("homework_id", homework.id)
        .eq("student_id", user.studentId)
        .maybeSingle();

      if (existing) {
        const { error: submitError } = await supabase
          .from("homework_submissions")
          .update({
            file_url: data.publicUrl,
            file_name: file.name,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (submitError) {
          console.error("DATABASE ERROR:", submitError);
          setUploadError(submitError.message);
          setUploadProgress(0);
          return;
        }
      } else {
        const { error: submitError } = await supabase.from("homework_submissions").insert({
          homework_id: homework.id,
          student_id: user.studentId,
          file_url: data.publicUrl,
          file_name: file.name,
        });

        if (submitError) {
          console.error(submitError);
          setUploadError("حدث خطأ أثناء حفظ البيانات");
          setUploadProgress(0);
          return;
        }
      }

      setUploadProgress(90);
      await loadHomework();
      setUploadProgress(100);

      setUploadSuccess(isReplacement ? "✅ تم استبدال الملف بنجاح" : "✅ تم تسليم الواجب بنجاح");

      setTimeout(() => {
        setUploadSuccess("");
        setUploadProgress(0);
      }, 5000);
    } catch (err) {
      console.error(err);
      setUploadError("حدث خطأ غير متوقع");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (fileName: string): "pdf" | "image" | "unknown" => {
    if (!fileName) return "unknown";
    const ext = fileName.toLowerCase().split(".").pop();
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return "image";
    return "unknown";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] px-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold text-sm sm:text-base">جاري تحميل الواجب...</p>
        </div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5EF] px-4">
        <div className="text-center">
          <p className="text-gray-600 font-bold text-base sm:text-lg">لم يتم العثور على الواجب</p>
          <Button onClick={() => navigate(-1)} className="mt-4 bg-teal-500 hover:bg-teal-600">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  const isInteractive = questions.length > 0;
  const hasEssay = questions.some((q) => q.type === "essay");
  const isSubmitted = !!submission?.submitted_answers_at || (!!submission && isInteractive && submission.answers);
  const isGraded = submission?.grade !== null && submission?.grade !== undefined;

  // ══════════════════════════════════════════════
  // وضع الواجب التفاعلي (أسئلة واختيارات)
  // ══════════════════════════════════════════════
  if (isInteractive) {
    // ── شاشة النتيجة / انتظار المراجعة بعد التسليم ──
    if (isSubmitted) {
      return (
        <StudentLayout>
          <main className="flex-1 overflow-y-auto bg-[#F7F5EF]">
            <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
              <Button variant="outline" onClick={() => navigate(-1)} className="border-2 font-bold text-sm">
                <ArrowRight size={16} />
                رجوع
              </Button>

              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8 text-center border-b border-gray-100">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${isGraded ? "bg-teal-50" : "bg-amber-50"}`}>
                    {isGraded ? <CheckCircle className="text-teal-500" size={28} /> : <ClipboardList className="text-amber-500" size={28} />}
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-900 mb-1">
                    {isGraded ? "تم تصحيح الواجب" : "تم تسليم الواجب"}
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {isGraded
                      ? "شوف نتيجتك ومراجعة إجاباتك تحت"
                      : hasEssay
                      ? "في انتظار مراجعة المعلم للأسئلة المقالية"
                      : "تم حفظ إجاباتك بنجاح"}
                  </p>
                </div>

                <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                  {/* ملخص الدرجات */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="bg-emerald-50 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-emerald-200 flex flex-col items-center justify-center">
                      <p className="text-[11px] sm:text-xs text-emerald-700 font-bold mb-1">إجابات صحيحة</p>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-600">{submission.correct_count ?? 0}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-blue-200 flex flex-col items-center justify-center">
                      <p className="text-[11px] sm:text-xs text-blue-700 font-bold mb-1">أسئلة اختيارات</p>
                      <p className="text-2xl sm:text-3xl font-black text-blue-600">{submission.total_auto_questions ?? 0}</p>
                    </div>
                    <div className="bg-teal-50 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border border-teal-200 flex flex-col items-center justify-center">
                      <p className="text-[11px] sm:text-xs text-teal-700 font-bold mb-1 flex items-center gap-1">
                        الدرجة النهائية
                      </p>
                      <p className="text-2xl sm:text-3xl font-black text-teal-600">
                        {isGraded ? submission.grade : "—"}
                        {homework.total_score && (
                          <span className="text-sm text-gray-400 font-bold"> / {homework.total_score}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {!isGraded && hasEssay && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4">
                      <p className="text-amber-800 text-xs sm:text-sm font-bold flex items-start gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        فيه سؤال مقالي في الواجب ده، فالدرجة النهائية هتظهر بعد ما المعلم يراجعها يدويًا.
                      </p>
                    </div>
                  )}

                  {submission?.feedback && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                      <p className="font-black text-gray-900 text-sm mb-1.5">ملاحظات المعلم</p>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{submission.feedback}</p>
                    </div>
                  )}

                  {/* مراجعة الأسئلة */}
                  <div className="space-y-3 sm:space-y-4">
                    {questions.map((q, i) => {
                      const isEssay = q.type === "essay";
                      const selected = answers[q.id];
                      const isRight = !isEssay && selected === q.correct_answer;

                      return (
                        <div
                          key={q.id}
                          className={`rounded-2xl border-2 p-4 sm:p-5 bg-white ${
                            isEssay ? "border-gray-200" : isRight ? "border-emerald-200" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-bold">
                              {q.points === 1 ? "درجة واحدة" : `${q.points} درجات`}
                            </span>
                            {!isEssay && (
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                                  isRight ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                }`}
                              >
                                {isRight ? "إجابة صحيحة" : "إجابة خاطئة"}
                              </span>
                            )}
                            {isEssay && (
                              <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 text-[10px] sm:text-xs font-bold">
                                سؤال مقالي
                              </span>
                            )}
                          </div>

                          <p className="text-sm sm:text-base font-bold text-gray-900 leading-relaxed mb-4">
                            {i + 1}. {q.title}
                          </p>

                          {q.image_url && (
                            <div className="mb-4 flex justify-center">
                              <img src={q.image_url} alt="صورة السؤال" className="max-w-full max-h-56 rounded-xl border border-gray-200 object-contain" />
                            </div>
                          )}

                          {!isEssay && (
                            <div className="space-y-2">
                              {q.choices.map((choice, cIdx) => {
                                const isCorrectChoice = cIdx === q.correct_answer;
                                const isSelectedWrong = !isRight && cIdx === selected;
                                return (
                                  <div
                                    key={choice.id}
                                    className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold ${
                                      isCorrectChoice
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : isSelectedWrong
                                        ? "bg-rose-50 border-rose-200 text-rose-700"
                                        : "bg-gray-50 border-gray-200 text-gray-600"
                                    }`}
                                  >
                                    <span className="break-words">{choice.text}</span>
                                    {isCorrectChoice && <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />}
                                    {isSelectedWrong && <XCircle size={16} className="text-rose-600 flex-shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {isEssay && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                              <p className="text-[11px] font-black text-gray-500 mb-1.5">إجابتك:</p>
                              <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line">
                                {essayAnswers[q.id] || "لم تُجب"}
                              </p>
                            </div>
                          )}

                          {q.explanation && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-[11px] sm:text-xs font-black text-gray-500 mb-1.5">ملاحظة:</p>
                              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Button onClick={() => navigate(-1)} className="w-full bg-teal-500 hover:bg-teal-600">
                    العودة
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </StudentLayout>
      );
    }

    // ── شاشة تأكيد التسليم ──
    if (showConfirmSubmit) {
      return (
        <StudentLayout>
          <main className="flex-1 overflow-y-auto bg-[#F7F5EF]">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
                <div className="p-6 sm:p-8 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-blue-500" size={26} />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-gray-900">تأكيد تسليم الواجب</h3>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">الأسئلة المجابة</span>
                    <span className="text-lg sm:text-2xl font-black text-blue-500">
                      {answeredCount} / {questions.length}
                    </span>
                  </div>
                  {answeredCount < questions.length && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3.5">
                      <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed font-bold">
                        لسه فيه {questions.length - answeredCount} أسئلة لم تُجب عليها. تقدر تكمل بعد كده لو الواجب لسه مفتوح، أو تسلّم كده.
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowConfirmSubmit(false)} className="flex-1">
                      الرجوع
                    </Button>
                    <Button onClick={submitInteractiveAnswers} disabled={submittingAnswers} className="flex-1 bg-teal-500 hover:bg-teal-600">
                      {submittingAnswers ? "جاري التسليم..." : "تأكيد التسليم"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </StudentLayout>
      );
    }

    // ── شاشة تعريفية (Intro) قبل الحل ──
    if (!hasStarted) {
      return (
        <StudentLayout>
          <main className="flex-1 overflow-y-auto bg-[#F7F5EF]">
            <div className="max-w-2xl mx-auto p-3 sm:p-6">
              <Button variant="outline" onClick={() => navigate(-1)} className="border-2 font-bold text-sm mb-4">
                <ArrowRight size={16} />
                رجوع
              </Button>

              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-[#B348FE] via-purple-600 to-[#9E2FFF] p-8 sm:p-12 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-xl">
                    <ClipboardList className="text-white" size={40} />
                  </div>
                  <h1 className="text-xl sm:text-3xl font-black text-white mb-2">{homework.title}</h1>
                  {homework.course_sections?.courses?.title && (
                    <p className="text-purple-100 text-sm sm:text-base">{homework.course_sections.courses.title}</p>
                  )}
                </div>

                <div className="p-5 sm:p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-blue-50 rounded-2xl p-4 sm:p-5 border border-blue-200 text-center">
                      <p className="text-2xl sm:text-3xl font-black text-blue-600">{questions.length}</p>
                      <p className="text-xs text-blue-600 mt-1 font-bold">سؤال</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 text-center">
                      <p className="text-2xl sm:text-3xl font-black text-emerald-600">
                        {homework.total_score || questions.reduce((s, q) => s + (Number(q.points) || 1), 0)}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1 font-bold">الدرجة الكلية</p>
                    </div>
                  </div>

                  {homework.description && (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5">
                      <p className="font-black text-gray-900 text-sm mb-1.5">وصف الواجب</p>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {homework.description}
                      </p>
                    </div>
                  )}

                  {hasEssay && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                      <p className="text-amber-800 text-xs sm:text-sm font-bold flex items-start gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        الواجب ده فيه أسئلة مقالية، فالدرجة النهائية هتظهر بعد ما المعلم يراجعها يدويًا.
                      </p>
                    </div>
                  )}

                  <Button onClick={() => setHasStarted(true)} className="w-full bg-teal-500 hover:bg-teal-600 py-3 text-base font-bold">
                    ابدأ حل الواجب
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </StudentLayout>
      );
    }

    // ── شاشة حل الواجب ──
    return (
      <StudentLayout>
        <main className="flex-1 overflow-y-auto bg-[#F7F5EF]">
          <div className="max-w-3xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
            <Button variant="outline" onClick={() => setHasStarted(false)} className="border-2 font-bold text-sm">
              <ArrowRight size={16} />
              رجوع
            </Button>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6">
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 mb-2">{homework.title}</h1>
              {homework.course_sections?.courses?.title && (
                <p className="text-xs sm:text-sm font-bold text-teal-600 mb-2">{homework.course_sections.courses.title}</p>
              )}
              {homework.description && (
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">{homework.description}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] sm:text-xs font-bold">
                  {questions.length} سؤال
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[11px] sm:text-xs font-bold">
                  بدون وقت محدد
                </span>
              </div>
            </div>

            {questions.map((q, i) => {
              const isEssay = q.type === "essay";
              return (
                <div key={q.id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-white text-[11px] sm:text-xs font-black shrink-0">
                      {q.points === 1 ? "درجة واحدة" : `${q.points} درجات`}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-lg font-bold text-gray-900 leading-relaxed mb-4">
                    {i + 1}. {q.title}
                  </h2>

                  {q.image_url && (
                    <div className="mb-4 flex justify-center">
                      <img src={q.image_url} alt="صورة السؤال" className="max-w-full max-h-64 rounded-xl border border-gray-200 object-contain" />
                    </div>
                  )}

                  {!isEssay ? (
                    <div className="space-y-2.5">
                      {q.choices.map((choice, cIdx) => {
                        const selected = answers[q.id] === cIdx;
                        return (
                          <button
                            key={choice.id}
                            onClick={() => handleAnswerSelect(q.id, cIdx)}
                            className={`w-full text-right px-4 sm:px-5 py-3.5 rounded-xl sm:rounded-2xl border transition-all font-medium text-xs sm:text-base ${
                              selected
                                ? "border-emerald-400 bg-emerald-50 text-gray-900"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                  selected ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                                }`}
                              >
                                {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <span className="flex-1 break-words">{choice.text}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      value={essayAnswers[q.id] || ""}
                      onChange={(e) => handleEssayChange(q.id, e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 text-sm resize-none"
                      placeholder="اكتب إجابتك هنا..."
                    />
                  )}
                </div>
              );
            })}

            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-gray-700">تقدم الإجابات</span>
              <span className="text-sm sm:text-base font-black text-gray-900">
                {answeredCount} / {questions.length}
              </span>
            </div>

            <Button onClick={() => setShowConfirmSubmit(true)} className="w-full bg-teal-500 hover:bg-teal-600 py-3 text-base font-bold">
              <Send size={18} />
              تسليم الواجب
            </Button>
          </div>
        </main>
      </StudentLayout>
    );
  }

  // ══════════════════════════════════════════════
  // الوضع القديم: رفع ملف (لو الواجب مفيهوش أسئلة)
  // ══════════════════════════════════════════════
  const getStatus = (): "not_submitted" | "submitted" | "corrected" => {
    if (!submission) return "not_submitted";
    if (submission.grade !== null && submission.grade !== undefined) return "corrected";
    return "submitted";
  };

  const status = getStatus();
  const canUpload = homework.allow_file_upload && status !== "corrected";
  const fileType = submission?.file_name ? getFileType(submission.file_name) : "unknown";

  return (
    <StudentLayout>
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#09090B] border-b border-gray-100 dark:border-[#2A2A2A] px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-3 sm:mb-4 border-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] font-bold transition-all duration-200 text-sm"
          >
            <ArrowRight size={16} />
            رجوع
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
            تفاصيل الواجب
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm lg:text-base mt-1">
            عرض التفاصيل وتسليم الواجب
          </p>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 max-w-5xl mx-auto">
          {/* Header Card */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
              <div>
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3 leading-snug">
                  {homework.title}
                </h2>

                {homework.course_sections?.courses?.title && (
                  <p className="text-xs sm:text-sm font-bold text-[#B348FE] mb-2">
                    {homework.course_sections.courses.title}
                  </p>
                )}

                {homework.description && (
                  <p className="mt-2 sm:mt-3 text-gray-600 dark:text-gray-400 leading-relaxed text-xs sm:text-sm lg:text-base">
                    {homework.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {status === "not_submitted" && (
                  <span className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-black border border-amber-200 dark:border-amber-900">
                    لم يتم التسليم
                  </span>
                )}

                {status === "submitted" && (
                  <span className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] text-xs sm:text-sm font-black border border-[#EAD8FF] dark:border-[#2A2A2A]">
                    تم التسليم
                  </span>
                )}

                {status === "corrected" && (
                  <span className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-black border border-emerald-200 dark:border-emerald-900">
                    تم التصحيح
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teacher Attachments */}
          {(homework.attachment_pdf || homework.attachment_image) && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-[#F6EEFF] dark:bg-[#2B103D] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0">
                      <FileText className="text-[#B348FE] w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-gray-900 dark:text-white text-sm sm:text-base">ملفات الواجب</p>
                      <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        المرفقات من المعلم
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {homework.attachment_pdf && (
                      <a href={homework.attachment_pdf} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none">
                        <Button size="sm" className="bg-[#B348FE] hover:bg-[#9E2FFF] font-bold w-full sm:w-auto text-xs sm:text-sm">
                          <Eye size={15} />
                          عرض PDF
                        </Button>
                      </a>
                    )}

                    {homework.attachment_image && (
                      <a href={homework.attachment_image} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] font-bold w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Eye size={15} />
                          عرض الصورة
                        </Button>
                      </a>
                    )}
                  </div>

                  {homework.attachment_pdf && (
                    <div className="mt-3 sm:mt-4 border-2 border-gray-200 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl overflow-hidden">
                      <iframe
                        src={homework.attachment_pdf}
                        className="w-full h-[350px] sm:h-[450px] lg:h-[500px]"
                        title="معاينة ملف PDF"
                      />
                    </div>
                  )}

                  {homework.attachment_image && !homework.attachment_pdf && (
                    <div className="mt-3 sm:mt-4 border-2 border-gray-200 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl overflow-hidden p-3 sm:p-4 bg-gray-50 dark:bg-[#1A1A1A]">
                      <img
                        src={homework.attachment_image}
                        alt="مرفق الواجب"
                        className="w-full h-auto rounded-lg sm:rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                        onClick={() => window.open(homework.attachment_image, "_blank")}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grade Display */}
          {status === "corrected" && submission?.grade !== null && submission?.grade !== undefined && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md animate-fadeIn">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 sm:p-3 rounded-lg sm:rounded-xl shrink-0">
                        <CheckCircle className="text-emerald-600 dark:text-emerald-500 w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="font-black text-gray-900 dark:text-white text-sm sm:text-base">درجة الواجب</p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-500">
                        {submission.grade}
                        {homework.total_score && (
                          <span className="text-base sm:text-xl lg:text-2xl text-gray-500 dark:text-gray-400 font-bold">
                            {" "}/ {homework.total_score}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teacher Comment */}
          {submission?.feedback && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md animate-fadeIn">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-[#F6EEFF] dark:bg-[#2B103D] p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                      <FileText className="text-[#B348FE] w-4 h-4 sm:w-[22px] sm:h-[22px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 dark:text-white text-sm sm:text-base mb-1.5 sm:mb-2">
                        ملاحظات المعلم
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                        {submission.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Submission */}
          {submission && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md animate-fadeIn">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4 sm:space-y-5">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A1A1A] dark:to-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="bg-white dark:bg-gray-800 p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-sm shrink-0">
                          {fileType === "pdf" && <FileType className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />}
                          {fileType === "image" && <ImageIcon className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />}
                          {fileType === "unknown" && <FileText className="text-gray-600 dark:text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 dark:text-white text-sm sm:text-base">ملفك المرفوع</p>
                          <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {submission.file_name}
                          </p>
                          {submission.submitted_at && (
                            <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
                              آخر رفع: {formatDate(submission.submitted_at)}
                            </p>
                          )}
                          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            النوع: {fileType === "pdf" ? "PDF" : fileType === "image" ? "صورة" : "ملف"}
                          </p>
                        </div>
                      </div>
                      <a href={submission.file_url} target="_blank" rel="noreferrer" className="shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] font-bold w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Eye size={15} />
                          فتح في تبويب جديد
                        </Button>
                      </a>
                    </div>
                  </div>

                  {submission.file_url && (
                    <div className="border-2 border-gray-200 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl overflow-hidden animate-fadeIn">
                      {fileType === "pdf" && (
                        <iframe
                          src={submission.file_url}
                          className="w-full h-[400px] sm:h-[500px] lg:h-[600px]"
                          title="معاينة ملف الواجب"
                        />
                      )}
                      {fileType === "image" && (
                        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-[#1A1A1A]">
                          <img
                            src={submission.file_url}
                            alt="ملف الواجب"
                            className="w-full h-auto rounded-lg sm:rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                            onClick={() => window.open(submission.file_url, "_blank")}
                          />
                        </div>
                      )}
                      {fileType === "unknown" && (
                        <div className="p-6 sm:p-8 text-center bg-gray-50 dark:bg-[#1A1A1A]">
                          <FileText className="mx-auto text-gray-400 mb-3" size={40} />
                          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                            لا يمكن معاينة هذا النوع من الملفات. استخدم زر "فتح في تبويب جديد" للعرض.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Section */}
          {canUpload && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-base sm:text-lg mb-1.5 sm:mb-2">
                      {submission ? "استبدال الواجب" : "رفع الواجب"}
                    </p>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-500 dark:text-gray-400">
                      {submission
                        ? "يمكنك استبدال الملف الحالي قبل أن يقوم المعلم بالتصحيح."
                        : "اختر ملف PDF أو صورة لرفع إجابتك."}
                    </p>
                  </div>

                  {status === "submitted" && !uploading && !uploadSuccess && (
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 animate-fadeIn">
                      <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-bold flex items-start sm:items-center gap-2">
                        <AlertCircle size={17} className="shrink-0 mt-0.5 sm:mt-0" />
                        تم تسليم الواجب بالفعل، ويمكنك استبدال الملف حتى يقوم المعلم بالتصحيح.
                      </p>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-[#2A2A2A]">
                        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                          <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">جاري رفع الملف...</p>
                          <p className="text-xs sm:text-sm font-black text-[#B348FE]">{uploadProgress}%</p>
                        </div>
                        <div className="w-full h-2.5 sm:h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#B348FE] to-[#9E2FFF] transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-center mt-3 sm:mt-4">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 animate-fadeIn">
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 text-xs sm:text-sm">
                        <CheckCircle size={17} />
                        {uploadSuccess}
                      </p>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 animate-fadeIn">
                      <p className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2 text-xs sm:text-sm">
                        <AlertCircle size={17} />
                        {uploadError}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
                    <div className="w-full sm:w-auto">
                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept=".pdf"
                        hidden
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          await uploadHomework(file);
                          e.target.value = "";
                        }}
                      />

                      <Button
                        size="sm"
                        disabled={uploading}
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        className="bg-[#B348FE] hover:bg-[#9E2FFF] shadow-md hover:shadow-[0_8px_20px_rgba(179,72,254,.35)] font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-sm"
                      >
                        <Upload size={16} />
                        {uploading ? "جاري الرفع..." : submission ? "استبدال PDF" : "رفع PDF"}
                      </Button>
                    </div>

                    <div className="w-full sm:w-auto">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          await uploadHomework(file);
                          e.target.value = "";
                        }}
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-sm"
                      >
                        <Upload size={16} />
                        {uploading ? "جاري الرفع..." : submission ? "استبدال صورة" : "رفع صورة"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {status === "corrected" && homework.allow_file_upload && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm animate-fadeIn">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <p className="text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-start sm:items-center gap-2">
                    <CheckCircle size={17} className="shrink-0 mt-0.5 sm:mt-0" />
                    تم تصحيح الواجب، ولا يمكن استبدال الملف بعد التصحيح.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </StudentLayout>
  );
}

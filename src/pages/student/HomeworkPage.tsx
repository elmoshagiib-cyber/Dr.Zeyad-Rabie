import { FileText, CheckCircle, Clock, AlertCircle, Eye, Award, Download } from "lucide-react";
import StudentLayout from "./StudentLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useEffect, useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export function HomeworkPage() {
  const { user } = useApp();

  const [uploading, setUploading] = useState(false);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pdfInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const imageInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.studentId) {
      loadHomeworks();
    }
  }, [user]);

  // Helper function to get homework status
  const getHomeworkStatus = (hw: any) => {
    const hasSubmission = hw.submitted;
    const hasGrade =
      hw.submission?.grade !== null &&
      hw.submission?.grade !== undefined;

    if (!hasSubmission) {
      return "not_submitted";
    }

    if (hasGrade) {
      return "corrected";
    }

    return "submitted";
  };

  const submitted = homeworks.filter((h) => h.submitted).length;
  const pending = homeworks.filter((h) => !h.submitted).length;

  // كل الواجبات اللي ليها درجة (تم تصحيحها)
  const gradedHomeworks = homeworks.filter(
    (h) => h.submission?.grade !== null && h.submission?.grade !== undefined
  );

  // المعدل: مجموع (الدرجة / الدرجة الكلية) لكل واجب، كنسبة مئوية
  const averageGrade =
    gradedHomeworks.length > 0
      ? Math.round(
          gradedHomeworks.reduce((sum, h) => {
            const total = h.total_score || 100;
            return sum + (h.submission.grade / total) * 100;
          }, 0) / gradedHomeworks.length
        )
      : null;

  const loadHomeworks = async () => {
    if (!user?.studentId) return;

    setLoading(true);

    const { data: enrollments } = await supabase
      .from("student_courses")
      .select("course_id")
      .eq("student_id", user.studentId);

    if (!enrollments || enrollments.length === 0) {
      setHomeworks([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map((c) => c.course_id);

    const { data: homeworksData } = await supabase
      .from("homeworks")
      .select("*")
      .in("course_id", courseIds);

    if (!homeworksData || homeworksData.length === 0) {
      setHomeworks([]);
      setLoading(false);
      return;
    }

    // ==========================================
    // فلترة الواجبات "اليتيمة": أي واجب مالوش
    // عنصر حقيقي (course_item) مرتبط بيه في الكورس
    // بيحصل ده لو المدرس مسح العنصر من صفحة تعديل
    // الدورة من غير ما الصف في جدول homeworks يتمسح
    // ==========================================
    const itemIds = homeworksData
      .map((hw: any) => hw.course_item_id)
      .filter(Boolean);

    let validItemIds = new Set<string>();

    if (itemIds.length > 0) {
      const { data: validItems } = await supabase
        .from("course_items")
        .select("id")
        .in("id", itemIds)
        .eq("type", "homework");

      validItemIds = new Set((validItems || []).map((i: any) => i.id));
    }

    const validHomeworks = homeworksData.filter((hw: any) =>
      validItemIds.has(hw.course_item_id)
    );

    const { data: submissions } = await supabase
      .from("homework_submissions")
      .select("*")
      .eq("student_id", user.studentId);

    const submissionsMap =
      submissions?.reduce((acc, item) => {
        acc[item.homework_id] = item;
        return acc;
      }, {} as any) || {};

    const finalHomeworks = validHomeworks.map((hw) => ({
      ...hw,
      submitted: !!submissionsMap[hw.id],
      submission: submissionsMap[hw.id],
    }));

    setHomeworks(finalHomeworks);
    setLoading(false);
  };

  const uploadHomework = async (file: File, homeworkId: number) => {
    if (!user?.studentId) return;

    try {
      setUploading(true);

      const fileName = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("homework-files")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        return;
      }

      const { data } = supabase.storage.from("homework-files").getPublicUrl(fileName);

      const { data: existing } = await supabase
        .from("homework_submissions")
        .select("*")
        .eq("homework_id", homeworkId)
        .eq("student_id", user.studentId)
        .maybeSingle();

      if (existing) {
        const { error: submitError } = await supabase
          .from("homework_submissions")
          .update({
            answer: data.publicUrl,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (submitError) {
          console.error(submitError);
          return;
        }
      } else {
        const { error: submitError } = await supabase.from("homework_submissions").insert({
          homework_id: homeworkId,
          student_id: user.studentId,
          answer: data.publicUrl,
        });

        if (submitError) {
          console.error(submitError);
          return;
        }
      }

      await loadHomeworks();
      alert("تم رفع الواجب بنجاح");
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Helper function to check if file is PDF
  const isPdfFile = (url: string) => {
    return url?.toLowerCase().includes(".pdf");
  };

  return (
    <StudentLayout>
      {/* Header */}
      <div className="bg-white dark:bg-[#09090B] border-b border-gray-100 dark:border-[#2A2A2A] px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-1.5 sm:mb-2">
          الواجبات
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm lg:text-base">
          متابعة وتسليم جميع الواجبات الدراسية
        </p>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Submitted Card */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 col-span-1">
            <CardContent className="p-4 sm:p-6 lg:p-7">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 truncate">
                    تم التسليم
                  </p>
                  <p className="text-2xl sm:text-4xl lg:text-5xl font-black text-emerald-600">
                    {submitted}
                  </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shrink-0">
                  <CheckCircle className="text-emerald-600 w-5 h-5 sm:w-8 sm:h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Card */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 col-span-1">
            <CardContent className="p-4 sm:p-6 lg:p-7">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 truncate">
                    قيد الانتظار
                  </p>
                  <p className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-600">
                    {pending}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shrink-0">
                  <Clock className="text-amber-600 w-5 h-5 sm:w-8 sm:h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Grade Card */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6 lg:p-7">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 truncate">
                    معدل الدرجات
                  </p>
                  <p className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#B348FE]">
                    {averageGrade !== null ? `${averageGrade}%` : "-"}
                  </p>
                  {gradedHomeworks.length > 0 && (
                    <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
                      بناءً على {gradedHomeworks.length} واجب مُصحح
                    </p>
                  )}
                </div>
                <div className="bg-[#F6EEFF] dark:bg-[#2B103D] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shrink-0">
                  <Award className="text-[#B348FE] w-5 h-5 sm:w-8 sm:h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Homework List */}
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-20">
              <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-[#B348FE]/20 border-t-[#B348FE] rounded-full animate-spin" />
            </div>
          ) : homeworks.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center">
              <FileText className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={40} />
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-2">
                لا توجد واجبات
              </h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                لا توجد واجبات متاحة حالياً.
              </p>
            </div>
          ) : (
            homeworks.map((hw) => {
              const status = getHomeworkStatus(hw);

              return (
                <Card
                  key={hw.id}
                  className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl hover:border-[#B348FE] transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Header Section */}
                      <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-black text-gray-900 dark:text-white text-base sm:text-xl lg:text-2xl leading-snug flex-1">
                            {hw.title}
                          </h3>

                          <span
                            className={`
                              px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black whitespace-nowrap shrink-0 border
                              ${
                                status === "not_submitted"
                                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                                  : status === "submitted"
                                  ? "bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] border-[#EAD8FF] dark:border-[#2A2A2A]"
                                  : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                              }
                            `}
                          >
                            {status === "not_submitted" && "لم يتم التسليم"}
                            {status === "submitted" && "تم التسليم"}
                            {status === "corrected" && "تم التصحيح"}
                          </span>
                        </div>

                        {hw.description && (
                          <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                            {hw.description}
                          </p>
                        )}
                      </div>

                      {/* Homework Attachments */}
                      {(hw.attachment_pdf || hw.attachment_image) && (
                        <div className="bg-[#F6EEFF] dark:bg-[#1A1A1A] border border-[#EAD8FF] dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                              <div className="bg-[#B348FE] bg-opacity-10 p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0">
                                <FileText className="text-[#B348FE] w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <p className="font-black text-gray-900 dark:text-white text-sm sm:text-base">
                                ملفات الواجب
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {hw.attachment_pdf && (
                                <a href={hw.attachment_pdf} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none">
                                  <Button size="sm" variant="outline" className="font-bold w-full sm:w-auto text-xs sm:text-sm">
                                    <Eye size={15} />
                                    عرض PDF
                                  </Button>
                                </a>
                              )}

                              {hw.attachment_image && (
                                <a href={hw.attachment_image} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none">
                                  <Button size="sm" className="bg-[#B348FE] hover:bg-[#9E2FFF] font-bold w-full sm:w-auto text-xs sm:text-sm">
                                    <Eye size={15} />
                                    عرض الصورة
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Grade Display */}
                      {status === "corrected" &&
                        hw.submission?.grade !== null &&
                        hw.submission?.grade !== undefined && (
                          <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 sm:p-3 rounded-lg sm:rounded-xl shrink-0">
                                  <CheckCircle className="text-emerald-600 dark:text-emerald-500 w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <p className="font-black text-gray-900 dark:text-white text-sm sm:text-base">
                                  درجة الواجب
                                </p>
                              </div>
                              <div className="text-left shrink-0">
                                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-500">
                                  {hw.submission.grade}
                                  {hw.total_score && (
                                    <span className="text-base sm:text-xl lg:text-2xl text-gray-500 dark:text-gray-400 font-bold">
                                      {" "}
                                      / {hw.total_score}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Teacher Feedback */}
                      {hw.submission?.feedback && (
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
                                {hw.submission.feedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Student Submission Display */}
                      {hw.submission && (
                        <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              <div className="bg-gray-100 dark:bg-gray-800 p-2.5 sm:p-3 rounded-lg sm:rounded-xl shrink-0">
                                <FileText className="text-gray-600 dark:text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-gray-900 dark:text-white text-sm sm:text-base mb-0.5 sm:mb-1">
                                  ملفك المرفوع
                                </p>
                                <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {hw.submission.answer?.split("/").pop()}
                                </p>
                              </div>
                            </div>
                            <a href={hw.submission.answer} target="_blank" rel="noreferrer" className="shrink-0">
                              <Button size="sm" variant="outline" className="font-bold w-full sm:w-auto text-xs sm:text-sm">
                                <Eye size={15} />
                                عرض الملف
                              </Button>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="border-t border-gray-200 dark:border-[#2A2A2A] pt-4 sm:pt-6">
                        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                          <Button
                            size="sm"
                            className="bg-[#B348FE] hover:bg-[#9E2FFF] font-bold w-full sm:w-auto text-sm"
                            onClick={() => {
                              navigate(`/dashboard/homework/${hw.course_item_id}`);
                            }}
                          >
                            <Eye size={16} />
                            فتح الواجب
                          </Button>

                          {hw.submission?.answer && (
                            <a href={hw.submission.answer} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                              <Button size="sm" variant="outline" className="font-bold w-full sm:w-auto text-sm">
                                <FileText size={16} />
                                عرض الملف
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
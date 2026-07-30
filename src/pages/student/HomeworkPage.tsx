import { FileText, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
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
const pdfInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
const imageInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
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

  const submitted = homeworks.filter(h => h.submitted).length;
  const pending = homeworks.filter(h => !h.submitted).length;
  const interactive = 0;

  const loadHomeworks = async () => {
    if (!user?.id) return;

    const { data: enrollments } = await supabase
      .from("student_courses")
      .select("course_id")
      .eq("student_id", Number(user.id));

    if (!enrollments) return;

    const courseIds = enrollments.map(c => c.course_id);

    const { data: homeworksData } = await supabase
      .from("homeworks")
      .select("*")
      .in("course_id", courseIds);

    const { data: submissions } = await supabase
      .from("homework_submissions")
      .select("*")
      .eq("student_id", Number(user.id));

    const submissionsMap =
      submissions?.reduce((acc, item) => {
        acc[item.homework_id] = item;
        return acc;
      }, {} as any) || {};

    const finalHomeworks =
      homeworksData?.map(hw => ({
        ...hw,
        submitted: !!submissionsMap[hw.id],
        submission: submissionsMap[hw.id]
      })) || [];

    console.log("HOMEWORKS:", finalHomeworks);

    setHomeworks(finalHomeworks);
  };

  const uploadHomework = async (
    file: File,
    homeworkId: number
  ) => {
    if (!user?.id) return;

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

      const { data } = supabase.storage
        .from("homework-files")
        .getPublicUrl(fileName);

      const { data: existing } = await supabase
        .from("homework_submissions")
        .select("*")
        .eq("homework_id", homeworkId)
        .eq("student_id", Number(user.id))
        .maybeSingle();

      if (existing) {
        const { error: submitError } = await supabase
          .from("homework_submissions")
          .update({
            answer: data.publicUrl,
            submitted_at: new Date().toISOString()
          })
          .eq("id", existing.id);

        if (submitError) {
          console.error(submitError);
          return;
        }
      } else {
        const { error: submitError } = await supabase
          .from("homework_submissions")
          .insert({
            homework_id: homeworkId,
            student_id: Number(user.id),
            answer: data.publicUrl
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
    <div
      className="flex h-screen overflow-hidden bg-white dark:bg-[#09090B]"
      dir="rtl"
    >
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#09090B] border-b border-gray-100 dark:border-[#2A2A2A] px-6 lg:px-8 py-6">
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-2">
            الواجبات
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base">
            متابعة وتسليم جميع الواجبات الدراسية
          </p>
        </div>

        <div className="p-6 lg:p-8 space-y-6 lg:space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* Submitted Card */}
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6 lg:p-7">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-2">
                      تم التسليم
                    </p>
                    <p className="text-4xl lg:text-5xl font-black text-emerald-600">
                      {submitted}
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl">
                    <CheckCircle className="text-emerald-600" size={32} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Card */}
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6 lg:p-7">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-2">
                      قيد الانتظار
                    </p>
                    <p className="text-4xl lg:text-5xl font-black text-amber-600">
                      {pending}
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl">
                    <Clock className="text-amber-600" size={32} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Card */}
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6 lg:p-7">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-2">
                      واجبات تفاعلية
                    </p>
                    <p className="text-4xl lg:text-5xl font-black text-[#B348FE]">
                      {interactive}
                    </p>
                  </div>
                  <div className="bg-[#F6EEFF] dark:bg-[#2B103D] p-4 rounded-2xl">
                    <AlertCircle className="text-[#B348FE]" size={32} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Homework List */}
          <div className="space-y-5 lg:space-y-6">
            {homeworks.map(hw => {
              const status = getHomeworkStatus(hw);
              const canUpload = hw.allow_file_upload;

              return (
                <Card 
                  key={hw.id} 
                  className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm hover:shadow-xl hover:border-[#B348FE] transition-all duration-300"
                >
                  <CardContent className="p-6 lg:p-8">
                    <div className="space-y-6">
                      {/* Header Section */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-black text-gray-900 dark:text-white text-xl lg:text-2xl mb-3 leading-tight">
                            {hw.title}
                          </h3>

                          {hw.description && (
                            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                              {hw.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {status === "not_submitted" && (
                            <span className="px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-black whitespace-nowrap border border-amber-200 dark:border-amber-900">
                              لم يتم التسليم
                            </span>
                          )}

                          {status === "submitted" && (
                            <span className="px-4 py-2 rounded-full bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] text-xs font-black whitespace-nowrap border border-[#EAD8FF] dark:border-[#2A2A2A]">
                              تم التسليم
                            </span>
                          )}

                          {status === "corrected" && (
                            <span className="px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-black whitespace-nowrap border border-emerald-200 dark:border-emerald-900">
                              تم التصحيح
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Homework Attachments */}
                      {(hw.attachment_pdf || hw.attachment_image) && (
                        <div className="bg-[#F6EEFF] dark:bg-[#1A1A1A] border border-[#EAD8FF] dark:border-[#2A2A2A] rounded-2xl p-5 lg:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#B348FE] bg-opacity-10 p-3 rounded-xl">
                                <FileText className="text-[#B348FE]" size={20} />
                              </div>
                              <p className="font-black text-gray-900 dark:text-white text-base">
                                ملفات الواجب
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {hw.attachment_pdf && (
                                <a
                                  href={hw.attachment_pdf}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="font-bold"
                                  >
                                    <Eye size={16} />
                                    عرض PDF
                                  </Button>
                                </a>
                              )}

                              {hw.attachment_image && (
                                <a
                                  href={hw.attachment_image}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Button 
                                    size="sm"
                                    className="bg-[#B348FE] hover:bg-[#9E2FFF] font-bold"
                                  >
                                    <Eye size={16} />
                                    عرض الصورة
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Grade Display */}
                      {status === "corrected" && hw.submission?.grade !== null && hw.submission?.grade !== undefined && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900 rounded-2xl p-5 lg:p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                                <CheckCircle className="text-emerald-600 dark:text-emerald-500" size={24} />
                              </div>
                              <div>
                                <p className="font-black text-gray-900 dark:text-white text-base">
                                  درجة الواجب
                                </p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-500">
                                {hw.submission.grade}
                                {hw.total_score && (
                                  <span className="text-xl lg:text-2xl text-gray-500 dark:text-gray-400 font-bold">
                                    {" "}/ {hw.total_score}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Teacher Feedback */}
                      {hw.submission?.teacher_comment && (
                        <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-5 lg:p-6">
                          <div className="flex items-start gap-4">
                            <div className="bg-[#F6EEFF] dark:bg-[#2B103D] p-3 rounded-xl flex-shrink-0">
                              <FileText className="text-[#B348FE]" size={22} />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-gray-900 dark:text-white text-base mb-2">
                                ملاحظات المعلم
                              </p>
                              <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {hw.submission.teacher_comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Student Submission Display */}
                      {hw.submission && (
                        <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-5 lg:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
                                <FileText className="text-gray-600 dark:text-gray-400" size={24} />
                              </div>
                              <div>
                                <p className="font-black text-gray-900 dark:text-white text-base mb-1">
                                  ملفك المرفوع
                                </p>
                                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                                  {hw.submission.answer?.split("/").pop()}
                                </p>
                              </div>
                            </div>
                            <a
                              href={hw.submission.answer}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="font-bold w-full sm:w-auto"
                              >
                                <Eye size={16} />
                                عرض الملف
                              </Button>
                            </a>
                          </div>
                        </div>
                      )}

{/* Actions */}
<div className="border-t border-gray-200 dark:border-[#2A2A2A] pt-6">
  <div className="flex flex-wrap gap-3">

    <Button
      size="sm"
      className="bg-[#B348FE] hover:bg-[#9E2FFF] font-bold"
      onClick={() => {
        navigate(`/dashboard/homework/${hw.course_item_id}`);
      }}
    >
      <Eye size={16} />
      فتح الواجب
    </Button>

    {hw.submission?.answer && (
      <a
        href={hw.submission.answer}
        target="_blank"
        rel="noreferrer"
      >
        <Button
          size="sm"
          variant="outline"
          className="font-bold"
        >
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
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
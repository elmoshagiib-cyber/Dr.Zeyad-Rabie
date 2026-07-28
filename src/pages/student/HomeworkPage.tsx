import { Upload, FileText, CheckCircle, Clock, AlertCircle, Download, Eye } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useEffect, useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";

export function HomeworkPage() {
  const { user } = useApp();
  const [uploading, setUploading] = useState(false);
  const [homeworks, setHomeworks] = useState<any[]>([]);

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
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-[#1E244F] border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-black text-slate-900">الواجبات</h1>
          <p className="text-slate-500 text-sm mt-1">
            متابعة وتسليم جميع الواجبات الدراسية
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">تم التسليم</p>
                    <p className="text-3xl font-black text-emerald-600">
                      {submitted}
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <CheckCircle className="text-emerald-600" size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">قيد الانتظار</p>
                    <p className="text-3xl font-black text-amber-600">
                      {pending}
                    </p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-xl">
                    <Clock className="text-amber-600" size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">واجبات تفاعلية</p>
                    <p className="text-3xl font-black text-blue-600">
                      {interactive}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <AlertCircle className="text-blue-600" size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Homework List */}
          <div className="space-y-4">
            {homeworks.map(hw => {
              const status = getHomeworkStatus(hw);
              const canUpload = hw.allow_file_upload;

              return (
                <Card key={hw.id} hover>
                  <CardContent className="p-6">
                    <div className="space-y-4">

                  {/* Header Section */}
<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
  <div className="flex-1">
    <h3 className="font-black text-slate-900 text-lg mb-2">
      {hw.title}
    </h3>

    {hw.description && (
      <p className="text-sm text-slate-600 leading-relaxed">
        {hw.description}
      </p>
    )}
  </div>

  <div className="flex flex-wrap gap-2">
    {status === "not_submitted" && (
      <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold whitespace-nowrap">
        لم يتم التسليم
      </span>
    )}

    {status === "submitted" && (
      <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold whitespace-nowrap">
        تم التسليم
      </span>
    )}

    {status === "corrected" && (
      <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold whitespace-nowrap">
        تم التصحيح
      </span>
    )}
  </div>
</div>

{(hw.attachment_pdf || hw.attachment_image) && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-center justify-between">

      <div>
        <p className="font-bold">
          ملفات الواجب
        </p>
      </div>

      <div className="flex gap-2">

        {hw.attachment_pdf && (
          <a
            href={hw.attachment_pdf}
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" variant="outline">
              <Eye size={14} />
              PDF
            </Button>
          </a>
        )}

        {hw.attachment_image && (
          <a
            href={hw.attachment_image}
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm">
              <Eye size={14} />
              صورة
            </Button>
          </a>
        )}

      </div>

    </div>
  </div>
)}
                      {/* Grade Display */}
                      {status === "corrected" && hw.submission?.grade !== null && hw.submission?.grade !== undefined && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-emerald-100 p-2 rounded-lg">
                                <CheckCircle className="text-emerald-600" size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">درجة الواجب</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-2xl font-black text-emerald-600">
                                {hw.submission.grade}
{hw.total_score && (
  <span className="text-lg text-slate-500">
    / {hw.total_score}
  </span>
)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Teacher Feedback */}
                      {hw.submission?.teacher_comment && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                              <FileText className="text-slate-600" size={18} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-900 text-sm mb-1">ملاحظات المعلم</p>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {hw.submission.teacher_comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Student Submission Display */}
                      {hw.submission && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-slate-100 p-2 rounded-lg">
                                <FileText className="text-slate-600" size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">ملفك المرفوع</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {hw.submission.answer?.split("/").pop()}
                                </p>
                              </div>
                            </div>
                            <a
                              href={hw.submission.answer}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button size="sm" variant="outline">
                                <Eye size={14} />
                                عرض الملف
                              </Button>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Upload Section */}
                      <div className="border-t pt-4">
                        {hw.submitted && canUpload && (
                          <p className="text-amber-600 text-sm font-medium mb-3 flex items-center gap-2">
                            <AlertCircle size={16} />
                            سيتم استبدال الملف السابق عند رفع ملف جديد
                          </p>
                        )}

                        <div className="flex flex-wrap gap-3">
{/* PDF Upload */}
<div>
  <input
    id={`pdf-${hw.id}`}
    type="file"
    accept=".pdf"
    hidden
    disabled={!canUpload || uploading}
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      await uploadHomework(file, hw.id);

      // يسمح برفع نفس الملف مرة أخرى
      e.target.value = "";
    }}
  />

  <label htmlFor={`pdf-${hw.id}`}>
    <Button
      size="sm"
      disabled={!canUpload || uploading}
      type="button"
    >
      <Upload size={14} />
      {uploading ? "جاري الرفع..." : "رفع PDF"}
    </Button>
  </label>
</div>

{/* Image Upload */}
<div>
  <input
    id={`image-${hw.id}`}
    type="file"
    accept="image/*"
    hidden
    disabled={!canUpload || uploading}
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      await uploadHomework(file, hw.id);

      // يسمح برفع نفس الصورة مرة أخرى
      e.target.value = "";
    }}
  />

  <label htmlFor={`image-${hw.id}`}>
    <Button
      variant="outline"
      size="sm"
      disabled={!canUpload || uploading}
      type="button"
    >
      <Upload size={14} />
      {uploading ? "جاري الرفع..." : "رفع صورة"}
    </Button>
  </label>
</div>

{hw.status === "interactive" && (
  <Button variant="success" size="sm">
    <FileText size={14} />
    ابدأ الحل
  </Button>
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
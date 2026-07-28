import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, FileText, CheckCircle, Eye, AlertCircle } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";

export function HomeworkDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [homework, setHomework] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    loadHomework();
  }, [id]);

  const loadHomework = async () => {
    if (!id || !user?.id) return;

    setLoading(true);

    const { data: hw, error } = await supabase
      .from("homeworks")
      .select("*")
      .eq("course_item_id", id)
      .single();

    console.log(hw);
    console.log(error);

    if (hw) {
      setHomework(hw);

      const { data: sub } = await supabase
        .from("homework_submissions")
        .select("*")
        .eq("homework_id", hw.id)
        .eq("student_id", Number(user.id))
        .maybeSingle();

      setSubmission(sub);
    }

    setLoading(false);
  };

  const uploadHomework = async (file: File) => {
    if (!user?.id || !homework?.id) return;

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
        .eq("homework_id", homework.id)
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
            homework_id: homework.id,
            student_id: Number(user.id),
            answer: data.publicUrl
          });

        if (submitError) {
          console.error(submitError);
          return;
        }
      }

      await loadHomework();
      alert("تم رفع الواجب بنجاح");
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const getStatus = () => {
    if (!submission) return "not_submitted";
    if (submission.grade !== null && submission.grade !== undefined) return "corrected";
    return "submitted";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        جاري تحميل الواجب...
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        لم يتم العثور على الواجب
      </div>
    );
  }

  const status = getStatus();
  const canUpload = homework.allow_file_upload;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            رجوع
          </Button>
          <h1 className="text-2xl font-black text-slate-900">تفاصيل الواجب</h1>
          <p className="text-slate-500 text-sm mt-1">
            عرض التفاصيل وتسليم الواجب
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {homework.title}
                </h2>

                {homework.description && (
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    {homework.description}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex gap-3 flex-wrap">
                {status === "not_submitted" && (
                  <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                    لم يتم التسليم
                  </span>
                )}

                {status === "submitted" && (
                  <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                    تم التسليم
                  </span>
                )}

                {status === "corrected" && (
                  <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                    تم التصحيح
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teacher Attachments */}
          {(homework.attachment_pdf || homework.attachment_image) && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">ملفات الواجب</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        المرفقات من المعلم
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {homework.attachment_pdf && (
                      <a
                        href={homework.attachment_pdf}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="sm">
                          <Eye size={14} />
                          عرض PDF
                        </Button>
                      </a>
                    )}

                    {homework.attachment_image && (
                      <a
                        href={homework.attachment_image}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          <Eye size={14} />
                          عرض الصورة
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grade Display */}
          {status === "corrected" && submission?.grade !== null && submission?.grade !== undefined && (
            <Card>
              <CardContent className="p-6">
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
                        {submission.grade}
                        {homework.total_score && (
                          <span className="text-lg text-slate-500"> / {homework.total_score}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teacher Comment */}
          {submission?.teacher_comment && (
            <Card>
              <CardContent className="p-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                      <FileText className="text-slate-600" size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm mb-2">ملاحظات المعلم</p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {submission.teacher_comment}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Submission */}
          {submission && (
            <Card>
              <CardContent className="p-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <FileText className="text-slate-600" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">ملفك المرفوع</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {submission.answer?.split("/").pop()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={submission.answer}
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
              </CardContent>
            </Card>
          )}

          {/* Upload Section */}
          {canUpload && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-slate-900 mb-1">رفع الواجب</p>
                    <p className="text-sm text-slate-500">
                      اختر ملف PDF أو صورة لرفع إجابتك
                    </p>
                  </div>

                  {submission && (
                    <p className="text-amber-600 text-sm font-medium flex items-center gap-2">
                      <AlertCircle size={16} />
                      سيتم استبدال الملف السابق عند رفع ملف جديد
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {/* PDF Upload */}
                    <div>
                      <input
                        id="pdf-upload"
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
                      <label htmlFor="pdf-upload">
                        <Button
                          size="sm"
                          disabled={uploading}
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
                        id="image-upload"
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
                      <label htmlFor="image-upload">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={uploading}
                          type="button"
                        >
                          <Upload size={14} />
                          {uploading ? "جاري الرفع..." : "رفع صورة"}
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {homework.allow_text_answer && (
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="font-bold text-slate-900 mb-2">إجابة نصية</p>
                  <p className="text-sm text-slate-500">
                    يمكنك كتابة إجابتك هنا مباشرة
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
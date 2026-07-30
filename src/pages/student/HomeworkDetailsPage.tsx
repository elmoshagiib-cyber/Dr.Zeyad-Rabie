import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, FileText, CheckCircle, Eye, AlertCircle, ArrowRight, Image as ImageIcon, FileType } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";
import { useRef } from "react";

export function HomeworkDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [homework, setHomework] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState<string>("");
  const [uploadError, setUploadError] = useState("");

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

    const isReplacement = !!submission;

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadSuccess("");
      setUploadError("");

      // Smooth progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 30) {
            clearInterval(progressInterval);
            return 30;
          }
          return prev + 5;
        });
      }, 100);

      const fileName = `${Date.now()}-${file.name}`;
      console.log(file.type);
      console.log(file.name);

      const { error: uploadError } = await supabase.storage
        .from("homework-files")
        .upload(fileName, file);

      clearInterval(progressInterval);
      setUploadProgress(60);
      console.log(uploadError);

      if (uploadError) {
        setUploadError("حدث خطأ أثناء رفع الملف");
        console.error(uploadError);
        setUploadProgress(0);
        return;
      }

      const { data } = supabase.storage
        .from("homework-files")
        .getPublicUrl(fileName);

      setUploadProgress(75);

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
            file_url: data.publicUrl,
            file_name: file.name,
            submitted_at: new Date().toISOString()
          })
          .eq("id", existing.id);

        if (submitError) {
console.error("DATABASE ERROR:", submitError);

alert(JSON.stringify(submitError, null, 2));

setUploadError(submitError.message);
          setUploadProgress(0);
          return;
        }
      } else {
        const { error: submitError } = await supabase
          .from("homework_submissions")
          
          .insert({
            homework_id: homework.id,
            student_id: Number(user.id),
            file_url: data.publicUrl,
            file_name: file.name
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

      // Show success message
      if (isReplacement) {
        setUploadSuccess("✅ تم استبدال الملف بنجاح");
      } else {
        setUploadSuccess("✅ تم تسليم الواجب بنجاح");
      }

      // Hide success message after 5 seconds
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

  const getStatus = (): "not_submitted" | "submitted" | "corrected" => {
    if (!submission) return "not_submitted";

    if (submission.grade !== null && submission.grade !== undefined) {
      return "corrected";
    }

    return "submitted";
  };

  const getFileType = (fileName: string): "pdf" | "image" | "unknown" => {
    if (!fileName) return "unknown";
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    return 'unknown';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090B]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-bold">جاري تحميل الواجب...</p>
        </div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090B]">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-bold text-lg">لم يتم العثور على الواجب</p>
          <Button
            onClick={() => navigate(-1)}
            className="mt-4 bg-[#B348FE] hover:bg-[#9E2FFF]"
          >
            العودة
          </Button>
        </div>
      </div>
    );
  }

  const status = getStatus();
  const canUpload = homework.allow_file_upload && status !== "corrected";
  const fileType = submission?.file_name ? getFileType(submission.file_name) : 'unknown';

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#09090B]" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#09090B] border-b border-gray-100 dark:border-[#2A2A2A] px-6 lg:px-8 py-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4 border-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] font-bold transition-all duration-200"
          >
            <ArrowRight size={16} />
            رجوع
          </Button>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
            تفاصيل الواجب
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base mt-1">
            عرض التفاصيل وتسليم الواجب
          </p>
        </div>

        <div className="p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-5xl mx-auto">
          {/* Header Card */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
            <CardContent className="p-6 lg:p-8 space-y-5">
              <div>
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-3">
                  {homework.title}
                </h2>

                {homework.description && (
                  <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed text-sm lg:text-base">
                    {homework.description}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex gap-3 flex-wrap">
                {status === "not_submitted" && (
                  <span className="px-4 lg:px-5 py-2 lg:py-2.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm font-black border border-amber-200 dark:border-amber-900 transition-all duration-200">
                    لم يتم التسليم
                  </span>
                )}

                {status === "submitted" && (
                  <span className="px-4 lg:px-5 py-2 lg:py-2.5 rounded-full bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] text-sm font-black border border-[#EAD8FF] dark:border-[#2A2A2A] transition-all duration-200">
                    تم التسليم
                  </span>
                )}

                {status === "corrected" && (
                  <span className="px-4 lg:px-5 py-2 lg:py-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-black border border-emerald-200 dark:border-emerald-900 transition-all duration-200">
                    تم التصحيح
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teacher Attachments */}
          {(homework.attachment_pdf || homework.attachment_image) && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#F6EEFF] dark:bg-[#2B103D] p-3 rounded-2xl transition-all duration-200">
                      <FileText className="text-[#B348FE]" size={24} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white text-base">ملفات الواجب</p>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        المرفقات من المعلم
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {homework.attachment_pdf && (
                      <a
                        href={homework.attachment_pdf}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button 
                          size="sm"
                          className="bg-[#B348FE] hover:bg-[#9E2FFF] font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#B348FE]/30"
                        >
                          <Eye size={16} />
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] font-bold transition-all duration-200"
                        >
                          <Eye size={16} />
                          عرض الصورة
                        </Button>
                      </a>
                    )}
                  </div>

                  {/* Preview Section for Teacher Attachments */}
                  {homework.attachment_pdf && (
                    <div className="mt-4 border-2 border-gray-200 dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
                      <iframe
                        src={homework.attachment_pdf}
                        className="w-full h-[500px]"
                        title="معاينة ملف PDF"
                      />
                    </div>
                  )}

                  {homework.attachment_image && !homework.attachment_pdf && (
                    <div className="mt-4 border-2 border-gray-200 dark:border-[#2A2A2A] rounded-2xl overflow-hidden p-4 bg-gray-50 dark:bg-[#1A1A1A]">
                      <img
                        src={homework.attachment_image}
                        alt="مرفق الواجب"
                        className="w-full h-auto rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                        onClick={() => window.open(homework.attachment_image, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grade Display */}
          {status === "corrected" && submission?.grade !== null && submission?.grade !== undefined && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md animate-fadeIn">
              <CardContent className="p-6 lg:p-8">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900 rounded-2xl p-5 lg:p-6 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl transition-all duration-200">
                        <CheckCircle className="text-emerald-600 dark:text-emerald-500" size={24} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-base">درجة الواجب</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-500">
                        {submission.grade}
                        {homework.total_score && (
                          <span className="text-xl lg:text-2xl text-gray-500 dark:text-gray-400 font-bold">
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
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md animate-fadeIn">
              <CardContent className="p-6 lg:p-8">
                <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-5 lg:p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#F6EEFF] dark:bg-[#2B103D] p-3 rounded-xl flex-shrink-0 transition-all duration-200">
                      <FileText className="text-[#B348FE]" size={22} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-900 dark:text-white text-base mb-2">
                        ملاحظات المعلم
                      </p>
                      <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
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
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md animate-fadeIn">
              <CardContent className="p-6 lg:p-8">
                <div className="space-y-5">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A1A1A] dark:to-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-5 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm transition-all duration-200">
                          {fileType === 'pdf' && <FileType className="text-red-500" size={24} />}
                          {fileType === 'image' && <ImageIcon className="text-blue-500" size={24} />}
                          {fileType === 'unknown' && <FileText className="text-gray-600 dark:text-gray-400" size={24} />}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white text-base">ملفك المرفوع</p>
                          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {submission.file_name}
                          </p>
                          {submission.submitted_at && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              آخر رفع: {formatDate(submission.submitted_at)}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            النوع: {fileType === 'pdf' ? 'PDF' : fileType === 'image' ? 'صورة' : 'ملف'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={submission.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] font-bold w-full sm:w-auto transition-all duration-200"
                        >
                          <Eye size={16} />
                          فتح في تبويب جديد
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* File Preview */}
                  {submission.file_url && (
                    <div className="border-2 border-gray-200 dark:border-[#2A2A2A] rounded-2xl overflow-hidden animate-fadeIn">
                      {fileType === 'pdf' && (
                        <iframe
                          src={submission.file_url}
                          className="w-full h-[600px]"
                          title="معاينة ملف الواجب"
                        />
                      )}
                      {fileType === 'image' && (
                        <div className="p-4 bg-gray-50 dark:bg-[#1A1A1A]">
                          <img
                            src={submission.file_url}
                            alt="ملف الواجب"
                            className="w-full h-auto rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                            onClick={() => window.open(submission.file_url, '_blank')}
                          />
                        </div>
                      )}
                      {fileType === 'unknown' && (
                        <div className="p-8 text-center bg-gray-50 dark:bg-[#1A1A1A]">
                          <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
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
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
              <CardContent className="p-6 lg:p-8">
                <div className="space-y-5">
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-lg mb-2">
                      {submission ? "استبدال الواجب" : "رفع الواجب"}
                    </p>
                    <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                      {submission
                        ? "يمكنك استبدال الملف الحالي قبل أن يقوم المعلم بالتصحيح."
                        : "اختر ملف PDF أو صورة لرفع إجابتك."}
                    </p>
                  </div>

                  {/* Status Messages */}
                  {status === "submitted" && !uploading && !uploadSuccess && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 animate-fadeIn">
                      <p className="text-amber-700 dark:text-amber-400 text-sm font-bold flex items-center gap-2">
                        <AlertCircle size={18} />
                        تم تسليم الواجب بالفعل، ويمكنك استبدال الملف حتى يقوم المعلم بالتصحيح.
                      </p>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-2xl p-5 border border-gray-200 dark:border-[#2A2A2A]">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            جاري رفع الملف...
                          </p>
                          <p className="text-sm font-black text-[#B348FE]">
                            {uploadProgress}%
                          </p>
                        </div>
                        <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#B348FE] to-[#9E2FFF] transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-center mt-4">
                          <div className="w-8 h-8 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 animate-fadeIn">
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle size={18} />
                        {uploadSuccess}
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadError && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 animate-fadeIn">
                      <p className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                        <AlertCircle size={18} />
                        {uploadError}
                      </p>
                    </div>
                  )}

                  {/* Upload Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {/* PDF Upload */}
                    <div>
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
                        className="bg-[#B348FE] hover:bg-[#9E2FFF] shadow-md hover:shadow-[0_8px_20px_rgba(179,72,254,.35)] font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload size={16} />
                        {uploading
                          ? "جاري الرفع..."
                          : submission
                            ? "استبدال PDF"
                            : "رفع PDF"}
                      </Button>
                    </div>

                    {/* Image Upload */}
                    <div>
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
                        className="border-2 hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] hover:border-[#B348FE] font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload size={16} />
                        {uploading
                          ? "جاري الرفع..."
                          : submission
                            ? "استبدال صورة"
                            : "رفع صورة"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Corrected Status Message */}
          {status === "corrected" && homework.allow_file_upload && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm animate-fadeIn">
              <CardContent className="p-6 lg:p-8">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <p className="text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
                    <CheckCircle size={18} />
                    تم تصحيح الواجب، ولا يمكن استبدال الملف بعد التصحيح.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {homework.allow_text_answer && (
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm transition-all duration-300 hover:shadow-md">
              <CardContent className="p-6 lg:p-8">
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-lg mb-2">إجابة نصية</p>
                  <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                    يمكنك كتابة إجابتك هنا مباشرة
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Add Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
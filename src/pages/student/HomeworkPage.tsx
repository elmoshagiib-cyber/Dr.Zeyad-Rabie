import { Upload, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
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
  const pdfRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (user?.id) {
      loadHomeworks();
    }
  }, [user]);

  const submitted =
  homeworks.filter(h => h.submitted).length;

const pending =
  homeworks.filter(h => !h.submitted).length;

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

return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-black text-slate-900">الواجبات</h1>
          <p className="text-slate-500 text-sm">
            متابعة وتسليم جميع الواجبات الدراسية
          </p>
        </div>

        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">تم التسليم</p>
                    <p className="text-3xl font-black text-emerald-600">
                      {submitted}
                    </p>
                  </div>
                  <CheckCircle className="text-emerald-500" size={30} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">قيد الانتظار</p>
                    <p className="text-3xl font-black text-amber-600">
                      {pending}
                    </p>
                  </div>
                  <Clock className="text-amber-500" size={30} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">واجبات تفاعلية</p>
                    <p className="text-3xl font-black text-blue-600">
                      {interactive}
                    </p>
                  </div>
                  <AlertCircle className="text-blue-500" size={30} />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Homework List */}
          <div className="space-y-4">

            {homeworks.map(hw => (
              <Card key={hw.id} hover>
                <CardContent className="p-5">

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                      <h3 className="font-black text-slate-900">
                        {hw.title}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {hw.description}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        موعد التسليم: {new Date(hw.due_date).toLocaleDateString("ar-EG", {
  day: "numeric",
  month: "long",
})}
                      </p>
                      {hw.submission && (
  <div className="mt-2 flex gap-3">
{hw.submission?.grade !== null &&
 hw.submission?.grade !== undefined && (
  <div className="mt-2">
    <span className="text-blue-600 font-bold">
      الدرجة: {hw.submission.grade}
    </span>
  </div>
)}
    <span className="text-green-600 text-sm font-bold">
  {hw.submission.answer.split("/").pop()}
</span>
{hw.submission.grade !== null &&
 hw.submission.grade !== undefined && (
  <span className="text-blue-600 text-sm font-bold">
    الدرجة: {hw.submission.grade}
  </span>
)}
    <a
      href={hw.submission.answer}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 text-sm font-bold"
    >
      عرض الملف
    </a>

  </div>
)}
                    </div>

                    <div className="flex flex-wrap gap-2">

                     {hw.submitted ? (
  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
    تم التسليم
  </span>
) : (
  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
    لم يتم التسليم
  </span>
)}

                    </div>
                  </div>
{hw.submitted && (
  <p className="text-green-600 text-sm font-bold">
    يمكنك رفع ملف جديد وسيتم استبدال الملف السابق
  </p>
)}
<div 
className="flex flex-wrap gap-3 mt-5">
{/* PDF */}
<label>
  <input
  ref={pdfRef}
  type="file"
  accept=".pdf"
  hidden
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadHomework(file, hw.id);
  }}
/>

<Button
  size="sm"
  onClick={() => pdfRef.current?.click()}
>
  رفع PDF
</Button>
</label>
{/* IMAGE */}
<label>
<input
  ref={imageRef}
  type="file"
  accept="image/*"
  hidden
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadHomework(file, hw.id);
  }}
/>

<Button
  variant="outline"
  size="sm"
  onClick={() => imageRef.current?.click()}
>
  رفع صورة
</Button>
</label>
             {hw.status === "interactive" && (
  <Button variant="success" size="sm">
    <FileText size={14} />
    ابدأ الحل
  </Button>
)}

</div>

</CardContent>
</Card>
            ))}

          </div>
        </div>
      </main>
    </div>
  );
}

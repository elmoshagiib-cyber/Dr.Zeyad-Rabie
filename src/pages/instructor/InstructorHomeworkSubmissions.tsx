import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
export function InstructorHomeworkSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<number, number>>({});
  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
   const { data, error } = await supabase
  .from("homework_submissions")
  .select(`
    *,
    homeworks(*)
  `);

if (error) {
  console.error(error);
  return;
}

const submissionsWithStudents = await Promise.all(
  (data || []).map(async (item) => {
    const { data: student } = await supabase
      .from("students")
      .select("full_name")
      .eq("id", item.student_id)
      .single();

    return {
      ...item,
      student_name: student?.full_name || "غير معروف",
    };
  })
);

setSubmissions(submissionsWithStudents);
return;

    if (error) {
      console.error(error);
      return;
    }

    setSubmissions(data || []);
  };

  return (
  <div
    className="flex h-screen bg-slate-50 overflow-hidden"
    dir="rtl"
  >
    <div className="hidden lg:block flex-shrink-0">
      <DashboardSidebar type="instructor" />
    </div>

    <main className="flex-1 overflow-y-auto">
      <div className="bg-white dark:bg-[#130726] border-b border-slate-200 px-6 py-5">
      <h1 className="text-2xl font-bold mb-5">
  تسليمات الطلاب
</h1>
</div>
<p>{submissions.length}</p>

      {submissions.map((item) => (
        <div
          key={item.id}
          className="border p-4 rounded-lg mb-3"
        >
          <p>Submission ID: {item.id}</p>
          <p>الواجب: {item.homeworks?.title}</p>
          <p>الطالب: {item.student_name}</p>
          <p>
  تاريخ التسليم:
  {new Date(item.submitted_at).toLocaleDateString("ar-EG")}
</p>
<div className="flex gap-2 mt-3">
  <button
    onClick={() => {
      window.open(item.answer, "_blank");
    }}
    className="text-blue-600"
  >
    عرض الملف
  </button>

  <input
  type="number"
  placeholder="الدرجة"
  value={grades[item.id] ?? item.grade ?? ""}
  onChange={(e) =>
    setGrades({
      ...grades,
      [item.id]: Number(e.target.value),
    })
  }
  className="border rounded px-2 py-1"
/>

  <button
  onClick={async () => {
    await supabase
      .from("homework_submissions")
      .update({
        grade: grades[item.id],
      })
      .eq("id", item.id);

    alert("تم حفظ الدرجة");
    loadSubmissions();
  }}
  className="bg-green-600 text-white px-3 py-1 rounded"
>
  حفظ الدرجة
</button>
</div>
        </div>
      ))}
          </main>
    </div>
  );
}
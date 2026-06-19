import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Save,
  Search,
  Filter,
} from "lucide-react";

export function InstructorHomeworkSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [grades, setGrades] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [homeworkFilter, setHomeworkFilter] = useState("الكل");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("homework_submissions")
      .select(`*, homeworks(*)`)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
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
    setLoading(false);
  };

  const gradedCount = submissions.filter((s) => s.grade !== null).length;
  const pendingCount = submissions.length - gradedCount;

  const homeworkOptions = useMemo(() => {
    const titles = submissions.map((s) => s.homeworks?.title).filter(Boolean);
    return ["الكل", ...Array.from(new Set(titles))];
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const matchesSearch =
        item.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.homeworks?.title?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "الكل" ||
        (statusFilter === "تم التصحيح" && item.grade !== null) ||
        (statusFilter === "بانتظار التصحيح" && item.grade === null);

      const matchesHomework =
        homeworkFilter === "الكل" ||
        item.homeworks?.title === homeworkFilter;

      return matchesSearch && matchesStatus && matchesHomework;
    });
  }, [submissions, search, statusFilter, homeworkFilter]);

  const saveGrade = async (id: number) => {
    if (grades[id] === undefined) {
      alert("من فضلك أدخل الدرجة أولاً");
      return;
    }

    await supabase
      .from("homework_submissions")
      .update({ grade: grades[id] })
      .eq("id", id);

    alert("✅ تم حفظ الدرجة بنجاح");
    loadSubmissions();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Hero */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-10 py-8 text-white shadow-[0_10px_40px_rgba(37,99,235,0.25)]">
            <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-white/10 p-4 rounded-2xl">
              <FileText size={36} />
            </div>

            <h1 className="text-4xl font-black">تسليمات الطلاب</h1>
            <p className="text-blue-100 mt-3 text-lg">
              مراجعة الواجبات وتقييم أداء الطلاب بسهولة واحترافية
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FileText className="text-blue-600" />}
            title="إجمالي التسليمات"
            value={submissions.length}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="text-green-600" />}
            title="تم التصحيح"
            value={gradedCount}
            color="green"
          />
          <StatCard
            icon={<Clock className="text-orange-600" />}
            title="بانتظار التصحيح"
            value={pendingCount}
            color="orange"
          />
        </div>

        {/* Filters */}
        <Card className="bg-white rounded-[32px] border border-slate-100 shadow-sm mb-8">
          <CardContent className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-black mb-1 flex items-center gap-2">
                <Filter size={20} />
                البحث والفلاتر
              </h3>
              <p className="text-slate-500">
                ابحث وقم بتصفية التسليمات بسهولة
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="اسم الطالب أو الواجب..."
                  className="pr-10"
                />
              </div>

              <select
                value={homeworkFilter}
                onChange={(e) => setHomeworkFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-5 py-3 bg-white"
              >
                {homeworkOptions.map((hw, idx) => (
                  <option key={idx}>{hw}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl px-5 py-3 bg-white"
              >
                <option>الكل</option>
                <option>تم التصحيح</option>
                <option>بانتظار التصحيح</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            جاري تحميل البيانات...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            لا توجد نتائج مطابقة
          </div>
        ) : (
          filteredSubmissions.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 mb-6 hover:shadow-md transition"
            >
              <div className="flex flex-col lg:flex-row-reverse gap-6">
                {/* Preview */}
                <div className="lg:w-1/2">
                  <div className="border rounded-2xl overflow-hidden h-[420px] bg-slate-100">
                    {item.answer ? (
                      <iframe
                        src={item.answer}
                        title={`submission-${item.id}`}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        لا يوجد ملف مرفق
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="lg:w-1/2 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {item.student_name}
                      </h2>
                      <p className="text-slate-500 mt-1">
                        {item.homeworks?.title}
                      </p>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        item.grade !== null
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.grade !== null
                        ? "تم التصحيح"
                        : "بانتظار التصحيح"}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600 mb-6">
                    <div className="flex justify-between">
                      <span>رقم التسليم</span>
                      <span>#{item.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>تاريخ التسليم</span>
                      <span>
                        {new Date(item.submitted_at).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <label className="block mb-2 font-semibold">
                      الدرجة
                    </label>

                    <input
                      type="number"
                      placeholder="أدخل الدرجة"
                      value={grades[item.id] ?? item.grade ?? ""}
                      onChange={(e) =>
                        setGrades({
                          ...grades,
                          [item.id]: Number(e.target.value),
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => saveGrade(item.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition"
                      >
                        <Save size={18} />
                        حفظ الدرجة
                      </button>

                      <button
                        onClick={() =>
                          item.answer && window.open(item.answer, "_blank")
                        }
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition"
                      >
                        <Eye size={18} />
                        عرض الملف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

/* Small reusable stat card */
function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "blue" | "green" | "orange";
}) {
  const bg =
    color === "blue"
      ? "bg-blue-100"
      : color === "green"
      ? "bg-green-100"
      : "bg-orange-100";

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-slate-500">{title}</p>
          <h3 className="text-3xl font-black">{value}</h3>
        </div>
      </div>
    </div>
  );
}
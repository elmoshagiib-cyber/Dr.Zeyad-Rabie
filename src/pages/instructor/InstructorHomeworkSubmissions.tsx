import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { DashboardSidebar } from "../../components/layout/dashboard/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Save,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  User,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  Image as ImageIcon,
  FileType,
  X,
  RotateCcw,
} from "lucide-react";

interface Submission {
  id: number;
  student_id: number;
  homework_id: number;
  file_url?: string;
  file_name?: string;
  text_answer?: string;
  answer?: string;
  grade?: number;
  feedback?: string;
  submitted_at: string;
  student_name?: string;

  // تفاعلي (أسئلة اختيارات + مقالي)
  answers?: Record<string, any>;
  auto_score?: number;
  correct_count?: number;
  total_auto_questions?: number;
  has_essay?: boolean;

  homeworks?: {
    title: string;
    total_score?: number;
    course_id?: string;

    courses?: {
      grade?: string;
      title?: string;
    };
  };
}

interface EssayQuestion {
  id: number;
  title: string;
  points: number;
  correct_text?: string;
  image_url?: string;
}

const GRADE_LABELS: Record<string, string> = {
  prep_1: "أولى إعدادي",
  prep_2: "ثانية إعدادي",
  prep_3: "ثالثة إعدادي",
  sec_1: "أولى ثانوي",
  sec_2: "ثانية ثانوي",
  sec_3: "ثالثة ثانوي",
};

const GRADE_OPTIONS = [
  "الكل",
  "أولى إعدادي",
  "ثانية إعدادي",
  "ثالثة إعدادي",
  "أولى ثانوي",
  "ثانية ثانوي",
  "ثالثة ثانوي",
];

export function InstructorHomeworkSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grades, setGrades] = useState<Record<number, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [homeworkFilter, setHomeworkFilter] = useState("الكل");
  const [gradeFilter, setGradeFilter] = useState("الكل");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
 const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([]);
  const [loadingEssayQuestions, setLoadingEssayQuestions] = useState(false);
  // على الموبايل: نتحكم هل نعرض القائمة ولا التفاصيل
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");


  useEffect(() => {
    loadSubmissions();
  }, []);

  // تحميل أسئلة المقالي بتاعة الواجب لما يتغيّر التسليم المختار
  useEffect(() => {
    if (!selectedSubmission?.answers) {
      setEssayQuestions([]);
      return;
    }

    const loadEssayQuestions = async () => {
      setLoadingEssayQuestions(true);
      const { data } = await supabase
        .from("homework_questions")
        .select("id, title, points, correct_text, image_url")
        .eq("homework_id", selectedSubmission.homework_id)
        .eq("type", "essay")
        .order("sort_order", { ascending: true });

      setEssayQuestions(data || []);
      setLoadingEssayQuestions(false);
    };

    loadEssayQuestions();
  }, [selectedSubmission?.id]);

  const loadSubmissions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("homework_submissions")
      .select(
        `
        *,
        homeworks (
          *,
          courses (
            grade,
            title
          )
        )
      `
      )
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

  const gradedCount = submissions.filter((s) => s.grade !== null && s.grade !== undefined).length;
  const pendingCount = submissions.length - gradedCount;

  const averageGrade = useMemo(() => {
    const graded = submissions.filter(
      (s) => s.grade !== null && s.grade !== undefined && s.homeworks?.total_score
    );
    if (graded.length === 0) return null;
    const sum = graded.reduce((acc, s) => acc + (s.grade! / (s.homeworks!.total_score || 100)) * 100, 0);
    return Math.round(sum / graded.length);
  }, [submissions]);

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
        (statusFilter === "تم التصحيح" && item.grade !== null && item.grade !== undefined) ||
        (statusFilter === "بانتظار التصحيح" && (item.grade === null || item.grade === undefined));

      const matchesHomework = homeworkFilter === "الكل" || item.homeworks?.title === homeworkFilter;

      const gradeName = GRADE_LABELS[item.homeworks?.courses?.grade || ""] || "";
      const matchesGrade = gradeFilter === "الكل" || gradeName === gradeFilter;

      return matchesSearch && matchesStatus && matchesHomework && matchesGrade;
    });
  }, [submissions, search, statusFilter, homeworkFilter, gradeFilter]);

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "الكل" ||
    homeworkFilter !== "الكل" ||
    gradeFilter !== "الكل";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("الكل");
    setHomeworkFilter("الكل");
    setGradeFilter("الكل");
  };

  // لو القائمة المفلترة اتغيرت وماعدش فيها العنصر المختار، بنختار أول عنصر تلقائيًا
  useEffect(() => {
    if (filteredSubmissions.length === 0) {
      setSelectedSubmission(null);
      return;
    }

    const stillExists = selectedSubmission
      ? filteredSubmissions.some((s) => s.id === selectedSubmission.id)
      : false;

    if (!stillExists) {
      setSelectedSubmission(filteredSubmissions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSubmissions]);

  const selectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setMobileView("detail");
  };

  const saveGrade = async (id: number) => {
    const gradeValue = grades[id];
    const feedbackValue = feedbacks[id];

    if (gradeValue === undefined || gradeValue === null || Number.isNaN(gradeValue)) {
      alert("من فضلك أدخل الدرجة أولاً");
      return;
    }

    setSaving(true);

    const updateData: any = { grade: gradeValue };
    if (feedbackValue !== undefined) {
      updateData.feedback = feedbackValue;
    }

    const { error } = await supabase.from("homework_submissions").update(updateData).eq("id", id);

    if (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحفظ");
      setSaving(false);
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, grade: gradeValue, feedback: feedbackValue ?? s.feedback } : s))
    );

    if (selectedSubmission?.id === id) {
      setSelectedSubmission((prev) =>
        prev ? { ...prev, grade: gradeValue, feedback: feedbackValue ?? prev.feedback } : null
      );
    }

    setSaving(false);

    const newGrades = { ...grades };
    delete newGrades[id];
    setGrades(newGrades);

    const newFeedbacks = { ...feedbacks };
    delete newFeedbacks[id];
    setFeedbacks(newFeedbacks);
  };

  const getFileType = (submission: Submission): "pdf" | "image" | "text" | "none" => {
    const fileUrl = submission.file_url || submission.answer;
    const fileName = submission.file_name;

    if (!fileUrl && !submission.text_answer) return "none";
    if (!fileUrl && submission.text_answer) return "text";

    if (fileName) {
      const ext = fileName.toLowerCase().split(".").pop();
      if (ext === "pdf") return "pdf";
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return "image";
    }

    if (fileUrl?.includes(".pdf")) return "pdf";
    if (fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) return "image";

    return "none";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handlePrevious = () => {
    if (!selectedSubmission) return;
    const currentIdx = filteredSubmissions.findIndex((s) => s.id === selectedSubmission.id);
    if (currentIdx > 0) setSelectedSubmission(filteredSubmissions[currentIdx - 1]);
  };

  const handleNext = () => {
    if (!selectedSubmission) return;
    const currentIdx = filteredSubmissions.findIndex((s) => s.id === selectedSubmission.id);
    if (currentIdx < filteredSubmissions.length - 1) setSelectedSubmission(filteredSubmissions[currentIdx + 1]);
  };

  const currentIndex = selectedSubmission
    ? filteredSubmissions.findIndex((s) => s.id === selectedSubmission.id) + 1
    : 0;

  const statCards = [
    {
      label: "إجمالي التسليمات",
      value: submissions.length,
      icon: <FileText className="text-violet-600" size={26} />,
      bg: "bg-violet-100",
    },
    {
      label: "تم التصحيح",
      value: gradedCount,
      icon: <CheckCircle className="text-emerald-600" size={26} />,
      bg: "bg-emerald-100",
      valueClass: "text-emerald-600",
    },
    {
      label: "بانتظار التصحيح",
      value: pendingCount,
      icon: <Clock className="text-amber-600" size={26} />,
      bg: "bg-amber-100",
      valueClass: "text-amber-600",
    },
    {
      label: "معدل الدرجات",
      value: averageGrade !== null ? `${averageGrade}%` : "-",
      icon: <TrendingUp className="text-[#B348FE]" size={26} />,
      bg: "bg-[#F6EEFF]",
      valueClass: "text-[#B348FE]",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#09090B]" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#0F172A] via-[#1E1B3A] to-[#2A1B4D] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mx-4 lg:mx-6 mt-4 lg:mt-6 flex-shrink-0"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-[#B348FE]/10 blur-[100px]" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-[#B348FE]/10 blur-[100px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
              <FileText className="text-amber-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">تصحيح الواجبات</h1>
              <p className="text-white/60 text-xs sm:text-sm mt-0.5">مراجعة وتصحيح تسليمات الطلاب</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 p-4 lg:p-6 bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#2A2A2A] flex-shrink-0">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#111111] rounded-2xl lg:rounded-3xl border border-slate-200 dark:border-[#2A2A2A] shadow-sm hover:shadow-lg transition p-4 lg:p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-bold mb-1">{stat.label}</p>
                <div className={`text-xl lg:text-3xl font-black text-gray-900 dark:text-white ${stat.valueClass || ""}`}>
                  {stat.value}
                </div>
              </div>
              <div className={`w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 lg:p-6 bg-white dark:bg-[#09090B] border-b border-gray-200 dark:border-[#2A2A2A] flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <div className="relative xl:col-span-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن طالب أو واجب..."
                className="pr-10 bg-white dark:bg-[#111111] border-gray-200 dark:border-[#2A2A2A] rounded-xl"
              />
            </div>

            <select
              value={homeworkFilter}
              onChange={(e) => setHomeworkFilter(e.target.value)}
              className="w-full border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-4 py-2 bg-white dark:bg-[#111111] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B348FE]"
            >
              {homeworkOptions.map((hw, idx) => (
                <option key={idx}>{hw}</option>
              ))}
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-4 py-2 bg-white dark:bg-[#111111] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B348FE]"
            >
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade}>{grade}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-4 py-2 bg-white dark:bg-[#111111] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#B348FE]"
            >
              <option>الكل</option>
              <option>تم التصحيح</option>
              <option>بانتظار التصحيح</option>
            </select>

          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                {filteredSubmissions.length} نتيجة من {submissions.length}
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-bold text-[#B348FE] hover:text-[#9E2FFF] transition-colors"
              >
                <RotateCcw size={14} />
                مسح الفلاتر
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-bold">جاري تحميل البيانات...</p>
              </div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <FileText className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={64} />
                <p className="text-gray-600 dark:text-gray-400 font-bold text-lg">لا توجد تسليمات</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  {hasActiveFilters ? "جرب تغيير الفلاتر" : "لسه محدش سلّم واجب"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#B348FE] hover:text-[#9E2FFF] transition-colors"
                  >
                    <RotateCcw size={14} />
                    مسح الفلاتر
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Sidebar - Submissions List */}
              <div
                className={`w-full lg:w-80 xl:w-96 border-l border-gray-200 dark:border-[#2A2A2A] overflow-y-auto bg-gray-50 dark:bg-[#0A0A0A] ${
                  mobileView === "detail" ? "hidden lg:block" : "block"
                }`}
              >
                <div className="p-4">
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">
                    {filteredSubmissions.length} تسليم
                  </div>

                  <div className="space-y-2">
                    {filteredSubmissions.map((submission) => (
                      <button
                        key={submission.id}
                        onClick={() => selectSubmission(submission)}
                        className={`w-full text-right p-4 rounded-2xl transition-all duration-200 ${
                          selectedSubmission?.id === submission.id
                            ? "bg-white dark:bg-[#111111] shadow-md border-2 border-[#B348FE]"
                            : "bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B348FE] hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-gray-900 dark:text-white text-sm truncate">
                              {submission.student_name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {submission.homeworks?.title}
                            </p>
                            <p className="text-[11px] font-bold text-[#B348FE] mt-1">
                              {GRADE_LABELS[submission.homeworks?.courses?.grade || ""] || ""}
                            </p>
                          </div>

                           <span
                            className={`px-2 py-1 rounded-lg text-xs font-black whitespace-nowrap ${
                              submission.grade !== null && submission.grade !== undefined
                                ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {submission.grade !== null && submission.grade !== undefined
                              ? "مُصحح"
                              : submission.has_essay
                              ? "بانتظار مراجعة مقالي"
                              : "معلق"}
                          </span>                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                          <Calendar size={12} />
                          <span>{new Date(submission.submitted_at).toLocaleDateString("ar-EG")}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Panel - Submission Details */}
              {selectedSubmission && (
                <div className={`flex-1 overflow-y-auto ${mobileView === "list" ? "hidden lg:block" : "block"}`}>
                  <div className="p-4 lg:p-8 max-w-5xl mx-auto">
                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-6 gap-3">
                      {/* زرار رجوع للقائمة على الموبايل بس */}
                      <button
                        onClick={() => setMobileView("list")}
                        className="lg:hidden flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-300 p-2 rounded-xl border-2 border-gray-200 dark:border-[#2A2A2A] hover:border-[#B348FE] transition-all"
                      >
                        <ArrowRight size={16} />
                        القائمة
                      </button>

                      <div className="text-sm font-bold text-gray-500 dark:text-gray-400 hidden lg:block">
                        {currentIndex} من {filteredSubmissions.length}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handlePrevious}
                          disabled={currentIndex === 1}
                          className="p-2 rounded-xl border-2 border-gray-200 dark:border-[#2A2A2A] hover:border-[#B348FE] hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          title="السابق"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={currentIndex === filteredSubmissions.length}
                          className="p-2 rounded-xl border-2 border-gray-200 dark:border-[#2A2A2A] hover:border-[#B348FE] hover:bg-[#F6EEFF] dark:hover:bg-[#2B103D] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          title="التالي"
                        >
                          <ChevronLeft size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Student Info */}
                    <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm mb-6">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 flex-wrap">
                          <div className="bg-[#F6EEFF] dark:bg-[#2B103D] p-3 rounded-2xl">
                            <User className="text-[#B348FE]" size={24} />
                          </div>
                          <div className="flex-1 min-w-[150px]">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                              {selectedSubmission.student_name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              معرّف الطالب: #{selectedSubmission.student_id}
                            </p>
                          </div>

                          <span
                            className={`px-4 py-2 rounded-full text-sm font-black border ${
                              selectedSubmission.grade !== null && selectedSubmission.grade !== undefined
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                            }`}
                          >
                            {selectedSubmission.grade !== null && selectedSubmission.grade !== undefined
                              ? "تم التصحيح"
                              : "بانتظار التصحيح"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Homework Info */}
                    <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm mb-6">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-2xl">
                            <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3">
                              {selectedSubmission.homeworks?.title}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">تاريخ التسليم</span>
                                <p className="font-bold text-gray-900 dark:text-white mt-1">
                                  {formatDate(selectedSubmission.submitted_at)}
                                </p>
                              </div>
                              {selectedSubmission.homeworks?.total_score && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">الدرجة النهائية</span>
                                  <p className="font-bold text-gray-900 dark:text-white mt-1">
                                    {selectedSubmission.homeworks.total_score}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preview Section */}
                    {selectedSubmission.answers ? (
                      <>
                        {/* ملخص أسئلة الاختيارات (مصححة تلقائيًا) */}
                        {(selectedSubmission.total_auto_questions ?? 0) > 0 && (
                          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm mb-6">
                            <CardContent className="p-6">
                              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-emerald-500" />
                                أسئلة الاختيارات (مصححة تلقائيًا)
                              </h3>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-900 text-center">
                                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mb-1">إجابات صحيحة</p>
                                  <p className="text-2xl font-black text-emerald-600">{selectedSubmission.correct_count ?? 0}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-900 text-center">
                                  <p className="text-[11px] text-blue-700 dark:text-blue-400 font-bold mb-1">عدد الأسئلة</p>
                                  <p className="text-2xl font-black text-blue-600">{selectedSubmission.total_auto_questions ?? 0}</p>
                                </div>
                                <div className="bg-teal-50 dark:bg-teal-950/20 rounded-2xl p-4 border border-teal-200 dark:border-teal-900 text-center">
                                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-bold mb-1">درجة الاختيارات</p>
                                  <p className="text-2xl font-black text-teal-600">{selectedSubmission.auto_score ?? 0}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* الأسئلة المقالية */}
                        <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm mb-6">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Eye size={20} className="text-[#B348FE]" />
                              الأسئلة المقالية
                            </h3>

                            {loadingEssayQuestions ? (
                              <div className="py-10 text-center text-gray-400 text-sm font-bold">جاري التحميل...</div>
                            ) : essayQuestions.length === 0 ? (
                              <div className="text-center py-10 bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl border-2 border-dashed border-gray-300 dark:border-[#2A2A2A]">
                                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">لا توجد أسئلة مقالية في هذا الواجب</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {essayQuestions.map((q, i) => {
                                  const studentAnswer = selectedSubmission.answers?.[String(q.id)]?.text || "";
                                  return (
                                    <div key={q.id} className="border-2 border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-4 sm:p-5">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                                          {q.points === 1 ? "درجة واحدة" : `${q.points} درجات`}
                                        </span>
                                      </div>
                                      <p className="font-bold text-gray-900 dark:text-white text-sm mb-3">
                                        {i + 1}. {q.title}
                                      </p>
                                      {q.image_url && (
                                        <img src={q.image_url} alt="صورة السؤال" className="max-h-48 rounded-xl border border-gray-200 dark:border-[#2A2A2A] mb-3" />
                                      )}
                                      <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-4 mb-2">
                                        <p className="text-[11px] font-black text-gray-500 dark:text-gray-400 mb-1.5">إجابة الطالب:</p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                          {studentAnswer || "لم يجب الطالب على هذا السؤال"}
                                        </p>
                                      </div>
                                      {q.correct_text && (
                                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4">
                                          <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 mb-1.5">الإجابة النموذجية:</p>
                                          <p className="text-sm text-emerald-800 dark:text-emerald-300 whitespace-pre-wrap leading-relaxed">
                                            {q.correct_text}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm mb-6">
                        <CardContent className="p-6">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Eye size={20} className="text-[#B348FE]" />
                            معاينة الإجابة
                          </h3>

                          {(() => {
                            const fileType = getFileType(selectedSubmission);
                            const fileUrl = selectedSubmission.file_url || selectedSubmission.answer;

                            return (
                              <div className="space-y-4">
                                {fileType === "pdf" && fileUrl && (
                                  <div className="border-2 border-gray-200 dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
                                    <iframe src={fileUrl} className="w-full h-[500px] lg:h-[600px]" title="PDF Preview" />
                                    <div className="p-3 bg-gray-50 dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#2A2A2A]">
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-[#B348FE] hover:underline font-bold flex items-center gap-2"
                                      >
                                        <Eye size={16} />
                                        فتح في تبويب جديد
                                      </a>
                                    </div>
                                  </div>
                                )}

                                {fileType === "image" && fileUrl && (
                                  <div className="border-2 border-gray-200 dark:border-[#2A2A2A] rounded-2xl overflow-hidden">
                                    <div className="p-4 bg-gray-50 dark:bg-[#1A1A1A]">
                                      <img
                                        src={fileUrl}
                                        alt="Student Submission"
                                        className="w-full h-auto rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                                        onClick={() => setImagePreview(fileUrl)}
                                      />
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#2A2A2A]">
                                      <button
                                        onClick={() => setImagePreview(fileUrl)}
                                        className="text-sm text-[#B348FE] hover:underline font-bold flex items-center gap-2"
                                      >
                                        <Eye size={16} />
                                        عرض بحجم كامل
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {selectedSubmission.text_answer && (
                                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A1A1A] dark:to-[#151515] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                      <FileText className="text-gray-600 dark:text-gray-400" size={18} />
                                      <h4 className="font-bold text-gray-900 dark:text-white">الإجابة النصية</h4>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                      {selectedSubmission.text_answer}
                                    </p>
                                  </div>
                                )}

                                {fileType === "none" && !selectedSubmission.text_answer && (
                                  <div className="text-center py-16 bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl border-2 border-dashed border-gray-300 dark:border-[#2A2A2A]">
                                    <FileText className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={64} />
                                    <p className="text-gray-500 dark:text-gray-400 font-bold">لم يتم رفع أي ملف</p>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                      الطالب لم يقم بإرفاق إجابة
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    )}

                    {/* Grading Section */}
                    <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Award size={20} className="text-[#B348FE]" />
                          التصحيح
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block mb-2 font-bold text-gray-900 dark:text-white text-sm">
                              الدرجة
                              {selectedSubmission.homeworks?.total_score && (
                                <span className="text-gray-500 dark:text-gray-400 font-normal mr-2">
                                  (من {selectedSubmission.homeworks.total_score})
                                </span>
                              )}
                            </label>
                            <input
                              type="number"
                              placeholder="أدخل الدرجة"
                              value={grades[selectedSubmission.id] ?? selectedSubmission.grade ?? ""}
                              onChange={(e) =>
                                setGrades({
                                  ...grades,
                                  [selectedSubmission.id]: Number(e.target.value),
                                })
                              }
                              className="w-full border-2 border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B348FE] focus:border-[#B348FE] transition-all duration-200"
                            />
                          </div>

                          <div>
                            <label className="block mb-2 font-bold text-gray-900 dark:text-white text-sm">
                              الملاحظات (اختياري)
                            </label>
                            <textarea
                              placeholder="أضف ملاحظات للطالب..."
                              value={feedbacks[selectedSubmission.id] ?? selectedSubmission.feedback ?? ""}
                              onChange={(e) =>
                                setFeedbacks({
                                  ...feedbacks,
                                  [selectedSubmission.id]: e.target.value,
                                })
                              }
                              rows={4}
                              className="w-full border-2 border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B348FE] focus:border-[#B348FE] resize-none transition-all duration-200"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                              onClick={() => saveGrade(selectedSubmission.id)}
                              disabled={saving}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3 px-6 flex items-center justify-center gap-2 transition-all duration-300 font-black shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {saving ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  جاري الحفظ...
                                </>
                              ) : (
                                <>
                                  <Save size={18} />
                                  حفظ التصحيح
                                </>
                              )}
                            </button>

                            {(selectedSubmission.file_url || selectedSubmission.answer) && (
                              <button
                                onClick={() => {
                                  const url = selectedSubmission.file_url || selectedSubmission.answer;
                                  if (url) window.open(url, "_blank");
                                }}
                                className="flex-1 sm:flex-initial bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-2xl py-3 px-6 flex items-center justify-center gap-2 transition-all duration-300 font-black shadow-md hover:shadow-[0_8px_20px_rgba(179,72,254,.35)]"
                              >
                                <Eye size={18} />
                                عرض الملف
                              </button>
                            )}
                          </div>

                          {selectedSubmission.grade !== null && selectedSubmission.grade !== undefined && (
                            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                  الدرجة الحالية
                                </span>
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500">
                                  {selectedSubmission.grade}
                                  {selectedSubmission.homeworks?.total_score && (
                                    <span className="text-lg text-gray-500 dark:text-gray-400">
                                      {" "}
                                      / {selectedSubmission.homeworks.total_score}
                                    </span>
                                  )}
                                </span>
                              </div>
                              {selectedSubmission.feedback && (
                                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-900">
                                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                                    الملاحظات السابقة:
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {selectedSubmission.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setImagePreview(null)}
        >
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="text-white" size={24} />
          </button>
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full max-h-full rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

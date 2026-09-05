import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardSidebar } from "../../components/layout/dashboard/DashboardSidebar";
import {
  Bell,
  FileText,
  Calendar,
  BookOpen,
  Video,
  Gift,
  Users,
  Send,
  Trash2,
  Copy,
  Plus,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Pin,
  Settings,
  Timer,
  Pencil,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  target_type: string;
  target_value: string | null;
  recipient_count: number;
  created_by: string | null;
  is_sent: boolean;
  sent_at: string | null;
  is_pinned: boolean;
  is_active: boolean;
  icon: string | null;
  color: string | null;
  created_at: string;
  is_banner: boolean;
  banner_end_at: string | null;
}

interface Student {
  id: number;
  full_name: string;
  grade: string;
}

interface NotificationSetting {
  id: number;
  setting_key: string;
  enabled: boolean;
}

interface Stats {
  total: number;
  today: number;
  students: number;
  lastSent: string;
}

const notificationTypeMap: Record<string, { label: string; icon: any; color: string }> = {
  lecture: { label: "محاضرة", icon: BookOpen, color: "bg-blue-50 text-blue-700" },
  exam: { label: "امتحان", icon: FileText, color: "bg-violet-50 text-violet-700" },
  homework: { label: "واجب", icon: Calendar, color: "bg-amber-50 text-amber-700" },
  live: { label: "بث مباشر", icon: Video, color: "bg-rose-50 text-rose-700" },
  announcement: { label: "إعلان", icon: Bell, color: "bg-emerald-50 text-emerald-700" },
  offer: { label: "عرض خاص", icon: Gift, color: "bg-purple-50 text-purple-700" },
  general: { label: "عام", icon: Bell, color: "bg-slate-50 text-slate-700" },
};

const settingsMap: Record<string, { title: string; description: string; icon: any }> = {
  new_lecture: {
    title: "إضافة محاضرة جديدة",
    description: "إرسال إشعار للطلاب عند إضافة محاضرة جديدة",
    icon: BookOpen,
  },
  new_exam: {
    title: "إضافة امتحان جديد",
    description: "إرسال إشعار للطلاب عند إضافة امتحان جديد",
    icon: FileText,
  },
  new_homework: {
    title: "رفع واجب جديد",
    description: "إرسال إشعار للطلاب عند رفع واجب منزلي جديد",
    icon: Calendar,
  },
  exam_result: {
    title: "ظهور نتيجة امتحان",
    description: "إرسال إشعار للطلاب عند نشر نتائج الامتحانات",
    icon: TrendingUp,
  },
  live_stream: {
    title: "بث مباشر",
    description: "إرسال إشعار للطلاب عند بدء بث مباشر",
    icon: Video,
  },
  new_offer: {
    title: "تفعيل عرض",
    description: "إرسال إشعار للطلاب عند تفعيل عرض خاص جديد",
    icon: Gift,
  },
};

const targetTypeMap: Record<string, string> = {
  all: "الكل",
  stage: "المرحلة",
  grade: "الصف",
  student: "طالب محدد",
};

const typeColorMap: Record<string, string> = {
  lecture: "#3B82F6",
  exam: "#8B5CF6",
  homework: "#F59E0B",
  live: "#EF4444",
  announcement: "#10B981",
  offer: "#A855F7",
  general: "#B348FE",
};

const filterOptions = [
  { key: "all", label: "الكل" },
  { key: "announcement", label: "الإعلانات" },
  { key: "lecture", label: "المحاضرات" },
  { key: "exam", label: "الامتحانات" },
  { key: "homework", label: "الواجبات" },
  { key: "offer", label: "العروض" },
];

export default function InstructorNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, students: 0, lastSent: "-" });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    isPinned: false,
    targetType: "all",
    targetValue: "",
    isBanner: false,
    bannerEndAt: "",
  });
  const [historySearch, setHistorySearch] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const [notificationsRes, studentsRes, settingsRes] = await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("students").select("id, full_name, grade"),
        supabase.from("notification_settings").select("*"),
      ]);

      if (notificationsRes.error) throw notificationsRes.error;
      if (studentsRes.error) throw studentsRes.error;
      if (settingsRes.error) throw settingsRes.error;

      setNotifications(notificationsRes.data || []);
      setStudents(studentsRes.data || []);
      setSettings(settingsRes.data || []);

      const today = new Date().toISOString().split("T")[0];
      const todayCount = (notificationsRes.data || []).filter(
        (n) => n.sent_at?.split("T")[0] === today
      ).length;

      const lastSentNotif = (notificationsRes.data || []).find((n) => n.is_sent && n.sent_at);
      const lastSentDate = lastSentNotif
        ? new Date(lastSentNotif.sent_at!).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "-";

      setStats({
        total: notificationsRes.data?.length || 0,
        today: todayCount,
        students: studentsRes.data?.length || 0,
        lastSent: lastSentDate,
      });
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحميل البيانات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    return students.filter((s) =>
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  const filteredNotifications = useMemo(() => {
    let result = notifications;
    if (activeFilter !== "all") {
      result = result.filter((n) => n.type === activeFilter);
    }
    if (historySearch.trim()) {
      const q = historySearch.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }
    return result;
  }, [notifications, activeFilter, historySearch]);

const getStageFromGrade = (grade: string): string => {
  if (grade.includes("ثانوي")) return "الثانوية";

  if (
    grade.includes("إعدادي") ||
    grade.includes("الإعدادي")
  )
    return "الإعدادية";

  return "";
};

  const recipientCount = useMemo(() => {
    if (formData.targetType === "all") {
      return students.length;
    }
    if (formData.targetType === "stage") {
      if (!formData.targetValue) return 0;
      return students.filter((s) => getStageFromGrade(s.grade) === formData.targetValue).length;
    }
    if (formData.targetType === "grade") {
      if (!formData.targetValue) return 0;
      return students.filter((s) => s.grade === formData.targetValue).length;
    }
    if (formData.targetType === "student") {
      return formData.targetValue ? 1 : 0;
    }
    return 0;
  }, [formData.targetType, formData.targetValue, students]);

  const getRecipientStudents = useCallback((): number[] => {
    if (formData.targetType === "all") {
      return students.map((s) => s.id);
    }
    if (formData.targetType === "stage") {
      return students
        .filter((s) => getStageFromGrade(s.grade) === formData.targetValue)
        .map((s) => s.id);
    }
    if (formData.targetType === "grade") {
      return students.filter((s) => s.grade === formData.targetValue).map((s) => s.id);
    }
    if (formData.targetType === "student") {
      return formData.targetValue ? [parseInt(formData.targetValue)] : [];
    }
    return [];
  }, [formData.targetType, formData.targetValue, students]);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "general",
      isPinned: false,
      targetType: "all",
      targetValue: "",
      isBanner: false,
      bannerEndAt: "",
    });
    setEditingId(null);
  };

  const handleSendNotification = async () => {
    try {
      if (!formData.title.trim() || (!formData.isBanner && !formData.content.trim())) {
        toast.error("يجب ملء الحقول المطلوبة");
        return;
      }

      if (formData.isBanner && !formData.bannerEndAt) {
        toast.error("يجب تحديد تاريخ ووقت نهاية العد التنازلي");
        return;
      }

      if (formData.isBanner && new Date(formData.bannerEndAt).getTime() <= Date.now()) {
        toast.error("يجب أن يكون وقت انتهاء العداد في المستقبل");
        return;
      }

      if (!formData.isBanner && recipientCount === 0) {
        toast.error("لا يوجد مستلمين لهذا الإشعار");
        return;
      }

      setSending(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const sharedFields = {
        title: formData.title,
        content: formData.isBanner ? formData.title : formData.content,
        type: formData.type,
        target_type: formData.isBanner ? "all" : formData.targetType,
        target_value: formData.isBanner ? null : formData.targetValue || null,
        is_pinned: formData.isBanner ? false : formData.isPinned,
        is_banner: formData.isBanner,
        banner_end_at: formData.isBanner ? new Date(formData.bannerEndAt).toISOString() : null,
        icon:
          formData.type === "lecture"
            ? "book"
            : formData.type === "exam"
            ? "file"
            : formData.type === "homework"
            ? "calendar"
            : formData.type === "offer"
            ? "gift"
            : "bell",
        color: typeColorMap[formData.type] || "#B348FE",
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("notifications")
          .update(sharedFields)
          .eq("id", editingId);

        if (updateError) throw updateError;

        toast.success("تم تحديث الإشعار بنجاح");
      } else {
        const recipientIds = formData.isBanner ? [] : getRecipientStudents();

        const { data: notification, error: notifError } = await supabase
          .from("notifications")
          .insert({
            ...sharedFields,
            recipient_count: formData.isBanner ? students.length : recipientIds.length,
            created_by: user.id,
            is_sent: true,
            sent_at: new Date().toISOString(),
            is_active: true,
          })
          .select()
          .single();

        if (notifError) throw notifError;

        if (!formData.isBanner) {
          const studentNotifications = recipientIds.map((studentId) => ({
            notification_id: notification.id,
            student_id: studentId,
            read_at: null,
          }));

          const { error: studentNotifError } = await supabase
            .from("notification_reads")
            .insert(studentNotifications);

          if (studentNotifError) throw studentNotifError;

          toast.success(`تم إرسال الإشعار إلى ${recipientIds.length} طالب بنجاح`);
        } else {
          toast.success("تم تفعيل الشريط بنجاح");
        }
      }

      resetForm();
      setShowSendForm(false);
      setShowConfirm(false);
      await loadData();
    } catch (error: any) {
      toast.error(editingId ? "حدث خطأ أثناء تحديث الإشعار" : "حدث خطأ أثناء إرسال الإشعار");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleDuplicate = (notification: Notification) => {
    setEditingId(null);
    setFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      isPinned: notification.is_pinned,
      targetType: notification.target_type,
      targetValue: notification.target_value || "",
      isBanner: notification.is_banner,
      bannerEndAt: notification.banner_end_at
        ? new Date(notification.banner_end_at).toISOString().slice(0, 16)
        : "",
    });
    setShowSendForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("تم نسخ الإشعار");
  };

  const handleEdit = (notification: Notification) => {
    setEditingId(notification.id);
    setFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      isPinned: notification.is_pinned,
      targetType: notification.target_type,
      targetValue: notification.target_value || "",
      isBanner: notification.is_banner,
      bannerEndAt: notification.banner_end_at
        ? new Date(notification.banner_end_at).toISOString().slice(0, 16)
        : "",
    });
    setShowSendForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("جاهز للتعديل");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإشعار؟")) return;

    try {
const { error: studentNotifError } = await supabase
        .from("notification_reads")
        .delete()
        .eq("notification_id", id);

      if (studentNotifError) throw studentNotifError;

      const { error: notifError } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (notifError) throw notifError;

      toast.success("تم حذف الإشعار بنجاح");
      await loadData();
    } catch (error: any) {
      toast.error("حدث خطأ أثناء حذف الإشعار");
      console.error(error);
    }
  };

  const toggleBannerActive = async (id: number, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_active: !currentActive })
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_active: !currentActive } : n))
      );

      toast.success(!currentActive ? "تم تفعيل الشريط" : "تم إيقاف الشريط");
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحديث حالة الشريط");
      console.error(error);
    }
  };

  const toggleSetting = async (id: number, currentEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from("notification_settings")
        .update({ enabled: !currentEnabled })
        .eq("id", id);

      if (error) throw error;

      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !currentEnabled } : s))
      );

      toast.success("تم تحديث الإعدادات بنجاح");
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحديث الإعدادات");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F8FAFC]" dir="rtl">
        <DashboardSidebar type="instructor" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600 font-bold">جاري التحميل...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" dir="rtl">
      <DashboardSidebar type="instructor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#0F172A] via-[#1E1B3A] to-[#2A1B4D] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mb-6 sm:mb-8"
          >
            <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-[#B348FE]/10 blur-[100px]" />
            <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-[#B348FE]/10 blur-[100px]" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="text-amber-400" size={20} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">سجل الإشعارات</h1>
                  <p className="text-white/60 text-xs sm:text-sm mt-0.5">متابعة جميع الإشعارات المرسلة للطلاب عبر المنصة</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                {notifications.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm("هل أنت متأكد من مسح كل السجل؟ لا يمكن التراجع عن هذا الإجراء.")) return;
                      try {
                        await supabase.from("notification_reads").delete().neq("id", 0);
                        await supabase.from("notifications").delete().neq("id", 0);
                        toast.success("تم مسح السجل بنجاح");
                        await loadData();
                      } catch (error) {
                        toast.error("حدث خطأ أثناء مسح السجل");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-colors"
                  >
                    <Trash2 size={16} />
                    مسح السجل
                  </button>
                )}
                <button
                  onClick={() => setShowSendForm(!showSendForm)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-colors"
                >
                  <Send size={16} />
                  إرسال إشعار يدوي
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-bold hover:bg-white/90 transition-colors"
                >
                  <Settings size={16} />
                  الإعدادات
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "إجمالي الإشعارات",
                value: stats.total,
                icon: Bell,
                gradient: "from-blue-500 to-blue-600",
                bg: "bg-blue-50",
                color: "text-blue-600",
              },
              {
                title: "إشعارات اليوم",
                value: stats.today,
                icon: TrendingUp,
                gradient: "from-emerald-500 to-emerald-600",
                bg: "bg-emerald-50",
                color: "text-emerald-600",
              },
              {
                title: "عدد الطلاب",
                value: stats.students,
                icon: Users,
                gradient: "from-purple-500 to-purple-600",
                bg: "bg-purple-50",
                color: "text-purple-600",
              },
              {
                title: "آخر إرسال",
                value: stats.lastSent,
                icon: Clock,
                gradient: "from-amber-500 to-amber-600",
                bg: "bg-amber-50",
                color: "text-amber-600",
                isText: true,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                    <p className={`text-2xl font-black ${stat.isText ? "text-base" : ""}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={stat.color} size={28} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900">
                    {editingId ? "تعديل الإشعار" : "إرسال إشعار جديد"}
                  </h2>
                  <button
                    onClick={() => {
                      if (showSendForm) resetForm();
                      setShowSendForm(!showSendForm);
                    }}
                    className="p-2 rounded-xl bg-[#B348FE] text-white hover:bg-[#9E2FFF] transition-colors"
                  >
                    {showSendForm ? <X size={20} /> : <Plus size={20} />}
                  </button>
                </div>

                <AnimatePresence>
                  {showSendForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="border border-dashed border-[#B348FE]/40 rounded-xl p-4 bg-[#B348FE]/5">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            checked={formData.isBanner}
                            onChange={(e) =>
                              setFormData({ ...formData, isBanner: e.target.checked, targetType: "all", targetValue: "" })
                            }
                            className="w-5 h-5 rounded border-slate-300 text-[#B348FE] focus:ring-[#B348FE]"
                          />
                          <Timer size={18} className="text-[#B348FE]" />
                          <span className="text-sm font-bold text-slate-700">
                            عرضه كشريط عد تنازلي أعلى الموقع (فوق الـ Navbar)
                          </span>
                        </label>

                        {formData.isBanner && (
                          <p className="text-xs text-slate-500 leading-relaxed">
                            الشريط بيتعرض لكل زوار الموقع (مسجلين أو لأ)، فمفيش داعي تحدد مستلمين له، واكتب نص قصير وواضح لأنه هيظهر في مساحة صغيرة أعلى الموقع.
                          </p>
                        )}
                      </div>

                      {formData.isBanner ? (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              نص الشريط
                            </label>
                            <textarea
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              rows={2}
                              maxLength={120}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all resize-none"
                              placeholder="مثال: فاضل على نهاية رحلة الثانوية العامة"
                            />
                            <p className="text-xs text-slate-400 mt-1 text-left">{formData.title.length}/120</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              ينتهي العد التنازلي في
                            </label>
                            <input
                              type="datetime-local"
                              value={formData.bannerEndAt}
                              min={new Date().toISOString().slice(0, 16)}
                              onChange={(e) =>
                                setFormData({ ...formData, bannerEndAt: e.target.value })
                              }
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all"
                            />
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                              العداد هيحسب تلقائيًا (أيام : ساعات : دقايق : ثواني) لحد التاريخ والوقت ده. الشريط هيفضل ظاهر لحد ما الوقت ينتهي أو المستخدم يقفله بزرار X.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              العنوان
                            </label>
                            <input
                              type="text"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              maxLength={100}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all"
                              placeholder="عنوان الإشعار"
                            />
                            <p className="text-xs text-slate-400 mt-1 text-left">{formData.title.length}/100</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              المحتوى
                            </label>
                            <textarea
                              value={formData.content}
                              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                              rows={4}
                              maxLength={500}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all resize-none"
                              placeholder="محتوى الإشعار"
                            />
                            <p className="text-xs text-slate-400 mt-1 text-left">{formData.content.length}/500</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              نوع الإشعار
                            </label>
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all"
                            >
                              {Object.entries(notificationTypeMap).map(([key, value]) => (
                                <option key={key} value={key}>
                                  {value.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.isPinned}
                                onChange={(e) =>
                                  setFormData({ ...formData, isPinned: e.target.checked })
                                }
                                className="w-5 h-5 rounded border-slate-300 text-[#B348FE] focus:ring-[#B348FE]"
                              />
                              <Pin size={18} className="text-slate-600" />
                              <span className="text-sm font-bold text-slate-700">تثبيت الإشعار</span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                              المستلمون
                            </label>
                            <select
                              value={formData.targetType}
                              onChange={(e) =>
                                setFormData({ ...formData, targetType: e.target.value, targetValue: "" })
                              }
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all"
                            >
                              {Object.entries(targetTypeMap).map(([key, value]) => (
                                <option key={key} value={key}>
                                  {value}
                                </option>
                              ))}
                            </select>
                          </div>

                          {formData.targetType === "stage" && (
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                اختر المرحلة
                              </label>
                              <select
                                value={formData.targetValue}
                                onChange={(e) =>
                                  setFormData({ ...formData, targetValue: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all"
                              >
                                <option value="">اختر المرحلة</option>
                                <option value="الثانوية">الثانوية</option>
                                <option value="الإعدادية">الإعدادية</option>
                              </select>
                            </div>
                          )}

                          {formData.targetType === "grade" && (
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                اختر الصف
                              </label>
                              <select
                                value={formData.targetValue}
                                onChange={(e) =>
                                  setFormData({ ...formData, targetValue: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all"
                              >
                                <option value="">اختر الصف</option>
                                <optgroup label="المرحلة الإعدادية">
                                  <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                                  <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
                                  <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                                </optgroup>
                                <optgroup label="المرحلة الثانوية">
                                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                                  <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                                </optgroup>
                              </select>
                            </div>
                          )}

                          {formData.targetType === "student" && (
                            <div className="relative">
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                اختر الطالب
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={
                                    formData.targetValue
                                      ? students.find((s) => s.id === parseInt(formData.targetValue))?.full_name || ""
                                      : studentSearch
                                  }
                                  onChange={(e) => {
                                    setStudentSearch(e.target.value);
                                    setFormData({ ...formData, targetValue: "" });
                                    setShowStudentDropdown(true);
                                  }}
                                  onFocus={() => setShowStudentDropdown(true)}
                                  onBlur={() => setTimeout(() => setShowStudentDropdown(false), 150)}
                                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all"
                                  placeholder="ابحث عن طالب..."
                                />
                                <Search
                                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                  size={20}
                                />
                              </div>

                              <AnimatePresence>
                                {showStudentDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                                  >
                                    {filteredStudents.length === 0 && (
                                      <p className="px-4 py-3 text-sm text-slate-500 text-center">لا يوجد طلاب مطابقين</p>
                                    )}
                                    {filteredStudents.slice(0, 50).map((student) => (
                                      <button
                                        key={student.id}
                                        onClick={() => {
                                          setFormData({ ...formData, targetValue: student.id.toString() });
                                          setStudentSearch("");
                                          setShowStudentDropdown(false);
                                        }}
                                        className="w-full px-4 py-3 text-right hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                      >
                                        <p className="font-bold text-slate-900">{student.full_name}</p>
                                        <p className="text-sm text-slate-600">{student.grade}</p>
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-700">عدد المستلمين:</span>
                              <span className="text-lg font-black text-[#B348FE]">
                                {recipientCount} طالب
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      <button
                        onClick={() => setShowConfirm(true)}
                        disabled={
                          !formData.title.trim() ||
                          (formData.isBanner ? !formData.bannerEndAt : !formData.content.trim() || recipientCount === 0) ||
                          sending
                        }
                        className="w-full bg-[#B348FE] text-white font-bold py-4 rounded-xl hover:bg-[#9E2FFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Send size={20} />
                        {editingId ? "تحديث الإشعار" : "إرسال الإشعار"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900">الإعدادات</h2>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <Settings size={20} className={showSettings ? "rotate-90 transition-transform" : "transition-transform"} />
                  </button>
                </div>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 max-h-[500px] overflow-y-auto"
                    >
                      {settings.length === 0 ? (
                        <div className="text-center py-8">
                          <Settings size={40} className="text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-600">لا توجد إعدادات متاحة</p>
                        </div>
                      ) : (
                        settings.map((setting) => {
                          const mapped = settingsMap[setting.setting_key];
                          if (!mapped) return null;

                          const Icon = mapped.icon;

                          return (
                            <div
                              key={setting.id}
                              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Icon size={18} className="text-[#B348FE]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">
                                  {mapped.title}
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">{mapped.description}</p>
                              </div>
                              <button
                                onClick={() => toggleSetting(setting.id, setting.enabled)}
                                className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors relative ${
                                  setting.enabled ? "bg-[#B348FE]" : "bg-slate-300"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                                    setting.enabled ? "right-1" : "right-6"
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-black text-slate-900">سجل الإشعارات</h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="عنوان الإشعار، محتوى، أو اسم الطالب..."
                  className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#B348FE] focus:ring-2 focus:ring-[#B348FE]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    activeFilter === option.key
                      ? "bg-[#B348FE] text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Bell size={40} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">لا توجد إشعارات</h3>
                <p className="text-slate-600">
                  {activeFilter === "all" ? "لم يتم إرسال أي إشعارات بعد" : "لا توجد إشعارات من هذا النوع"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-right text-xs font-black text-slate-600">الإشعار</th>
                        <th className="px-4 py-3 text-right text-xs font-black text-slate-600">المستلمين</th>
                        <th className="px-4 py-3 text-right text-xs font-black text-slate-600">تاريخ الإرسال</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-slate-600">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotifications.map((notification) => {
                        const typeInfo = notificationTypeMap[notification.type] || notificationTypeMap.general;

                        return (
                          <tr
                            key={notification.id}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-start gap-3">
                                <div className="min-w-0">
                                  <p className="font-black text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                                    {notification.title}
                                    {notification.is_pinned && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold">
                                        <Pin size={10} />
                                        مثبت
                                      </span>
                                    )}
                                    {notification.is_banner && (
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                          notification.is_active
                                            ? "bg-[#B348FE]/10 text-[#B348FE]"
                                            : "bg-slate-100 text-slate-500"
                                        }`}
                                      >
                                        <Timer size={10} />
                                        {notification.is_active ? "شريط نشط" : "شريط متوقف"}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-md">
                                    {notification.content}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${typeInfo.color}`}>
                                      {typeInfo.label}
                                    </span>
                                    {notification.is_banner && notification.banner_end_at && (
                                      <span className="text-[10px] text-slate-400">
                                        ينتهي: {new Date(notification.banner_end_at).toLocaleString("ar-EG", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1 w-fit">
                                  <Users size={12} />
                                  {notification.recipient_count} طالب
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {targetTypeMap[notification.target_type]}
                                  {notification.target_value && notification.target_type !== "all" && `: ${notification.target_value}`}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold text-slate-600">
                                {notification.sent_at
                                  ? new Date(notification.sent_at).toLocaleDateString("ar-EG", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-1">
                                {notification.is_banner && (
                                  <button
                                    onClick={() => toggleBannerActive(notification.id, notification.is_active)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                      notification.is_active
                                        ? "bg-[#B348FE]/10 text-[#B348FE] hover:bg-[#B348FE]/20"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }`}
                                    title={notification.is_active ? "إيقاف الشريط" : "تفعيل الشريط"}
                                  >
                                    <Timer size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEdit(notification)}
                                  className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all duration-200"
                                  title="تعديل"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDuplicate(notification)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-all duration-200"
                                  title="نسخ"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all duration-200"
                                  title="حذف"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filteredNotifications.map((notification) => {
                    const typeInfo = notificationTypeMap[notification.type] || notificationTypeMap.general;

                    return (
                      <div
                        key={notification.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                              {notification.title}
                              {notification.is_pinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold">
                                  <Pin size={10} />
                                  مثبت
                                </span>
                              )}
                              {notification.is_banner && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                    notification.is_active
                                      ? "bg-[#B348FE]/10 text-[#B348FE]"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <Timer size={10} />
                                  {notification.is_active ? "شريط نشط" : "شريط متوقف"}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{notification.content}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                            <Users size={10} />
                            {notification.recipient_count} طالب
                          </span>
                          {notification.sent_at && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(notification.sent_at).toLocaleDateString("ar-EG")}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          {notification.is_banner && (
                            <button
                              onClick={() => toggleBannerActive(notification.id, notification.is_active)}
                              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold ${
                                notification.is_active
                                  ? "bg-[#B348FE]/10 text-[#B348FE]"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <Timer size={14} />
                              {notification.is_active ? "إيقاف" : "تفعيل"}
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(notification)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold"
                          >
                            <Pencil size={14} />
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDuplicate(notification)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                          >
                            <Copy size={14} />
                            نسخ
                          </button>
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold"
                          >
                            <Trash2 size={14} />
                            حذف
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => !sending && setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-amber-600" />
              </div>

              <h3 className="text-xl font-black text-slate-900 text-center mb-2">
                {editingId ? "تأكيد التحديث" : "تأكيد الإرسال"}
              </h3>

              <p className="text-slate-600 text-center mb-6">
                {editingId ? (
                  "هل أنت متأكد من حفظ التعديلات على هذا الإشعار؟"
                ) : formData.isBanner ? (
                  "هل أنت متأكد من تفعيل هذا الشريط لكل زوار الموقع؟"
                ) : (
                  <>
                    هل أنت متأكد من إرسال هذا الإشعار إلى{" "}
                    <span className="font-black text-[#B348FE]">{recipientCount}</span> طالب؟
                  </>
                )}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={sending}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors font-bold disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={sending}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#B348FE] text-white hover:bg-[#9E2FFF] transition-colors font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {editingId ? "جاري الحفظ..." : "جاري الإرسال..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      {editingId ? "تأكيد التحديث" : "تأكيد الإرسال"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
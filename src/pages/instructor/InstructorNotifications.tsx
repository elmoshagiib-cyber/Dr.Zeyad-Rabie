import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import {
  Bell,
  FileText,
  Calendar,
  BookOpen,
  Video,
  Gift,
  DollarSign,
  Ticket,
  TrendingUp,
  Clock,
  Users,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface NotificationSetting {
  id: string;
  icon: any;
  title: string;
  description: string;
  enabled: boolean;
}

interface NotificationHistoryItem {
  id: string;
  title: string;
  type: string;
  recipients: number;
  date: string;
  status: "sent" | "scheduled" | "failed";
}

export default function InstructorNotifications() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "new-lecture",
      icon: BookOpen,
      title: "إضافة محاضرة جديدة",
      description: "إرسال إشعار للطلاب عند إضافة محاضرة جديدة للكورس",
      enabled: true,
    },
    {
      id: "new-exam",
      icon: FileText,
      title: "إضافة امتحان جديد",
      description: "إرسال إشعار للطلاب عند إضافة امتحان جديد",
      enabled: true,
    },
    {
      id: "new-homework",
      icon: Calendar,
      title: "رفع واجب جديد",
      description: "إرسال إشعار للطلاب عند رفع واجب منزلي جديد",
      enabled: true,
    },
    {
      id: "exam-result",
      icon: TrendingUp,
      title: "ظهور نتيجة امتحان",
      description: "إرسال إشعار للطلاب عند نشر نتائج الامتحانات",
      enabled: false,
    },
    {
      id: "live-stream",
      icon: Video,
      title: "بث مباشر",
      description: "إرسال إشعار للطلاب عند بدء بث مباشر",
      enabled: true,
    },
    {
      id: "new-course",
      icon: BookOpen,
      title: "إضافة كورس جديد",
      description: "إرسال إشعار للطلاب عند إطلاق كورس جديد",
      enabled: true,
    },
    {
      id: "registration-open",
      icon: Users,
      title: "فتح باب الحجز",
      description: "إرسال إشعار للطلاب عند فتح باب التسجيل في الكورسات",
      enabled: false,
    },
    {
      id: "coupon-active",
      icon: Gift,
      title: "تفعيل كوبون",
      description: "إرسال إشعار للطلاب عند تفعيل كوبون خصم جديد",
      enabled: true,
    },
  ]);

  const [history] = useState<NotificationHistoryItem[]>([
    {
      id: "1",
      title: "تم إضافة محاضرة جديدة في كورس الفيزياء",
      type: "محاضرة",
      recipients: 245,
      date: "2024-01-15 14:30",
      status: "sent",
    },
    {
      id: "2",
      title: "امتحان الرياضيات الشهري متاح الآن",
      type: "امتحان",
      recipients: 189,
      date: "2024-01-14 10:00",
      status: "sent",
    },
    {
      id: "3",
      title: "واجب الكيمياء - الفصل الثالث",
      type: "واجب",
      recipients: 156,
      date: "2024-01-13 16:45",
      status: "sent",
    },
    {
      id: "4",
      title: "بث مباشر لمراجعة الامتحان النهائي",
      type: "بث مباشر",
      recipients: 312,
      date: "2024-01-16 18:00",
      status: "scheduled",
    },
    {
      id: "5",
      title: "كوبون خصم 50% على الكورسات الجديدة",
      type: "عرض خاص",
      recipients: 523,
      date: "2024-01-12 09:00",
      status: "sent",
    },
  ]);

  const stats = [
    {
      title: "إجمالي الإشعارات",
      value: "1,247",
      icon: Bell,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "إجمالي الإشعارات المرسلة",
    },
    {
      title: "إشعارات مجدولة",
      value: "23",
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      description: "إشعارات قيد الانتظار",
    },
    {
      title: "إشعارات اليوم",
      value: "47",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      description: "تم إرسالها اليوم",
    },
  ];

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSaveSettings = () => {
    console.log("Settings saved:", settings);
    alert("تم حفظ الإعدادات بنجاح");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={14} />
            تم الإرسال
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
            <Clock size={14} />
            مجدول
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
            <XCircle size={14} />
            فشل
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      محاضرة: "bg-blue-50 text-blue-700",
      امتحان: "bg-violet-50 text-violet-700",
      واجب: "bg-amber-50 text-amber-700",
      "بث مباشر": "bg-rose-50 text-rose-700",
      "عرض خاص": "bg-emerald-50 text-emerald-700",
    };
    return colors[type] || "bg-slate-50 text-slate-700";
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden" dir="rtl">
      <DashboardSidebar type="instructor" />

      <main className="flex-1 overflow-y-auto">
<div className="flex items-center justify-center h-[calc(100vh-130px)] px-6">

  <div className="
    w-full
    max-w-3xl
    bg-white
    rounded-[32px]
    border
    border-[#E8D6FF]
    shadow-[0_20px_60px_rgba(179,72,254,.12)]
    p-10
    text-center
  ">

    <div className="
      w-24
      h-24
      mx-auto
      rounded-[28px]
      bg-[#F6EEFF]
      flex
      items-center
      justify-center
      shadow-[0_10px_30px_rgba(179,72,254,.15)]
    ">
      <Bell
        size={48}
        className="text-[#B348FE]"
      />
    </div>

    <h2 className="mt-8 text-3xl font-black text-slate-900">
      مركز الإشعارات قيد التطوير
    </h2>

    <p className="mt-5 text-slate-500 text-lg leading-9 max-w-2xl mx-auto">
      نعمل حاليًا على تطوير نظام إشعارات متكامل يسمح بإرسال الرسائل
      الفردية والجماعية للطلاب، مع جدولة الإشعارات وتتبع حالة التسليم
      وإحصائيات الوصول، لتوفير تجربة أكثر احترافية.
    </p>

    <div className="mt-10 flex flex-wrap justify-center gap-3">

      <span className="px-5 py-3 rounded-2xl bg-[#F6EEFF] text-[#B348FE] font-bold">
        رسائل فردية
      </span>

      <span className="px-5 py-3 rounded-2xl bg-[#F6EEFF] text-[#B348FE] font-bold">
        رسائل جماعية
      </span>

      <span className="px-5 py-3 rounded-2xl bg-[#F6EEFF] text-[#B348FE] font-bold">
        جدولة الإرسال
      </span>

      <span className="px-5 py-3 rounded-2xl bg-[#F6EEFF] text-[#B348FE] font-bold">
        سجل الإشعارات
      </span>

      <span className="px-5 py-3 rounded-2xl bg-[#F6EEFF] text-[#B348FE] font-bold">
        تقارير التسليم
      </span>

    </div>

    <div
      className="
        mt-10
        inline-flex
        items-center
        gap-3
        rounded-2xl
        bg-[#B348FE]
        text-white
        px-7
        py-4
        font-bold
        shadow-[0_12px_35px_rgba(179,72,254,.35)]
      "
    >
      🔔 قريبًا بإذن الله
    </div>

  </div>

</div>
      </main>
    </div>
  );
}
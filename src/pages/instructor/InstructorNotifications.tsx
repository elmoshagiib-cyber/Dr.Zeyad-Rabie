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
        <div className="p-6 lg:p-8 space-y-6">
          {/* Top Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#350F44] to-[#4a1a5c] flex items-center justify-center shadow-lg">
                  <Bell className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">
                    إدارة الإشعارات
                  </h1>
                  <p className="text-slate-600 text-base max-w-2xl leading-relaxed">
                    يمكنك إدارة جميع إشعارات المنصة والتحكم في الرسائل المرسلة
                    للطلاب.
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 border-2 border-[#350F44] text-[#350F44] rounded-2xl font-bold hover:bg-[#350F44] hover:text-white transition-all duration-300 flex items-center gap-2 whitespace-nowrap">
                <FileText size={20} />
                سجل الإشعارات
              </button>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={stat.iconColor} size={28} />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-2">
                  {stat.value}
                </h3>
                <p className="text-slate-900 font-bold text-base mb-1">
                  {stat.title}
                </p>
                <p className="text-slate-500 text-sm">{stat.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              إعدادات الإشعارات
            </h2>
            <div className="space-y-4">
              {settings.map((setting, index) => (
                <motion.div
                  key={setting.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-[#F6AC08] hover:bg-slate-50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-[#F6AC08]/10 flex items-center justify-center transition-colors duration-300">
                      <setting.icon
                        className="text-slate-600 group-hover:text-[#F6AC08] transition-colors duration-300"
                        size={24}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900 mb-1">
                        {setting.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={() => toggleSetting(setting.id)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#350F44]"></div>
                  </label>
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveSettings}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-[#350F44] to-[#4a1a5c] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              حفظ التعديلات
            </motion.button>
          </motion.div>

          {/* Notification History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                سجل الإشعارات
              </h2>
              <button className="px-5 py-2.5 text-[#350F44] font-bold hover:bg-slate-50 rounded-xl transition-all duration-300 flex items-center gap-2">
                عرض الكل
                <TrendingUp size={18} />
              </button>
            </div>

            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">
                        عنوان الإشعار
                      </th>
                      <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">
                        النوع
                      </th>
                      <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">
                        المستلمون
                      </th>
                      <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">
                        تاريخ الإرسال
                      </th>
                      <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">
                        الحالة
                      </th>
                      <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-slate-900">
                            {item.title}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(
                              item.type
                            )}`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">
                              {item.recipients} طالب
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-slate-600">{item.date}</p>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(item.status)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200">
                              <Eye size={18} className="text-slate-600" />
                            </button>
                            <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors duration-200">
                              <Trash2 size={18} className="text-rose-600" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-100 flex items-center justify-center">
                  <Bell size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  لا توجد إشعارات حتى الآن
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  سيتم عرض جميع الإشعارات المرسلة للطلاب هنا
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
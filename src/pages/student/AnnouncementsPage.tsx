import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Badge } from "../../components/ui/Badge";

export function AnnouncementsPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true);

      // 🔥 هنربطها بـ Supabase بعد ما نخلص Dashboard المستر
      setAnnouncements([]);

      setLoading(false);
    };

    loadAnnouncements();
  }, []);

  return (
    <div
      className="flex h-screen bg-slate-50 overflow-hidden"
      dir="rtl"
    >
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#1E244F] border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <Bell
                size={22}
                className="text-blue-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                الإشعارات
              </h1>

              <p className="text-sm text-slate-500">
                جميع إعلانات المستر ستظهر هنا.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-2xl bg-white animate-pulse"
                />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white dark:bg-[#1E244F] rounded-3xl p-16 text-center shadow-sm border border-slate-200">
              <Bell
                size={60}
                className="mx-auto text-slate-300 mb-6"
              />

              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">
                لا توجد إشعارات حالياً
              </h2>

              <p className="text-slate-500 leading-8 max-w-xl mx-auto">
                عند قيام المستر بنشر إعلان جديد أو إضافة درس أو امتحان أو واجب،
                سيظهر هنا مباشرة.
              </p>

              <Badge
                variant="blue"
                className="mt-8"
              >
                🚧 سيتم تفعيلها بعد الانتهاء من لوحة تحكم المستر
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white rounded-2xl p-5 shadow-sm"
                >
                  {announcement.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
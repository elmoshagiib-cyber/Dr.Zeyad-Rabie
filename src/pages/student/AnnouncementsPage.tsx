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

      // هنربطها بـ Supabase بعد ما نخلص Dashboard المستر
      setAnnouncements([]);

      setLoading(false);
    };

    loadAnnouncements();
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden bg-white dark:bg-[#09090B]"
      dir="rtl"
    >
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#09090B] border-b border-gray-100 dark:border-[#2A2A2A] px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center flex-shrink-0">
              <Bell
                size={24}
                className="text-[#B348FE]"
              />
            </div>

            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                الإشعارات
              </h1>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">
                جميع اشعارات المستر ستظهر هنا.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {loading ? (
            <div className="space-y-4 lg:space-y-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-3xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] animate-pulse"
                />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-12 lg:p-16 text-center shadow-sm border border-gray-100 dark:border-[#2A2A2A]">
              <div className="w-20 h-20 rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center mx-auto mb-6">
                <Bell
                  size={36}
                  className="text-[#B348FE]"
                />
              </div>

              <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-4">
                لا توجد إشعارات حالياً
              </h2>

              <p className="text-gray-500 dark:text-gray-400 leading-8 max-w-xl mx-auto text-sm lg:text-base">
                عند قيام المستر بنشر إعلان جديد أو إضافة درس أو امتحان أو واجب،
                سيظهر هنا مباشرة.
              </p>

              <Badge
                variant="purple"
                className="mt-6 inline-flex"
              >
                🚧 سيتم تفعيلها بعد الانتهاء من لوحة تحكم المستر
              </Badge>
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-5">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl p-5 lg:p-6 shadow-sm hover:shadow-lg hover:border-[#B348FE] transition-all duration-300"
                >
                  <h3 className="font-black text-gray-900 dark:text-white text-lg">
                    {announcement.title}
                  </h3>
                  {announcement.description && (
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                      {announcement.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
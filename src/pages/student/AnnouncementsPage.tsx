import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../lib/supabase";

export function AnnouncementsPage() {
  const { user } = useApp();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!user) {
        setAnnouncements([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("notification_reads")
        .select(`
          id,
          read_at,
          notifications (
            id,
            title,
            content,
            type,
            icon,
            color,
            is_pinned,
            created_at
          )
        `)
        .eq("student_id", user.studentId)
        .order("created_at", { ascending: false, foreignTable: "notifications" });

      if (!error && data) {
        setAnnouncements(data);
      } else {
        setAnnouncements([]);
      }

      setLoading(false);
    };

    loadAnnouncements();
  }, [user]);

  const markAsRead = async (readRowId: number) => {
    await supabase
      .from("notification_reads")
      .update({ read_at: new Date().toISOString() })
      .eq("id", readRowId)
      .is("read_at", null);
  };

  return (
    <StudentLayout>
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#09090B] border-b border-gray-100 dark:border-[#2A2A2A] px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center flex-shrink-0">
              <Bell size={20} className="text-[#B348FE] sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                الإشعارات
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                جميع اشعارات المستر ستظهر هنا.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 sm:h-24 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] animate-pulse"
                />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center shadow-sm border border-gray-100 dark:border-[#2A2A2A]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Bell size={30} className="text-[#B348FE] sm:w-9 sm:h-9" />
              </div>

              <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
                لا توجد إشعارات حالياً
              </h2>

              <p className="text-gray-500 dark:text-gray-400 leading-6 sm:leading-8 max-w-xl mx-auto text-xs sm:text-sm lg:text-base">
                عند قيام المستر بنشر إعلان جديد أو إضافة درس أو امتحان أو واجب،
                سيظهر هنا مباشرة.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 lg:space-y-5">
              {announcements.map((item) => {
                const notif = item.notifications;
                if (!notif) return null;
                const isUnread = !item.read_at;

                return (
                  <div
                    key={item.id}
                    onClick={() => isUnread && markAsRead(item.id)}
                    className={`
                      bg-white dark:bg-[#111111] border rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm
                      hover:shadow-lg hover:border-[#B348FE] transition-all duration-300 cursor-pointer
                      ${isUnread ? "border-[#B348FE]/40" : "border-gray-100 dark:border-[#2A2A2A]"}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="font-black text-gray-900 dark:text-white text-sm sm:text-lg flex items-center gap-2 flex-1 min-w-0">
                        <span className="break-words">{notif.title}</span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
                        )}
                      </h3>
                      {notif.is_pinned && (
                        <Badge variant="purple">مثبت</Badge>
                      )}
                    </div>

                    {notif.content && notif.content !== notif.title && (
                      <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs sm:text-sm leading-6 sm:leading-7 whitespace-pre-line break-words">
                        {notif.content}
                      </p>
                    )}

                    <p className="text-[11px] sm:text-xs text-gray-400 mt-2.5 sm:mt-3">
                      {new Date(notif.created_at).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </StudentLayout>
  );
}
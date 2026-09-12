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
        <div className="px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6">
          <div
            className="
              relative overflow-hidden
              max-w-5xl mx-auto
              rounded-2xl sm:rounded-3xl
              px-4 sm:px-6 md:px-8
              py-5 sm:py-6 md:py-7
              flex items-center justify-between gap-4
              bg-[#5800a9] dark:bg-[#b600d7]
            "
          >
            <div className="relative z-10 text-right min-w-0">
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-1.5">
                الإشعارات
              </h1>
              <p className="text-white/80 text-[11px] xs:text-xs sm:text-sm">
                جميع إشعارات المستر ستظهر هنا
              </p>
            </div>

            <div
              className="
                relative z-10 flex-shrink-0
                w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11
                rounded-xl sm:rounded-2xl
                bg-white/15
                flex items-center justify-center
              "
            >
              <Bell className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-10 py-5 sm:py-6 lg:py-8">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] p-4 sm:p-5 lg:p-6 animate-pulse"
                  >
                    <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-[#2A2A2A] mb-3" />
                    <div className="h-3 w-full rounded bg-gray-100 dark:bg-[#1D1D1D] mb-2" />
                    <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-[#1D1D1D]" />
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="bg-white dark:bg-[#111111] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 lg:p-16 text-center shadow-sm border border-gray-100 dark:border-[#2A2A2A]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Bell className="text-[#B348FE] w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" />
                </div>

                <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-[#5800a9] dark:text-white mb-2.5 sm:mb-4">
                  لا توجد إشعارات حالياً
                </h2>

                <p className="text-gray-500 dark:text-gray-400 leading-6 sm:leading-7 md:leading-8 max-w-xl mx-auto text-xs sm:text-sm md:text-base px-2 sm:px-0">
                  عند قيام المستر بنشر إعلان جديد أو إضافة درس أو امتحان أو واجب،
                  سيظهر هنا مباشرة.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                {announcements.map((item) => {
                  const notif = item.notifications;
                  if (!notif) return null;
                  const isUnread = !item.read_at;

                  return (
                    <div
                      key={item.id}
                      onClick={() => isUnread && markAsRead(item.id)}
                      className={`
                        relative bg-white dark:bg-[#111111] border rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 shadow-sm
                        hover:shadow-lg hover:-translate-y-0.5 hover:border-[#B348FE] transition-all duration-300 cursor-pointer
                        ${isUnread ? "border-[#B348FE]/40 bg-[#FBF6FF] dark:bg-[#170A20]" : "border-gray-100 dark:border-[#2A2A2A]"}
                      `}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-black text-[#5800a9] dark:text-white text-sm sm:text-base lg:text-lg flex items-center gap-2 flex-1 min-w-0">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
                          )}
                          <span className="break-words">{notif.title}</span>
                        </h3>
                        {notif.is_pinned && (
                          <Badge variant="purple">مثبت</Badge>
                        )}
                      </div>

                      {notif.content && notif.content !== notif.title && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-xs sm:text-sm leading-6 sm:leading-7 whitespace-pre-line break-words line-clamp-4">
                          {notif.content}
                        </p>
                      )}

                      <p className="text-[11px] sm:text-xs text-gray-400 mt-3 sm:mt-4">
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
        </div>
      </main>
    </StudentLayout>
  );
}
import { Trophy, Clock } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";

export function LeaderboardPage() {
  return (
    <StudentLayout>
      <div
        dir="rtl"
        className="min-h-full flex items-center justify-center p-6"
      >
        <div className="w-full max-w-2xl text-center">

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6EEFF] dark:bg-[#B348FE]/10">
            <Trophy
              size={40}
              className="text-[#B348FE]"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            أبطال المنصة
          </h1>

          {/* Description */}
          <p className="text-gray-500 dark:text-gray-400 text-base leading-7 max-w-lg mx-auto">
            هنعرض هنا ترتيبك ونقاطك ومقارنتك بزمايلك، بعد إطلاق
            نظام النقاط والإنجازات داخل المنصة.
          </p>

          {/* Coming Soon */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#F6EEFF] dark:bg-[#B348FE]/10 px-5 py-3 text-[#B348FE] dark:text-[#C97AFF] font-medium">
            <Clock size={18} />
            <span>قريبًا</span>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}
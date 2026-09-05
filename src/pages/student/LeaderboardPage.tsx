import { Trophy, Sparkles } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export function LeaderboardPage() {
  return (
    <StudentLayout>
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-full">
        <Card className="max-w-3xl w-full bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
          {/* زخرفة خفيفة في الخلفية */}
          <div className="absolute -top-16 -left-16 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#F6EEFF]/60 dark:bg-[#2B103D]/20 blur-3xl pointer-events-none" />

          <CardContent className="relative py-10 sm:py-16 lg:py-24 px-5 sm:px-6 lg:px-12 text-center">
            {/* Trophy Icon */}
            <div className="relative w-18 h-18 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 flex items-center justify-center mx-auto mb-5 sm:mb-8 shadow-lg">
              <Trophy size={36} className="text-amber-500 sm:w-12 sm:h-12" />
              <Sparkles size={16} className="absolute -top-1.5 -left-1.5 text-[#B348FE] sm:w-5 sm:h-5 animate-pulse" />
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-5">
              لوحة المتصدرين
            </h1>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg leading-6 sm:leading-8 lg:leading-9 mb-6 sm:mb-8 max-w-xl mx-auto">
              هذه الميزة ستكون متاحة قريبًا بعد إطلاق نظام النقاط
              والإنجازات داخل المنصة.
            </p>

            {/* Badge */}
            <Badge
              variant="amber"
              className="text-xs sm:text-sm lg:text-base px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 font-black inline-flex"
            >
              🚧 تحت التطوير
            </Badge>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
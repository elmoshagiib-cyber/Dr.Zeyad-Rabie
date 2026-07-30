import { useState } from "react";
import { Trophy, Star, TrendingUp } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { LEADERBOARD } from "../../data/mockData";

export function LeaderboardPage() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "alltime">("monthly");
  const [grade, setGrade] = useState("all");
  const myRank = 12;

  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const podiumHeights = ["h-24", "h-32", "h-20"];
  const podiumBgs = ["bg-slate-400", "bg-amber-400", "bg-amber-600"];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#09090B]" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>
      
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-6 lg:p-8">
        <Card className="max-w-3xl w-full bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-xl">
          <CardContent className="py-16 lg:py-24 px-6 lg:px-12 text-center">
            {/* Trophy Icon */}
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Trophy size={48} className="text-amber-500" />
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-5">
              لوحة المتصدرين
            </h1>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 text-base lg:text-lg leading-8 lg:leading-9 mb-8 max-w-xl mx-auto">
              هذه الميزة ستكون متاحة قريبًا بعد إطلاق نظام النقاط
              والإنجازات داخل المنصة.
            </p>

            {/* Badge */}
            <Badge variant="amber" className="text-sm lg:text-base px-5 lg:px-6 py-2.5 lg:py-3 font-black inline-flex">
              🚧 تحت التطوير
            </Badge>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
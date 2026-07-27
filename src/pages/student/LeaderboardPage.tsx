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
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>
      
<main className="flex-1 overflow-y-auto flex items-center justify-center p-8">
  <Card className="max-w-2xl w-full">
    <CardContent className="py-20 text-center">

      <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
        <Trophy size={42} className="text-amber-500" />
      </div>

      <h1 className="text-3xl font-black text-slate-900 mb-4">
        لوحة المتصدرين
      </h1>

      <p className="text-slate-500 text-lg leading-8 mb-8">
        هذه الميزة ستكون متاحة قريبًا بعد إطلاق نظام النقاط
        والإنجازات داخل المنصة.
      </p>

      <Badge variant="amber" className="text-base px-5 py-2">
        🚧 تحت التطوير
      </Badge>

    </CardContent>
  </Card>
</main>

    </div>
  );
}

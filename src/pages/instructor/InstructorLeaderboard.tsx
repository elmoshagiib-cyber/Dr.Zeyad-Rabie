import { useState } from "react";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { Trophy, Plus, Minus, Power } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface StudentScore {
  id: number;
  name: string;
  grade: string;
  points: number;
}

export function InstructorLeaderboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // تفعيل/إيقاف نظام اللوحة بالكامل من هنا
  const [enabled, setEnabled] = useState(false);

  // حدود النقط لكل شارة - عدّلها زي ما تحب
  const [thresholds, setThresholds] = useState({
    silver: 100,
    gold: 300,
    diamond: 600,
  });

  // بيانات تجريبية - استبدلها بربط API الطلاب الحقيقي
  const [students, setStudents] = useState<StudentScore[]>([
    { id: 1, name: "أحمد محمود", grade: "الصف الثالث الثانوي", points: 420 },
    { id: 2, name: "سارة علي", grade: "الصف الثاني الثانوي", points: 310 },
    { id: 3, name: "يوسف كريم", grade: "الصف الثالث الثانوي", points: 150 },
  ]);

  const getBadge = (points: number) => {
    if (points >= thresholds.diamond) return { label: "ماسي", color: "#38BDF8" };
    if (points >= thresholds.gold) return { label: "ذهبي", color: "#F59E0B" };
    if (points >= thresholds.silver) return { label: "فضي", color: "#94A3B8" };
    return { label: "بدون شارة", color: "#CBD5E1" };
  };

  const adjustPoints = (id: number, delta: number) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, points: Math.max(0, s.points + delta) } : s
      )
    );
  };

  const toggleEnabled = () => {
    setEnabled((prev) => !prev);
    toast.success(!enabled ? "تم تفعيل لوحة الأبطال" : "تم إيقاف لوحة الأبطال");
  };

  const sortedStudents = [...students].sort((a, b) => b.points - a.points);

  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div dir="rtl" className="min-h-screen bg-white">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#5800a9] to-[#b600d7] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mx-4 sm:mx-6 mt-4 sm:mt-6"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-[100px] pointer-events-none" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="text-amber-300" size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black truncate">إدارة أبطال المنصة</h1>
                <p className="text-white/80 text-xs sm:text-sm mt-1">تحكم في نظام النقط والشارات للطلاب</p>
              </div>
            </div>

            <button
              onClick={toggleEnabled}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                enabled
                  ? "bg-white text-[#5800a9]"
                  : "bg-white/10 text-white border border-white/20"
              }`}
            >
              <Power size={16} />
              {enabled ? "الميزة مفعّلة" : "الميزة متوقفة"}
            </button>
          </div>
        </motion.div>

        {/* حدود الشارات */}
        <div className="mx-4 sm:mx-6 mt-6 bg-gray-50 rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg font-black text-gray-800 mb-4">حدود النقط للشارات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">فضي</label>
              <input
                type="number"
                value={thresholds.silver}
                onChange={(e) =>
                  setThresholds((prev) => ({ ...prev, silver: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5800a9]/30"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">ذهبي</label>
              <input
                type="number"
                value={thresholds.gold}
                onChange={(e) =>
                  setThresholds((prev) => ({ ...prev, gold: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5800a9]/30"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 mb-1 block">ماسي</label>
              <input
                type="number"
                value={thresholds.diamond}
                onChange={(e) =>
                  setThresholds((prev) => ({ ...prev, diamond: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5800a9]/30"
              />
            </div>
          </div>
        </div>

        {/* جدول الطلاب */}
        <div className="mx-4 sm:mx-6 mt-6 mb-8">
          <h2 className="text-lg font-black text-gray-800 mb-4">ترتيب الطلاب</h2>
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            {sortedStudents.map((s, index) => {
              const badge = getBadge(s.points);
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#5800a9] text-white text-xs font-black flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.grade}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-xs font-black px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                    <span className="text-sm font-black text-gray-700 w-12 text-center">
                      {s.points}
                    </span>
                    <button
                      onClick={() => adjustPoints(s.id, -10)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => adjustPoints(s.id, 10)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
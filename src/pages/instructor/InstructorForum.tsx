import { useState } from "react";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { Swords, Plus, Power, Trash2, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface CompetitionRound {
  id: number;
  title: string;
  grade: string;
  startDate: string;
  endDate: string;
}

export function InstructorForum() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // تفعيل/إيقاف المسابقة بالكامل
  const [enabled, setEnabled] = useState(false);

  // بيانات تجريبية - اربطها بالـ API لاحقًا
  const [rounds, setRounds] = useState<CompetitionRound[]>([
    {
      id: 1,
      title: "جولة الفيزياء الأسبوعية",
      grade: "الصف الثالث الثانوي",
      startDate: "2026-09-20",
      endDate: "2026-09-27",
    },
  ]);

  const [newRound, setNewRound] = useState({
    title: "",
    grade: "",
    startDate: "",
    endDate: "",
  });

  const toggleEnabled = () => {
    setEnabled((prev) => !prev);
    toast.success(!enabled ? "تم تفعيل بطولة الأسئلة" : "تم إيقاف بطولة الأسئلة");
  };

  const addRound = () => {
    if (!newRound.title || !newRound.grade || !newRound.startDate || !newRound.endDate) {
      toast.error("من فضلك املأ كل بيانات الجولة");
      return;
    }

    setRounds((prev) => [
      ...prev,
      { id: Date.now(), ...newRound },
    ]);
    setNewRound({ title: "", grade: "", startDate: "", endDate: "" });
    toast.success("تمت إضافة الجولة بنجاح");
  };

  const deleteRound = (id: number) => {
    setRounds((prev) => prev.filter((r) => r.id !== id));
    toast.success("تم حذف الجولة");
  };

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
                <Swords className="text-amber-300" size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black truncate">إدارة بطولة الأسئلة</h1>
                <p className="text-white/80 text-xs sm:text-sm mt-1">تحكم في جولات المسابقة بين الطلاب</p>
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

        {/* إضافة جولة جديدة */}
        <div className="mx-4 sm:mx-6 mt-6 bg-gray-50 rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg font-black text-gray-800 mb-4">إضافة جولة مسابقة جديدة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="عنوان الجولة"
              value={newRound.title}
              onChange={(e) => setNewRound((prev) => ({ ...prev, title: e.target.value }))}
              className="px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5800a9]/30"
            />
            <input
              type="text"
              placeholder="الصف الدراسي"
              value={newRound.grade}
              onChange={(e) => setNewRound((prev) => ({ ...prev, grade: e.target.value }))}
              className="px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5800a9]/30"
            />
            <input
              type="date"
              value={newRound.startDate}
              onChange={(e) => setNewRound((prev) => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5800a9]/30"
            />
            <input
              type="date"
              value={newRound.endDate}
              onChange={(e) => setNewRound((prev) => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5800a9]/30"
            />
          </div>
          <button
            onClick={addRound}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5800a9] text-white font-bold text-sm hover:opacity-90 transition-all duration-300"
          >
            <Plus size={16} />
            إضافة الجولة
          </button>
        </div>

        {/* قائمة الجولات */}
        <div className="mx-4 sm:mx-6 mt-6 mb-8">
          <h2 className="text-lg font-black text-gray-800 mb-4">الجولات الحالية</h2>

          {rounds.length === 0 ? (
            <p className="text-sm text-gray-400">مفيش جولات مضافة لسه</p>
          ) : (
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              {rounds.map((r, index) => (
                <div
                  key={r.id}
                  className={`flex items-center justify-between gap-3 px-4 py-3 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.grade}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      {r.startDate} → {r.endDate}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteRound(r.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
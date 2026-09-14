import { useState } from "react";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export function InstructorContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div dir="rtl" className="min-h-screen bg-white">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#1547D6] to-[#3183FF] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mx-4 sm:mx-6 mt-4 sm:mt-6"
        >
          <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-[100px] pointer-events-none" />
          <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            {/* العنوان والأيقونة */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="text-amber-400" size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black truncate">المحتوى</h1>
              </div>
            </div>
          </div>
        </motion.div>

        {/* هنا هنضيف محتوى الصفحة لاحقًا */}
      </div>
    </DashboardLayout>
  );
}
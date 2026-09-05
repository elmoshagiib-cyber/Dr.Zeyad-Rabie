import { motion } from "framer-motion";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

function ConstructionScene() {
  const blocks = [0, 1, 2, 3, 4];

  return (
    <div className="relative w-48 h-40 sm:w-64 sm:h-48 lg:w-72 lg:h-56 mx-auto mb-6 sm:mb-8 select-none">
      {/* الأرضية */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-gray-200 dark:bg-[#2A2A2A] rounded-full" />

      {/* البلوكات بترتفع فوق بعض زي عمارة بتتبني */}
      <div className="absolute bottom-1.5 sm:bottom-2 right-3 sm:right-6 flex flex-col-reverse gap-1">
        {blocks.map((i) => (
          <motion.div
            key={i}
            className="w-14 sm:w-20 lg:w-24 h-4 sm:h-5 lg:h-6 rounded-md sm:rounded-lg bg-gradient-to-r from-[#B348FE] to-[#8B2FD8] shadow-md"
            initial={{ opacity: 0, y: 12, scaleX: 0.7 }}
            animate={{ opacity: 1, y: 0, scaleX: 1 }}
            transition={{
              duration: 0.5,
              delay: i * 0.35,
              repeat: Infinity,
              repeatDelay: blocks.length * 0.35 + 0.6,
              repeatType: "loop",
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* غبار/ورش خفيفة فوق البلوكات */}
      <motion.div
        className="absolute bottom-16 sm:bottom-20 right-4 sm:right-8 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-300/60 blur-[2px]"
        animate={{ opacity: [0, 0.8, 0], y: [0, -14, -20], scale: [0.6, 1.1, 0.8] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-16 sm:bottom-20 right-10 sm:right-16 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-300/50 blur-[2px]"
        animate={{ opacity: [0, 0.7, 0], y: [0, -10, -16], scale: [0.5, 1, 0.7] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
      />

      {/* الشخصية */}
      <div className="absolute bottom-1.5 sm:bottom-2 left-2 sm:left-6">
        <motion.div
          className="relative"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* الجسم */}
          <div className="w-9 h-11 sm:w-11 sm:h-14 lg:w-12 lg:h-16 rounded-t-2xl rounded-b-md bg-[#2B2B2B] dark:bg-[#3A3A3A] mx-auto relative z-10" />

          {/* الراس + الخوذة */}
          <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-20">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-[#F2C6A0]" />
            <div className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 w-7 sm:w-8 lg:w-9 h-3 sm:h-3.5 rounded-t-full bg-amber-400 shadow-sm" />
          </div>

          {/* الدراع والشاكوش - بتضرب */}
          <motion.div
            className="absolute top-1 sm:top-1.5 -right-3 sm:-right-4 z-0 origin-top-left"
            style={{ transformOrigin: "0% 0%" }}
            animate={{ rotate: [0, 55, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
          >
            <div className="w-1.5 h-6 sm:h-7 lg:h-8 bg-[#F2C6A0] rounded-full" />
            <div className="absolute -bottom-1 -right-1.5 w-4 h-2.5 sm:w-5 sm:h-3 rounded-sm bg-gray-500 dark:bg-gray-400 rotate-45" />
          </motion.div>

          {/* الرجلين */}
          <div className="flex justify-center gap-1 -mt-0.5">
            <div className="w-2 h-2.5 sm:w-2.5 sm:h-3 bg-[#1D1D1D] rounded-sm" />
            <div className="w-2 h-2.5 sm:w-2.5 sm:h-3 bg-[#1D1D1D] rounded-sm" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  return (
    <StudentLayout>
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-full">
        <Card className="max-w-3xl w-full bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
          {/* زخرفة خلفية خفيفة */}
          <div className="absolute -top-16 -left-16 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#F6EEFF]/60 dark:bg-[#2B103D]/20 blur-3xl pointer-events-none" />

          <CardContent className="relative py-10 sm:py-14 lg:py-16 px-5 sm:px-6 lg:px-12 text-center">
            <ConstructionScene />

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-5">
              لوحة المتصدرين
            </h1>

            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg leading-6 sm:leading-8 lg:leading-9 mb-6 sm:mb-8 max-w-xl mx-auto">
              إحنا شغالين عليها دلوقتي 👷‍♂️ هتكون متاحة قريبًا بعد إطلاق
              نظام النقاط والإنجازات داخل المنصة.
            </p>

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
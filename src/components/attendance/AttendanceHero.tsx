import { motion } from "framer-motion";
import { QrCode, Plus, CalendarClock } from "lucide-react";
import QRCode from "react-qr-code";
interface AttendanceHeroProps {
  onCreateSession?: () => void;
  activeSession?: boolean;
}

export function AttendanceHero({
  onCreateSession,
  activeSession = false,
}: AttendanceHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 p-8 shadow-xl"
    >
      {/* Background Blur */}
      <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.05]">
    <div className="grid h-full w-full grid-cols-12">
        {Array.from({ length: 144 }).map((_, i) => (
            <div
                key={i}
                className="border border-white/20"
            />
        ))}
    </div>
</div>
      <div className="absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Right */}
        <div className="text-right text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
            <CalendarClock size={18} />

            <span className="text-sm font-medium">
              إدارة حضور وغياب الطلاب
            </span>
          </div>

          <h1 className="text-5xl font-black tracking-tight">
            الحضور والانصراف
          </h1>

          <p className="mt-3 max-w-xl text-lg text-blue-100 leading-8">
أنشئ جلسات حضور بسهولة، وسجل حضور الطلاب لحظيًا باستخدام QR Code مع متابعة مباشرة للإحصائيات ونسبة الحضور.
          </p>

          {activeSession && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-100 backdrop-blur">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />

             جلسة الأسبوع الرابع نشطة الآن
            </div>
          )}
        </div>

        {/* Left */}
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/15 backdrop-blur-md shadow-lg">
            <QrCode className="text-white drop-shadow-lg" size={54} />
          </div>

          <button
            onClick={onCreateSession}
            className="group flex items-center gap-2 rounded-2xl bg-white px-7 py-3 font-bold text-blue-700 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Plus
    size={20}
    className="transition-transform duration-300 group-hover:rotate-90"
/>

            إنشاء جلسة حضور
          </button>
        </div>
      </div>
    </motion.div>
  );
}
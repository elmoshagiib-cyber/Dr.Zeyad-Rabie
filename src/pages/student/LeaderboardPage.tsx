import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Construction, Trophy, Star, Users2 } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

function CraneScene() {
  const blocks = [0, 1, 2, 3];

  return (
    <div className="relative w-56 h-40 sm:w-72 sm:h-48 lg:w-80 lg:h-56 mx-auto mb-6 sm:mb-8 select-none">
      {/* أرضية */}
      <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-[#2A2A2A] to-transparent" />

      {/* البرج بيتبني */}
      <div className="absolute bottom-0.5 left-6 sm:left-8 lg:left-10 flex flex-col-reverse gap-1">
        {blocks.map((i) => (
          <motion.div
            key={i}
            className="w-16 sm:w-20 lg:w-24 h-5 sm:h-6 lg:h-7 rounded-md bg-gradient-to-b from-[#C56BFF] to-[#8B2FD8] shadow-[0_3px_12px_rgba(139,47,216,0.35)]"
            initial={{ opacity: 0, y: 10, scaleX: 0.85 }}
            animate={{ opacity: 1, y: 0, scaleX: 1 }}
            transition={{
              duration: 0.6,
              delay: 1 + i * 1.1,
              repeat: Infinity,
              repeatDelay: blocks.length * 1.1 + 1,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </div>

      {/* الرافعة */}
      <div className="absolute bottom-0.5 right-4 sm:right-6 lg:right-8">
        {/* الصاري */}
        <div className="w-1 h-32 sm:h-40 lg:h-44 mx-auto rounded-full bg-gradient-to-t from-gray-300 to-gray-200 dark:from-[#3A3A3A] dark:to-[#2A2A2A]" />

        {/* الذراع الأفقي */}
        <motion.div
          className="absolute top-0 right-0 h-1 w-24 sm:w-32 lg:w-36 rounded-full bg-gradient-to-l from-gray-300 to-gray-200 dark:from-[#3A3A3A] dark:to-[#2A2A2A] origin-right"
          animate={{ rotate: [0, -2.5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* لمبة تحذير */}
        <motion.span
          className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* الحبل والبلوك المرفوع */}
        <motion.div
          className="absolute top-0 right-20 sm:right-28 lg:right-32 flex flex-col items-center"
          animate={{ y: [0, 62, 62, 0], opacity: [1, 1, 0, 0] }}
          transition={{
            duration: 4.4,
            times: [0, 0.4, 0.55, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-px h-14 sm:h-16 lg:h-20 bg-gray-300 dark:bg-[#3A3A3A]" />
          <div className="w-6 h-4 sm:w-7 sm:h-5 rounded-sm bg-gradient-to-b from-[#C56BFF] to-[#8B2FD8] shadow-md" />
        </motion.div>
      </div>

      {/* غبار خفيف */}
      <motion.div
        className="absolute bottom-8 left-14 sm:left-16 w-2.5 h-2.5 rounded-full bg-amber-300/50 blur-[2px]"
        animate={{ opacity: [0, 0.7, 0], y: [0, -16, -24] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-8 left-20 sm:left-24 w-2 h-2 rounded-full bg-amber-300/40 blur-[2px]"
        animate={{ opacity: [0, 0.6, 0], y: [0, -12, -20] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

function ProgressBar() {
  const target = 68;
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="max-w-xs sm:max-w-sm mx-auto mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">
          نسبة الإنجاز
        </span>
        <span className="text-xs sm:text-sm font-black text-[#B348FE]">
          {value}%
        </span>
      </div>
      <div className="relative h-2 sm:h-2.5 rounded-full bg-gray-100 dark:bg-[#1F1F1F] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-[#B348FE] to-[#8B2FD8] relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${target}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="absolute inset-y-0 w-10 bg-white/30 blur-sm"
            animate={{ left: ["-20%", "120%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

const upcoming = [
  { icon: Trophy, label: "ترتيبك" },
  { icon: Star, label: "نقاطك" },
  { icon: Users2, label: "مقارنة بالزمايل" },
];

export function LeaderboardPage() {
  return (
    <StudentLayout>
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-full">
        <div className="max-w-3xl w-full rounded-[28px] sm:rounded-[32px] p-[1px] bg-gradient-to-br from-[#B348FE]/40 via-gray-100 dark:via-[#2A2A2A] to-amber-300/40 shadow-xl">
          <Card className="w-full bg-white dark:bg-[#111111] border-0 rounded-[27px] sm:rounded-[31px] relative overflow-hidden">
            {/* خلفية شبكية خفيفة */}
            <div
              className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(179,72,254,0.15) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            {/* بقع ضوء ناعمة */}
            <div className="absolute -top-20 -left-20 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#B348FE]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-amber-300/10 blur-3xl pointer-events-none" />

            <CardContent className="relative py-10 sm:py-14 lg:py-16 px-5 sm:px-8 lg:px-12 text-center">
              {/* شارة صغيرة فوق */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#F6EEFF] dark:bg-[#2B103D] text-[#B348FE] text-[11px] sm:text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8">
                <Construction size={13} className="sm:w-4 sm:h-4" />
                جاري البناء
              </div>

              <CraneScene />

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">
                لوحة المتصدرين
              </h1>

              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg leading-6 sm:leading-8 lg:leading-9 mb-6 sm:mb-8 max-w-xl mx-auto">
                إحنا شغالين عليها دلوقتي، هتكون متاحة قريبًا بعد إطلاق
                نظام النقاط والإنجازات داخل المنصة.
              </p>

              <ProgressBar />

              {/* صف اللي جاي */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-6 sm:mb-8">
                {upcoming.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-full px-3 sm:px-4 py-1.5 sm:py-2"
                  >
                    <Icon size={13} className="text-[#B348FE] sm:w-4 sm:h-4" />
                    <span className="text-[11px] sm:text-xs font-bold text-gray-600 dark:text-gray-300">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <Badge
                variant="amber"
                className="text-xs sm:text-sm lg:text-base px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 font-black inline-flex"
              >
                🚧 تحت التطوير
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
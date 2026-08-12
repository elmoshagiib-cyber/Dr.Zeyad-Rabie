import { useEffect, useState } from "react";
import { Wrench, Sparkles } from "lucide-react";

// غيّر التاريخ ده بس لتاريخ ووقت الإطلاق المتوقع (بتوقيت القاهرة)
const LAUNCH_DATE = new Date("2026-08-20T19:00:00+02:00");

function getTimeLeft() {
  const now = new Date().getTime();
  const distance = LAUNCH_DATE.getTime() - now;

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

export function MaintenanceMode() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: "يوم", value: timeLeft.days },
    { label: "ساعة", value: timeLeft.hours },
    { label: "دقيقة", value: timeLeft.minutes },
    { label: "ثانية", value: timeLeft.seconds },
  ];

  return (
    <div
      dir="rtl"
      className="
        fixed inset-0 z-[99999]
        flex items-center justify-center
        bg-gradient-to-br from-[#1a0b2e] via-[#2d1155] to-[#0b0715]
        overflow-hidden
        px-6
      "
    >
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#B348FE]/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#F6AC08]/20 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <div
          className="
            w-20 h-20 sm:w-24 sm:h-24
            mx-auto mb-8
            rounded-3xl
            bg-gradient-to-br from-[#B348FE] to-[#7C1FE0]
            flex items-center justify-center
            shadow-[0_20px_60px_rgba(179,72,254,.5)]
            animate-bounce
          "
          style={{ animationDuration: "2.5s" }}
        >
          <Wrench className="text-white w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="text-[#F6AC08] w-5 h-5" />
          <span className="text-[#F6AC08] font-bold text-sm sm:text-base">
            جاري التطوير
          </span>
          <Sparkles className="text-[#F6AC08] w-5 h-5" />
        </div>

        <h1 className="text-white text-[26px] sm:text-[36px] font-black leading-tight mb-4">
          المنصة بتتحدث دلوقتي
          <br />
          <span className="text-[#B348FE]">عشان تبقى أحسن ليك</span>
        </h1>

        <p className="text-slate-300 text-[15px] sm:text-[17px] leading-8 mb-8">
          إحنا شغالين على تحسينات جديدة هتفيدك في رحلتك الدراسية.
          هنرجع تاني قريبًا جدًا، استنونا شوية 
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
          {timeUnits.map((unit, index) => (
            <div
              key={index}
              className="
                w-16 h-16 sm:w-20 sm:h-20
                rounded-2xl
                bg-white/5
                border border-[#B348FE]/30
                backdrop-blur-sm
                flex flex-col items-center justify-center
                shadow-[0_10px_30px_rgba(179,72,254,.15)]
              "
            >
              <span className="text-white text-xl sm:text-2xl font-black tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-slate-400 text-[10px] sm:text-xs font-bold mt-0.5">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-slate-400 text-xs sm:text-sm mb-6">
          الإطلاق يوم{" "}
          {LAUNCH_DATE.toLocaleDateString("ar-EG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          الساعة{" "}
          {LAUNCH_DATE.toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          بتوقيت القاهرة
        </p>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#B348FE] animate-pulse" />
          <span className="text-slate-300 text-xs sm:text-sm font-bold">
            حالة النظام: التحديث جاري في السكة
          </span>
        </div>

        <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#B348FE] to-[#F6AC08] transition-all duration-1000"
            style={{ width: "45%" }}
          />
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2026-08-20T19:00:00+02:00");

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 864e5),
    hours: Math.floor((diff / 36e5) % 24),
    minutes: Math.floor((diff / 6e4) % 60),
    seconds: Math.floor((diff / 1e3) % 60),
  };
}

export function MaintenanceMode() {
  const [t, setT] = useState(getTimeLeft());
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { label: "يوم", value: t.days },
    { label: "ساعة", value: t.hours },
    { label: "دقيقة", value: t.minutes },
    { label: "ثانية", value: t.seconds },
  ];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden px-6"
      style={{ background: "#0d0717", fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(179,72,254,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(179,72,254,0.06) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-32" style={{ background: "linear-gradient(#0d0717,transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(transparent,#0d0717)" }} />
      <div className="absolute rounded-full" style={{ top:"30%", left:"-80px", width:"320px", height:"320px", background:"rgba(179,72,254,0.12)", filter:"blur(90px)" }} />
      <div className="absolute rounded-full" style={{ bottom:"20%", right:"-80px", width:"260px", height:"260px", background:"rgba(246,172,8,0.08)", filter:"blur(90px)" }} />

      <div className="relative z-10 text-center w-full max-w-lg mx-auto">

        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 mb-7 px-5 py-2 rounded-full"
          style={{ border: "1px solid rgba(179,72,254,0.35)" }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#B348FE" }}
          />
          <span className="text-xs font-bold tracking-wider" style={{ color: "#B348FE" }}>
            جاري التطوير
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-white font-black leading-tight mb-4" style={{ fontSize: "clamp(22px,5vw,38px)" }}>
          المنصة بتتحدث دلوقتي
          <br />
          <span
            style={{
              background: "linear-gradient(90deg,#B348FE,#F6AC08)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            عشان تبقى أحسن ليك
          </span>
        </h1>

        {/* Divider */}
        <div
          className="mx-auto mb-8 rounded-full"
          style={{ width: "48px", height: "2px", background: "linear-gradient(90deg,#B348FE,#F6AC08)" }}
        />

        <p className="text-sm leading-loose mb-9 max-w-sm mx-auto" style={{ color: "#8b8b9a" }}>
          إحنا شغالين على تحسينات جديدة هتفيدك في رحلتك الدراسية.
          هنرجع تاني قريبًا جدًا.
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex flex-col items-center justify-center py-4 rounded-xl gap-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-white font-black text-2xl sm:text-3xl tabular-nums">
                {pad(u.value)}
              </span>
              <span className="text-xs font-bold" style={{ color: "#555568" }}>
                {u.label}
              </span>
            </div>
          ))}
        </div>

        {/* Launch date */}
        <p className="text-xs mb-7" style={{ color: "#555568" }}>
          الإطلاق يوم{" "}
          {LAUNCH_DATE.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}{" "}
          — الساعة{" "}
          {LAUNCH_DATE.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}{" "}
          بتوقيت القاهرة
        </p>

        {/* Progress */}
        <div
          className="w-full max-w-xs mx-auto mb-4 rounded-full overflow-hidden"
          style={{ height: "3px", background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: "62%", background: "linear-gradient(90deg,#B348FE,#F6AC08)" }}
          />
        </div>

        <p className="text-xs font-bold tracking-widest" style={{ color: "#555568" }}>
          التحديث جاي في السكة
        </p>
      </div>
    </div>
  );
}
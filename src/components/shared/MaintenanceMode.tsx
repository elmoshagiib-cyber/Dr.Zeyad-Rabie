import { Lock, TrafficCone, Clock } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

export function MaintenanceMode() {
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto px-4 sm:px-6 py-10"
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
      <div className="absolute rounded-full" style={{ top: "25%", left: "-80px", width: "320px", height: "320px", background: "rgba(179,72,254,0.12)", filter: "blur(90px)" }} />
      <div className="absolute rounded-full" style={{ bottom: "15%", right: "-80px", width: "260px", height: "260px", background: "rgba(246,172,8,0.08)", filter: "blur(90px)" }} />

      <div className="relative z-10 text-center w-full max-w-lg mx-auto">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8 sm:mb-10">
          <img
            src="/images/logo.png"
            alt="مستر زياد ربيع"
            className="w-14 h-14 sm:w-16 sm:h-16 mb-1 object-contain"
          />
          <span className="text-white font-black text-lg sm:text-xl">مستر زياد ربيع</span>
          <span className="text-[11px] sm:text-xs" style={{ color: "#8b8b9a" }}>
            الكيمياء بأسلوب مختلف
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-white font-black leading-tight mb-4" style={{ fontSize: "clamp(24px,6vw,42px)" }}>
          المنصة{" "}
          <span
            style={{
              background: "linear-gradient(90deg,#B348FE,#F6AC08)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            مغلقة
          </span>{" "}
          حاليًا
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-[15px] leading-loose mb-3 max-w-sm mx-auto" style={{ color: "#8b8b9a" }}>
          نحن نعمل حاليًا على بعض التحديثات لنقدم لك تجربة أفضل قريبًا
        </p>

        <p className="text-sm sm:text-[15px] font-bold mb-9 flex items-center justify-center gap-1.5" style={{ color: "#c9a6ff" }}>
          شكرًا لتفهمك ودعمك المستمر
          <span>💜</span>
        </p>

        {/* Illustration */}
        <div className="relative w-full flex items-center justify-center mb-9 sm:mb-10">
          <div className="relative">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] flex items-center justify-center"
              style={{
                background: "linear-gradient(160deg, rgba(179,72,254,0.25), rgba(88,0,169,0.15))",
                border: "1px solid rgba(179,72,254,0.35)",
                boxShadow: "0 20px 60px rgba(179,72,254,.25)",
              }}
            >
              <Lock className="w-11 h-11 sm:w-12 sm:h-12" style={{ color: "#B348FE" }} strokeWidth={1.75} />
            </div>

            {/* Caution stripe */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-28 sm:w-32 h-4 sm:h-5 rounded-full"
              style={{
                background: "repeating-linear-gradient(45deg, #F6AC08 0 10px, #0d0717 10px 20px)",
                opacity: 0.9,
              }}
            />

            {/* Cones */}
            <TrafficCone
              className="absolute -bottom-3 -right-8 sm:-right-10 w-7 h-7 sm:w-8 sm:h-8 rotate-6"
              style={{ color: "#F6AC08" }}
              strokeWidth={2}
            />
            <TrafficCone
              className="absolute -bottom-4 -left-9 sm:-left-11 w-6 h-6 sm:w-7 sm:h-7 -rotate-12"
              style={{ color: "#F6AC08" }}
              strokeWidth={2}
            />

            {/* Badge: جاري الصيانة */}
            <div
              className="absolute -top-2 -left-16 sm:-left-20 whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold"
              style={{
                background: "rgba(13,7,23,0.9)",
                border: "1px solid rgba(179,72,254,0.35)",
                color: "#B348FE",
              }}
            >
              جاري الصيانة
            </div>
          </div>
        </div>

        {/* "We'll be back" pill */}
        <div
          className="inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-5 py-3 rounded-2xl mb-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" style={{ color: "#B348FE" }} />
            <span className="text-white text-sm font-bold">
              سنعود قريبًا بمزيد من الميزات
            </span>
          </div>
          <span className="hidden sm:block w-[1px] h-4" style={{ background: "rgba(255,255,255,0.15)" }} />
          <span className="text-xs" style={{ color: "#8b8b9a" }}>
            تابعنا للحصول على آخر المستجدات
          </span>
        </div>

        {/* Social icons */}
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://www.facebook.com/mr.zeyadrabie?locale=ar_AR"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <FaFacebookF className="text-white text-[15px]" />
          </a>
          <a
            href="https://www.instagram.com/mr.zeyadrabie/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <FaInstagram className="text-white text-[16px]" />
          </a>
        </div>

      </div>
    </div>
  );
}
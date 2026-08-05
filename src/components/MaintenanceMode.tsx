import { Wrench, Sparkles } from "lucide-react";

export function MaintenanceMode() {
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
          هنرجع تاني قريبًا جدًا، استنونا شوية 🚀
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B348FE] animate-pulse" />
          <span
            className="w-2 h-2 rounded-full bg-[#B348FE] animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-[#B348FE] animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
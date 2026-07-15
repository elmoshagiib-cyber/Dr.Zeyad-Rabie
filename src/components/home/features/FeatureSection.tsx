import { BannerCarousel } from "./BannerCarousel";

export function FeatureSection() {
  return (
    <section
      className="
        relative
        bg-white dark:bg-[#09090B]
        py-14 sm:py-20 lg:py-28
        overflow-hidden
      "
      dir="rtl"
    >
      {/* Subtle ambient glow behind carousel */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] opacity-[0.06] dark:opacity-[0.12] blur-[80px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, #A52DFF 0%, #7C1DCC 50%, transparent 100%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Title ────────────────────────────────────────────── */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">

          {/* Eyebrow label */}
          <span
            className="
              inline-flex items-center gap-1.5
              text-[11px] sm:text-[12px] font-bold tracking-widest uppercase
              text-violet-500 dark:text-violet-400
              bg-violet-50 dark:bg-violet-500/10
              border border-violet-100 dark:border-violet-500/20
              px-3 py-1 rounded-full
              mb-5 sm:mb-6
            "
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            المنصة التعليمية الأولى
          </span>

          <h2
            className="
              font-black leading-[1.2]
              text-[28px] sm:text-[42px] lg:text-[58px] xl:text-[64px]
            "
            style={{ fontFamily: "'Alexandria', sans-serif" }}
          >
            {/* Line 1 */}
            <span className="block text-slate-900 dark:text-white mb-1 sm:mb-2">
              ليه تختار
            </span>

            {/* Line 2 — gradient */}
            <span
              className="
                inline-block
                bg-gradient-to-l
                from-[#7C1DCC] via-[#A52DFF] to-[#D900A8]
                bg-clip-text text-transparent
                pb-1
              "
            >
              مستر زياد ربيع؟
            </span>
          </h2>

          {/* Subtitle */}
          <p
            className="
              mt-3 sm:mt-4
              text-slate-500 dark:text-slate-400
              text-[14px] sm:text-[16px] lg:text-[18px]
              leading-[1.7]
              max-w-[480px] mx-auto
            "
          >
            منصة تعليمية متكاملة تجمع بين الشرح الاحترافي والتدريب المكثف لتحقيق أعلى الدرجات.
          </p>
        </div>

        {/* ── Carousel ─────────────────────────────────────────── */}
        <BannerCarousel />

      </div>
    </section>
  );
}

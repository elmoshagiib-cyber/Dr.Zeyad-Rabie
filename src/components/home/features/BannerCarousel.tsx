import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { BANNERS, type Banner } from "./banners";


// ─── Slide Content Animation ───────────────────────────────────────────────
const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.98,
    transition: {
      duration: 0.28,
      ease: "easeIn",
    },
  },
};

// ─── Single Slide ───────────────────────────────────────────────────────────
interface SlideProps {
  banner: Banner;
  isActive: boolean;
}


function Slide({ banner, isActive }: SlideProps) {
    console.log(BANNERS.map(x => x.image));
  return (
   <div
  className="
    relative
    w-full
    h-[250px]
    sm:h-[400px]
    lg:h-[540px]
    xl:h-[580px]
    overflow-hidden
    rounded-[20px]
    sm:rounded-[28px]
    lg:rounded-[36px]
    transition-opacity
    duration-500
  "
  style={{
    opacity: isActive ? 1 : 0.45,
  }}
>

     {/* Background Image */}
<div
  className="absolute inset-0 z-0 overflow-hidden"
>
  <img
    src={banner.image}
    onLoad={() => console.log("loaded", banner.image)}
    alt={banner.title}
    draggable={false}
    className="w-full h-full object-cover"
    style={{
      transform: isActive ? "scale(1.08)" : "scale(1)",
      transition: "transform 6s cubic-bezier(0.25,0.46,0.45,0.94)",
    }}
  />
</div>

{/* Right Gradient */}
<div
  className="absolute inset-0 z-10"
  style={{
    background:
      "linear-gradient(270deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,.12) 70%, transparent 100%)",
  }}
/>

{/* Bottom Gradient */}
<div
  className="absolute inset-0 z-10"
  style={{
    background:
      "linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 50%)",
  }}
/>

{/* Content */}
<div
  className="
    absolute
    inset-0
    z-20
    flex
    items-end
    justify-end
    p-6
    sm:p-10
    lg:p-14
  "
>
  <AnimatePresence mode="wait">
    {isActive && (
      <motion.div
        key={banner.id}
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="
          ml-auto
          max-w-[280px]
          sm:max-w-[360px]
          lg:max-w-[500px]
          text-right
          mb-6
          mr-4
          lg:mr-8
        "
      >
        <h3
          className="
            font-black
            text-white
            leading-[1.15]
            text-[24px]
            sm:text-[34px]
            lg:text-[44px]
            xl:text-[50px]
            mb-3
          "
          style={{
            textShadow: "0 4px 25px rgba(0,0,0,.45)",
          }}
        >
          {banner.title}
        </h3>

        <p
          className="
            hidden
            sm:block
            text-white/85
            text-[14px]
            lg:text-[17px]
            leading-7
            max-w-[560px]
            mb-7
          "
          style={{
            textShadow: "0 2px 12px rgba(0,0,0,.35)",
          }}
        >
          {banner.description}
        </p>

        <div
          className="
            flex
            justify-end
            items-center
            gap-4
            mt-8
            translate-x-14
            lg:translate-x-40
          "
        >
          <button
            className="
              flex
              items-center
              gap-2
              h-12
              px-6
              rounded-2xl
              bg-white
              text-[15px]
              text-slate-900
              font-bold
              shadow-xl
              hover:scale-105
              active:scale-95
              transition-all
            "
          >
            <Play size={18} className="fill-current" />
            ابدأ الآن
          </button>

          <button
            className="
              flex
              items-center
              gap-2
              h-12
              px-6
              rounded-2xl
              bg-white/15
              backdrop-blur-xl
              border
              border-white/25
              text-white
              font-semibold
              text-[15px]
              hover:bg-white/25
              active:scale-95
              transition-all
            "
          >
            <Info size={18} />
            اعرف المزيد
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
    </div>
  );
}

// ─── Arrow Button ───────────────────────────────────────────────────────────
interface ArrowProps {
  onClick: () => void;
  direction: "prev" | "next";
  disabled: boolean;
}

function ArrowButton({ onClick, direction, disabled }: ArrowProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "السابق" : "التالي"}
      className="
        hidden lg:flex
        items-center justify-center
        w-11 h-11
        rounded-full
        bg-white/15 hover:bg-white/30
        backdrop-blur-md
        border border-white/20
        text-white
        shadow-lg
        transition-all duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-0 disabled:pointer-events-none
        z-10
      "
    >
      {direction === "prev" ? (
        <ChevronRight size={18} strokeWidth={2.5} />
      ) : (
        <ChevronLeft size={18} strokeWidth={2.5} />
      )}
    </button>
  );
}

// ─── Indicators ────────────────────────────────────────────────────────────
interface IndicatorsProps {
  count: number;
  active: number;
  onSelect: (i: number) => void;
}

function Indicators({ count, active, onSelect }: IndicatorsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-4 sm:mt-5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`الشريحة ${i + 1}`}
          className="relative h-[5px] rounded-full overflow-hidden transition-all duration-400"
          style={{
            width: active === i ? "28px" : "7px",
            background:
              active === i ? "transparent" : "rgba(148,163,184,0.4)",
            transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {active === i && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #7C1DCC, #A52DFF, #D900A8)",
                animation: "indicatorFill 5s linear forwards",
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main Carousel ──────────────────────────────────────────────────────────
const AUTOPLAY_DELAY = 5000;

export function BannerCarousel() {
  const autoplayPlugin = useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      dragFree: false,
      skipSnaps: false,
    },
    [autoplayPlugin.current]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(true);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollNext();
      if (e.key === "ArrowRight") scrollPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [scrollPrev, scrollNext]);

  return (
    <div className="relative px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* Arrows + Track wrapper */}
      <div className="flex items-center gap-3 lg:gap-4">
        <ArrowButton
          onClick={scrollPrev}
          direction="prev"
          disabled={!canScrollPrev}
        />

        {/* Embla viewport */}
        <div
          ref={emblaRef}
          className="overflow-hidden flex-1 rounded-[20px] sm:rounded-[28px] lg:rounded-[36px]"
          style={{
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          }}
        >
          <div className="flex">
            {BANNERS.map((banner, i) => (
              <div
                key={banner.id}
                className="flex-none w-full min-w-0"
              >
                <Slide
  banner={banner}
  isActive={activeIndex === i}
/>
              </div>
            ))}
          </div>
        </div>

        <ArrowButton
          onClick={scrollNext}
          direction="next"
          disabled={!canScrollNext}
        />
      </div>

      {/* Indicators */}
      <Indicators
        count={BANNERS.length}
        active={activeIndex}
        onSelect={scrollTo}
      />

      {/* CSS for indicator fill animation */}
      <style>{`
        @keyframes indicatorFill {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  );
}

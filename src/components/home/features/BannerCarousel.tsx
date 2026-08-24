import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BANNERS, type Banner } from "./banners";

// ─── Single Slide ───────────────────────────────────────────────────────────
interface SlideProps {
  banner: Banner;
  isActive: boolean;
  isFirst: boolean;
}

function Slide({ banner, isActive, isFirst }: SlideProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="
        relative
        w-full
        h-[220px]
        sm:h-[260px]
        md:h-[340px]
        lg:h-[430px]
        xl:h-[480px]
        2xl:h-[520px]
        overflow-hidden
        rounded-[20px]
        md:rounded-[28px]
        lg:rounded-[36px]
        transition-opacity
        duration-500
        bg-gradient-to-br from-slate-100 to-slate-200
      "
      style={{
        opacity: isActive ? 1 : 0.45,
      }}
    >
      {/* Loading State */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6">
          <svg className="w-16 h-16 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-center">فشل تحميل الصورة</p>
          <p className="text-xs mt-2 opacity-60 text-center max-w-xs break-all">
            {banner.image}
          </p>
        </div>
      )}

      {/* Image */}
      <img
        src={banner.image}
        alt={banner.title}
        draggable={false}
        loading={isFirst ? "eager" : "lazy"}
        fetchPriority={isFirst ? "high" : "auto"}
        className={`
          w-full h-full object-cover select-none transition-opacity duration-300
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        onLoad={() => {
          setImageLoaded(true);
          setImageError(false);
        }}
        onError={(e) => {
          console.error(`❌ Failed to load image: ${banner.image}`);
          console.error('Image element:', e.currentTarget);
          setImageError(true);
          setImageLoaded(false);
        }}
      />
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
        bg-white/90 hover:bg-white
        backdrop-blur-md
        border border-slate-200
        text-slate-700
        shadow-lg
        transition-all duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-0 disabled:pointer-events-none
        z-10
      "
    >
      {direction === "prev" ? (
        <ChevronRight size={20} strokeWidth={2.5} />
      ) : (
        <ChevronLeft size={20} strokeWidth={2.5} />
      )}
    </button>
  );
}

// ─── Indicators ────────────────────────────────────────────────────────────
interface IndicatorsProps {
  count: number;
  active: number;
  onSelect: (i: number) => void;
  progress: number;
}

function Indicators({ count, active, onSelect, progress }: IndicatorsProps) {
  return (
    <div 
      className="flex items-center justify-center gap-1.5 mt-5 sm:mt-6"
      role="tablist"
      aria-label="تنقل البانر"
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`الشريحة ${i + 1}`}
          role="tab"
          aria-selected={active === i}
          tabIndex={0}
          className="
            relative 
            h-[5px] 
            rounded-full 
            overflow-hidden 
            transition-all 
            duration-400
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-purple-500
            focus-visible:ring-offset-2
          "
          style={{
            width: active === i ? "32px" : "8px",
            background: active === i ? "transparent" : "rgba(148,163,184,0.35)",
            transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {active === i && (
            <span
              className="absolute inset-0 rounded-full origin-left"
              style={{
                background: "linear-gradient(90deg, #7C1DCC, #A52DFF, #D900A8)",
                transform: `scaleX(${progress / 100})`,
                transition: "transform 0.05s linear",
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
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setProgress(0);
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

  useEffect(() => {
    if (isHovering) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = (100 / AUTOPLAY_DELAY) * 50;
        return prev + increment;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isHovering, activeIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    const nextIndex = (activeIndex + 1) % BANNERS.length;
    const img = new Image();
    img.src = BANNERS[nextIndex].image;
  }, [activeIndex, emblaApi]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollNext();
      if (e.key === "ArrowRight") scrollPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [scrollPrev, scrollNext]);

  useEffect(() => {
    
    BANNERS.forEach((banner, index) => {
      
    });
  }, []);

  return (
    <div 
      className="relative px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto py-8" 
      dir="rtl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex items-center gap-3 lg:gap-4">
        <ArrowButton
          onClick={scrollPrev}
          direction="prev"
          disabled={!canScrollPrev}
        />

        <div
          ref={emblaRef}
          className="
            overflow-hidden 
            flex-1 
            rounded-[20px] 
            md:rounded-[28px] 
            lg:rounded-[36px]
          "
          style={{
            boxShadow: "0 18px 45px rgba(0,0,0,0.12)",
          }}
          role="region"
          aria-roledescription="carousel"
          aria-label="عرض البانرات"
        >
          <div className="flex">
            {BANNERS.map((banner, i) => (
              <div key={banner.id} className="flex-none w-full min-w-0">
                <Slide banner={banner} isActive={activeIndex === i} isFirst={i === 0} />
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

      <Indicators
        count={BANNERS.length}
        active={activeIndex}
        onSelect={scrollTo}
        progress={progress}
      />
    </div>
  );
}
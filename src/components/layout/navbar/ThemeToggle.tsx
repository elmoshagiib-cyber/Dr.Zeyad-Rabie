import { useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

// ────────────────────────────────────────────────
// Design tokens (avoid magic numbers)
// ────────────────────────────────────────────────
const TRACK = {
  width: 68,
  height: 34,
  padding: 3,
} as const;

const KNOB = {
  size: 28,
} as const;

const KNOB_TRAVEL = TRACK.width - KNOB.size - TRACK.padding * 2; // = 38

const SPRING: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 34,
  mass: 0.7,
};

// مدة الستارة اللي بتتحرك من اليمين للشمال عند تبديل المود
const WIPE_DURATION = 0.5; // بالثواني

export function ThemeToggle({ isDark, toggleTheme }: ThemeToggleProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isWiping, setIsWiping] = useState(false);

  const handleToggle = () => {
    if (isWiping) return; // يمنع الضغط المتكرر أثناء الأنيميشن

    if (prefersReducedMotion) {
      toggleTheme(); // بدّل على طول من غير ستارة لو المستخدم مفعّل تقليل الحركة
      return;
    }

    setIsWiping(true);
  };

  // Respect user motion preferences
  const knobTransition = useMemo<Transition>(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : SPRING,
    [prefersReducedMotion]
  );

  const iconTransition = useMemo<Transition>(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    [prefersReducedMotion]
  );

  return (
    <>
    <motion.button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={
        isDark
          ? "التبديل إلى الوضع الفاتح"
          : "التبديل إلى الوضع الداكن"
      }
      title={isDark ? "Light mode" : "Dark mode"}
      onClick={handleToggle}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
      transition={SPRING}
      style={{
        width: TRACK.width,
        height: TRACK.height,
        padding: TRACK.padding,
      }}
className="
  group
  relative
  isolate
  z-[100]
  flex
  items-center
  shrink-0
  rounded-full
  cursor-pointer
  overflow-hidden

  bg-[#B348FE]

  shadow-lg
  hover:bg-[#B348FE]

  transition-all
  duration-300

  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-[#B348FE]
  focus-visible:ring-offset-2
  focus-visible:ring-offset-white
  dark:focus-visible:ring-offset-neutral-950
"
    >
      {/* Track icons (behind the knob) */}
<span
  aria-hidden
  className="absolute inset-0 flex items-center justify-between px-[9px]"
>
  {/* القمر على الشمال */}
  <motion.span
    initial={false}
    animate={{
      opacity: isDark ? 0 : 0.45,
      scale: isDark ? 0.7 : 1,
    }}
    transition={iconTransition}
    className="text-white drop-shadow-sm"
  >
    <Moon size={13} strokeWidth={2.4} />
  </motion.span>

  {/* الشمس على اليمين */}
  <motion.span
    initial={false}
    animate={{
      opacity: isDark ? 0.45 : 0,
      scale: isDark ? 1 : 0.7,
    }}
    transition={iconTransition}
    className="text-white drop-shadow-sm"
  >
    <Sun size={14} strokeWidth={2.4} />
  </motion.span>
</span>

      {/* Moving Knob */}
      <motion.span
        initial={false}
animate={{
  x: isDark ? KNOB_TRAVEL : 0,
}}
        transition={knobTransition}
        style={{
          width: KNOB.size,
          height: KNOB.size,
        }}
  className="
  absolute
  left-[3px]
  top-[3px]

  z-10

  flex
  items-center
  justify-center

  rounded-full

  bg-white

  ring-1
  ring-black/5
"
      >
        <AnimatePresence mode="wait" initial={false}>
{isDark ? (
  <motion.span
    key="moon"
    initial={{ opacity: 0, rotate: -180, scale: 0.6 }}
    animate={{ opacity: 1, rotate: 0, scale: 1 }}
    exit={{ opacity: 0, rotate: 180, scale: 0.6 }}
    transition={iconTransition}
    className="text-[#B348FE]"
  >
    <Moon
      size={14}
      strokeWidth={2.5}
      fill="currentColor"
    />
  </motion.span>
) : (
  <motion.span
    key="sun"
    initial={{ opacity: 0, rotate: 180, scale: 0.6 }}
    animate={{ opacity: 1, rotate: 0, scale: 1 }}
    exit={{ opacity: 0, rotate: -180, scale: 0.6 }}
    transition={iconTransition}
    className="text-[#B348FE]"
  >
    <Sun
      size={14}
      strokeWidth={2.5}
    />
  </motion.span>
)}
        </AnimatePresence>
      </motion.span>
    </motion.button>

    {/* الستارة اللي بتتحرك من اليمين للشمال زي الفيديو بالظبط */}
    {isWiping && (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100vw" }}
        transition={{ duration: WIPE_DURATION, ease: [0.65, 0, 0.35, 1] }}
        onAnimationComplete={() => {
          // لما الستارة تغطي الشاشة بالكامل، بدّل المود الحقيقي تحتها
          toggleTheme();
          setIsWiping(false);
        }}
        className={`fixed inset-y-0 right-0 z-[90] pointer-events-none ${
          isDark ? "bg-white" : "bg-neutral-950"
        }`}
      />
    )}
    </>
  );
}
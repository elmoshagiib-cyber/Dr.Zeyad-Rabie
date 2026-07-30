import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export function ThemeToggle({
  isDark,
  toggleTheme,
}: ThemeToggleProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={
        isDark
          ? "التبديل إلى الوضع الفاتح"
          : "التبديل إلى الوضع الداكن"
      }
      onClick={toggleTheme}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
className="
relative
flex
items-center
w-14
h-8
sm:w-16
sm:h-9
px-1
rounded-full
overflow-hidden
bg-[#B348FE]
cursor-pointer
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-[#B348FE]
focus-visible:ring-offset-2
shrink-0
"
    >
      <span className="absolute left-[7px]">
        <Moon
          size={16}
          className="text-white"
        />
      </span>

      <span className="absolute right-[7px]">
        <Sun
          size={16}
          className="text-white"
        />
      </span>

      <motion.span
        layout
animate={{
  x: isDark ? 28 : 0,
}}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
        }}
       className="
absolute
left-1
z-10
flex
items-center
justify-center
w-7
h-7
rounded-full
bg-white
shadow-md
"
      />
    </motion.button>
  );
}
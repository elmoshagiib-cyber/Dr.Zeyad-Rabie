import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void; // بيبدأ الستارة، مش بيبدل الثيم فورًا
  isDark: boolean;
  isWiping: boolean;
  finishWipe: () => void; // بتتنده لما الستارة تخلص عشان تبدل الثيم فعليًا
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  isDark: false,
  isWiping: false,
  finishWipe: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme;
    return saved || "light";
  });

  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    const isInstructorDashboard =
      window.location.pathname.startsWith("/instructor");

    if (isInstructorDashboard) {
      root.classList.remove("dark");
      return;
    }

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    if (isWiping) return;
    setIsWiping(true);
  };

  const finishWipe = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    setIsWiping(false);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isDark: theme === "dark", isWiping, finishWipe }}
    >
      <ThemeWipeOverlay isWiping={isWiping} isDark={theme === "dark"} onDone={finishWipe} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// ============ الستارة نفسها ============
import { motion } from "framer-motion";

const WIPE_DURATION = 0.5;

function ThemeWipeOverlay({
  isWiping,
  isDark,
  onDone,
}: {
  isWiping: boolean;
  isDark: boolean;
  onDone: () => void;
}) {
  if (!isWiping) return null;

  return (
    <motion.div
      initial={{ clipPath: "inset(0 0 0 100%)" }}
      animate={{ clipPath: "inset(0 0 0 0%)" }}
      transition={{ duration: WIPE_DURATION, ease: [0.65, 0, 0.35, 1] }}
      onAnimationComplete={onDone}
      className={`fixed inset-0 -z-10 pointer-events-none ${
        isDark ? "bg-white" : "bg-[#0b0715]"
      }`}
    />
  );
}
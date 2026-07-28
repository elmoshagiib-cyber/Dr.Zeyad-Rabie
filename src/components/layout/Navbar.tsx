import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GuestActions } from "./navbar/GuestActions";
import { ThemeToggle } from "./navbar/ThemeToggle";
import { SearchButton } from "./navbar/SearchButton";
import { motion, AnimatePresence } from "framer-motion";
import { UserMenu } from "./navbar/UserMenu";

import { FaReact } from "react-icons/fa6";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";
export function Navbar() {
const [scrollProgress, setScrollProgress] = useState(0);


  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useApp();
  const { isDark, toggleTheme } = useTheme();


useEffect(() => {
  const handleScroll = () => {

    const totalHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const progress =
      (window.scrollY / totalHeight) * 100;

    setScrollProgress(progress);
  };

  window.addEventListener("scroll", handleScroll);

  return () =>
    window.removeEventListener("scroll", handleScroll);
}, []);


  return (
<nav
  className={`
    fixed
    top-0
    left-0
    right-0
    z-50
    w-full
    bg-white
    dark:bg-[#111111]
    border-b
    border-[#ECECEC]
    dark:border-[#2A2A2A]
    transition-all
    duration-300
  `}
>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-24 flex items-center justify-between">
<div className="flex items-center gap-3 pr-3">

  {/* Mobile Center Logo */}
<div
  className="
  md:hidden
  absolute
  left-1/2
  -translate-x-1/2
  "
>
  <button
    onClick={() => navigate("/")}
    className="flex items-center justify-center"
  >
    <img
      src={isDark ? "/images/logo-dark.png" : "/images/logo-light.png"}
      alt="د. زياد ربيع"
      className="h-15 object-contain"
    />
  </button>
</div>

  {/* Logo */}
  <button
  className="
  hidden
  md:flex
  items-center
  justify-center
  transition-all
  duration-200
  hover:scale-105
  "
  onClick={() => navigate("/")}
>
    <img
      src={isDark ? "/images/logo-dark.png" : "/images/logo-light.png"}
      alt="د. زياد ربيع"
      className="
      h-10
      sm:h-12
      lg:h-16
      object-contain
      "
    />
  </button>

  <ThemeToggle
    isDark={isDark}
    toggleTheme={toggleTheme}
  />

  {/* Desktop Only */}
  <div className="hidden md:block">
    <SearchButton />
  </div>

</div>
          {/* Right Side */}
          <div className="flex items-center gap-4">
           
          {user ? (
  <UserMenu />
) : (
  <GuestActions navigate={navigate} />
)}
       
            {/* Mobile Menu Toggle */}
           {!user && (
  <button
    onClick={() => setMobileOpen(!mobileOpen)}
    className="
md:hidden
flex
items-center
justify-center
w-11
h-11
bg-transparent
p-0
"
  >
   <AnimatePresence mode="wait">
  {!mobileOpen ? (
    <motion.div
      key="menu"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col justify-center gap-[5px]"
    >
      <span className="block w-7 h-[3px] rounded-full bg-[#FF4D73]" />
      <span className="block w-7 h-[3px] rounded-full bg-[#FF4D73]" />
      <span className="block w-7 h-[3px] rounded-full bg-[#FF4D73]" />
    </motion.div>
  ) : (
    <motion.div
      key="atom"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.2 }}
    >
   <motion.div
  animate={{ rotate: 360 }}
  transition={{
    repeat: Infinity,
    duration: 4,
    ease: "linear",
  }}
>
  <FaReact
    size={28}
    className="text-[#FF4D73]"
  />
</motion.div>

    </motion.div>
  )}
</AnimatePresence>

  </button>
)}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
            {!user && mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#1E244F] border-t border-slate-100 p-4">
          <div className="space-y-1">
            <button
onClick={() => navigate("/login")}
className="
w-full
h-[52px]
rounded-xl
border
border-[#422E91]
text-[#422E91]
hover:bg-[#422E91]
hover:text-white
transition-all
duration-300
mb-3
"
>
تسجيل الدخول
</button>

<button
  onClick={() => navigate("/register")}
  className="
group
relative
overflow-hidden
w-full
h-[52px]
rounded-xl
bg-[#422E91]
hover:bg-[#5340A8]
text-white
font-semibold
shadow-[0_12px_30px_rgba(66,46,145,.35)]
transition-all
duration-300
"
>
  <div
    className="
absolute
inset-0
bg-white/10
opacity-0
group-hover:opacity-100
transition-opacity
duration-300
"
  />

  <span className="relative z-10">
    إنشاء حساب
  </span>
</button>
          </div>
        </div>
      )}
   <div
  className="
absolute
bottom-0
left-0
w-full
h-[4px]
bg-[#D9F7F4]
overflow-hidden
"
>
  <motion.div
    className="
h-full
bg-[#27D3C2]
"
    style={{
      width: `${scrollProgress}%`,
    }}
  />
</div>

    </nav>
  );
}
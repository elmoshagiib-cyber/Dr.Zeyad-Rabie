import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GuestActions } from "./navbar/GuestActions";
import { ThemeToggle } from "./navbar/ThemeToggle";

import { motion, AnimatePresence } from "framer-motion";
import { UserMenu } from "./navbar/UserMenu";

import { FaReact } from "react-icons/fa6";
import { Bell, Search, Users, Timer, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { ParentAccessModal } from "./navbar/ParentAccessModal";
export function Navbar() {
const [scrollProgress, setScrollProgress] = useState(0);


  const [mobileOpen, setMobileOpen] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useApp();
  const { isDark, toggleTheme } = useTheme();
const [isScrolled, setIsScrolled] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);

const [bannerNotif, setBannerNotif] = useState<{ id: number; title: string; banner_end_at: string } | null>(null);
const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
const [bannerVisible, setBannerVisible] = useState(false);

const loadBanner = useCallback(async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, banner_end_at")
    .eq("is_banner", true)
    .eq("is_active", true)
    .gt("banner_end_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return;

  if (!data) {
    setBannerNotif(null);
    setBannerVisible(false);
    return;
  }

  const dismissedId = localStorage.getItem("dismissed_banner_id");
  setBannerNotif(data);
  setBannerVisible(dismissedId !== String(data.id));
}, []);

useEffect(() => {
  loadBanner();

  const interval = setInterval(loadBanner, 20000);

  const handleVisibility = () => {
    if (document.visibilityState === "visible") loadBanner();
  };
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, [loadBanner]);

useEffect(() => {
  if (!bannerNotif?.banner_end_at) return;

  const updateCountdown = () => {
    const diff = new Date(bannerNotif.banner_end_at).getTime() - Date.now();

    if (diff <= 0) {
      setBannerVisible(false);
      setTimeLeft(null);
      return;
    }

    setTimeLeft({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    });
  };

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);

  return () => clearInterval(interval);
}, [bannerNotif]);

const dismissBanner = () => {
  if (bannerNotif) {
    localStorage.setItem("dismissed_banner_id", String(bannerNotif.id));
  }
  setBannerVisible(false);
};

useEffect(() => {
  const loadUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("notification_reads")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.studentId)
      .is("read_at", null);

    if (!error) {
      setUnreadCount(count || 0);
    }
  };

  loadUnreadCount();
}, [user]);

useEffect(() => {
const handleScroll = () => {
  const scrollY = window.scrollY;

  const totalHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const progress = (scrollY / totalHeight) * 100;

  setScrollProgress(progress);

  setIsScrolled(scrollY > 0);
};

  window.addEventListener("scroll", handleScroll);

  return () =>
    window.removeEventListener("scroll", handleScroll);
}, []);


  return (
    <>
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col">

      <AnimatePresence>
        {bannerVisible && bannerNotif && timeLeft && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full overflow-hidden bg-[#0B0E17] text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <span className="truncate text-[13px] sm:text-[16px] font-extrabold">
                  {bannerNotif.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {[
                  { value: timeLeft.seconds, label: "ث" },
                  { value: timeLeft.minutes, label: "د" },
                  { value: timeLeft.hours, label: "س" },
                  { value: timeLeft.days, label: "يوم", highlight: true },
                ].map((unit, i) => (
                  <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                    {i > 0 && <span className="text-white/30 font-bold text-sm">:</span>}
                    <div
                      className={`flex flex-col items-center rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[38px] sm:min-w-[50px] ${
                        unit.highlight ? "bg-red-500" : "bg-white/10"
                      }`}
                    >
                      <span className="text-[14px] sm:text-[18px] font-black leading-none tabular-nums text-white">
                        {String(unit.value).padStart(2, "0")}
                      </span>
                      <span className={`text-[8px] sm:text-[9px] leading-none mt-0.5 ${unit.highlight ? "text-white/85" : "text-white/60"}`}>
                        {unit.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={dismissBanner}
                className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/15 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

<nav
  className={`
    relative
    w-full
    bg-white
    dark:bg-[#09090B]
    transition-all
    duration-300
    ${
      isScrolled
        ? "border-b border-[#ECECEC] dark:border-[#2A2A2A]"
        : "border-b border-transparent"
    }
  `}
>

      <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="relative h-24 flex items-center justify-between">
<div className="flex items-center gap-3 pr-1 sm:pr-3">

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

<div className="flex items-center gap-2">
  <ThemeToggle
    isDark={isDark}
    toggleTheme={toggleTheme}
  />

  <button
    onClick={() => navigate("/search")}
    className="
      flex
      items-center
      justify-center

      w-9
      h-9
      sm:w-10
      sm:h-10

      rounded-full

      border
      border-gray-200
      dark:border-[#2A2A2A]

      bg-white
      dark:bg-[#111111]

      hover:border-[#B348FE]
      hover:text-[#B348FE]

      transition-all
      duration-300
    "
  >
    <Search className="w-4 h-4" />
  </button>
</div>

  

</div>
          {/* Right Side */}
         <div className="flex items-center gap-1.5 sm:gap-3">

  {user ? (
    <>
{/* Notification */}
      <button
        onClick={() => navigate("/dashboard/announcements")}
        className="
          relative
          flex
          items-center
          justify-center

          w-11
          h-11
          sm:w-12
          sm:h-12

          rounded-full

          border
          border-gray-200
          dark:border-[#2A2A2A]

          bg-white
          dark:bg-[#111111]

          hover:border-[#B348FE]
          hover:text-[#B348FE]

          transition-all
          duration-300
        "
      >
        <Bell className="w-5 h-5" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span
            className="
              absolute
              top-2
              right-2

              w-2.5
              h-2.5

              rounded-full
              bg-red-500
            "
          />
        )}
      </button>

      <UserMenu />
    </>
  ) : (
    <>
      <GuestActions navigate={navigate} />
    </>
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
      <span className="block w-7 h-[3px] rounded-full bg-[#B348FE]" />
      <span className="block w-7 h-[3px] rounded-full bg-[#B348FE]" />
      <span className="block w-7 h-[3px] rounded-full bg-[#B348FE]" />
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
    className="text-[#B348FE]"
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
border-[#B348FE]
text-[#B348FE]
hover:bg-[#B348FE]
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
bg-[#B348FE]
hover:bg-[#9A2EFF]
text-white
font-semibold
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


<AnimatePresence>
  {isScrolled && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="
        absolute
        bottom-0
        left-0
        w-full
        h-[3px]
        bg-[#B348FE]/15
        pointer-events-none
      "
    >
      <motion.div
        className="h-full bg-[#B348FE]"
        initial={{ width: "0%" }}
        animate={{ width: `${scrollProgress}%` }}
        transition={{
          duration: 0.1,
          ease: "linear",
        }}
      />
    </motion.div>
  )}
</AnimatePresence>

    </nav>
    </div>

    <ParentAccessModal open={showParentModal} onClose={() => setShowParentModal(false)} />
    </>
  );
}
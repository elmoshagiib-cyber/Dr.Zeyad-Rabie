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
import { LoginButton } from "./navbar/LoginButton";
import { RegisterButton } from "./navbar/RegisterButton";
export function Navbar() {
const [scrollProgress, setScrollProgress] = useState(0);


  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useApp();
  const { isDark, toggleTheme } = useTheme();
const [isScrolled, setIsScrolled] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);

const [bannerNotif, setBannerNotif] = useState<{ id: number; title: string; is_pinned: boolean; banner_end_at: string | null } | null>(null);
const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
const [bannerVisible, setBannerVisible] = useState(false);

const loadBanner = useCallback(async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, is_pinned, is_banner, banner_end_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return;

  if (!data) {
    setBannerNotif(null);
    setBannerVisible(false);
    return;
  }

  // لو ده إشعار "شريط عداد" وانتهى وقته، اعتبره غير موجود
  if (data.is_banner && data.banner_end_at && new Date(data.banner_end_at).getTime() <= Date.now()) {
    setBannerNotif(null);
    setBannerVisible(false);
    return;
  }

  const dismissedId = localStorage.getItem("dismissed_banner_id");
  const wasDismissed = dismissedId === String(data.id);

  setBannerNotif(data);
  setBannerVisible(data.is_pinned || !wasDismissed);
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
  if (!bannerNotif?.banner_end_at) {
    setTimeLeft(null);
    return;
  }

  const updateCountdown = () => {
    const diff = new Date(bannerNotif.banner_end_at as string).getTime() - Date.now();

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

  // على الموبايل: شكل الكبسولة يفضل ثابت طول الوقت (مش مرتبط بالسكرول)
  // على التابلت والدسكتوب: يفضل زي ما هو من غير أي تغيير
  const isMobileView = window.innerWidth < 768;
  setIsScrolled(isMobileView);
};

  handleScroll();

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
  };
}, []);


  return (
    <>
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col">

      <AnimatePresence>
        {bannerVisible && bannerNotif && (
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

              {timeLeft && (
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
              )}

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
    bg-white
    dark:bg-[#09090B]
    transition-all
    duration-300
    ease-out
    ${
      isScrolled
        ? "w-[calc(100%-56px)] sm:w-[calc(100%-72px)] max-w-3xl mx-auto mt-3 rounded-full border border-[#ECECEC] dark:border-[#2A2A2A] shadow-[0_8px_30px_rgba(0,0,0,.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,.45)]"
        : "w-full mt-0 rounded-none border-b border-transparent shadow-none"
    }
  `}
>

      <div
        className={`
          w-full max-w-7xl mx-auto transition-[padding] duration-300
          ${isScrolled ? "px-4 sm:px-5" : "px-5 sm:px-6 lg:px-8"}
        `}
      >
        <div
          className={`
            relative flex items-center justify-between
            transition-[height] duration-300
            ${isScrolled ? "h-[72px] sm:h-20" : "h-24"}
          `}
        >
<div className="flex items-center gap-3 pr-1 sm:pr-3">

  {/* Centered Logo (mobile only) */}
<div
  className="
  absolute
  left-1/2
  -translate-x-1/2
  md:hidden
  z-10
  "
>
  <button
    type="button"
    onClick={() => navigate("/")}
    className="
    flex
    items-center
    justify-center
    cursor-pointer
    transition-all
    duration-200
    hover:scale-105
    "
  >
    <img
      src={isDark ? "/images/logo-dark.png" : "/images/logo-light.png"}
      alt="د. زياد ربيع"
      className="
      h-14
      sm:h-16
      lg:h-20
      object-contain
      "
    />
  </button>
</div>

<div className={`flex items-center transition-[gap] duration-300 ${isScrolled ? "gap-1" : "gap-2"}`}>
  <button
    type="button"
    onClick={() => navigate("/")}
    className="
    hidden
    md:flex
    items-center
    justify-center
    cursor-pointer
    transition-all
    duration-200
    hover:scale-105
    "
  >
    <img
      src={isDark ? "/images/logo-dark.png" : "/images/logo-light.png"}
      alt="د. زياد ربيع"
      className="
      h-11
      lg:h-14
      object-contain
      "
    />
  </button>

  <ThemeToggle
    isDark={isDark}
    toggleTheme={toggleTheme}
  />
</div>

  

</div>
          {/* Right Side */}
         <div className={`flex items-center transition-[gap] duration-300 ${isScrolled ? "gap-1" : "gap-1.5 sm:gap-3"}`}>

  {user ? (
    <>
{/* Notification */}
      <button
        onClick={() => navigate("/dashboard/announcements")}
        className={`
          relative
          flex
          items-center
          justify-center
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
          ${isScrolled ? "w-9 h-9" : "w-11 h-11 sm:w-12 sm:h-12"}
        `}
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
    aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
    className={`
md:hidden
flex
items-center
justify-center
bg-transparent
p-0
transition-[width,height]
duration-300
${isScrolled ? "w-9 h-9" : "w-11 h-11"}
`}
  >
    <div className="relative w-7 h-[18px] flex items-center justify-center">
      <motion.span
        animate={{
          rotate: mobileOpen ? 45 : 0,
          y: mobileOpen ? 0 : -7,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="absolute w-7 h-[3px] rounded-full bg-[#5800a9] dark:bg-[#b600d7]"
      />
      <motion.span
        animate={{
          opacity: mobileOpen ? 0 : 1,
          scale: mobileOpen ? 0 : 1,
        }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="absolute w-7 h-[3px] rounded-full bg-[#5800a9] dark:bg-[#b600d7]"
      />
      <motion.span
        animate={{
          rotate: mobileOpen ? -45 : 0,
          y: mobileOpen ? 0 : 7,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="absolute w-7 h-[3px] rounded-full bg-[#5800a9] dark:bg-[#b600d7]"
      />
    </div>
  </button>
)}
          </div>
        </div>
      </div>



<div
  className={`
    absolute inset-0 pointer-events-none overflow-hidden
    ${isScrolled ? "rounded-full" : "rounded-none"}
  `}
>
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: scrollProgress > 0 ? 1 : 0 }}
    transition={{
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    }}
    className="
      absolute
      bottom-0
      left-0
      w-full
      h-[5px]
      bg-[#B348FE]/15
    "
  >
    <motion.div
      className="h-full bg-[#5800a9] dark:bg-[#b600d7]"
      initial={{ width: "0%" }}
      animate={{ width: `${scrollProgress}%` }}
      transition={{
        duration: 0.1,
        ease: "linear",
      }}
    />
  </motion.div>
</div>

    </nav>

    <AnimatePresence>
      {!user && mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="
            md:hidden
            w-[calc(100%-56px)]
            max-w-3xl
            mx-auto
            mt-2
            rounded-[28px]
            bg-white
            dark:bg-[#111111]
            border
            border-[#ECECEC]
            dark:border-[#2A2A2A]
            shadow-[0_8px_30px_rgba(0,0,0,.12)]
            dark:shadow-[0_8px_30px_rgba(0,0,0,.45)]
            p-4
          "
        >
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/register")}
              className="
                w-full
                h-[52px]
                rounded-full
                bg-[#5800a9]
                hover:bg-[#420080]
                dark:bg-[#b600d7]
                dark:hover:bg-[#9a00b5]
                text-white
                font-semibold
                transition-all
                duration-300
              "
            >
              إنشاء حساب
            </button>

            <button
              onClick={() => navigate("/login")}
              className="
                w-full
                h-[52px]
                rounded-full
                border-2
                border-[#5800a9]
                dark:border-[#b600d7]
                text-[#5800a9]
                dark:text-[#b600d7]
                font-semibold
                hover:bg-[#5800a9]
                hover:text-white
                dark:hover:bg-[#b600d7]
                dark:hover:text-white
                transition-all
                duration-300
              "
            >
              تسجيل الدخول
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>

    </>
  );
}
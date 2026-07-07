import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import { motion } from "motion/react";
import {
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  User,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
const iconStyle =
  "text-slate-500 dark:text-slate-300 transition-all duration-300 group-hover:text-violet-600";
export function Navbar() {
const [scrollProgress, setScrollProgress] = useState(0);


  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
const [notificationsOpen, setNotificationsOpen] = useState(false);
const [profileOpen, setProfileOpen] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20);

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
sticky
top-4
relative
overflow-hidden
z-50
mx-auto
w-[96%]
max-w-[1500px]
rounded-[26px]
bg-white/90
dark:bg-[#130726]/90
backdrop-blur-2xl
before:absolute
before:inset-0
before:rounded-[26px]
before:bg-gradient-to-b
before:from-white/5
before:to-transparent
before:pointer-events-none
border
border-violet-200/40
dark:border-white/10
transition-all
duration-300
${
  isScrolled
    ? "shadow-[0_15px_50px_rgba(124,29,204,.18)]"
    : "shadow-[0_8px_25px_rgba(124,29,204,.08)]"
}
`}
>

      <div className="px-8 lg:px-10">
        <div className="flex items-center justify-between h-[76px]">
          <div className="flex items-center gap-4 pr-3">

  {/* Logo */}
  <button
    onClick={() => navigate("/")}
    className="
flex
items-center
justify-center
transition-all
duration-200
ease-out
hover:scale-[1.05]
hover:drop-shadow-[0_0_10px_rgba(124,58,237,.25)]
"
  >
    
    <img
      src={isDark ? "/images/logo-dark.png" : "/images/logo-light.png"}
      alt="د. زياد ربيع"
      className="
h-8
sm:h-10
lg:h-[56px]
object-contain
"
    />
  </button>

  {/* Theme Button */}
  <motion.button
  onClick={toggleTheme}
  whileHover={{ scale: 1.04 }}
  whileTap={{ scale: 0.96 }}
  transition={{
    type: "spring",
    stiffness: 500,
    damping: 30,
  }}
  className="
relative
w-[78px]
h-[42px]
rounded-full
overflow-hidden
bg-gradient-to-r
from-[#5B21B6]
via-[#6D28D9]
to-[#8B5CF6]
shadow-[0_8px_25px_rgba(91,33,182,.35)]
"
>

  {/* Background Glow */}

  <div
    className="
absolute
inset-0
bg-gradient-to-t
from-black/10
to-white/10
"
  />

  {/* Knob */}

  <motion.div
    layout
    transition={{
      type: "spring",
      stiffness: 500,
      damping: 32,
    }}
    className={`
absolute
top-[3px]
${isDark ? "left-[3px]" : "left-[39px]"}
w-[36px]
h-[36px]
rounded-full
bg-white
shadow-[0_6px_20px_rgba(0,0,0,.18)]
flex
items-center
justify-center
`}
  >
    {isDark ? (
      <Moon
        size={18}
        strokeWidth={2.4}
        className="text-[#5B21B6]"
      />
    ) : (
      <Sun
        size={18}
        strokeWidth={2.4}
        className="text-[#F59E0B]"
      />
    )}
  </motion.div>

  {/* Left Icon */}

  <Moon
    size={14}
    strokeWidth={2.3}
    className="
absolute
left-4
top-1/2
-translate-y-1/2
text-white/60
"
  />

  {/* Right Icon */}

  <Sun
    size={14}
    strokeWidth={2.3}
    className="
absolute
right-4
top-1/2
-translate-y-1/2
text-white/60
"
  />

</motion.button>

</div>
          {/* Right Side */}
          <div className="flex items-center gap-4">
           
            {user ? (
              <>
                
                <div className="relative">
  <button
    onClick={() => setNotificationsOpen(!notificationsOpen)}
className="
relative
group
w-11
h-[48px]
rounded-2xl
flex
items-center
justify-center
hover:bg-violet-50
dark:hover:bg-white/5
transition-all
duration-200
"
  >
    <Bell
size={21}
strokeWidth={2.3}
className={iconStyle}
/>

    {notifications.length > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#EF4444]
ring-2
ring-white text-white text-[10px] rounded-full flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </button>
  
<div className="relative flex items-center gap-4">

  {/* Avatar */}
  <button
  onClick={() => setProfileOpen(!profileOpen)}
  className="
    flex
    items-center
    gap-3
    h-[52px]
    pl-3
    pr-2
    rounded-2xl
    bg-white
    dark:bg-[#171024]
    border
    border-[#DDD6FE]
    dark:border-white/10
    shadow-sm
    hover:shadow-[0_5px_15px_rgba(0,0,0,.18)]
    hover:border-violet-300
    transition-all
    duration-300
  "
>
  <div
    className="
     w-11
h-11
      rounded-full
      bg-gradient-to-br
      from-violet-700
      via-purple-600
      to-fuchsia-500
      flex
      items-center
      justify-center
      text-white
    "
  >
    <User size={18} strokeWidth={2.3} className={iconStyle} />
  </div>

  <div className="text-right">
    <p className="text-sm font-bold text-slate-900 dark:text-white">
      {user?.name?.split(" ").slice(0, 2).join(" ")}
    </p>

  <p className="text-[11px] text-slate-500">
  {user?.grade}
</p>

  </div>

  <ChevronDown
    size={18}
    className={`
      text-slate-400
      transition-transform
      duration-300
      ${profileOpen ? "rotate-180" : ""}
    `}
  />
</button>

  {profileOpen && (
    <div
      className="
        absolute
        left-0
        top-full
        mt-3
        w-72
        rounded-[28px]
        bg-white
        dark:bg-[#171024]
        border
        border-[#DDD6FE]
        dark:border-white/10
        shadow-[0_25px_60px_rgba(0,0,0,.12)]
        overflow-hidden
        z-50
      "
    >
      {/* Header */}
      <div className="p-6 flex items-center gap-4">

        <div
          className="
            w-14
            h-14
            rounded-full
            bg-gradient-to-br
            from-violet-700
            to-fuchsia-500
            flex
            items-center
            justify-center
            text-white
            font-bold
            text-lg
          "
        >
          <User size={24} />
        </div>

        <div>
         <h3 className="font-bold text-slate-900 dark:text-white">
  {user?.name?.split(" ").slice(0, 2).join(" ")}
</h3>

          <p className="text-xs text-slate-500">
           {user?.grade}
          </p>
        </div>

      </div>

      <div className="border-t border-slate-100 dark:border-white/10">

<button
  onClick={() => {
    setProfileOpen(false);
    navigate("/dashboard");
  }}
  className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition"
>
  <User size={18} />
  <span>حسابي</span>
</button>

<button
  onClick={() => {
    setProfileOpen(false);
    navigate("/dashboard/courses");
  }}
  className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition"
>
  <BookOpen size={18} />
  <span>كورساتي</span>
</button>

<button
onClick={()=>{
setProfileOpen(false);
navigate("/profile");
}}
>
  <Settings size={18} />
  <span>الإعدادات</span>
</button>

<button
  onClick={async () => {
  await supabase.auth.signOut();

  logout();

  setProfileOpen(false);

  navigate("/");
}}
  className="w-full flex items-center justify-between px-6 py-3 text-red-500 hover:bg-red-50 transition"
>
  <LogOut size={18} />
  <span>تسجيل الخروج</span>
</button>

      </div>

    </div>
  )}

</div>

</div>
  {notificationsOpen && (
    <div
      className="
      absolute left-0 top-full mt-3
      w-[280px]
sm:w-[380px]
lg:w-[420px]
      bg-white
      rounded-3xl
      shadow-[0_25px_60px_rgba(0,0,0,.12)]
      border border-slate-200
      overflow-hidden
      z-50
      animate-in fade-in zoom-in-95
    "
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="font-black text-slate-900">
          الإشعارات
        </h3>

        <span className="text-xs text-slate-400">
          {notifications.length}
        </span>
      </div>

      <div className="max-h-[450px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            لا توجد إشعارات
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="
              p-4
              border-b border-slate-100
              hover:bg-slate-50
              transition-colors
              cursor-pointer
            "
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    {item.content}
                  </p>
                </div>

                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )}

              </>
            ) : (
             <>

             <div
className="
hidden
md:flex
items-center
gap-3
rounded-[28px]
bg-[#F8FAFC]
dark:bg-white/5
border
border-[#E2E8F0]
dark:border-white/10
p-2
shadow-[0_10px_30px_rgba(0,0,0,.05)]
backdrop-blur-xl
"
>

  {/* Login */}

  {/* Register */}


  <button
    onClick={() => navigate("/login")}
className="
hidden
md:flex
items-center
justify-center
h-[48px]
px-7
rounded-[18px]
border
border-[#DDD6FE]
dark:border-white/10
bg-white/5
dark:bg-white
backdrop-blur-xl
text-slate-700
dark:text-white
font-semibold
hover:border-violet-400
hover:text-violet-700
hover:-translate-y-[2px]
hover:shadow-[0_10px_25px_rgba(91,33,182,.10)]
hover:shadow-violet-500/10
transition-all
duration-300
ease-out
hover:-translate-y-[2px]
hover:scale-[1.02]
"
  >
  <span>تسجيل الدخول</span>

<ArrowRightOnRectangleIcon
  className="w-5 h-5 text-slate-400
group-hover:text-violet-600
transition-colors
duration-300"
/>
  </button>

  <button
    onClick={() => navigate("/register")}
className="
hidden
md:flex
items-center
justify-center
gap-4
h-[52px]
px-7
rounded-[20px]
bg-gradient-to-r
from-[#5B21B6]
via-[#6D28D9]
to-[#9333EA]
shadow-[0_10px_30px_rgba(91,33,182,.30)]
text-white
font-bold
transition-all
duration-300
ease-out
hover:-translate-y-[2px]
hover:scale-[1.02]
hover:bg-[#6633C4]
shadow-[0_8px_20px_rgba(91,33,182,.25)]
hover:shadow-[0_18px_40px_rgba(91,33,182,.45)]
active:scale-[0.96]
active:translate-y-[1px]
"
>
<span
  className="
    tracking-[-0.2px]
    text-[15px]
    font-semibold
tracking-[-0.2px]
  "
>
  إنشاء حساب
</span>

<div
  className="
w-[44px]
h-[44px]  
    rounded-[20px]
    bg-white/18
backdrop-blur-md
border
border-white/30
    flex
    items-center
    justify-center
  "
>
  <UserPlusIcon 
  className="
w-[22px]
h-[22px]
text-white
"
/>
</div>
  </button>
  </div>
</>
            )}
            
            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-slate-500 group
rounded-2xl
hover:bg-violet-50
dark:hover:bg-white/5">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
            {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#130726] border-t border-slate-100 p-4">
          <div className="space-y-1">
            <button
onClick={() => navigate("/login")}
className="
w-full
h-[52px]
rounded-xl
border
border-violet-300
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
text-white
bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8]
"
>

  <div
  className="
    absolute
    inset-0
    bg-gradient-to-r
    from-white/10
    via-transparent
    to-white/10
    opacity-0
    group-hover:opacity-100
    transition-opacity
    duration-300
  "
/>

إنشاء حساب
</button>

          </div>
        </div>
      )}
     <div className="h-[4px] w-full bg-slate-200 dark:bg-white/15 overflow-hidden">

  <div
    className="
    h-full
    rounded-full
    bg-gradient-to-r
    from-violet-600
    via-fuchsia-500
    to-violet-400
    shadow-[0_0_15px_rgba(168,85,247,.8)]
    transition-all
    duration-300
    ease-out
    "
    style={{
      width: `${scrollProgress}%`,
    }}
  />

</div>
    </nav>
  );
}
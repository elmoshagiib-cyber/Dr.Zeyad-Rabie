import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

export function Navbar() {
const [scrollProgress, setScrollProgress] = useState(0);


  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
const [notificationsOpen, setNotificationsOpen] = useState(false);

useEffect(() => {
  loadNotifications();
}, []);

const loadNotifications = async () => {
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (data) {
    setNotifications(data);
  }
};
useEffect(() => {
  const handleNavbarScroll = () => {
    setIsScrolled(window.scrollY > 20);
  };

  window.addEventListener("scroll", handleNavbarScroll);

  return () =>
    window.removeEventListener(
      "scroll",
      handleNavbarScroll
    );
}, []);

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


  const isActive = (path: string) => location.pathname === path;

  return (
   <nav
  className={`
sticky
top-0
z-50
bg-white/90
dark:bg-[#0b0715]/90
backdrop-blur-xl
border-b
border-slate-200
dark:border-white/10
transition-all
duration-300
${isScrolled
  ? "shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
  : "shadow-none"}
`}
>

      <div className="max-w-[1500px] mx-auto px-8">
        <div className="flex items-center justify-between h-[100px]">
          <div className="flex items-center gap-4">

  {/* Logo */}
  <button
    onClick={() => navigate("/")}
    className="
h-12
md:h-24
transition-all
duration-300
group-hover:scale-105
"
  >
    
    <img
      src={isDark ? "/images/logo-dark.png" : "/images/logo-light.png"}
      alt="د. زياد ربيع"
      className="
h-14
md:h-16
object-contain
transition-all
duration-300
group-hover:scale-105
"
    />
  </button>

  {/* Theme Button */}
  <button
  onClick={toggleTheme}
  className="
  relative
  hidden md:block
  w-[90px]
  h-[48px]
  rounded-full
  bg-gradient-to-r
from-violet-700
to-fuchsia-500
  transition-all
  duration-300
  
  "
>
  
    
  {/* Circle */}

  <div
    className={`
      absolute
      top-[4px]
      w-[40px]
      h-[40px]
      rounded-full
      bg-white
      shadow-lg
      flex
      items-center
      justify-center
      transition-all
      duration-300
      ease-in-out
      ${isDark ? "left-[4px]" : "right-[4px]"}
    `}
  >
    {isDark ? (
      <Moon
        size={18}
        className="text-[#6D28D9]"
      />
    ) : (
      <Sun
        size={18}
        className="text-[#6D28D9]"
      />
    )}
  </div>

  <Moon
    size={16}
  className="
  absolute
  right-5
    top-1/2
    -translate-y-1/2
    text-white/70
    "
  />

  <Sun
    size={16}
  className="
  absolute
  left-5
    top-1/2
    -translate-y-1/2
    text-white/70
    "
  />
</button>
</div>
          {/* Right Side */}
          <div className="flex items-center gap-6">
           
            {user ? (
              <>
                
                <div className="relative">
  <button
    onClick={() => setNotificationsOpen(!notificationsOpen)}
    className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
  >
    <Bell size={20} />

    {notifications.length > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </button>
  
<button
  onClick={logout}
  className="px-5 py-3 bg-red-500 text-white rounded-xl"
>
  تسجيل الخروج
</button>
  {notificationsOpen && (
    <div
      className="
      absolute left-0 top-full mt-3
      w-[380px]
      bg-white
      rounded-3xl
      shadow-2xl
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
</div>
              </>
            ) : (
             <>
  <button
    onClick={() => navigate("/login")}
    className="
h-14
px-10
rounded-2xl
border-2
border-violet-300
bg-white
text-violet-700
font-black
hover:bg-violet-50
hover:border-violet-500
transition-all
duration-300
"
  >
   خش سجل يلا @
  </button>

  <button
    onClick={() => navigate("/register")}
className="
h-[52px]
px-8
rounded-2xl
font-black
text-white
bg-gradient-to-r
from-violet-700
via-purple-600
to-fuchsia-500
shadow-lg
shadow-violet-500/20
bg-[#7C3AED]
hover:bg-[#6D28D9]
transition-all
duration-300
"
>
   خش اعمل اكونت
  </button>
</>
            )}
            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
            {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#130726] border-t border-slate-100 p-4">
          <div className="space-y-1">

          </div>
        </div>
      )}
     <div className="h-[4px] w-full bg-slate-200 dark:bg-white/10 overflow-hidden">

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
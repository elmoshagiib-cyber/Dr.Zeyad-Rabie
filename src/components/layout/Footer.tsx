import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa";

const SOCIAL_LINKS = [
  {
    icon: FaFacebookF,
    href: "https://www.facebook.com/zeyad.rabi3?locale=ar_AR",
    label: "Facebook",
    hover:
      "hover:bg-blue-600 hover:shadow-[0_0_22px_rgba(37,99,235,.5)]",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/zeyad_rabi33/",
    label: "Instagram",
    hover:
      "hover:bg-pink-600 hover:shadow-[0_0_22px_rgba(219,39,119,.5)]",
  },
  {
    icon: FaYoutube,
    href: "https://www.youtube.com/@zeyadrabie10",
    label: "YouTube",
    hover:
      "hover:bg-red-600 hover:shadow-[0_0_22px_rgba(220,38,38,.5)]",
  },
  {
    icon: FaTiktok,
    href: "https://www.tiktok.com/@zeyadrabie172?lang=en",
    label: "TikTok",
    hover:
      "hover:bg-slate-700 hover:shadow-[0_0_22px_rgba(100,116,139,.5)]",
  },
];

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative overflow-hidden bg-[#050312]">

      {/* ── Background hero image ── */}
      <div className="absolute inset-0">
        <img
          src="/images/footer-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* ── Overlay — same vibe as the reference ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(5,3,18,.97) 0%, rgba(5,3,18,.80) 50%, rgba(5,3,18,.65) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-10 sm:pb-14 text-center">

        {/* Logo */}
        <img
          src="/images/logo-dark.png"
          alt="مستر زياد ربيع"
          className="
            h-20 sm:h-28 lg:h-32
            mx-auto mb-5 sm:mb-6
            
            object-contain
          "
        />

        

        
        {/* Social icons */}
        <div className="flex justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
          {SOCIAL_LINKS.map(({ icon: Icon, href, label, hover }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className={`
                w-11 h-11 sm:w-13 sm:h-13
                rounded-2xl
                bg-white/10
                border border-white/10
                flex items-center justify-center
                text-white
                ${hover}
                hover:scale-110 hover:-translate-y-1
                transition-all duration-300
              `}
              style={{ width: "48px", height: "48px" }}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="relative my-10 sm:my-12">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-[9px] w-[18px] h-[18px] rounded-full bg-[#7C1DCC] border-4 border-[#050312]" />
        </div>


        {/* Credits card */}
{/* Developer Credits */}
<div
  className="
    mt-8
    w-fit
    mx-auto
    flex
    items-center
    justify-center
    gap-3
    rounded-2xl
    bg-white/5
    border
    border-white/10
    backdrop-blur-xl
    px-5
    py-3
    text-[14px]
    sm:text-[15px]
    font-semibold
  "
>
  <span className="text-white/85 whitespace-nowrap font-semibold">
       &lt; All Rights Reserved ©2026 &gt;

  </span>

  <a
    href="https://www.facebook.com/ahmedcysec?locale=ar_AR"
    target="_blank"
    rel="noopener noreferrer"
   className="
  px-5
  py-2
  rounded-2xl
  bg-white/10
  border
  border-white/10
  backdrop-blur-md
  text-white
  hover:bg-white/20
  hover:border-white/20
  hover:-translate-y-1
  hover:scale-105
  transition-all
  duration-300
"
  >
     Team Code Reapers
  </a>


  <span className="text-white/85 whitespace-nowrap font-semibold">
       &lt; Developed By &gt;
  </span>
</div>

      </div>
    </footer>
  );
}

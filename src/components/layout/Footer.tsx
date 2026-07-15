import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa";

const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: "#", label: "Facebook",  hover: "hover:bg-blue-600  hover:shadow-[0_0_22px_rgba(37,99,235,.5)]"  },
  { icon: FaYoutube,   href: "#", label: "YouTube",   hover: "hover:bg-red-600   hover:shadow-[0_0_22px_rgba(220,38,38,.5)]"   },
  { icon: FaInstagram, href: "#", label: "Instagram",  hover: "hover:bg-pink-600  hover:shadow-[0_0_22px_rgba(219,39,119,.5)]"  },
  { icon: FaTiktok,    href: "#", label: "TikTok",    hover: "hover:bg-slate-700 hover:shadow-[0_0_22px_rgba(100,116,139,.5)]" },
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
            drop-shadow-[0_0_30px_rgba(168,85,247,.45)]
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
        <div className="
          mt-10 sm:mt-12
          mx-auto max-w-sm
          rounded-2xl sm:rounded-3xl
          border border-white/10
          bg-white/5
          backdrop-blur-xl
          px-6 sm:px-8
          py-6 sm:py-7
        ">
          <p className="text-slate-400 text-[11px] sm:text-[12px] tracking-widest uppercase mb-1">
            Designed &amp; Developed by
          </p>
          <h3 className="text-[22px] sm:text-[26px] font-black text-[#F6AC08] mt-1">
            Ahmed Dev
          </h3>
          <p className="text-slate-400 text-[12px] sm:text-[13px] mt-1">
            Full Stack Developer
          </p>

          <div className="h-px bg-white/10 my-4 sm:my-5" />

          <p className="text-slate-500 text-[11px] sm:text-[12px]">
            © 2026 منصة مستر زياد ربيع — جميع الحقوق محفوظة
          </p>
        </div>

      </div>
    </footer>
  );
}

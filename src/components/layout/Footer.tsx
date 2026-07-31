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
    <footer className="relative overflow-hidden bg-[#050312] w-full">
      {/* ── Background hero image ── */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/images/footer-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* ── Overlay — same vibe as the reference ── */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            "linear-gradient(to top, rgba(5,3,18,.97) 0%, rgba(5,3,18,.80) 50%, rgba(5,3,18,.65) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-8 sm:pb-10 lg:pb-14 text-center">
        {/* Logo */}
        <img
          src="/images/logo-dark.png"
          alt="مستر زياد ربيع"
          className="
            h-16
            sm:h-20
            lg:h-28
            xl:h-32
            mx-auto
            mb-4
            sm:mb-5
            lg:mb-6
            object-contain
            w-auto
          "
        />

        {/* Social icons */}
        <div className="flex justify-center gap-2 sm:gap-3 lg:gap-4 mt-6 sm:mt-8 lg:mt-10 flex-wrap">
          {SOCIAL_LINKS.map(({ icon: Icon, href, label, hover }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`
                w-10
                h-10
                sm:w-12
                sm:h-12
                lg:w-14
                lg:h-14
                rounded-lg
                sm:rounded-xl
                lg:rounded-2xl
                bg-white/10
                border
                border-white/10
                flex
                items-center
                justify-center
                text-white
                ${hover}
                hover:scale-110
                hover:-translate-y-1
                transition-all
                duration-300
                flex-shrink-0
              `}
            >
              <Icon size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="relative my-8 sm:my-10 lg:my-12 w-full">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <span className="absolute left-1/2 -translate-x-1/2 -top-2 sm:-top-2.5 lg:-top-3 w-4 sm:w-4.5 lg:w-5 h-4 sm:h-4.5 lg:h-5 rounded-full bg-[#7C1DCC] border-3 sm:border-4 border-[#050312] flex-shrink-0" />
        </div>

        {/* Developer Credits */}
        <div className="w-full px-2 sm:px-4">
          <div
            className="
              mt-6
              sm:mt-7
              lg:mt-8
              w-full
              sm:w-fit
              sm:mx-auto
              flex
              flex-col
              sm:flex-row
              items-center
              justify-center
              gap-2
              sm:gap-3
              lg:gap-4
              rounded-lg
              sm:rounded-xl
              lg:rounded-2xl
              bg-white/5
              border
              border-white/10
              backdrop-blur-xl
              px-3
              sm:px-4
              lg:px-5
              py-2.5
              sm:py-3
              lg:py-4
              text-xs
              sm:text-sm
              lg:text-base
              font-semibold
            "
          >
            <span className="text-white/85 whitespace-nowrap font-semibold text-xs sm:text-sm lg:text-base">
              &lt; All Rights Reserved ©2026 &gt;
            </span>

            <div className="hidden sm:block w-px h-4 sm:h-5 lg:h-6 bg-white/20" />

            <a
              href="https://wa.me/201109414585"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-3
                sm:px-4
                lg:px-5
                py-1.5
                sm:py-2
                lg:py-3
                rounded-lg
                sm:rounded-xl
                lg:rounded-2xl
                bg-white/10
                border
                border-white/10
                backdrop-blur-md
                text-white
                text-xs
                sm:text-sm
                lg:text-base
                font-semibold
                hover:bg-white/20
                hover:border-white/20
                hover:-translate-y-1
                hover:scale-105
                transition-all
                duration-300
                whitespace-nowrap
              "
            >
              Team Code Reapers
            </a>

            <div className="hidden sm:block w-px h-4 sm:h-5 lg:h-6 bg-white/20" />

            <span className="text-white/85 whitespace-nowrap font-semibold text-xs sm:text-sm lg:text-base">
              &lt; Developed By &gt;
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
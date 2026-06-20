import { useNavigate } from "react-router-dom";
import {
  FaFacebookF,
  FaYoutube,
  FaTiktok,
  FaInstagram
} from "react-icons/fa";

export function Footer() {
  const navigate = useNavigate();

  return (
<footer
  className="
  relative
  overflow-hidden
  bg-[#050312]
  py-16
  "
>
  {/* Background Image */}
  <div className="absolute inset-0 opacity-30">
    <img
      src="/images/footer-bg.png"
      alt=""
      className="w-full h-full object-cover"
    />
  </div>

  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-[#0b0715] to-[#050312]" />

  <div className="relative max-w-6xl mx-auto px-6 text-center">

    {/* Logo */}
    <img
      src="/images/logo-dark.png"
      alt="زياد ربيع"
      className="h-40 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(168,85,247,.4)]"
    />

    <h2 className="
text-4xl
font-black
text-white
mb-4
">
منصة د. زياد ربيع
</h2>

<p className="
text-slate-300
text-xl
max-w-4xl
mx-auto
leading-loose
">
تعلم الكيمياء بطريقة مختلفة • شرح مبسط • مراجعات شاملة • اختبارات تفاعلية
</p>

    {/* Social */}
    <div className="flex justify-center gap-5 mt-10">

      <a
        href="#"
        className="
w-16
h-16
rounded-3xl
bg-white/10
text-white
border
border-purple-500/20
flex
items-center
justify-center
hover:bg-purple-600
hover:scale-110
hover:-translate-y-2
hover:bg-purple-600
hover:shadow-[0_0_25px_rgba(168,85,247,.5)]
duration-300
"
      >
        <FaFacebookF size={24} />

      </a>

      <a
        href="#"
        className="
w-16
h-16
rounded-3xl
bg-white/10
text-white
border
border-purple-500/20
flex
items-center
justify-center
hover:bg-purple-600
hover:scale-110
hover:shadow-[0_0_25px_rgba(168,85,247,.5)]
transition-all
duration-300
"
      >
        <FaYoutube size={24} />

      </a>

      <a
        href="#"
        className="
w-16
h-16
rounded-3xl
bg-white/10
text-white
border
border-purple-500/20
flex
items-center
justify-center
hover:bg-purple-600
hover:scale-110
hover:shadow-[0_0_25px_rgba(168,85,247,.5)]
transition-all
duration-300
"
      >
      <FaInstagram size={24} />
      </a>

    </div>

    {/* Line */}
    <div className="relative my-14">
      <div className="h-[1px] bg-purple-500/30" />
      <div className="w-3 h-3 bg-purple-500 rounded-full absolute left-1/2 -translate-x-1/2 -top-[5px]" />
    </div>

    {/* Text */}
    <p className="text-xl text-white">
      تم صنع هذه المنصة بهدف تمكين الطالب وتحقيق أفضل النتائج
    </p>

    {/* Credits */}
    <div className="flex flex-wrap justify-center gap-4 mt-10">

      <div className="
px-8
py-3
rounded-2xl
bg-purple-500/10
border
border-purple-500/30
text-purple-300
">
Developed By
</div>

      <div className="
px-8
py-3
rounded-2xl
bg-gradient-to-r
from-violet-600
to-purple-500
text-white
font-black
shadow-lg
shadow-violet-500/20
">
Ahmed Cysec
</div>

      <div className="
px-8
py-3
rounded-2xl
bg-white/10
border
border-white/10
text-slate-300
">
© 2026 All Rights Reserved
</div>

    </div>

  </div>
</footer>
  );
}

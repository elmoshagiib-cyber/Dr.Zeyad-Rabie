import Marquee from "react-fast-marquee";

export function ScrollingBanner() {
  return (
    <div className="py-10 overflow-hidden">
      <div
  className="
  bg-gradient-to-r
from-[#f7f4ff]
via-[#f1ebff]
to-[#f7f4ff]
  rotate-[-2deg]
  h-[140px]
flex items-center
  shadow-[0_0_60px_rgba(139,92,246,0.15)]
  
  "
>
        <Marquee
          speed={80}
          gradient={false}
          autoFill
        >
          <div className="flex items-center gap-12 mx-10">
            <img
  src="/images/zeyad-banner.png"
  className="h-[120px] w-auto"
/>

            <span className="text-4xl font-black text-[#3d285f] whitespace-nowrap">
              أهلاً بك في منصة مستر زياد ربيع
            </span>

            <img
  src="/images/atom.png"
  className="h-16"
/>

            <span className="text-4xl font-black text-[#3d285f] whitespace-nowrap">
              شرح مبسط - امتحانات تفاعلية - مراجعات شاملة
            </span>

            <img
              src="/images/logo-light.png"
              className="h-20"
            />

            <span className="text-4xl font-black text-[#3d285f] whitespace-nowrap">
              أهلاً بك في منصة مستر زياد ربيع
            </span>
          </div>
        </Marquee>
      </div>
    </div>
  );
}
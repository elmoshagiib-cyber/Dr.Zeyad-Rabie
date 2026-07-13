import { motion } from "framer-motion";

interface HeroSectionProps {
  image: string;
}

export default function HeroSection({ image }: HeroSectionProps) {
  return (
    <div className="relative h-full min-h-[650px] overflow-hidden rounded-[40px]">

      {/* Background Image */}

      <img
        src={image}
        alt=""
        className="
w-full
h-full
object-cover
scale-105
"
      />

      {/* Dark Overlay */}

      <div
        className="
absolute
inset-0
bg-gradient-to-t
from-[#09090B]
via-black/20
to-transparent
"
      />

      {/* Glow */}

      <div
        className="
absolute
-left-24
-bottom-24
w-[420px]
h-[420px]
rounded-full
bg-violet-500/30
blur-[130px]
"
      />

      {/* Content */}

      <div
        className="
absolute
bottom-10
right-10
left-10
z-20
"
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7 }}
          className="
text-5xl
font-black
leading-tight
text-white
"
        >
          ابدأ رحلتك
          <br />
          مع مستر زياد ربيع
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .2 }}
          className="
mt-6
text-white/80
leading-9
text-lg
max-w-md
"
        >
          شرح تفاعلي • واجبات • اختبارات • متابعة مستمرة حتى تحقق أعلى الدرجات.
        </motion.p>
      </div>

      {/* Floating Card */}

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{
          repeat: Infinity,
          duration: 4
        }}
        className="
absolute
top-8
left-8
rounded-3xl
bg-white/10
backdrop-blur-xl
border
border-white/20
px-6
py-5
"
      >
        <p className="text-white/70 text-sm">
          أكثر من
        </p>

        <h3 className="text-white text-3xl font-black">
          +5000
        </h3>

        <p className="text-white/70 text-sm">
          طالب
        </p>
      </motion.div>

    </div>
  );
}
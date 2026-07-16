import { motion } from "framer-motion";

interface HeroSectionProps {
  image: string;
}

export default function HeroSection({ image }: HeroSectionProps) {
  return (
    <div
className="
relative
h-full
min-h-[620px]
lg:min-h-[700px]
overflow-hidden
"
>

      {/* Background Image */}

      <img
        src={image}
        alt=""
        className="
w-full
h-full
object-cover
w-full
h-full
object-cover
object-center
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

     

    </div>
  );
}
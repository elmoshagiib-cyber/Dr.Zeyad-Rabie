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


      

     

    </div>
  );
}
import { ReactNode } from "react";
import { motion } from "framer-motion";

export function ScrollReveal({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 80,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.9,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
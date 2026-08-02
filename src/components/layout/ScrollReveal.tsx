import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
  initial={
    prefersReducedMotion
      ? false
      : {
          opacity: 0,
          y: 50,
          scale: 0.98,
        }
  }
  whileInView={
    prefersReducedMotion
      ? {}
      : {
          opacity: 1,
          y: 0,
          scale: 1,
        }
  }
  viewport={{
    once: true,
    amount: 0.15,
  }}
  transition={{
    duration: 0.55,
    delay,
    ease: [0.25, 0.46, 0.45, 0.94],
  }}
>
  {children}
</motion.div>
  );
}
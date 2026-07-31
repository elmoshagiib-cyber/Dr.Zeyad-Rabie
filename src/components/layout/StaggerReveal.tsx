import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface StaggerItemProps {
  children: ReactNode;
}

export function StaggerItem({
  children,
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={
        prefersReducedMotion
          ? {}
          : {
              hidden: {
                opacity: 0,
                y: 24,
                scale: 0.97,
                filter: "blur(6px)",
              },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              },
            }
      }
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
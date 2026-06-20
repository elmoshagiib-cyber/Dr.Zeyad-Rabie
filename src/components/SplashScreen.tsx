import { motion } from "framer-motion";
import { useEffect } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({
  onFinish,
}: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <motion.img
        src="/images/logo.png"
        alt="logo"
        className="w-[420px] max-w-[85vw]"
        style={{
          filter:
            "drop-shadow(0 0 20px #7c3aed) drop-shadow(0 0 60px #7c3aed)",
        }}
        initial={{
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
  opacity: 1,
  scale: [0.8, 1.05, 1],
}}
        transition={{
  duration: 1.5,
  ease: "easeOut",
}}
      />
    </div>
  );
}
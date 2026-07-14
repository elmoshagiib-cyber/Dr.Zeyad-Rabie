import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({
  onFinish,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            onFinish();
          }, 250);

          return 100;
        }

        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
      fixed
      inset-0
      z-[9999]
      bg-white
      flex
      items-center
      justify-center
      "
    >
      <div className="w-full max-w-md px-8 text-center">

        <motion.img
          src="/images/logo.png"
          alt="Logo"
          className="w-48 mx-auto"
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: .7,
          }}
        />

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: .3,
          }}
          className="
          mt-8
          text-2xl
          font-bold
          text-slate-900
          "
        >
          مرحبًا بك
        </motion.h2>

        <p
          className="
          mt-2
          text-slate-500
          text-lg
          "
        >
          جاري تجهيز المنصة...
        </p>

        <div
          className="
          mt-10
          w-full
          h-2
          rounded-full
          bg-slate-200
          overflow-hidden
          "
        >
          <motion.div
            className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-[#5B21B6]
            via-[#7C3AED]
            to-[#A855F7]
            "
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              ease: "easeOut",
            }}
          />
        </div>

        <p
          className="
          mt-4
          text-sm
          font-medium
          text-slate-500
          "
        >
          {progress}%
        </p>

      </div>
    </motion.div>
  );
}
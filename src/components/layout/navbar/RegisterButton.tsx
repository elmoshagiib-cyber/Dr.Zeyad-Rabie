import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export function RegisterButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <Link
        to="/register"
        aria-label="حساب جديد"
        className="
          group inline-flex items-center gap-2
          px-4 h-10
          rounded-xl
          border-2 border-[#5800a9] dark:border-[#b600d7]
          bg-[#5800a9] dark:bg-[#b600d7]
          text-white text-[14px] font-semibold
          hover:bg-transparent hover:text-[#5800a9]
          dark:hover:bg-transparent dark:hover:text-[#b600d7]
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5800a9] focus-visible:ring-offset-2
        "
        dir="rtl"
      >
        <Home
          size={16}
          strokeWidth={2.2}
          className="text-white group-hover:text-[#5800a9] dark:group-hover:text-[#b600d7] transition-colors duration-200"
          aria-hidden="true"
        />
        <span>إنشاء حساب</span>
      </Link>
    </motion.div>
  );
}
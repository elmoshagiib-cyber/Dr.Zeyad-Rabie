import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
export function LoginButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <Link
        to="/login"
        aria-label="تسجيل الدخول"
        className="group inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 text-[14px] font-medium hover:border-teal-400 hover:text-teal-600 hover:shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
        dir="rtl"
      >
        <span>تسجيل الدخول</span>
        <LogIn
          size={16}
          strokeWidth={2}
          className="text-amber-400 group-hover:text-teal-500 transition-colors duration-200"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}

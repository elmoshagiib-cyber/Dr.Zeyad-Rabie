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
        className="group inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-white border border-[#B348FE] text-[#B348FE] text-[14px] font-medium hover:bg-[#B348FE] hover:text-white hover:shadow-[0_10px_25px_rgba(179,72,254,.25)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B348FE] focus-visible:ring-offset-2"
        dir="rtl"
      >
        <span>تسجيل الدخول</span>
        <LogIn
          size={16}
          strokeWidth={2}
          className="text-[#B348FE] group-hover:text-white transition-colors duration-200"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}

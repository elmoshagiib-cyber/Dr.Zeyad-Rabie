import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

export function RegisterButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <Link
        to="/register"
        aria-label="أنشئ حسابك"
        className="
inline-flex
items-center
gap-2
pl-4
pr-2
h-10
rounded-xl
bg-[#3B1248]
hover:bg-[#4A175B]
text-white
text-[14px]
font-semibold
transition-all
duration-200
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-[#F6AC08]
focus-visible:ring-offset-2
"
        dir="rtl"
      >
        {/* Icon box — right side in RTL */}
        <span className="
flex
items-center
justify-center
w-6
h-6
rounded-md
bg-[#F6AC08]
shrink-0
">
          <UserPlus
            size={13}
            strokeWidth={2.2}
            className="text-white"
            aria-hidden="true"
          />
        </span>
        <span>! أنشئ حسابك</span>
      </Link>
    </motion.div>
  );
}

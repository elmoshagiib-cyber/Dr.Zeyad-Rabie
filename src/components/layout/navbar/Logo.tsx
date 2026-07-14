import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Logo() {
  return (
    <Link
      to="/"
      aria-label="الصفحة الرئيسية"
      className="flex items-center shrink-0"
    >
      <motion.img
        src="/logo.png"
        alt="شعار المنصة"
        draggable={false}
        whileHover={{ scale: 1.03 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 22,
        }}
        className="
h-[72px]
w-auto
object-contain
select-none
"
      />
    </Link>
  );
}
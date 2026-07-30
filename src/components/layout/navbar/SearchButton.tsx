import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface SearchButtonProps {
  onClick?: () => void;
}

export function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
className="
w-11
h-11
rounded-full
bg-white
border
border-[#E5E7EB]
flex
items-center
justify-center
text-slate-700
hover:border-[#B348FE]
hover:text-[#B348FE]
transition-all
duration-300
shadow-sm
"
    >
      <Search size={20} strokeWidth={2.4} />
    </motion.button>
  );
}
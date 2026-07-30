import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { ThemeToggle } from "./ThemeToggle";
import { LoginButton } from "./LoginButton";
import { RegisterButton } from "./RegisterButton";
import { useTheme } from "../../../context/ThemeContext";
import { TbAtom2 } from "react-icons/tb";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "المواد", href: "/materials" },
  { label: "من نحن", href: "/about" },
  { label: "اتصل بنا", href: "/contact" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
const { isDark, toggleTheme } = useTheme();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <motion.button
          type="button"
          aria-label="فتح القائمة"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="
md:hidden
flex
items-center
justify-center
w-11
h-11
bg-transparent
border-0
shadow-none
p-0
"
        >
<AnimatePresence mode="wait" initial={false}>
  {!open ? (
    <motion.div
      key="menu"
      initial={{ opacity: 0, rotate: -90 }}
      animate={{ opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, rotate: 90 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col justify-center gap-[5px]"
    >
      <motion.span
  className="block h-[3px] w-7 rounded-full bg-[#B348FE]"
  whileHover={{ x: -2 }}
/>
      <motion.span
  className="block h-[3px] w-7 rounded-full bg-[#FF4D73]"
  whileHover={{ x: -2 }}
/>
     <motion.span
  className="block h-[3px] w-7 rounded-full bg-[#FF4D73]"
  whileHover={{ x: -2 }}
/>
    </motion.div>
  ) : (
    <motion.div
      key="close"
      initial={{ opacity: 0, rotate: 90 }}
      animate={{ opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, rotate: -90 }}
      transition={{ duration: 0.25 }}
    >
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    repeat: Infinity,
    duration: 3,
    ease: "linear",
  }}
>
  <TbAtom2
    size={28}
    className="text-[#B348FE]"
  />
</motion.div>

    </motion.div>
  )}
</AnimatePresence>

        </motion.button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 35 }}
            dir="rtl"
            aria-label="القائمة الرئيسية"
            className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col focus-visible:outline-none"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
              <Dialog.Title className="text-lg font-semibold text-gray-800">
                القائمة
              </Dialog.Title>
              <Dialog.Close asChild>
                <motion.button
                  type="button"
                  aria-label="إغلاق القائمة"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B348FE]"
                >
                  <X size={18} strokeWidth={2} className="text-gray-500" aria-hidden="true" />
                </motion.button>
              </Dialog.Close>
            </div>

            {/* Navigation */}
            <nav
              aria-label="التنقل في القائمة"
              className="flex flex-col gap-1 px-4 pt-4 flex-1"
            >
              {NAV_ITEMS.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index, type: "spring", stiffness: 300, damping: 28 }}
                  >
                    <Link
                      to={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400",
                        isActive
  ? "bg-[#B348FE]/10 text-[#B348FE]"
  : "text-gray-700 hover:bg-[#B348FE]/10 hover:text-[#B348FE]"
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

{/* Bottom Actions */}
<div className="flex flex-col gap-3 px-5 pb-8 pt-4 border-t border-gray-100">
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-500 font-medium">
      المظهر
    </span>

    <ThemeToggle
      isDark={isDark}
      toggleTheme={toggleTheme}
    />
  </div>

  <div className="flex flex-col gap-2 pt-1">
    <LoginButton />
    <RegisterButton />
  </div>
</div>

          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

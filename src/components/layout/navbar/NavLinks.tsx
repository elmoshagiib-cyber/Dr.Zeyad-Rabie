import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

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

export function NavLinks() {
  const location = useLocation();

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="hidden md:flex items-center gap-8"
      dir="rtl"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.href;

        return (
          <motion.div
            key={item.href}
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "relative text-[15px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm px-1 py-0.5",
                isActive
                  ? "text-teal-600"
                  : "text-gray-700 hover:text-teal-600",
              ].join(" ")}
            >
              {item.label}
              {isActive && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-teal-500 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

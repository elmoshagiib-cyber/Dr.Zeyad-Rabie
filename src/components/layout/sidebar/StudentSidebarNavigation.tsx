import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, LogOut } from "lucide-react";
import { cn } from "../../../utils/cn";
import { StudentSidebarItem } from "./StudentSidebarItem";

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
};

type Props = {
  navItems: NavItem[];
  collapsed: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
};

export function StudentSidebarNavigation({
  navItems,
  collapsed,
  currentPath,
  onNavigate,
  onLogout,
}: Props) {
  const [openPath, setOpenPath] = useState<string | null>(
    () => navItems.find((i) => i.children?.some((c) => c.path === currentPath))?.path ?? null
  );

  const toggleOpen = (path: string) => {
    if (collapsed) return;
    setOpenPath((prev) => (prev === path ? null : path));
  };

  return (
    <nav
      className={cn(
        "flex-1 overflow-y-auto no-scrollbar py-4 sm:py-5 transition-all duration-300",
        collapsed ? "px-2 sm:px-2.5" : "px-3 sm:px-4"
      )}
    >
      <div className="space-y-1.5">
        {navItems.map((item) => {
          if (item.children && item.children.length > 0) {
            const isActiveParent =
              currentPath === item.path || item.children.some((c) => c.path === currentPath);
            const isOpen = openPath === item.path && !collapsed;

            return (
              <div key={item.path} className="rounded-2xl overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  title={collapsed ? item.label : undefined}
                  onClick={() => onNavigate(item.path)}
                  onKeyDown={(e) => e.key === "Enter" && onNavigate(item.path)}
                  className={cn(
                    `
                    group
                    relative
                    flex
                    w-full
                    cursor-pointer
                    select-none
                    items-center
                    rounded-2xl
                    px-3
                    py-2.5
                    sm:py-3
                    transition-all
                    duration-300
                    ease-out
                    `,
                    collapsed ? "justify-center" : "justify-between",
                    isActiveParent
                      ? "bg-[#B348FE] text-white shadow-[0_8px_20px_rgba(179,72,254,.35)]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-[#F6EEFF] dark:hover:bg-[#1A1A1A] hover:text-[#B348FE]"
                  )}
                >
                  <div
                    className={cn(
                      `
                      flex
                      h-9 w-9
                      sm:h-10 sm:w-10
                      flex-shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      transition-all
                      duration-300
                      `,
                      isActiveParent
                        ? "bg-white/20"
                        : "bg-[#F6EEFF] text-[#B348FE] dark:bg-[#2B103D]"
                    )}
                  >
                    {item.icon}
                  </div>

                  {!collapsed && (
                    <span className="flex-1 text-center font-semibold text-sm sm:text-[15px] truncate">
                      {item.label}
                    </span>
                  )}

                  {!collapsed && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOpen(item.path);
                      }}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                    >
                      <motion.div
                        animate={{ rotate: isOpen ? -90 : 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <ChevronLeft
                          size={16}
                          className={isActiveParent ? "text-white" : "text-gray-400"}
                        />
                      </motion.div>
                    </button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="children"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-1.5">
                        {item.children.map((child) => (
                          <StudentSidebarItem
                            key={child.path}
                            label={child.label}
                            icon={child.icon}
                            badge={child.badge}
                            active={currentPath === child.path}
                            collapsed={collapsed}
                            onClick={() => onNavigate(child.path)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          const active = currentPath === item.path;

          return (
           <StudentSidebarItem
              key={item.path}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              active={active}
              collapsed={collapsed}
              onClick={() => onNavigate(item.path)}
            />
          );
        })}
      </div>

      <div className={cn("my-6 h-px bg-gray-200 dark:bg-[#2A2A2A]", collapsed && "mx-1")} />

      {!collapsed && (
        <p
          className="
            mb-3
            px-3
            text-[10px]
            sm:text-[11px]
            font-bold
            tracking-wider
            uppercase
            text-gray-400 dark:text-gray-500
          "
        >
          النظام
        </p>
      )}

      <motion.button
        onClick={onLogout}
        title={collapsed ? "تسجيل الخروج" : undefined}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          `
          group
          flex
          w-full
          items-center
          rounded-2xl
          px-3
          py-3
          text-red-600
          dark:text-red-400
          transition-all
          duration-300
          hover:bg-red-50
          dark:hover:bg-red-950/20
          `,
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div
          className="
            flex
            h-10
            w-10
            flex-shrink-0
            items-center
            justify-center
            rounded-xl
            bg-red-50
            dark:bg-red-950/30
            text-red-600
            dark:text-red-400
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:opacity-90
          "
        >
          <LogOut size={18} />
        </div>

        {!collapsed && (
          <span className="font-semibold text-sm sm:text-[15px]">
            تسجيل الخروج
          </span>
        )}
      </motion.button>
    </nav>
  );
}
import { useState } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type Props = {
  navGroups: NavGroup[];
  collapsed: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
};

export function StudentSidebarNavigation({
  navGroups,
  collapsed,
  currentPath,
  onNavigate,
}: Props) {
  // كل الأقسام مفتوحة افتراضيًا
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(navGroups.map((g) => [g.label, true]))
  );

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav
      className="
        flex-1
        overflow-y-auto
        no-scrollbar
        px-3
        py-4
        sm:px-4
        sm:py-5
      "
    >
      <div className="space-y-3">
        {navGroups.map((group) => {
          const isOpen = openGroups[group.label] ?? true;
          const hasActiveChild = group.items.some((i) => i.path === currentPath);

          return (
            <div
              key={group.label}
              className="
                rounded-2xl
                border
                border-gray-100
                dark:border-[#2A2A2A]
                overflow-hidden
              "
            >
              {/* رأس القسم (اللي بيتفتح/يتقفل) */}
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className={`
                  w-full flex items-center justify-between
                  px-3.5 py-3
                  transition-colors duration-200
                  ${
                    hasActiveChild
                      ? "bg-[#F6EEFF] dark:bg-[#2B103D]"
                      : "bg-white dark:bg-[#111111] hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
                  }
                `}
              >
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-300 ${
                      isOpen ? "" : "-rotate-90"
                    }`}
                  />
                )}
                <span
                  className={`
                    flex-1 text-right
                    text-[11px] sm:text-xs font-bold tracking-wide
                    ${
                      hasActiveChild
                        ? "text-[#B348FE]"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                >
                  {!collapsed ? group.label : ""}
                </span>
              </button>

              {/* عناصر القسم */}
              {isOpen && (
                <div className="p-2 space-y-1.5">
                  {group.items.map((item) => {
                    const active = currentPath === item.path;

                    return (
                      <SidebarItem
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
              )}
            </div>
          );
        })}
      </div>

      {!collapsed && (
        <>
          <div className="my-6 h-px bg-gray-200 dark:bg-[#2A2A2A]" />

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

          <button
            className="
              group
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              px-3
              py-3
              text-gray-700
              dark:text-gray-300
              transition-all
              duration-300
              hover:bg-[#F6EEFF]
              dark:hover:bg-[#1A1A1A]
              hover:text-[#B348FE]
              active:scale-[0.98]
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-[#0F172A]
                via-[#1E1B3A]
                to-[#2A1B4D]
                text-white
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:opacity-90
              "
            >
              <Settings size={18} />
            </div>

            <span className="font-semibold text-sm sm:text-[15px]">
              الإعدادات
            </span>
          </button>
        </>
      )}
    </nav>
  );
}
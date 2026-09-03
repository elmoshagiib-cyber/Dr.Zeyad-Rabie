import { ChevronLeft } from "lucide-react";
import { cn } from "../../../utils/cn";

type Props = {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  onClick: () => void;
};

export function SidebarItem({
  label,
  icon,
  active,
  collapsed,
  badge,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
        group
        relative
        flex
        w-full
        items-center
        overflow-hidden
        rounded-2xl
        px-3
        py-2.5
        sm:py-3
        transition-all
        duration-300
        ease-out
        `,
        collapsed ? "justify-center" : "justify-between",

active
  ? `
    bg-[#B348FE]
    text-white
    scale-[1.02]
    shadow-[0_8px_20px_rgba(179,72,254,.35)]
  `
          : `
text-gray-700
dark:text-gray-300
hover:bg-[#F6EEFF]
dark:hover:bg-[#1A1A1A]
hover:text-[#B348FE]
active:scale-[0.98]
          `
      )}
    >

      <div
        className={cn(
          "relative flex items-center",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            `
            flex
            h-9 w-9
            sm:h-10 sm:w-10
            items-center
            justify-center
            rounded-lg
            transition-all
            duration-300
            ease-out
            `,
            active
  ? `
    bg-white/20
  `
  : `
    bg-[#F6EEFF]
    dark:bg-[#2B103D]
    text-[#B348FE]
    group-hover:opacity-90
    group-hover:scale-110
  `
          )}
        >
          {icon}
        </div>

        {!collapsed && (
          <span className="font-semibold text-sm sm:text-[15px] truncate">
            {label}
          </span>
        )}
      </div>

      {!collapsed && (
        <div className="flex items-center gap-2">

         {typeof badge === "number" && badge > 0 && (
            <div
              className={cn(
                `
                flex
                h-5 sm:h-6
                min-w-[20px] sm:min-w-[24px]
                items-center
                justify-center
                rounded-full
                px-1.5 sm:px-2
                text-[10px] sm:text-[11px]
                font-bold
                `,
active
  ? "bg-white text-[#1E1B3A]"
  : "bg-[#B348FE] text-white"
              )}
            >
              {badge > 99 ? "99+" : badge}
            </div>
          )}

          {active && (
            <ChevronLeft
  size={16}
  className="
    text-white
    transition-all
    duration-300
    group-hover:-translate-x-1
  "
/>
          )}

        </div>
      )}
    </button>
  );
}
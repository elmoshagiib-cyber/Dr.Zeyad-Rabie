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
        rounded-[22px]
        px-3
        py-3
        transition-all
        duration-500
ease-out
        `,
        collapsed ? "justify-center" : "justify-between",

        active
          ? `
            bg-gradient-to-r
            from-violet-700
via-purple-700
to-fuchsia-600
            text-white
            shadow-[0_18px_45px_rgba(109,40,217,.35)]
          `
          : `
            text-slate-600
            hover:bg-gradient-to-r
hover:from-violet-50
hover:to-fuchsia-50
            hover:text-violet-700
          `
      )}
    >
      {/* Active Glow */}
      {active && (
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      )}

      {/* Active Line */}
      {active && (
        <div className="absolute right-0 top-3 bottom-3 w-[4px] rounded-l-full bg-white" />
      )}

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
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            transition-all
            duration-500
ease-out
            group-hover:scale-110
  group-hover:rotate-3
            `,
            active
              ? `
                bg-white/15
                backdrop-blur-md
              `
              : `
                bg-slate-100
                group-hover:bg-violet-100
                group-hover:scale-110
                group-hover:text-violet-700
              `
          )}
        >
          {icon}
        </div>

        {!collapsed && (
          <span className="font-bold text-[15px] tracking-wide">
            {label}
          </span>
        )}
      </div>

      {!collapsed && (
        <div className="flex items-center gap-2">

          {badge && (
            <div
              className={cn(
                `
                flex
                h-6
                min-w-[24px]
                items-center
                justify-center
                rounded-full
                px-2
                text-[11px]
                font-black
                `,
                active
                  ? "bg-white text-violet-700"
                  : "bg-rose-500 text-white"
              )}
            >
              {badge}
            </div>
          )}

          {active && (
            <ChevronLeft
              size={18}
              className="text-white/90"
            />
          )}

        </div>
      )}
    </button>
  );
}
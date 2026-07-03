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
        rounded-3xl
        px-3
        py-3
        transition-all
        duration-300
        `,
        collapsed
          ? "justify-center"
          : "justify-between",

        active
          ? `
            bg-[#4C1D95]
            text-white
            shadow-lg
            shadow-violet-900/20
          `
          : `
            text-slate-600
            hover:bg-violet-100
            hover:text-violet-700
          `
      )}
    >

      {active && (
        <div
          className="
          absolute
          right-0
          top-3
          bottom-3
          w-1
          rounded-l-full
          bg-white
          "
        />
      )}

      <div
        className={cn(
          "flex items-center",
          collapsed
            ? "justify-center"
            : "gap-3"
        )}
      >

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
            duration-300
            `,
            active
              ? "bg-white/15"
              : `
                bg-slate-50
                group-hover:bg-violet-200
              `
          )}
        >
          {icon}
        </div>

        {!collapsed && (
          <span className="font-semibold text-[15px]">
            {label}
          </span>
        )}

      </div>

      {!collapsed && badge && (
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
            text-xs
            font-bold
            `,
            active
              ? "bg-white text-violet-700"
              : "bg-red-500 text-white"
          )}
        >
          {badge}
        </div>
      )}

    </button>
  );
}
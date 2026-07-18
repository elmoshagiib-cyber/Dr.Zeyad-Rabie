import { Settings } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
};

type Props = {
  navItems: NavItem[];
  collapsed: boolean;
  currentPath: string;
  onNavigate: (path: string) => void;
};

export function SidebarNavigation({
  navItems,
  collapsed,
  currentPath,
  onNavigate,
}: Props) {
  return (
    <nav
      className="
        flex-1
        overflow-y-auto
        px-3 py-4
        sm:px-4 sm:py-5
        scrollbar-thin
        scrollbar-thumb-slate-300
        scrollbar-track-transparent
        hover:scrollbar-thumb-slate-400
      "
    >
      <div className="space-y-1.5">

        {navItems.map((item) => {

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

      {!collapsed && (
        <>
          <div className="my-6 h-px bg-slate-200" />

          <p
            className="
              mb-3
              px-3
              text-[10px]
              sm:text-[11px]
              font-bold
              tracking-wider
              uppercase
              text-slate-400
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
              rounded-xl
              px-3
              py-2.5
              sm:py-3
              text-slate-600
              transition-all
              duration-200
              hover:bg-indigo-50
              hover:text-indigo-700
              active:scale-[0.98]
            "
          >
            <div
              className="
                flex
                h-9 w-9
                sm:h-10 sm:w-10
                items-center
                justify-center
                rounded-lg
                bg-slate-100
                transition-all
                duration-200
                group-hover:bg-indigo-100
                group-hover:text-indigo-600
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
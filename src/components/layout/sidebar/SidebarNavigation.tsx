import { Settings } from "lucide-react";
import { cn } from "../../../utils/cn";
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
      px-5 py-5
      scrollbar-hide
      "
    >
      <div className="space-y-2">

       {navItems.map((item) => {

  const active =
    currentPath === item.path;

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

          <div className="my-8 h-px bg-slate-100" />

          <p
            className="
            mb-3
            px-3
            text-[11px]
            font-black
            tracking-[0.18em]
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
            rounded-2xl
            px-3
            py-3
            text-slate-600
            transition-all
            hover:bg-violet-100
            hover:text-violet-700
            "
          >

            <div
              className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-slate-50
              group-hover:bg-violet-200
              "
            >
              <Settings size={18} />
            </div>

            <span className="font-semibold">
              الإعدادات
            </span>

          </button>

        </>

      )}

    </nav>
  );
}

import { DashboardSidebarItem } from "./DashboardSidebarItem";

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

export function DashboardSidebarNavigation({
  navGroups,
  collapsed,
  currentPath,
  onNavigate,
}: Props) {
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
      <div className="space-y-5">

        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p
                className="
                  mb-2
                  px-3
                  text-[10px]
                  sm:text-[11px]
                  font-bold
                  tracking-wider
                  uppercase
                  text-gray-400 dark:text-gray-500
                "
              >
                {group.label}
              </p>
            )}

            <div className="space-y-1.5">
              {group.items.map((item) => {
                const active = currentPath === item.path;

                return (
                  <DashboardSidebarItem
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
          </div>
        ))}

      </div>

    </nav>
  );
}
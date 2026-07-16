import { GraduationCap, PanelRightClose, PanelRightOpen } from "lucide-react";

type SidebarHeaderProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function SidebarHeader({ collapsed, setCollapsed }: SidebarHeaderProps) {
  return (
    <div className="relative px-4 py-4 border-b border-slate-100 dark:border-white/6">

      {/* subtle top accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-transparent rounded-t-xl" />

      <div className="flex items-center justify-between gap-3">

        {/* Logo + info */}
        <div className="flex items-center gap-3 min-w-0">

          {/* Icon */}
          <div className="
            relative shrink-0
            flex items-center justify-center
            w-10 h-10
            rounded-2xl
            bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600
            shadow-[0_4px_14px_rgba(124,29,204,0.35)]
          ">
            <GraduationCap size={20} className="text-white" />
            {/* pulse ring */}
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0f0f0f] shadow-sm" />
          </div>

          {/* Text — hidden when collapsed */}
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-[14px] font-black text-slate-900 dark:text-white leading-tight truncate">
                منصة زياد ربيع
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                لوحة التحكم
              </p>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "توسيع الشريط" : "طي الشريط"}
          className="
            shrink-0
            flex items-center justify-center
            w-8 h-8
            rounded-xl
            text-slate-400 dark:text-slate-500
            hover:text-violet-600 dark:hover:text-violet-400
            hover:bg-violet-50 dark:hover:bg-violet-500/10
            transition-all duration-200
          "
        >
          {collapsed
            ? <PanelRightOpen  size={16} strokeWidth={2.2} />
            : <PanelRightClose size={16} strokeWidth={2.2} />
          }
        </button>

      </div>
    </div>
  );
}
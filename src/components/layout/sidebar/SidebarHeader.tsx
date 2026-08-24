import { Menu } from "lucide-react";

type SidebarHeaderProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function SidebarHeader({
  collapsed,
  setCollapsed,
}: SidebarHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-4">
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
          className="
            shrink-0
            w-10 h-10
            rounded-xl
            border border-[#EAD8FF]
            bg-[#F6EEFF]
            flex items-center justify-center
            text-[#B348FE]
            hover:bg-[#EEDBFF]
            hover:border-[#B348FE]
            active:scale-95
            transition-all
            duration-200
            shadow-sm
          "
        >
          <Menu size={18} strokeWidth={2.3} />
        </button>

        {!collapsed && (
          <h2 className="text-[15px] font-black text-slate-900 truncate mr-3">
            منصة زياد ربيع
          </h2>
        )}
      </div>
    </div>
  );
}
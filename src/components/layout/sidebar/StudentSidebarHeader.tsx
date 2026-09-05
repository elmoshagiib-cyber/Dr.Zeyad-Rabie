import { Menu } from "lucide-react";

type StudentSidebarHeaderProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function StudentSidebarHeader({
  collapsed,
  setCollapsed,
}: StudentSidebarHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-4">
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <h2 className="text-[15px] font-black text-slate-900 truncate">
            منصه زياد ربيع
          </h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
          className="
            shrink-0
            w-10 h-10
            rounded-xl
            border border-transparent
            bg-[#B348FE]
            flex items-center justify-center
            text-white
            shadow-[0_8px_20px_rgba(179,72,254,.35)]
            hover:opacity-90
            hover:scale-105
            active:scale-95
            transition-all
            duration-200
          "
        >
          <Menu size={18} strokeWidth={2.3} />
        </button>
      </div>
    </div>
  );
}
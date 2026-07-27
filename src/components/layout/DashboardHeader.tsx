import {
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";


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
    <div className="flex justify-start">
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
        className="
          w-10 h-10
          rounded-xl
          border border-slate-200
          bg-white
          flex items-center justify-center
          text-slate-600
          hover:bg-indigo-50
          hover:border-indigo-300
          hover:text-indigo-600
          transition-all
          duration-200
          shadow-sm
        "
      >
        {collapsed ? (
          <PanelRightOpen size={18} />
        ) : (
          <PanelRightClose size={18} />
        )}
      </button>
    </div>
  </div>
);
}
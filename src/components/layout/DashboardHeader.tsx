import { Menu, Sparkles } from "lucide-react";

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
            border border-slate-200
            bg-white
            flex items-center justify-center
            text-slate-600
            hover:bg-violet-50
            hover:border-violet-300
            hover:text-violet-600
            active:scale-95
            transition-all
            duration-200
            shadow-sm
          "
        >
          <Menu size={18} strokeWidth={2.3} />
        </button>

        {!collapsed && (
          <>
            <h2 className="text-[15px] font-black text-slate-900 truncate mx-2 flex-1 text-center">
              المنصة التعليمية
            </h2>

            <div
              className="
                shrink-0
                w-9 h-9
                rounded-xl
                bg-gradient-to-br
                from-violet-700
                via-purple-600
                to-fuchsia-600
                flex
                items-center
                justify-center
                shadow-[0_8px_18px_rgba(124,58,237,.3)]
              "
            >
              <Sparkles size={15} className="text-white" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
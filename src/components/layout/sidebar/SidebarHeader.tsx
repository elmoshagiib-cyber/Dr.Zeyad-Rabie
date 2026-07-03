import { GraduationCap, PanelRightClose, PanelRightOpen } from "lucide-react";

type SidebarHeaderProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function SidebarHeader({
  collapsed,
  setCollapsed,
}: SidebarHeaderProps) {
  return (
    <div className="border-b border-slate-100 px-5 py-4">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div
            className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-3xl
            bg-[#4C1D95]
            shadow-lg
            shadow-violet-900/20
            "
          >
            <GraduationCap
              size={26}
              className="text-white"
            />
          </div>

          {!collapsed && (
            <div>

              <h2 className="text-lg font-black text-slate-900">
                منصة زياد ربيع
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                لوحة التحكم
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />

                <span className="text-xs font-medium text-emerald-600">
                  Online
                </span>

              </div>

            </div>
          )}

        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          transition-all
          hover:bg-slate-50
          "
        >
          {collapsed ? (
            <PanelRightOpen size={20} />
          ) : (
            <PanelRightClose size={20} />
          )}
        </button>

      </div>

    </div>
  );
}
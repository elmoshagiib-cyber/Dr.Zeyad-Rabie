import {
  GraduationCap,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

type SidebarHeaderProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function SidebarHeader({
  collapsed,
  setCollapsed,
}: SidebarHeaderProps) {
  const { user } = useApp();

  return (
    <div className="relative overflow-hidden border-b border-slate-200/80 bg-white/40 backdrop-blur-sm px-4 py-5 sm:px-5 sm:py-6">

      {/* Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />

      <div className="relative flex items-center justify-between gap-3">

        {/* Logo + Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">

          <div className="relative shrink-0">

            {/* Logo */}
            <div
              className="
                w-12 h-12
                sm:w-14 sm:h-14
                rounded-xl
                bg-indigo-600
                flex
                items-center
                justify-center
                shadow-lg
                shadow-indigo-600/30
                transition-transform
                hover:scale-105
                duration-300
              "
            >
              <GraduationCap
                size={24}
                className="text-white sm:w-7 sm:h-7"
              />
            </div>

            {/* Online Status */}
            <div
              className="
                absolute
                -bottom-0.5
                -right-0.5
                w-4 h-4
                rounded-full
                bg-emerald-500
                border-2
                border-white
                shadow-sm
              "
            />

          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">

              <h2
                className="
                  text-base
                  sm:text-lg
                  font-bold
                  text-slate-800
                  truncate
                  leading-tight
                "
              >
                منصة زياد ربيع
              </h2>

              <p
                className="
                  text-xs
                  sm:text-sm
                  text-slate-500
                  mt-0.5
                  truncate
                "
              >
                لوحة التحكم
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

                <span
                  className="
                    text-[11px]
                    sm:text-xs
                    text-slate-400
                    truncate
                    font-medium
                  "
                >
                  {user?.name || "مرحبًا بك"}
                </span>

              </div>

            </div>
          )}

        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
          className="
            shrink-0
            w-9 h-9
            sm:w-10 sm:h-10
            rounded-lg
            border
            border-slate-200
            bg-white
            flex
            items-center
            justify-center
            text-slate-600
            hover:bg-indigo-50
            hover:border-indigo-300
            hover:text-indigo-600
            active:scale-95
            transition-all
            duration-200
            shadow-sm
          "
        >
          {collapsed ? (
            <PanelRightOpen size={18} strokeWidth={2} />
          ) : (
            <PanelRightClose size={18} strokeWidth={2} />
          )}
        </button>

      </div>
    </div>
  );
}
import {
  GraduationCap,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";

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
    <div className="relative overflow-hidden border-b border-slate-200 bg-white px-5 py-5">

      {/* Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-700 via-fuchsia-500 to-[#F6AC08]" />

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] via-fuchsia-500/[0.03] to-transparent pointer-events-none" />

      <div className="relative flex items-center justify-between">

        {/* Logo + Info */}
        <div className="flex items-center gap-4 min-w-0">

          <div className="relative shrink-0">

            {/* Logo */}
            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-gradient-to-br
                from-violet-700
                via-purple-600
                to-fuchsia-600
                flex
                items-center
                justify-center
                shadow-[0_14px_30px_rgba(124,58,237,.35)]
              "
            >
              <GraduationCap
                size={28}
                className="text-white"
              />
            </div>

            {/* Online Status */}
            <div
              className="
                absolute
                -bottom-1
                -right-1
                w-5
                h-5
                rounded-full
                bg-emerald-500
                border-[3px]
                border-white
                flex
                items-center
                justify-center
                shadow
              "
            >
              <Sparkles
                size={9}
                className="text-white"
              />
            </div>

          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">

              <h2
                className="
                  text-[18px]
                  font-black
                  text-slate-900
                  truncate
                "
              >
                منصة زياد ربيع
              </h2>

              <p
                className="
                  text-[13px]
                  text-slate-500
                  mt-0.5
                  truncate
                "
              >
                لوحة التحكم
              </p>

              <div className="mt-3 flex items-center gap-2">

                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                <span
                  className="
                    text-xs
                    text-slate-400
                    truncate
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
            w-10
            h-10
            rounded-xl
            border
            border-slate-200
            bg-white
            flex
            items-center
            justify-center
            text-slate-500
            hover:bg-violet-50
            hover:border-violet-300
            hover:text-violet-600
            active:scale-95
            transition-all
            duration-300
            shadow-sm
          "
        >
          {collapsed ? (
            <PanelRightOpen size={18} strokeWidth={2.3} />
          ) : (
            <PanelRightClose size={18} strokeWidth={2.3} />
          )}
        </button>

      </div>
    </div>
  );
}
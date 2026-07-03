import {
  Bell,
  Search,
  Moon,
  Menu,
} from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export function DashboardTopbar({
  onMenuClick,
}: Props) {
  return (
    <header
      className="
      sticky
      top-0
      z-30
      mb-6

      flex
      items-center
      justify-between

      rounded-[28px]

      border
      border-slate-200

      bg-white/80
      px-6
      py-4

      backdrop-blur-xl

      shadow-sm
      "
    >

      {/* Right */}

      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          hover:bg-slate-100
          lg:hidden
          "
        >
          <Menu size={22} />
        </button>

        <div>

          <h1 className="text-xl font-black">

            لوحة التحكم

          </h1>

          <p className="text-sm text-slate-500">

            مرحباً بعودتك 👋

          </p>

        </div>

      </div>

      {/* Left */}

      <div className="flex items-center gap-3">

        <button
          className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          hover:bg-slate-100
          "
        >
          <Search size={19} />
        </button>

        <button
          className="
          relative

          flex
          h-11
          w-11
          items-center
          justify-center

          rounded-2xl

          hover:bg-slate-100
          "
        >

          <Bell size={19} />

          <span
            className="
            absolute
            top-2
            right-2

            h-2
            w-2

            rounded-full
            bg-red-500
            "
          />

        </button>

        <button
          className="
          flex
          h-11
          w-11
          items-center
          justify-center

          rounded-2xl

          hover:bg-slate-100
          "
        >
          <Moon size={18} />
        </button>

      </div>

    </header>
  );
}
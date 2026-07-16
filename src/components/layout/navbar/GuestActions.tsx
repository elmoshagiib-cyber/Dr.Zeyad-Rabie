import { ArrowRightOnRectangleIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

interface GuestActionsProps {
  navigate: ReturnType<typeof useNavigate>;
}

export function GuestActions({ navigate }: GuestActionsProps) {
  return (
    <div className="hidden md:flex items-center gap-2.5">
      <button
        onClick={() => navigate("/login")}
        className="
          flex items-center justify-center gap-2
          h-10 px-5
          rounded-xl
          border border-[#E5E7EB] dark:border-white/10
          bg-white dark:bg-transparent
          text-slate-700 dark:text-slate-300
          text-[14px] font-semibold
          hover:border-violet-300 hover:text-violet-600
          dark:hover:border-violet-500 dark:hover:text-violet-400
          transition-all duration-300
        "
      >
        <span>تسجيل الدخول</span>
        <ArrowRightOnRectangleIcon className="w-4 h-4 text-slate-400" />
      </button>

     <button
  onClick={() => navigate("/register")}
  className="
    flex items-center justify-center gap-2
    h-10 px-5
    rounded-xl
    bg-[#371143]
    hover:bg-[#4A175B]
    text-white
    text-[14px]
    font-bold
    shadow-[0_12px_30px_rgba(55,17,67,.30)]
    hover:-translate-y-[1px]
    hover:shadow-[0_16px_36px_rgba(55,17,67,.40)]
    active:scale-[0.98]
    transition-all
    duration-300
  "
>
  <UserPlusIcon className="w-4 h-4" />
  <span>إنشاء حساب</span>
</button>
    </div>
  );
}
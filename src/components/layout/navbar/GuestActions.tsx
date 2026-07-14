import { ArrowRightOnRectangleIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

interface GuestActionsProps {
  navigate: ReturnType<typeof useNavigate>;
}

export function GuestActions({
  navigate,
}: GuestActionsProps) {
  return (
    
              <>

<div
  className="
hidden
md:flex
items-center
gap-3
"
>

  {/* Login */}

  {/* Register */}


  <button
    onClick={() => navigate("/login")}
className="
hidden
md:flex
items-center
justify-center
gap-2
h-12
px-6
rounded-xl
border
border-[#E5E7EB]
bg-white
text-slate-700
font-bold
hover:border-[#FACC15]
hover:text-[#F59E0B]
transition-all
duration-300
"
  >
  <span>تسجيل الدخول</span>

<ArrowRightOnRectangleIcon
  className="w-5 h-5 text-slate-400
group-hover:text-violet-600
transition-colors
duration-300"
/>
  </button>

<button
  onClick={() => navigate("/register")}
  className="
hidden
md:flex
items-center
justify-center
gap-3
h-[54px]
px-7
rounded-2xl
bg-[#F97316]
hover:bg-[#EA580C]
text-white
font-bold
shadow-[0_8px_22px_rgba(249,115,22,.28)]
transition-all
duration-300
hover:-translate-y-[2px]
hover:shadow-[0_14px_30px_rgba(249,115,22,.38)]
active:scale-[0.98]
"
>
  <div
    className="
w-10
h-10
rounded-xl
bg-[#EA580C]
flex
items-center
justify-center
"
  >
    <UserPlusIcon className="w-5 h-5 text-white" />
  </div>

  <span
    className="
text-[18px]
font-bold
tracking-tight
"
  >
    إنشاء حساب
  </span>
</button>
  </div>
    </>
  );
}
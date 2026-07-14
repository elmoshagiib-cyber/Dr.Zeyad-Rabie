import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff, GraduationCap, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";
import { CURRENT_STUDENT } from "../data/mockData";

type LoginRole = "student" | "instructor" | "admin";

export function LoginPage({
  staffMode = false,
}: {
  staffMode?: boolean;
}) {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState<LoginRole>("student");

  const demoUsers = {
  student: {
    email: "student@test.com",
    password: "student123",
  },

  instructor: {
    email: "zeyadrabie10@gmail.com",
    password: "asdfghjkl10",
  },

  admin: {
    email: "admin@test.com",
    password: "admin123",
  },
};

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 1200));

 if (activeRole === "student") {
   // Login الطالب

   login({
  id: CURRENT_STUDENT.id,
  name: CURRENT_STUDENT.name,
  role: "student",
  grade: CURRENT_STUDENT.grade,
  gradeLabel: CURRENT_STUDENT.gradeLabel,
  code: CURRENT_STUDENT.code,
  governorate: CURRENT_STUDENT.governorate,
  phone: CURRENT_STUDENT.phone,
  status: "approved",
});

navigate("/dashboard");

}
else if (activeRole === "instructor") {
   // Login Supabase

 const { data, error } =
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

if (error) {
  setError(error.message);
  setLoading(false);
  return;
}

console.log("AUTH USER ID =", data.user.id);

const { data: instructor, error: instructorError } =
  await supabase
    .from("instructors")
    .select("*")
    .eq("auth_id", data.user.id)
    .single();

console.log("AUTH USER =", data.user);
console.log("AUTH USER ID =", data.user.id);
console.log("INSTRUCTOR =", instructor);
console.log("INSTRUCTOR ERROR =", instructorError);

if (instructorError || !instructor) {
  setError("هذا الحساب ليس مدرساً");
  setLoading(false);
  return;
}

login({
  id: instructor.id,
  name: instructor.full_name,
  role: "instructor",
  phone: instructor.phone,
});

navigate("/instructor");

setLoading(false);
return;
}
else {
  login({
    id: "admin1",
    name: "مدير النظام",
    role: "admin",
  });

  navigate("/admin");
}

setLoading(false);
};

  return (
    <div className="
min-h-screen
bg-white
dark:bg-[#09090B]
overflow-hidden
relative
">

  <div className="absolute inset-0 overflow-hidden pointer-events-none">

    <div
        className="
absolute
top-[-180px]
right-[-180px]
w-[520px]
h-[520px]
rounded-full
bg-[#A52DFF]/20
blur-[130px]
"
    />

    <div
        className="
absolute
bottom-[-220px]
left-[-220px]
w-[600px]
h-[600px]
rounded-full
bg-fuchsia-500/15
blur-[150px]
"
    />

</div>

      <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex items-center px-6 py-12">
  <div className="grid lg:grid-cols-2 gap-14 items-center w-full">



        <div
  className="
relative
overflow-hidden
rounded-[36px]
border
border-slate-200
dark:border-white/10
bg-white/75
dark:bg-[#130726]/80
backdrop-blur-2xl
shadow-[0_25px_80px_rgba(124,29,204,.18)]
transition-all
duration-500
"
>

  {/* Decorative Glow */}

<div
  className="
absolute
top-0
left-0
w-full
h-1
bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8]
"
/>

<div
  className="
absolute
-left-24
-top-24
w-72
h-72
rounded-full
bg-[#A52DFF]/10
blur-[90px]
pointer-events-none
"
/>
          {/* Header */}
          <div className="px-10 pt-10 pb-7">
            <h1
className="
text-4xl
font-black
leading-tight
text-slate-900
dark:text-white
mb-3
"
>

{staffMode
? "لوحة تحكم المدرس"
: "مرحباً بعودتك 👋"}

</h1>
           <p
className="
text-base
leading-8
text-slate-500
dark:text-slate-400
"
>

{staffMode
? "تسجيل الدخول لإدارة المنصة"
: "سجّل دخولك للوصول إلى كورساتك"}

</p>
          </div>

          {/* Role Tabs */}
          {staffMode && (
<div className="px-8 mb-6">

<div className="bg-white/10 rounded-2xl p-1 flex">

<button
onClick={() =>
setActiveRole("instructor")
}
className={`flex-1 py-2 rounded-xl text-sm font-bold ${
activeRole === "instructor"
? "bg-white text-slate-900"
: "text-white/60"
}`}
>
مدرس
</button>

<button
onClick={() =>
setActiveRole("admin")
}
className={`flex-1 py-2 rounded-xl text-sm font-bold ${
activeRole === "admin"
? "bg-white text-slate-900"
: "text-white/60"
}`}
>
مدير
</button>

</div>

</div>
)}

          {/* Form */}
          <form onSubmit={handleLogin} className="px-10 pb-10 space-y-6">
<div className="group">
  <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
    البريد الإلكتروني
  </label>

  <div
    className="
relative
rounded-2xl
border
border-slate-200
dark:border-white/10
bg-white/80
dark:bg-white/5
transition-all
duration-300
group-focus-within:border-violet-500
group-focus-within:ring-4
group-focus-within:ring-violet-500/15
hover:border-violet-300
"
  >
    <Phone
      size={18}
      className="
absolute
right-5
top-1/2
-translate-y-1/2
text-violet-500
"
    />

    <input
      type="email"
      placeholder="البريد الإلكتروني"
     value={email}

onChange={(e) => setEmail(e.target.value)}
      className="
w-full
h-[60px]
bg-transparent
pr-14
pl-5
rounded-2xl
outline-none
text-slate-900
dark:text-white
placeholder:text-slate-400
"
      required
    />
  </div>
</div>
            <div className="group">
  <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
    كلمة المرور
  </label>

  <div
    className="
relative
rounded-2xl
border
border-slate-200
dark:border-white/10
bg-white/80
dark:bg-white/5
transition-all
duration-300
group-focus-within:border-violet-500
group-focus-within:ring-4
group-focus-within:ring-violet-500/15
hover:border-violet-300
"
  >
    <Lock
      size={18}
      className="
absolute
right-5
top-1/2
-translate-y-1/2
text-violet-500
"
    />

    <input
      type={showPass ? "text" : "password"}
      placeholder="••••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="
w-full
h-[60px]
bg-transparent
pr-14
pl-14
rounded-2xl
outline-none
text-slate-900
dark:text-white
placeholder:text-slate-400
"
      required
    />

    <button
      type="button"
      onClick={() => setShowPass(!showPass)}
      className="
absolute
left-5
top-1/2
-translate-y-1/2
text-slate-400
hover:text-violet-600
transition-colors
"
    >
      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-400" />
                <span className="text-slate-300 text-sm">تذكرني</span>
              </label>
              <button type="button" className="text-blue-400 text-sm hover:text-blue-300">نسيت كلمة المرور؟</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>تسجيل الدخول</>
              )}
            </button>

            {!staffMode && (
<p className="text-center text-slate-400 text-sm">
ليس لديك حساب؟
...
</p>
)}

            <button type="button" onClick={() => navigate("/")} className="w-full flex items-center justify-center gap-2 text-slate-400 text-sm hover:text-white transition-colors">
              <ArrowLeft size={14} />
              العودة للرئيسية
            </button>
          </form>
        </div>
           </div>
  </div>
</div>
  );
}

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { supabase } from "../lib/supabase";
import { FaWhatsapp } from "react-icons/fa";

export type UserRole = "student" | "instructor" | "admin";

export interface AppUser {
  id: string;
  studentId?: number;

  name: string;
  role: UserRole;

avatar_url?: string;
  cover_url?: string;

  grade?: string;
  gradeLabel?: string;
  code?: string;
  governorate?: string;
  phone?: string;
  status?: "pending" | "approved";
}


interface AppContextType {
  user: AppUser | null;
  loading: boolean;
  login: (user: AppUser) => void;
  updateUser: (data: Partial<AppUser>) => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  user: null,
  loading: true,
  login: () => {},
  updateUser: () => {},
  logout: async () => {},
});



export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [sessionKicked, setSessionKicked] = useState(false);
const savedUser = localStorage.getItem("user");

  const updateUser = (data: Partial<AppUser>) => {
  setUser((prev) => {
    if (!prev) return prev;

    const updated = {
      ...prev,
      ...data,
    };

    localStorage.setItem("user", JSON.stringify(updated));

    return updated;
  });
};

useEffect(() => {
  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
      return;
    }


    if (savedUser) {
      const savedToken = localStorage.getItem("session_token");

const { data: student } = await supabase
  .from("students")
  .select("session_token, is_blocked")
  .eq("auth_id", session.user.id)
  .single();

if (
  student &&
  student.session_token !== savedToken
) {
  await supabase.auth.signOut();

  localStorage.removeItem("user");
  localStorage.removeItem("session_token");

  setUser(null);
  setSessionKicked(true);
  setLoading(false);

  return;
}

      setIsBlocked(!!student?.is_blocked);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  };

  checkUser();
const interval = setInterval(async () => {
  const savedToken = localStorage.getItem("session_token");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!savedToken || !session) return;

  const { data: student } = await supabase
    .from("students")
    .select("session_token, is_blocked")
    .eq("auth_id", session.user.id)
    .single();

  if (!student) return;

if (student.session_token !== savedToken) {
    await supabase.auth.signOut();

    localStorage.clear();

    setUser(null);
    setSessionKicked(true);

    return;
  }

  setIsBlocked(!!student.is_blocked);
}, 3000);

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_, session)=> {
    if (!session) {
      localStorage.removeItem("user");
      setUser(null);
    }
  });

return () => {
  clearInterval(interval);
  subscription.unsubscribe();
};

}, []);  


  const login = (u: AppUser) => {
  setUser(u);
  localStorage.setItem("user", JSON.stringify(u));
};

const logout = async () => {
  await supabase.auth.signOut();

  setUser(null);

  localStorage.removeItem("user");
};

  return (
<AppContext.Provider
  value={{
    user,
    loading,
    login,
    updateUser,
    logout,
  }}
>
      {sessionKicked && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] shadow-2xl p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
              <span className="text-4xl">📱</span>
            </div>

            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              تم تسجيل خروجك
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
              تم تسجيل خروجك لأنه تم تسجيل الدخول بحسابك من جهاز آخر.
            </p>

            <button
              onClick={() => {
                setSessionKicked(false);
                window.location.href = "/login";
              }}
              className="mt-6 w-full py-3.5 rounded-xl bg-[#B348FE] hover:bg-[#9E2FFF] text-white font-bold transition-colors"
            >
              حسنًا
            </button>
          </div>
        </div>
      )}

      {isBlocked && user?.role === "student" && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] shadow-2xl p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
              <span className="text-4xl">🚫</span>
            </div>

            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              تم إيقاف حسابك مؤقتًا
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
              تم إيقاف تفعيل حسابك من قِبل الإدارة. لمعرفة السبب أو طلب إعادة التفعيل،
              تواصل مع فريق مستر زياد ربيع عبر واتساب.
            </p>

            <a
              href="https://wa.me/201109414585?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%AA%D9%85%20%D8%A5%D9%8A%D9%82%D8%A7%D9%81%20%D8%AA%D9%81%D8%B9%D9%8A%D9%84%20%D8%AD%D8%B3%D8%A7%D8%A8%D9%8A%20%D9%88%D8%A7%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FaWhatsapp className="text-xl" />
              تواصل مع فريق الدعم
            </a>

            <button
              onClick={logout}
              className="mt-3 w-full py-2 text-sm font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}

      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

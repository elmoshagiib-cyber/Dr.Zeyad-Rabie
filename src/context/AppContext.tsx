import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { supabase } from "../lib/supabase";

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
  .select("session_token")
  .eq("auth_id", session.user.id)
  .single();

if (
  student &&
  student.session_token !== savedToken
) {
  alert("تم تسجيل خروجك لأنه تم تسجيل الدخول بحسابك من جهاز آخر");

  await supabase.auth.signOut();

  localStorage.removeItem("user");
  localStorage.removeItem("session_token");

  setUser(null);
  setLoading(false);

  return;
}

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
    .select("session_token")
    .eq("auth_id", session.user.id)
    .single();

  if (!student) return;

if (student.session_token !== savedToken) {
    alert("تم تسجيل خروجك لأنه تم تسجيل الدخول بحسابك من جهاز آخر");

    await supabase.auth.signOut();

    localStorage.clear();

    window.location.href = "/login";
  }
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
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

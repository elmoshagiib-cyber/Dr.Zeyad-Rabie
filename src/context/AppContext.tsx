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
  name: string;
  role: UserRole;

  avatar_url?: string;

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
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

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
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  };

  checkUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_, session)=> {
    if (!session) {
      localStorage.removeItem("user");
      setUser(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);  const savedUser = localStorage.getItem("user");


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

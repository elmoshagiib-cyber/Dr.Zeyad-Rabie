import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export type UserRole = "student" | "instructor" | "admin";

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
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
  logout: () => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = (u: AppUser) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const logout = () => {
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

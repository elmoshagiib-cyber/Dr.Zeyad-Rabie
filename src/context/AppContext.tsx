import { createContext, useContext, useState, ReactNode } from "react";

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
  login: (user: AppUser) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  const login = (u: AppUser) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AppContext.Provider value={{ user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

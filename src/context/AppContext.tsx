import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Role, Screen } from "@/types";

interface AppState {
  screen: Screen;
  role: Role | null;
  areaFilter: string;
  currentEmployeeId: string | null;
  latestDiagnosticId: string | null;
  companyId: string | null;
}

interface AppContextValue extends AppState {
  navigateTo: (screen: Screen, params?: Partial<AppState>) => void;
  setAreaFilter: (area: string) => void;
  setRole: (role: Role | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    screen: "dashboard",
    role: "admin",
    areaFilter: "__all__",
    currentEmployeeId: null,
    latestDiagnosticId: null,
    companyId: null,
  });

  // Cargar la única compañía y guardar su id.
  useEffect(() => {
    supabase
      .from("companies")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setState((prev) => ({ ...prev, companyId: data.id }));
      });
  }, []);

  const navigateTo = useCallback((screen: Screen, params?: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...params, screen }));
  }, []);

  const setAreaFilter = useCallback((areaFilter: string) => {
    setState((prev) => ({ ...prev, areaFilter }));
  }, []);

  const setRole = useCallback((role: Role | null) => {
    setState((prev) => ({ ...prev, role }));
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: "login",
      role: null,
      areaFilter: "__all__",
      currentEmployeeId: null,
      latestDiagnosticId: null,
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ ...state, navigateTo, setAreaFilter, setRole, logout }),
    [state, navigateTo, setAreaFilter, setRole, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

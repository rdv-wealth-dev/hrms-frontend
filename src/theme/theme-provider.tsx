import { useState, useMemo, useCallback } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/rootReducer";
import { createAppTheme } from "./create-theme";
import { ThemeModeContext, type ThemeMode } from "../hooks/useThemeMode";

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const savedMode = localStorage.getItem("hrms-theme-mode");
      if (savedMode === "dark" || savedMode === "light") return savedMode;
    } catch {
      // Ignore storage errors
    }
    return "light";
  });

  const tenantPrimaryColor = useSelector(
    (state: RootState) => (state.auth?.organization as any)?.branding?.primaryColor as string | undefined
  );

  const toggleThemeMode = useCallback(() => {
    setMode((prev) => {
      const nextMode = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("hrms-theme-mode", nextMode);
      } catch {
        // Ignore storage errors
      }
      return nextMode;
    });
  }, []);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    try {
      localStorage.setItem("hrms-theme-mode", newMode);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const theme = useMemo(() => {
    return createAppTheme(mode, tenantPrimaryColor);
  }, [mode, tenantPrimaryColor]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleThemeMode,
      setThemeMode,
    }),
    [mode, toggleThemeMode, setThemeMode]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default AppThemeProvider;
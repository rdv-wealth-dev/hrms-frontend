import { createContext, useContext } from "react";

export type ThemeMode = "light" | "dark";

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: "light",
  toggleThemeMode: () => {},
  setThemeMode: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

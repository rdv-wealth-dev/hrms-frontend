

import { ThemeProvider } from "@mui/material/styles";

import type { ReactNode } from "react";
import { theme } from "./create-theme";

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({
  children,
}: AppThemeProviderProps) => {
  return (
    <ThemeProvider theme={theme}>
      
      {children}
    </ThemeProvider>
  );
};
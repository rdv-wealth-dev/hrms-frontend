import React from "react";
import { Toaster } from "sonner";
import { useTheme } from "@mui/material/styles";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme={theme.palette.mode === "dark" ? "dark" : "light"}
        toastOptions={{
          style: {
            fontFamily: '"Inter", "Segoe UI", sans-serif',
            borderRadius: "12px",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)",
          }
        }}
      />
    </>
  );
}

export default ToastProvider;

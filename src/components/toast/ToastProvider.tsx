import React from "react";
import { Toaster } from "sonner";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: '"Inter", "Segoe UI", sans-serif',
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            color: "#111827",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)",
          }
        }}
      />
    </>
  );
}

export default ToastProvider;

import React from "react";
import { toast } from "sonner";
import type { AlertColor } from "@mui/material/Alert";

export { ToastProvider } from "./ToastProvider";
export { Toaster, toast } from "sonner";

export function useToast() {
  const showToast = React.useCallback((message: string, severity: AlertColor = "success") => {
    switch (severity) {
      case "success":
        toast.success(message, {
          style: { borderColor: "#10B981" }
        });
        break;
      case "error":
        toast.error(message, {
          style: { borderColor: "#EF4444" }
        });
        break;
      case "warning":
        toast.warning(message, {
          style: { borderColor: "#F59E0B" }
        });
        break;
      case "info":
      default:
        toast.info(message, {
          style: { borderColor: "#6D5DF6" }
        });
        break;
    }
  }, []);

  return { showToast, toast };
}

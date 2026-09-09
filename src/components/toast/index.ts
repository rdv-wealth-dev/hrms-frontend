import React from "react";
import { useTheme } from "@mui/material/styles";
import { toast } from "sonner";
import type { AlertColor } from "@mui/material/Alert";
import { themeConfig } from "../../theme/theme-config";

export { ToastProvider } from "./ToastProvider";
export { Toaster, toast } from "sonner";

export function useToast() {
  const theme = useTheme();
  const primaryColor = theme?.palette?.primary?.main ?? themeConfig.palette.primary.main;

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
          style: { borderColor: primaryColor }
        });
        break;
    }
  }, [primaryColor]);

  return { showToast, toast };
}

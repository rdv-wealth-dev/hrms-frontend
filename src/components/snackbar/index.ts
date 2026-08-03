import { useToast, ToastProvider } from "../toast";

// Re-export the new provider and hook under legacy names to prevent compilation breaking in existing pages
export { ToastProvider as SnackbarProvider };

export function useSnackbar() {
  const { showToast } = useToast();
  return { showSnackbar: showToast };
}

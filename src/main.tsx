import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

// Self-Hosted WOFF2 Fonts via @fontsource/inter
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import "./global.css";
import App from "./App";
import { AppThemeProvider } from "./theme/theme-provider";
import { store } from "./store/store";
import { SnackbarProvider } from "./components/snackbar";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </AppThemeProvider>
    </Provider>
  </StrictMode>
);
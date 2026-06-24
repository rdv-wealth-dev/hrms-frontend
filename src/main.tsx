import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./global.css";
import App from "./App.tsx";
import { AppThemeProvider } from "./theme/theme-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </StrictMode>
);
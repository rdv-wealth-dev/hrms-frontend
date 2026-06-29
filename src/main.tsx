import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "./global.css";
import App from "./App";
import { AppThemeProvider } from "./theme/theme-provider";
import { store } from "./store/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </Provider>
  </StrictMode>
);
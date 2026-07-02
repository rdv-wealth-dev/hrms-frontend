import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import AppRoutes from "./routes";

import type { AppDispatch } from "./store/store";
import type { RootState } from "./store/rootReducer";
import { restoreSessionRequest, logout } from "./store/auth";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  const sessionChecked = useSelector(
    (state: RootState) => state.auth?.sessionChecked ?? false
  );

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth?.isAuthenticated ?? false
  );

  // Restore session on app load
  useEffect(() => {
    dispatch(restoreSessionRequest());
  }, [dispatch]);

  // Monitor access token deletion
  useEffect(() => {
    if (!isAuthenticated) return;

    // Listen to token deletion from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "accessToken" && !event.newValue) {
        dispatch(logout());
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Poll to detect token deletion in the current tab (e.g. via DevTools)
    const intervalId = setInterval(() => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        dispatch(logout());
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [isAuthenticated, dispatch]);

  // ✅ Don't render any routes/guards until we know for sure whether the
  // existing token (if any) is actually valid. Prevents AuthGuard/GuestGuard
  // from making a decision based on stale or empty Redux state right after
  // a page refresh.
  if (!sessionChecked) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#6D5DF6" }} />
      </Box>
    );
  }

  return <AppRoutes />;
}

export default App;
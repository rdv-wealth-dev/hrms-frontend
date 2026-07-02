import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import AppRoutes from "./routes";

import type { AppDispatch } from "./store/store";
import type { RootState } from "./store/rootReducer";
import { restoreSessionRequest } from "./store/auth";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  const sessionChecked = useSelector(
    (state: RootState) => state.auth?.sessionChecked ?? false
  );

  useEffect(() => {
    dispatch(restoreSessionRequest());
  }, [dispatch]);

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
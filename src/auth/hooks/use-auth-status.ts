import { useSelector } from "react-redux";
import type { RootState } from "../../store/rootReducer";

// ===========================================
// useAuthStatus — the single source of truth for "is this a valid session"
//
// We check localStorage directly (not just Redux isAuthenticated) because
// Redux state resets on page refresh, but the token survives in localStorage.
// This avoids incorrectly logging a refreshed-but-still-valid session out.
//
// NOTE: this does not rehydrate `user` in Redux after a refresh — that is
// a separate, already-known gap (session rehydration via /auth/me),
// tracked separately. AuthGuard here only answers "does a token exist",
// not "do we have the user's profile loaded".
// ===========================================

export function useAuthStatus() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth?.isAuthenticated ?? false
  );

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const hasSession = Boolean(token);

  return { hasSession, isAuthenticated };
}
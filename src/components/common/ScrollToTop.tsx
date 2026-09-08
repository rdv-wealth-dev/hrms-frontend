import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reusable component that resets window scroll position to the top (0, 0)
 * on every route location change across Desktop, Tablet, and Mobile devices.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    } catch {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;

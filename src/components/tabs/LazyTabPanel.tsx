import { useState, useEffect } from "react";
import Box from "@mui/material/Box";

export interface LazyTabPanelProps {
  active: boolean;
  keepMounted?: boolean;
  children: React.ReactNode;
}

/**
 * Mounts children only once `active` becomes true for the first time.
 * Prevents useEffects and API calls in hidden tabs from firing before the user opens them.
 *
 * @param active - Boolean indicating if this tab is currently selected
 * @param keepMounted - Set true only for tabs where state must be preserved across switches (e.g. half-filled forms)
 */
export function LazyTabPanel({ active, keepMounted = false, children }: LazyTabPanelProps) {
  const [hasBeenActive, setHasBeenActive] = useState(active);

  useEffect(() => {
    if (active) {
      setHasBeenActive(true);
    }
  }, [active]);

  if (!hasBeenActive) return null;
  if (!active && !keepMounted) return null;

  return <Box sx={{ display: active ? "block" : "none" }}>{children}</Box>;
}

export default LazyTabPanel;

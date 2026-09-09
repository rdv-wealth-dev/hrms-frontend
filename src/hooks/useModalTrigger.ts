import { useCallback } from "react";

/**
 * Universal hook to prevent W3C WAI-ARIA focus conflicts
 * ("Blocked aria-hidden on an element because its descendant retained focus")
 * when opening modals, dialogs, or drawers.
 *
 * Blurs the triggering element before the modal backdrop and aria-hidden="true"
 * are applied to the root container.
 */
export function useModalTrigger(openFn: () => void) {
  return useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement)?.blur();
      openFn();
    },
    [openFn]
  );
}

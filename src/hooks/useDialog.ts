import { useState, useCallback } from "react";

export function useDialog<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<T | null>(null);

  const open = useCallback((data?: T) => {
    if (data !== undefined) setTarget(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Timeout keeps target defined during exit animations
    setTimeout(() => setTarget(null), 300);
  }, []);

  return {
    isOpen,
    target,
    open,
    close,
    setTarget,
  };
}

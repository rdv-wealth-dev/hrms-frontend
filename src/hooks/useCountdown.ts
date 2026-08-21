import { useState, useEffect, useCallback, useMemo } from "react";

interface UseCountdownReturn {
  secondsLeft: number;
  isActive: boolean;
  formattedTime: string;
  startTimer: (seconds?: number) => void;
  stopTimer: () => void;
  setSeconds: (seconds: number) => void;
}

/**
 * Reusable countdown timer hook for rate limiting, OTP cooldowns, and resend timers.
 * @param defaultInitialSeconds Initial countdown duration in seconds (default 120s)
 */
export function useCountdown(defaultInitialSeconds = 120): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const startTimer = useCallback((seconds?: number) => {
    setSecondsLeft(seconds ?? defaultInitialSeconds);
  }, [defaultInitialSeconds]);

  const stopTimer = useCallback(() => {
    setSecondsLeft(0);
  }, []);

  const setSeconds = useCallback((seconds: number) => {
    setSecondsLeft(seconds > 0 ? seconds : 0);
  }, []);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const formattedMins = String(mins).padStart(2, "0");
    const formattedSecs = String(secs).padStart(2, "0");
    return `${formattedMins}:${formattedSecs}`;
  }, [secondsLeft]);

  return {
    secondsLeft,
    isActive: secondsLeft > 0,
    formattedTime,
    startTimer,
    stopTimer,
    setSeconds,
  };
}

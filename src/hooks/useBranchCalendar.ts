import { useState, useEffect, useCallback, useRef } from "react";
import { getBranchCalendar } from "../api/branch.api";
import type { BranchCalendarData } from "../store/branch/branch.types";

interface UseBranchCalendarOptions {
  branchId?: string;
  initialYear?: number;
  initialMonth?: number;
  autoFetch?: boolean;
}

export function useBranchCalendar({
  branchId,
  initialYear,
  initialMonth,
  autoFetch = true,
}: UseBranchCalendarOptions = {}) {
  const [calendarData, setCalendarData] = useState<BranchCalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-memory cache map keyed by `${branchId}_${year}_${month}`
  const cacheRef = useRef<Record<string, BranchCalendarData>>({});

  // Active month/year state — undefined by default so backend auto-dates to current month
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(initialMonth);

  const fetchCalendar = useCallback(
    async (targetBranchId?: string, targetYear?: number, targetMonth?: number) => {
      const activeBranchId = targetBranchId || branchId;
      if (!activeBranchId) return;

      const cacheKey = `${activeBranchId}_${targetYear || "current"}_${targetMonth || "current"}`;

      // Check cache first for INSTANT 0ms month transition
      if (cacheRef.current[cacheKey]) {
        const cached = cacheRef.current[cacheKey];
        setCalendarData(cached);
        setSelectedYear(cached.year);
        setSelectedMonth(cached.month);
        setLoading(false);
        setIsFetching(false);
        return;
      }

      setLoading((prevData) => (!prevData ? true : false));
      setIsFetching(true);
      setError(null);

      // Optimistic year/month state update for instant title header reflection
      if (targetYear) setSelectedYear(targetYear);
      if (targetMonth) setSelectedMonth(targetMonth);

      try {
        const response = await getBranchCalendar(activeBranchId, targetYear, targetMonth);
        if (response.succeeded && response.data) {
          cacheRef.current[cacheKey] = response.data;
          setCalendarData(response.data);
          setSelectedYear(response.data.year);
          setSelectedMonth(response.data.month);
        } else {
          setError(response.message || "Failed to fetch branch calendar");
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || "An error occurred fetching calendar"
        );
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    },
    [branchId]
  );

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  useEffect(() => {
    if (autoFetch && branchId) {
      fetchCalendar(branchId, initialYear, initialMonth);
    }
  }, [autoFetch, branchId, initialYear, initialMonth]);

  const currentYear = calendarData?.year || selectedYear || new Date().getFullYear();
  const currentMonth = calendarData?.month || selectedMonth || new Date().getMonth() + 1;

  const nextMonth = useCallback(() => {
    let nextY = currentYear;
    let nextM = currentMonth + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    if (branchId) fetchCalendar(branchId, nextY, nextM);
  }, [branchId, currentYear, currentMonth, fetchCalendar]);

  const prevMonth = useCallback(() => {
    let prevY = currentYear;
    let prevM = currentMonth - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    if (branchId) fetchCalendar(branchId, prevY, prevM);
  }, [branchId, currentYear, currentMonth, fetchCalendar]);

  const resetToCurrent = useCallback(() => {
    if (branchId) fetchCalendar(branchId, undefined, undefined);
  }, [branchId, fetchCalendar]);

  return {
    calendarData,
    summary: calendarData?.summary ?? null,
    loading,
    isFetching,
    error,
    year: selectedYear,
    month: selectedMonth,
    fetchCalendar,
    nextMonth,
    prevMonth,
    resetToCurrent,
    clearCache,
  };
}

export default useBranchCalendar;

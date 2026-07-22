import { useState, useEffect, useCallback } from "react";
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
  const [error, setError] = useState<string | null>(null);

  // Active month/year state — undefined by default so backend auto-dates to current month
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(initialMonth);

  const fetchCalendar = useCallback(
    async (targetBranchId?: string, targetYear?: number, targetMonth?: number) => {
      const activeBranchId = targetBranchId || branchId;
      if (!activeBranchId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getBranchCalendar(activeBranchId, targetYear, targetMonth);
        if (response.succeeded && response.data) {
          setCalendarData(response.data);
          // Sync internal state with server response
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
      }
    },
    [branchId]
  );

  useEffect(() => {
    if (autoFetch && branchId) {
      fetchCalendar(branchId, initialYear, initialMonth);
    }
  }, [autoFetch, branchId, initialYear, initialMonth]);

  const nextMonth = useCallback(() => {
    if (!calendarData) return;
    let nextY = calendarData.year;
    let nextM = calendarData.month + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    if (branchId) fetchCalendar(branchId, nextY, nextM);
  }, [branchId, calendarData, fetchCalendar]);

  const prevMonth = useCallback(() => {
    if (!calendarData) return;
    let prevY = calendarData.year;
    let prevM = calendarData.month - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    if (branchId) fetchCalendar(branchId, prevY, prevM);
  }, [branchId, calendarData, fetchCalendar]);

  const resetToCurrent = useCallback(() => {
    if (branchId) fetchCalendar(branchId, undefined, undefined);
  }, [branchId, fetchCalendar]);

  return {
    calendarData,
    summary: calendarData?.summary ?? null,
    loading,
    error,
    year: selectedYear,
    month: selectedMonth,
    fetchCalendar,
    nextMonth,
    prevMonth,
    resetToCurrent,
  };
}

export default useBranchCalendar;

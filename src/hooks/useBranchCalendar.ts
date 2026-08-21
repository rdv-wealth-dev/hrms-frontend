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
  branchId: initialBranchId = "",
  initialYear,
  initialMonth,
  autoFetch = true,
}: UseBranchCalendarOptions = {}) {
  const [branchId, setBranchId] = useState<string>(initialBranchId);
  const [year, setYear] = useState<number>(initialYear || new Date().getFullYear());
  const [month, setMonth] = useState<number>(initialMonth || new Date().getMonth() + 1);

  const [calendarData, setCalendarData] = useState<BranchCalendarData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync external initialBranchId if updated
  useEffect(() => {
    if (initialBranchId && initialBranchId !== branchId) {
      setBranchId(initialBranchId);
    }
  }, [initialBranchId]);

  const fetchCalendar = useCallback(async () => {
    if (!branchId) {
      setCalendarData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getBranchCalendar(branchId, year, month);
      if (response?.succeeded && response?.data) {
        setCalendarData(response.data);
      } else {
        setError(response?.message || "Failed to load branch monthly calendar.");
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.message || "Error fetching branch calendar.";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  }, [branchId, year, month]);

  useEffect(() => {
    if (autoFetch && branchId) {
      fetchCalendar();
    }
  }, [branchId, year, month, autoFetch, fetchCalendar]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const handleResetMonth = () => {
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth() + 1);
  };

  return {
    branchId,
    setBranchId,
    year,
    setYear,
    month,
    setMonth,
    calendarData,
    loading,
    isFetching: loading,
    error,
    handlePrevMonth,
    prevMonth: handlePrevMonth,
    handleNextMonth,
    nextMonth: handleNextMonth,
    handleResetMonth,
    resetToCurrent: handleResetMonth,
    refetch: fetchCalendar,
  };
}

export default useBranchCalendar;

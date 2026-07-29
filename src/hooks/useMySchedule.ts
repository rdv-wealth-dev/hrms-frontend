import { useState, useEffect, useCallback } from "react";
import { getMySchedule } from "../api/branch.api";
import type { BranchCalendarData } from "../store/branch/branch.types";

interface UseMyScheduleOptions {
  initialYear?: number;
  initialMonth?: number;
  autoFetch?: boolean;
}

export function useMySchedule({
  initialYear,
  initialMonth,
  autoFetch = true,
}: UseMyScheduleOptions = {}) {
  const [year, setYear] = useState<number>(initialYear || new Date().getFullYear());
  const [month, setMonth] = useState<number>(initialMonth || new Date().getMonth() + 1);

  const [scheduleData, setScheduleData] = useState<BranchCalendarData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMySchedule(year, month);
      if ((response?.succeeded || (response as any)?.success) && response?.data) {
        setScheduleData(response.data);
      } else {
        setError(response?.message || "Failed to load personal rotation schedule.");
      }
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Error fetching personal rotation schedule.";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (autoFetch) {
      fetchSchedule();
    }
  }, [year, month, autoFetch, fetchSchedule]);

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
    year,
    setYear,
    month,
    setMonth,
    scheduleData,
    loading,
    isFetching: loading,
    error,
    handlePrevMonth,
    prevMonth: handlePrevMonth,
    handleNextMonth,
    nextMonth: handleNextMonth,
    handleResetMonth,
    resetToCurrent: handleResetMonth,
    refetch: fetchSchedule,
  };
}

export default useMySchedule;

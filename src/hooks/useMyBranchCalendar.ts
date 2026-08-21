import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getMyBranchCalendar, getHeadOffice, getBranchCalendar } from "../api/branch.api";
import { usePermissions } from "./usePermissions";
import type { BranchCalendarData } from "../store/branch/branch.types";

interface UseMyBranchCalendarOptions {
  initialYear?: number;
  initialMonth?: number;
  autoFetch?: boolean;
}

export function useMyBranchCalendar({
  initialYear,
  initialMonth,
  autoFetch = true,
}: UseMyBranchCalendarOptions = {}) {
  const { role, isSuperAdmin } = usePermissions();
  const isOrgAdmin = role === "ORG_ADMIN" || isSuperAdmin;

  const [calendarData, setCalendarData] = useState<BranchCalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-memory cache map
  const cacheRef = useRef<Record<string, BranchCalendarData>>({});

  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(initialMonth);

  const fetchCalendar = useCallback(
    async (targetYear?: number, targetMonth?: number) => {
      const cacheKey = `my_${targetYear || "current"}_${targetMonth || "current"}`;

      if (cacheRef.current[cacheKey]) {
        const cached = cacheRef.current[cacheKey];
        setCalendarData(cached);
        setSelectedYear(cached.year);
        setSelectedMonth(cached.month);
        setLoading(false);
        setIsFetching(false);
        return;
      }

      setLoading((prev) => (!prev ? true : false));
      setIsFetching(true);
      setError(null);

      if (targetYear) setSelectedYear(targetYear);
      if (targetMonth) setSelectedMonth(targetMonth);

      try {
        if (isOrgAdmin) {
          const hoRes = await getHeadOffice();
          if (hoRes.succeeded && hoRes.data?._id) {
            const calRes = await getBranchCalendar(hoRes.data._id, targetYear, targetMonth);
            if (calRes.succeeded && calRes.data) {
              cacheRef.current[cacheKey] = calRes.data;
              setCalendarData(calRes.data);
              setSelectedYear(calRes.data.year);
              setSelectedMonth(calRes.data.month);
              return;
            }
          }
          setError(hoRes.message || "Failed to fetch Head Office calendar");
          return;
        }

        const response = await getMyBranchCalendar(targetYear, targetMonth);
        if (response.succeeded && response.data) {
          cacheRef.current[cacheKey] = response.data;
          setCalendarData(response.data);
          setSelectedYear(response.data.year);
          setSelectedMonth(response.data.month);
        } else {
          setError(response.message || "Failed to fetch my branch calendar");
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
    [isOrgAdmin]
  );

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCalendar(initialYear, initialMonth);
    }
  }, [autoFetch, initialYear, initialMonth, fetchCalendar]);

  const currentYear = calendarData?.year || selectedYear || new Date().getFullYear();
  const currentMonth = calendarData?.month || selectedMonth || new Date().getMonth() + 1;

  const nextMonth = useCallback(() => {
    let nextY = currentYear;
    let nextM = currentMonth + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    fetchCalendar(nextY, nextM);
  }, [currentYear, currentMonth, fetchCalendar]);

  const prevMonth = useCallback(() => {
    let prevY = currentYear;
    let prevM = currentMonth - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    fetchCalendar(prevY, prevM);
  }, [currentYear, currentMonth, fetchCalendar]);

  const resetToCurrent = useCallback(() => {
    fetchCalendar(undefined, undefined);
  }, [fetchCalendar]);

  // Event Helper Getters
  const daysWithEvents = useMemo(() => {
    if (!calendarData?.days) return [];
    return calendarData.days.filter((d) => d.events && d.events.length > 0);
  }, [calendarData]);

  const birthdayDays = useMemo(() => {
    if (!calendarData?.days) return [];
    return calendarData.days.filter((d) =>
      d.events?.some((e) => e.type === "BIRTHDAY")
    );
  }, [calendarData]);

  const anniversaryDays = useMemo(() => {
    if (!calendarData?.days) return [];
    return calendarData.days.filter((d) =>
      d.events?.some((e) => e.type === "ANNIVERSARY")
    );
  }, [calendarData]);

  const allEvents = useMemo(() => {
    if (!calendarData?.days) return [];
    return calendarData.days.flatMap((d) =>
      (d.events || []).map((e) => ({ ...e, date: d.date, dayOfWeek: d.dayOfWeek }))
    );
  }, [calendarData]);

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
    daysWithEvents,
    birthdayDays,
    anniversaryDays,
    allEvents,
  };
}

export default useMyBranchCalendar;

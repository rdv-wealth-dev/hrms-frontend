import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [error, setError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(initialMonth);

  const fetchCalendar = useCallback(
    async (targetYear?: number, targetMonth?: number) => {
      setLoading(true);
      setError(null);
      try {
        // If logged in as ORG_ADMIN, directly load Head Office calendar to avoid 404 console log
        if (isOrgAdmin) {
          const hoRes = await getHeadOffice();
          if (hoRes.succeeded && hoRes.data?._id) {
            const calRes = await getBranchCalendar(hoRes.data._id, targetYear, targetMonth);
            if (calRes.succeeded && calRes.data) {
              setCalendarData(calRes.data);
              setSelectedYear(calRes.data.year);
              setSelectedMonth(calRes.data.month);
              return;
            }
          }
          setError(hoRes.message || "Failed to fetch Head Office calendar");
          return;
        }

        // Regular employee self-service call
        const response = await getMyBranchCalendar(targetYear, targetMonth);
        if (response.succeeded && response.data) {
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
      }
    },
    [isOrgAdmin]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchCalendar(initialYear, initialMonth);
    }
  }, [autoFetch, initialYear, initialMonth, fetchCalendar]);

  const nextMonth = useCallback(() => {
    if (!calendarData) return;
    let nextY = calendarData.year;
    let nextM = calendarData.month + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    fetchCalendar(nextY, nextM);
  }, [calendarData, fetchCalendar]);

  const prevMonth = useCallback(() => {
    if (!calendarData) return;
    let prevY = calendarData.year;
    let prevM = calendarData.month - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    fetchCalendar(prevY, prevM);
  }, [calendarData, fetchCalendar]);

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
    error,
    year: selectedYear,
    month: selectedMonth,
    fetchCalendar,
    nextMonth,
    prevMonth,
    resetToCurrent,
    daysWithEvents,
    birthdayDays,
    anniversaryDays,
    allEvents,
  };
}

export default useMyBranchCalendar;

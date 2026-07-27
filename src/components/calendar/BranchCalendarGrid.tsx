import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import WeekendIcon from "@mui/icons-material/Weekend";
import WorkIcon from "@mui/icons-material/Work";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CakeIcon from "@mui/icons-material/Cake";
import CircularProgress from "@mui/material/CircularProgress";
import EventChip from "./EventChip";
import EventDetailPanel from "./EventDetailPanel";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/rootReducer";
import type { CustomWeekOffRule } from "../../store/organization/organization.types";
import type { BranchCalendarData, BranchCalendarDay } from "../../store/branch/branch.types";

interface BranchCalendarGridProps {
  data: BranchCalendarData;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onResetMonth?: () => void;
  onDayClick?: (day: BranchCalendarDay) => void;
  compact?: boolean;
  isFetching?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const normalizeDay = (d?: string) => (d ? d.trim().toLowerCase().slice(0, 3) : "");

export function BranchCalendarGrid({
  data,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  onDayClick,
  compact = false,
  isFetching = false,
}: BranchCalendarGridProps) {
  const [internalSelectedDay, setInternalSelectedDay] = useState<BranchCalendarDay | null>(null);
  const organization = useSelector((state: RootState) => state.organization?.organization);

  // Combine custom rules from API data, Organization store, or localStorage fallback
  const savedLocalRules = (() => {
    try {
      const raw = localStorage.getItem("hrms_org_custom_week_off_rules");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const activeRules: CustomWeekOffRule[] =
    data.customWeekOffRules && data.customWeekOffRules.length > 0
      ? data.customWeekOffRules
      : (organization?.locale?.customWeekOffRules && organization.locale.customWeekOffRules.length > 0)
      ? organization.locale.customWeekOffRules
      : savedLocalRules;

  const { year, month, days, branchName } = data;
  const monthName = MONTH_NAMES[month - 1] || "";

  // Dynamic summary computation directly from rendered days array and active custom rules
  const dynamicSummary = useMemo(() => {
    const totalDays = days.length || 31;

    let weekOffs = 0;
    let holidays = 0;
    let saturdays = 0;
    let saturdaysOff = 0;

    days.forEach((day) => {
      const dateNum = new Date(`${day.date}T00:00:00`).getDate();
      const weekOccurrence = day.weekNumber || Math.ceil(dateNum / 7);
      const dayNorm = normalizeDay(day.dayOfWeek);

      const matchesCustomRule = activeRules?.some(
        (rule: CustomWeekOffRule) =>
          normalizeDay(rule.dayOfWeek) === dayNorm &&
          rule.weeks?.includes(weekOccurrence)
      );

      const isCustomOffReason =
        day.offReason?.toUpperCase() === "CUSTOM_WEEK_OFF" ||
        day.offReason?.toLowerCase().includes("custom");

      const isCustomOff = isCustomOffReason || Boolean(matchesCustomRule);
      const isWeekOff = day.type === "WEEK_OFF" || isCustomOff;
      const isHoliday = day.type === "HOLIDAY";

      if (isHoliday) {
        holidays += 1;
      } else if (isWeekOff) {
        weekOffs += 1;
      }

      if (dayNorm === "sat") {
        saturdays += 1;
        if (isWeekOff) {
          saturdaysOff += 1;
        }
      }
    });

    const workingDays = Math.max(0, totalDays - weekOffs - holidays);

    return {
      totalDays: totalDays,
      workingDays: workingDays,
      weekOffs: weekOffs,
      holidays: holidays,
      saturdays: saturdays,
      saturdaysOff: saturdaysOff,
    };
  }, [days, activeRules]);

  // Helper to determine offset for the 1st day of the month (Monday-aligned)
  const firstDay = days[0];
  const firstDayIndex = firstDay
    ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(firstDay.dayOfWeek)
    : 0;

  const emptyPaddingSlots = firstDayIndex > 0 ? Array.from({ length: firstDayIndex }) : [];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: compact ? 1.5 : 2.5,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant={compact ? "subtitle1" : "h6"} sx={{ fontWeight: 700, color: "#111827" }}>
            {branchName ? `${branchName} — Calendar` : "Branch Calendar"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: compact ? "12px" : "14px" }}>
            {monthName} {year} Schedule & Employee Events
          </Typography>
        </Box>

        {/* Month Navigation Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onResetMonth && (
            <Chip
              icon={<TodayIcon sx={{ fontSize: "15px !important" }} />}
              label="Current"
              onClick={onResetMonth}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: "8px", cursor: "pointer", height: 28 }}
            />
          )}

          <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #E5E7EB", borderRadius: 2, px: 0.5 }}>
            <IconButton onClick={onPrevMonth} size="small" disabled={isFetching}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 110 }}>
              {isFetching && <CircularProgress size={13} sx={{ color: "#6366F1", mr: 0.7 }} />}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textAlign: "center", fontSize: "13px" }}>
                {monthName} {year}
              </Typography>
            </Box>
            <IconButton onClick={onNextMonth} size="small" disabled={isFetching}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards Bar (Full view only) */}
      {!compact && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EventAvailableIcon sx={{ color: "#6D5DF6", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Total Days</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{dynamicSummary.totalDays}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WorkIcon sx={{ color: "#10B981", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Working Days</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, color: "#047857" }}>{dynamicSummary.workingDays}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WeekendIcon sx={{ color: "#F59E0B", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Week Offs</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, color: "#B45309" }}>{dynamicSummary.weekOffs}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonthIcon sx={{ color: "#6366F1", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Saturdays Off</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, color: "#4338CA" }}>
                  {dynamicSummary.saturdaysOff} <Typography component="span" variant="caption" color="text.secondary">/ {dynamicSummary.saturdays}</Typography>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Calendar Grid Header (Mon - Sun) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: compact ? 0.5 : 1,
          mb: 1,
          textAlign: "center",
        }}
      >
        {WEEK_DAYS.map((dayName, idx) => (
          <Paper
            key={dayName}
            elevation={0}
            sx={{
              py: compact ? 0.5 : 1,
              fontWeight: 700,
              fontSize: compact ? "11px" : "13px",
              color: idx >= 5 ? "#EF4444" : "#4B5563",
              backgroundColor: "#F9FAFB",
              borderRadius: 1.5,
              border: "1px solid #F3F4F6",
            }}
          >
            {dayName}
          </Paper>
        ))}
      </Box>

      {/* Calendar Days Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: compact ? 0.5 : 1,
        }}
      >
        {/* Padding slots for alignment */}
        {emptyPaddingSlots.map((_, idx) => (
          <Box key={`empty-${idx}`} sx={{ minHeight: compact ? 55 : 95, opacity: 0.2 }} />
        ))}

        {/* Calendar Day Cards */}
        {days.map((day: BranchCalendarDay) => {
          const dayDate = new Date(`${day.date}T00:00:00`);
          const dateNum = dayDate.getDate();
          const today = new Date();
          const isToday =
            dayDate.getFullYear() === today.getFullYear() &&
            dayDate.getMonth() === today.getMonth() &&
            dayDate.getDate() === today.getDate();

          // Client-side fallback check for custom week-off rules (e.g. 2nd & 4th Saturday, 5th Friday)
          const weekOccurrence = day.weekNumber || Math.ceil(dateNum / 7);
          const matchesCustomRule = activeRules?.some(
            (rule: CustomWeekOffRule) =>
              normalizeDay(rule.dayOfWeek) === normalizeDay(day.dayOfWeek) &&
              rule.weeks?.includes(weekOccurrence)
          );

          const isCustomOffReason =
            day.offReason?.toUpperCase() === "CUSTOM_WEEK_OFF" ||
            day.offReason?.toLowerCase().includes("custom");

          const isCustomOff = isCustomOffReason || Boolean(matchesCustomRule);
          const isWeekOff = day.type === "WEEK_OFF" || isCustomOff;
          const isHoliday = day.type === "HOLIDAY";
          const hasEvents = day.events && day.events.length > 0;

          const hasBirthday = day.events?.some((e) => e.type === "BIRTHDAY");
          const hasAnniversary = day.events?.some((e) => e.type === "ANNIVERSARY");

          return (
            <Paper
              key={day.date}
              elevation={0}
              onClick={() => {
                onDayClick?.(day);
                if (hasEvents) {
                  setInternalSelectedDay(day);
                }
              }}
              sx={{
                minHeight: compact ? 65 : { xs: 50, sm: 80, md: 100 },
                p: compact ? 0.8 : { xs: 0.6, sm: 1 },
                borderRadius: 2,
                border: isToday ? "2px solid" : "1px solid",
                borderColor: isToday
                  ? "#EF4444"
                  : isCustomOff
                  ? "#C7D2FE"
                  : isWeekOff
                  ? "#FDE68A"
                  : isHoliday
                  ? "#BFDBFE"
                  : "#E5E7EB",
                boxShadow: isToday ? "0 0 0 1px #EF4444, 0 2px 8px rgba(239, 68, 68, 0.15)" : undefined,
                backgroundColor: isCustomOff
                  ? "#EEF2FF"
                  : isWeekOff
                  ? "#FFFBEB"
                  : isHoliday
                  ? "#EFF6FF"
                  : "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: onDayClick || hasEvents ? "pointer" : "default",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: isToday ? "#DC2626" : "#6D5DF6",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {/* Top Row: Date Number & Badges */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    fontSize: compact ? "12px" : { xs: "11px", sm: "13px", md: "14px" },
                    color: isToday
                      ? "#EF4444"
                      : isCustomOff
                      ? "#4338CA"
                      : isWeekOff
                      ? "#B45309"
                      : "#111827",
                  }}
                >
                  {dateNum}
                </Typography>

                {isToday && (
                  <Chip
                    label="Today"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "10px",
                      fontWeight: 700,
                      backgroundColor: "#FEF2F2",
                      color: "#EF4444",
                      border: "1px solid #FCA5A5",
                    }}
                  />
                )}

                {!compact && isHoliday && (
                  <Chip
                    label={day.holidayName ? day.holidayName : "Holiday"}
                    size="small"
                    title={day.holidayName || "Holiday"}
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                      height: 18,
                      fontSize: "10px",
                      fontWeight: 700,
                      backgroundColor: "#DBEAFE",
                      color: "#1E40AF",
                      maxWidth: { sm: 80, md: 120 },
                    }}
                  />
                )}

                {!compact && day.shift && (
                  <Chip
                    label={`${day.shift.name} (${day.shift.startTime}-${day.shift.endTime})`}
                    size="small"
                    title={`${day.shift.name} (${day.shift.startTime} - ${day.shift.endTime})`}
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                      height: 18,
                      fontSize: "10px",
                      fontWeight: 600,
                      backgroundColor: "#F1F5F9",
                      color: "#334155",
                      border: "1px solid #E2E8F0",
                      maxWidth: { sm: 90, md: 140 },
                    }}
                  />
                )}
              </Box>

              {/* Event Content rendering: Responsive Dot Indicators (Mobile) vs Single / Summary Chip (Desktop) */}
              {hasEvents && (
                <>
                  {/* Mobile View: Compact Dots */}
                  <Box
                    sx={{
                      display: compact ? "flex" : { xs: "flex", sm: "none" },
                      gap: 0.5,
                      alignItems: "center",
                      mt: 0.5,
                    }}
                  >
                    {hasBirthday && (
                      <Tooltip title="Birthday today">
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: "#FF6B6B",
                          }}
                        />
                      </Tooltip>
                    )}
                    {hasAnniversary && (
                      <Tooltip title="Work Anniversary today">
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: "#4ECDC4",
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>

                  {/* Tablet & Desktop View: Single Chip or Compact Summary Chip */}
                  {!compact && (
                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        flexDirection: "column",
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {day.events.length === 1 ? (
                        <EventChip event={day.events[0]} compact />
                      ) : (
                        <Tooltip title={`Click cell to view all ${day.events.length} celebrations`}>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.6,
                              px: 0.8,
                              py: 0.3,
                              borderRadius: "6px",
                              backgroundColor: "#FDF2F8",
                              color: "#DB2777",
                              border: "1px solid #FBCFE8",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              width: "fit-content",
                              maxWidth: "100%",
                              transition: "all 0.15s ease",
                              "&:hover": {
                                backgroundColor: "#FCE7F3",
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <CakeIcon sx={{ fontSize: 13, flexShrink: 0, color: "#DB2777" }} />
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{ fontWeight: 700, fontSize: "11px", lineHeight: 1.2 }}
                            >
                              {day.events[0].employeeName} +{day.events.length - 1} more
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Event Details Dialog Modal */}
      <EventDetailPanel
        open={Boolean(internalSelectedDay)}
        day={internalSelectedDay}
        onClose={() => setInternalSelectedDay(null)}
      />
    </Box>
  );
}

export default BranchCalendarGrid;

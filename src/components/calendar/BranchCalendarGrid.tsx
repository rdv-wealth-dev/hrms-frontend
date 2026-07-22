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
import EventChip from "./EventChip";
import type { BranchCalendarData, BranchCalendarDay } from "../../store/branch/branch.types";

interface BranchCalendarGridProps {
  data: BranchCalendarData;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onResetMonth?: () => void;
  onDayClick?: (day: BranchCalendarDay) => void;
  compact?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function BranchCalendarGrid({
  data,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  onDayClick,
  compact = false,
}: BranchCalendarGridProps) {
  const { year, month, days, summary, branchName } = data;
  const monthName = MONTH_NAMES[month - 1] || "";

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

          <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #E5E7EB", borderRadius: 2 }}>
            <IconButton onClick={onPrevMonth} size="small">
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle2" sx={{ px: 1, fontWeight: 700, minWidth: 95, textAlign: "center", fontSize: "13px" }}>
              {monthName} {year}
            </Typography>
            <IconButton onClick={onNextMonth} size="small">
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards Bar (Full view only) */}
      {!compact && summary && (
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
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{summary.totalDays}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WorkIcon sx={{ color: "#10B981", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Working Days</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, color: "#047857" }}>{summary.workingDays}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WeekendIcon sx={{ color: "#F59E0B", fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Week Offs</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, color: "#B45309" }}>{summary.weekOffs}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EventChip event={{ type: "ANNIVERSARY", title: "Events", employeeName: "", employeeCode: "" }} compact />
              <Box>
                <Typography variant="caption" color="text.secondary">Saturdays Off</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{summary.saturdaysOff}</Typography>
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
          const dateNum = new Date(`${day.date}T00:00:00`).getDate();
          const isWeekOff = day.type === "WEEK_OFF";
          const isHoliday = day.type === "HOLIDAY";
          const hasEvents = day.events && day.events.length > 0;

          const hasBirthday = day.events?.some((e) => e.type === "BIRTHDAY");
          const hasAnniversary = day.events?.some((e) => e.type === "ANNIVERSARY");

          return (
            <Paper
              key={day.date}
              elevation={0}
              onClick={() => onDayClick?.(day)}
              sx={{
                minHeight: compact ? 65 : { xs: 50, sm: 80, md: 100 },
                p: compact ? 0.8 : { xs: 0.6, sm: 1 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: isWeekOff
                  ? "#FDE68A"
                  : isHoliday
                  ? "#BFDBFE"
                  : "#E5E7EB",
                backgroundColor: isWeekOff
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
                  borderColor: "#6D5DF6",
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
                    color: isWeekOff ? "#B45309" : "#111827",
                  }}
                >
                  {dateNum}
                </Typography>

                {!compact && isWeekOff && (
                  <Chip
                    label={day.offReason === "SATURDAY_POLICY" ? "Sat Off" : "Week Off"}
                    size="small"
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                      height: 18,
                      fontSize: "10px",
                      fontWeight: 700,
                      backgroundColor: "#FEF3C7",
                      color: "#92400E",
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
              </Box>

              {/* Event Content rendering: Responsive Dot Indicators (Mobile) vs Full Chips (Tablet/Desktop) */}
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

                  {/* Tablet & Desktop View: Full Event Chips */}
                  {!compact && (
                    <Box
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        flexDirection: "column",
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      {day.events.map((evt, evtIdx) => (
                        <EventChip key={`${evt.employeeCode}-${evtIdx}`} event={evt} compact />
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

export default BranchCalendarGrid;

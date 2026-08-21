import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { useMyBranchCalendar } from "../../../hooks/useMyBranchCalendar";
import { LazyBranchCalendarGrid, EventDetailPanel } from "../../../components/calendar";
import type { BranchCalendarDay } from "../../../store/branch/branch.types";
import type { LeaveRequest } from "../../../api/leave.api";

interface LeaveCalendarViewProps {
  requests: LeaveRequest[];
}

export default function LeaveCalendarView({ requests }: LeaveCalendarViewProps) {
  const {
    calendarData,
    loading,
    isFetching,
    error,
    nextMonth,
    prevMonth,
    resetToCurrent,
  } = useMyBranchCalendar();

  const [selectedDay, setSelectedDay] = useState<BranchCalendarDay | null>(null);

  const handleDayClick = (day: BranchCalendarDay) => {
    setSelectedDay(day);
  };

  const handleClosePanel = () => {
    setSelectedDay(null);
  };

  const currentY = calendarData?.year || new Date().getFullYear();
  const currentM = calendarData?.month || (new Date().getMonth() + 1);

  // Dynamic filter: show requests overlapping with the viewed calendar month
  const activeApprovedLeaves = requests.filter((req) => {
    const status = (req?.status || "").toUpperCase();
    if (status !== "APPROVED" && status !== "PENDING") return false;
    if (!req?.fromDate || !req?.toDate) return false;

    try {
      const fromDate = new Date(req.fromDate);
      const toDate = new Date(req.toDate);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false;

      const monthStart = new Date(currentY, currentM - 1, 1);
      const monthEnd = new Date(currentY, currentM, 0, 23, 59, 59, 999);

      return fromDate <= monthEnd && toDate >= monthStart;
    } catch {
      return false;
    }
  });

  const monthLabel = calendarData
    ? new Date(currentY, currentM - 1).toLocaleString("en-US", { month: "long", year: "numeric" })
    : "Current Month";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Top Section: Month Calendar Grid */}
      <Card sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
        {!calendarData && loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : calendarData ? (
          <>
            <LazyBranchCalendarGrid
              data={calendarData}
              isFetching={isFetching}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onResetMonth={resetToCurrent}
              onDayClick={handleDayClick}
            />

            {/* Click-to-open Event Detail Panel */}
            <EventDetailPanel
              open={Boolean(selectedDay)}
              day={selectedDay}
              onClose={handleClosePanel}
            />
          </>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No branch calendar available for your profile.
          </Typography>
        )}
      </Card>

      {/* Title separator */}
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0F172A" }}>
          Scheduled Team Leaves — {monthLabel}
        </Typography>
      </Box>

      {/* Bottom Section: Leave Status Cards */}
      <Grid container spacing={2}>
        {activeApprovedLeaves.length === 0 ? (
          <Grid size={12}>
            <Card sx={{ p: 5, textAlign: "center" }}>
              <Typography sx={{ fontSize: "14px", color: "#64748B", fontWeight: 500 }}>
                No scheduled team leaves for this month.
              </Typography>
            </Card>
          </Grid>
        ) : (
          activeApprovedLeaves.map((req) => {
            const empName =
              `${req?.employeeId?.firstName ?? ""} ${req?.employeeId?.lastName ?? ""}`.trim() ||
              "Employee";
            const leaveType = req?.leaveTypeId?.name || "Leave";
            const status = req?.status || "PENDING";

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={req._id}>
                <Card sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                      {empName}
                    </Typography>
                    <Chip
                      label={status}
                      size="small"
                      sx={{
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: status === "APPROVED" ? "#D1FAE5" : "#FEF3C7",
                        color: status === "APPROVED" ? "#047857" : "#B45309",
                      }}
                    />
                  </Box>

                  <Typography sx={{ fontSize: "13px", color: "#475569" }}>
                    {leaveType} • {req?.totalDays ? `${req.totalDays} day(s)` : "1 day"}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#64748B" }}>
                    📅 {req.fromDate ? new Date(req.fromDate).toLocaleDateString() : ""} - {req.toDate ? new Date(req.toDate).toLocaleDateString() : ""}
                  </Typography>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
}

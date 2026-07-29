import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { useMyBranchCalendar } from "../../../hooks/useMyBranchCalendar";
import { LazyBranchCalendarGrid, EventDetailPanel } from "../../../components/calendar";
import type { BranchCalendarDay } from "../../../store/branch/branch.types";

export function MyBranchCalendarWidget() {
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

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        backgroundColor: "#FFFFFF",
        width: "100%",
      }}
    >
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
    </Paper>
  );
}

export default MyBranchCalendarWidget;

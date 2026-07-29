import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import type { LeaveRequest } from "../../../api/leave.api";

interface LeaveCalendarViewProps {
  requests: LeaveRequest[];
}

export default function LeaveCalendarView({ requests }: LeaveCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  const activeApprovedLeaves = requests.filter(
    (req) => (req?.status || "").toUpperCase() === "APPROVED" || (req?.status || "").toUpperCase() === "PENDING"
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Calendar Header Control */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "#EEF2FF",
              color: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarTodayOutlinedIcon />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
              {monthName}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#64748B" }}>
              Team Leave Schedule
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={handlePrevMonth} sx={{ border: "1px solid #CBD5E1" }}>
            <ChevronLeftIcon />
          </IconButton>
          <Button
            size="small"
            onClick={() => setCurrentDate(new Date())}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Today
          </Button>
          <IconButton size="small" onClick={handleNextMonth} sx={{ border: "1px solid #CBD5E1" }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Card>

      {/* Legend & Leave Cards */}
      <Grid container spacing={2}>
        {activeApprovedLeaves.length === 0 ? (
          <Grid size={12}>
            <Card
              elevation={0}
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Typography sx={{ fontSize: "14px", color: "#64748B", fontWeight: 500 }}>
                No scheduled team leaves for this period.
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
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
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
                    📅 {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}
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

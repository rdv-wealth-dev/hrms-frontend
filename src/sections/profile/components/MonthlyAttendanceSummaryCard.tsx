import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

import TextInput from "../../../components/input/TextInput";
import {
  getMonthlyAttendanceSummary,
  type MonthlyAttendanceSummaryData,
} from "../../../api/attendance.api";

interface MonthlyAttendanceSummaryCardProps {
  employeeId?: string | null;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const MonthlyAttendanceSummaryCard: React.FC<
  MonthlyAttendanceSummaryCardProps
> = ({ employeeId }) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1
  );

  const [summaryData, setSummaryData] =
    useState<MonthlyAttendanceSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMonthlyAttendanceSummary(
        employeeId,
        selectedYear,
        selectedMonth
      );
      if (res?.data) {
        setSummaryData(res.data);
      } else {
        setSummaryData(null);
      }
    } catch (err) {
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId, selectedYear, selectedMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const scorePct = summaryData?.attendancePercentage ?? 0;
  const scoreColor =
    scorePct >= 85 ? "#16A34A" : scorePct >= 70 ? "#D97706" : "#DC2626";
  const scoreBg =
    scorePct >= 85 ? "#DCFCE7" : scorePct >= 70 ? "#FEF3C7" : "#FEE2E2";

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssessmentOutlinedIcon sx={{ color: "#4F46E5" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
            Monthly Attendance Summary
          </Typography>
        </Box>

        {/* Month & Year Select Filters */}
        <Box sx={{ display: "flex", gap: 1.5, minWidth: 260 }}>
          <Box sx={{ width: 140 }}>
            <TextInput
              select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextInput>
          </Box>

          <Box sx={{ width: 100 }}>
            <TextInput
              select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2025, 2026, 2027].map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextInput>
          </Box>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={28} sx={{ color: "#4F46E5" }} />
        </Box>
      ) : !summaryData ? (
        <Typography
          variant="body2"
          sx={{ color: "#6B7280", textAlign: "center", py: 2 }}
        >
          No attendance summary data found for this period.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {/* Main Attendance Percentage Tile */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: "10px",
                backgroundColor: scoreBg,
                border: `1px solid ${scoreColor}`,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justify: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: scoreColor, fontWeight: 700, textTransform: "uppercase" }}
              >
                ATTENDANCE SCORE
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: scoreColor, mt: 0.5 }}
              >
                {summaryData?.attendancePercentage ?? 0}%
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: scoreColor, mt: 0.5, fontWeight: 500 }}
              >
                {summaryData?.totalWorkedHours ?? 0} Total Worked Hours
              </Typography>
            </Box>
          </Grid>

          {/* Days Present & Worked Hours */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Working Days:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {summaryData?.totalDays ?? 0} Days
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Days Present:
                </Typography>
                <Chip
                  label={`${summaryData?.present ?? 0} Days`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700, height: 20, fontSize: "0.75rem" }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Regularized:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                  {summaryData?.regularizedDays ?? 0} Days
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Late & Half Days Breakdown */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Late Arrivals:
                </Typography>
                <Chip
                  label={`${summaryData?.late ?? 0} Late`}
                  size="small"
                  color={summaryData?.late ? "warning" : "default"}
                  sx={{ fontWeight: 700, height: 20, fontSize: "0.75rem" }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Half Days:
                </Typography>
                <Chip
                  label={`${summaryData?.halfDay ?? 0} (${summaryData?.halfDayValue ?? 0}w)`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    height: 20,
                    fontSize: "0.75rem",
                    backgroundColor: "#FEF3C7",
                    color: "#D97706",
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Absent:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: summaryData?.absent ? "#DC2626" : "#16A34A",
                  }}
                >
                  {summaryData?.absent ?? 0} Days
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Leaves, Holidays & Week-Offs */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  On Leave:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#2563EB" }}>
                  {summaryData?.onLeave ?? 0} Days
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Holidays:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#7C3AED" }}>
                  {summaryData?.holiday ?? 0} Days
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Week Offs:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>
                  {summaryData?.weekOff ?? 0} Days
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
    </Card>
  );
};

export default MonthlyAttendanceSummaryCard;

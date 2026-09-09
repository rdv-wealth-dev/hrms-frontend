import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import StatusChip from "@/components/common/StatusChip";
import { DASHBOARD_MOCK_DATA } from "../mock/dashboard-data";

export function AttendanceTodayChart() {
  const { summary, departmentBreakdown } = DASHBOARD_MOCK_DATA.attendanceToday;

  return (
    <Card
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3.5,
        backgroundColor: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", fontSize: "1.05rem" }}>
          Attendance Today
        </Typography>

        {/* Status Chips Summary Row */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StatusChip status="PRESENT" label={`Present ${summary.present.toLocaleString()}`} />
            <Typography variant="caption" color="text.secondary">({summary.presentPct}%)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StatusChip status="ABSENT" label={`Absent ${summary.absent}`} />
            <Typography variant="caption" color="text.secondary">({summary.absentPct}%)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StatusChip status="LATE" label={`Late ${summary.late}`} />
            <Typography variant="caption" color="text.secondary">({summary.latePct}%)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StatusChip status="HALF_DAY" label={`WFH ${summary.wfh}`} />
            <Typography variant="caption" color="text.secondary">({summary.wfhPct}%)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StatusChip status="PENDING" label={`On Leave ${summary.onLeave}`} />
            <Typography variant="caption" color="text.secondary">({summary.onLeavePct}%)</Typography>
          </Box>
        </Box>
      </Box>

      {/* Stacked Bar Chart per Department */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, my: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748B", textTransform: "uppercase", fontSize: "10.5px" }}>
          Attendance by Department
        </Typography>

        {departmentBreakdown.map((item) => (
          <Box key={item.department}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#374151", mb: 0.3, display: "block" }}>
              {item.department}
            </Typography>
            <Tooltip
              title={`${item.department}: Present ${item.presentPct}% | Absent ${item.absentPct}% | Late ${item.latePct}% | WFH ${item.wfhPct}% | Leave ${item.onLeavePct}%`}
              arrow
              placement="top"
            >
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  height: 10,
                  borderRadius: 5,
                  overflow: "hidden",
                  backgroundColor: "#F3F4F6",
                }}
              >
                <Box sx={{ width: `${item.presentPct}%`, backgroundColor: "#10B981" }} />
                <Box sx={{ width: `${item.absentPct}%`, backgroundColor: "#EF4444" }} />
                <Box sx={{ width: `${item.latePct}%`, backgroundColor: "#F59E0B" }} />
                <Box sx={{ width: `${item.wfhPct}%`, backgroundColor: "#3B82F6" }} />
                <Box sx={{ width: `${item.onLeavePct}%`, backgroundColor: "#8B5CF6" }} />
              </Box>
            </Tooltip>
          </Box>
        ))}
      </Box>

      {/* Legend & Link */}
      <Box sx={{ pt: 2, mt: 1, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          size="small"
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: "14px !important" }} />}
          sx={{
            p: 0,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            color: "primary.main",
            "&:hover": { backgroundColor: "transparent", textDecoration: "underline" },
          }}
        >
          View Attendance Report
        </Button>
      </Box>
    </Card>
  );
}

export default AttendanceTodayChart;

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";

export interface AttendanceKpiData {
  presentCount: number;
  presentRateText?: string;
  absentCount: number;
  absentSubtext?: string;
  lateCount: number;
  lateSubtext?: string;
  wfhCount: number;
  wfhSubtext?: string;
}

interface AttendanceKpiCardsProps {
  data: AttendanceKpiData;
}

export default function AttendanceKpiCards({ data }: AttendanceKpiCardsProps) {
  const kpis = [
    {
      title: "PRESENT TODAY",
      value: data.presentCount,
      subtext: data.presentRateText || "94.3% attendance rate",
      icon: <CheckCircleOutlinedIcon sx={{ color: "#10B981", fontSize: 20 }} />,
      bgIcon: "rgba(16, 185, 129, 0.12)",
    },
    {
      title: "ABSENT",
      value: data.absentCount,
      subtext: data.absentSubtext || "4 medical, 8 unplanned",
      icon: <CancelOutlinedIcon sx={{ color: "#EF4444", fontSize: 20 }} />,
      bgIcon: "rgba(239, 68, 68, 0.12)",
    },
    {
      title: "LATE CHECK-INS",
      value: data.lateCount,
      subtext: data.lateSubtext || "After 9:30 AM",
      icon: <AccessTimeOutlinedIcon sx={{ color: "#F59E0B", fontSize: 20 }} />,
      bgIcon: "rgba(245, 158, 11, 0.12)",
    },
    {
      title: "WFH TODAY",
      value: data.wfhCount,
      subtext: data.wfhSubtext || "27.6% of workforce",
      icon: <LanguageOutlinedIcon sx={{ color: "#3B82F6", fontSize: 20 }} />,
      bgIcon: "rgba(59, 130, 246, 0.12)",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: { xs: 2, sm: 2.5 },
        mb: 4,
      }}
    >
      {kpis.map((kpi, idx) => (
        <Card
          key={idx}
          sx={{
            p: 2.5,
            borderRadius: 3.5,
            backgroundColor: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justify: "space-between",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "#6B7280",
                fontSize: "0.72rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {kpi.title}
            </Typography>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: kpi.bgIcon,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {kpi.icon}
            </Box>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", mb: 0.5, fontSize: "1.85rem" }}>
            {kpi.value}
          </Typography>

          <Typography variant="caption" sx={{ color: "#6B7280", fontSize: "0.78rem" }}>
            {kpi.subtext}
          </Typography>
        </Card>
      ))}
    </Box>
  );
}

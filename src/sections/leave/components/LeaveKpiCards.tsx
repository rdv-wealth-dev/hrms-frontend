import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";

interface LeaveKpiCardsProps {
  onLeaveTodayCount?: number;
  pendingApprovalsCount?: number;
  utilizationPercentage?: number;
  liabilityAmount?: string;
}

export default function LeaveKpiCards({
  onLeaveTodayCount = 6,
  pendingApprovalsCount = 2,
  utilizationPercentage = 67,
  liabilityAmount = "₹48.2L",
}: LeaveKpiCardsProps) {
  const cards = [
    {
      id: "on-leave",
      title: "ON LEAVE TODAY",
      value: String(onLeaveTodayCount),
      subtitle: "2.1% of workforce",
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 20, color: "#D97706" }} />,
      iconBg: "#FEF3C7",
    },
    {
      id: "pending",
      title: "PENDING APPROVALS",
      value: String(pendingApprovalsCount),
      subtitle: "Require your action",
      icon: <AccessTimeOutlinedIcon sx={{ fontSize: 20, color: "#EF4444" }} />,
      iconBg: "#FEE2E2",
    },
    {
      id: "utilization",
      title: "LEAVE UTILIZATION",
      value: `${utilizationPercentage}%`,
      subtitle: "Annual leave — YTD",
      icon: <AssessmentOutlinedIcon sx={{ fontSize: 20, color: "#2563EB" }} />,
      iconBg: "#DBEAFE",
    },
    {
      id: "liability",
      title: "LEAVE LIABILITY",
      value: liabilityAmount,
      subtitle: "Unencashed balance",
      icon: <AttachMoneyOutlinedIcon sx={{ fontSize: 20, color: "#7C3AED" }} />,
      iconBg: "#EDE9FE",
    },
  ];

  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.id}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: "16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748B",
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                }}
              >
                {card.title}
              </Typography>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  backgroundColor: card.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  lineHeight: 1.1,
                  mb: 0.5,
                }}
              >
                {card.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#64748B",
                }}
              >
                {card.subtitle}
              </Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

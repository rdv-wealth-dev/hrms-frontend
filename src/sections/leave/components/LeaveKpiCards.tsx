import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import Typography from "@mui/material/Typography";
import KpiCardsGrid, { type KpiCardItem } from "../../../components/card/KpiCard";

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
  const cards: KpiCardItem[] = [
    {
      title: "ON LEAVE TODAY",
      value: String(onLeaveTodayCount),
      subtext: "2.1% of workforce",
      trend: "0.6%",
      trendType: "positive",
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 20, color: "#6366F1" }} />,
      iconBg: "rgba(99, 102, 241, 0.08)",
    },
    {
      title: "PENDING APPROVALS",
      value: String(pendingApprovalsCount),
      subtext: "Require your action",
      trend: "-1",
      trendType: "negative",
      icon: <AccessTimeOutlinedIcon sx={{ fontSize: 20, color: "#F59E0B" }} />,
      iconBg: "rgba(245, 158, 11, 0.1)",
    },
    {
      title: "LEAVE UTILIZATION",
      value: `${utilizationPercentage}%`,
      subtext: "Annual leave — YTD",
      trend: "8.4%",
      trendType: "positive",
      progress: utilizationPercentage,
      progressColor: "#10B981",
    },
    {
      title: "LEAVE LIABILITY",
      value: liabilityAmount,
      subtext: "Unencashed balance",
      trend: "AS ON TODAY",
      trendType: "neutral",
      icon: (
        <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#6366F1", lineHeight: 1 }}>
          ₹
        </Typography>
      ),
      iconBg: "rgba(99, 102, 241, 0.08)",
    },
  ];

  return <KpiCardsGrid items={cards} mb={3} />;
}

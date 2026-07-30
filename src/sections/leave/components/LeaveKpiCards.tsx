import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
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
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 20, color: "#D97706" }} />,
      iconBg: "#FEF3C7",
    },
    {
      title: "PENDING APPROVALS",
      value: String(pendingApprovalsCount),
      subtext: "Require your action",
      icon: <AccessTimeOutlinedIcon sx={{ fontSize: 20, color: "#EF4444" }} />,
      iconBg: "#FEE2E2",
    },
    {
      title: "LEAVE UTILIZATION",
      value: `${utilizationPercentage}%`,
      subtext: "Annual leave — YTD",
      icon: <AssessmentOutlinedIcon sx={{ fontSize: 20, color: "#2563EB" }} />,
      iconBg: "#DBEAFE",
    },
    {
      title: "LEAVE LIABILITY",
      value: liabilityAmount,
      subtext: "Unencashed balance",
      icon: <AttachMoneyOutlinedIcon sx={{ fontSize: 20, color: "#7C3AED" }} />,
      iconBg: "#EDE9FE",
    },
  ];

  return <KpiCardsGrid items={cards} mb={3} />;
}

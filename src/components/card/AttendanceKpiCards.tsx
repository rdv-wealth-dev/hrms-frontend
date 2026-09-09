import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import KpiCardsGrid, { type KpiCardItem } from "./KpiCard";

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
  const kpis: KpiCardItem[] = [
    {
      title: "PRESENT TODAY",
      value: data.presentCount,
      subtext: data.presentRateText || "94.3% attendance rate",
      trend: "94.3%",
      trendType: "positive",
      icon: <CheckCircleOutlinedIcon sx={{ color: "#10B981", fontSize: 20 }} />,
      iconBg: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "ABSENT",
      value: data.absentCount,
      subtext: data.absentSubtext || "Unplanned leaves",
      trend: data.absentCount > 0 ? `-${data.absentCount}` : "0",
      trendType: data.absentCount > 0 ? "negative" : "neutral",
      icon: <CancelOutlinedIcon sx={{ color: "#EF4444", fontSize: 20 }} />,
      iconBg: "rgba(239, 68, 68, 0.1)",
    },
    {
      title: "LATE CHECK-INS",
      value: data.lateCount,
      subtext: data.lateSubtext || "After 9:30 AM",
      trend: data.lateCount > 0 ? `+${data.lateCount}` : undefined,
      trendType: data.lateCount > 0 ? "negative" : "neutral",
      icon: <AccessTimeOutlinedIcon sx={{ color: "#F59E0B", fontSize: 20 }} />,
      iconBg: "rgba(245, 158, 11, 0.1)",
    },
    {
      title: "WFH TODAY",
      value: data.wfhCount,
      subtext: data.wfhSubtext || "Remote staff",
      trend: "REMOTE",
      trendType: "neutral",
      icon: <LanguageOutlinedIcon sx={{ color: "#3B82F6", fontSize: 20 }} />,
      iconBg: "rgba(59, 130, 246, 0.1)",
    },
  ];

  return <KpiCardsGrid items={kpis} mb={3} />;
}

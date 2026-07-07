import Chip from "@mui/material/Chip";

type Props = {
  status: string;
};

export default function AttendanceStatusChip({ status }: Props) {
  let label = status;
  let bg = "rgba(107, 114, 128, 0.08)";
  let color = "#6B7280";
  let border = "1px solid rgba(107, 114, 128, 0.1)";

  switch (status) {
    case "PRESENT":
      label = "Present";
      bg = "rgba(16, 185, 129, 0.08)";
      color = "#10B981";
      border = "1px solid rgba(16, 185, 129, 0.2)";
      break;
    case "LATE":
      label = "Late";
      bg = "rgba(245, 158, 11, 0.08)";
      color = "#F59E0B";
      border = "1px solid rgba(245, 158, 11, 0.2)";
      break;
    case "HALF_DAY":
      label = "Half Day";
      bg = "rgba(249, 115, 22, 0.08)";
      color = "#F97316";
      border = "1px solid rgba(249, 115, 22, 0.2)";
      break;
    case "ABSENT":
      label = "Absent";
      bg = "rgba(239, 68, 68, 0.08)";
      color = "#EF4444";
      border = "1px solid rgba(239, 68, 68, 0.2)";
      break;
    case "ON_LEAVE":
      label = "On Leave";
      bg = "rgba(139, 92, 246, 0.08)";
      color = "#8B5CF6";
      border = "1px solid rgba(139, 92, 246, 0.2)";
      break;
    case "HOLIDAY":
      label = "Holiday";
      bg = "rgba(59, 130, 246, 0.08)";
      color = "#3B82F6";
      border = "1px solid rgba(59, 130, 246, 0.2)";
      break;
    case "WEEK_OFF":
      label = "Week Off";
      bg = "rgba(107, 114, 128, 0.06)";
      color = "#4B5563";
      border = "1px solid rgba(107, 114, 128, 0.12)";
      break;
    case "NOT_CHECKED_IN":
      label = "Not Checked In";
      bg = "rgba(107, 114, 128, 0.08)";
      color = "#6B7280";
      border = "1px solid rgba(107, 114, 128, 0.1)";
      break;
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: "0.75rem",
        backgroundColor: bg,
        color: color,
        border: border,
        borderRadius: "6px",
      }}
    />
  );
}

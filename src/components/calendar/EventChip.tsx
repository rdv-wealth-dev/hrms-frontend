import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CakeIcon from "@mui/icons-material/Cake";
import EventIcon from "@mui/icons-material/Event";
import type { BranchCalendarEvent } from "../../store/branch/branch.types";

interface EventChipProps {
  event: BranchCalendarEvent;
  compact?: boolean;
}

export function EventChip({ event, compact = false }: EventChipProps) {
  const isAnniversary = event.type === "ANNIVERSARY";
  const isBirthday = event.type === "BIRTHDAY";

  // Dynamic styling based on event type
  const bg = isAnniversary ? "#EEF2FF" : isBirthday ? "#FDF2F8" : "#F3F4F6";
  const color = isAnniversary ? "#4F46E5" : isBirthday ? "#DB2777" : "#374151";
  const borderColor = isAnniversary ? "#C7D2FE" : isBirthday ? "#FBCFE8" : "#E5E7EB";

  const IconComponent = isAnniversary
    ? CardGiftcardIcon
    : isBirthday
    ? CakeIcon
    : EventIcon;

  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {event.title}
          </Typography>
          <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.8)" }}>
            Employee: {event.employeeName} ({event.employeeCode})
          </Typography>
          {event.years !== undefined && (
            <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.8)" }}>
              Experience: {event.years} {event.years === 1 ? "Year" : "Years"}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.6,
          px: compact ? 0.8 : 1,
          py: compact ? 0.2 : 0.4,
          borderRadius: "6px",
          backgroundColor: bg,
          color: color,
          border: `1px solid ${borderColor}`,
          fontSize: compact ? "11px" : "12px",
          fontWeight: 600,
          cursor: "pointer",
          maxWidth: "100%",
          transition: "all 0.15s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
          },
        }}
      >
        <IconComponent sx={{ fontSize: compact ? 13 : 15, flexShrink: 0 }} />
        <Typography
          variant="caption"
          noWrap
          sx={{
            fontWeight: 600,
            fontSize: "inherit",
            lineHeight: 1.2,
          }}
        >
          {event.employeeName || event.title}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default EventChip;

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import CloseIcon from "@mui/icons-material/Close";
import CakeIcon from "@mui/icons-material/Cake";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CelebrationIcon from "@mui/icons-material/Celebration";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import type { BranchCalendarDay } from "../../store/branch/branch.types";

interface EventDetailPanelProps {
  open: boolean;
  day: BranchCalendarDay | null;
  onClose: () => void;
}

export function EventDetailPanel({ open, day, onClose }: EventDetailPanelProps) {
  if (!day) return null;

  const dateObj = new Date(`${day.date}T00:00:00`);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isHoliday = day.type === "HOLIDAY";
  const isWeekOff = day.type === "WEEK_OFF";
  const hasEvents = day.events && day.events.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EventAvailableIcon sx={{ color: "#6D5DF6" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "16px" }}>
            Day Details
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderTop: "1px solid #E5E7EB", pt: 2, pb: 3 }}>
        {/* Date Header */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
          {formattedDate}
        </Typography>

        {/* Day Type Badges */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={day.type}
            size="small"
            color={isHoliday ? "error" : isWeekOff ? "warning" : "success"}
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: "11px" }}
          />

          {isHoliday && day.holidayName && (
            <Chip
              label={`🎉 ${day.holidayName}`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "11px",
                backgroundColor: "#FEF3C7",
                color: "#92400E",
              }}
            />
          )}

          {isWeekOff && day.offReason && (
            <Chip
              label={day.offReason === "SATURDAY_POLICY" ? "Saturday Off" : day.offReason}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "11px",
                backgroundColor: "#F3F4F6",
                color: "#4B5563",
              }}
            />
          )}
        </Box>

        {/* Events List */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Events & Celebrations ({day.events.length})
        </Typography>

        {hasEvents ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1.5 }}>
            {day.events.map((evt, idx) => {
              const isAnniversary = evt.type === "ANNIVERSARY";
              const isBirthday = evt.type === "BIRTHDAY";

              const bg = isAnniversary ? "#EEF2FF" : isBirthday ? "#FDF2F8" : "#F9FAFB";
              const borderColor = isAnniversary ? "#C7D2FE" : isBirthday ? "#FBCFE8" : "#E5E7EB";
              const iconColor = isAnniversary ? "#4F46E5" : isBirthday ? "#DB2777" : "#4B5563";

              const Icon = isAnniversary ? CardGiftcardIcon : isBirthday ? CakeIcon : CelebrationIcon;

              return (
                <Paper
                  key={`${evt.employeeCode}-${idx}`}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: bg,
                    border: `1px solid ${borderColor}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                  }}
                >
                  <Icon sx={{ color: iconColor, mt: 0.2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                      {evt.employeeName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                      ID: {evt.employeeCode}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: iconColor, mt: 0.5, display: "block" }}>
                      {isBirthday
                        ? "🎂 Birthday Celebration"
                        : `${evt.years ?? 0} Year${(evt.years ?? 0) === 1 ? "" : "s"} Work Anniversary`}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ py: 3, textAlign: "center", backgroundColor: "#F9FAFB", borderRadius: 2, mt: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              No employee events or birthdays scheduled for this day.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EventDetailPanel;

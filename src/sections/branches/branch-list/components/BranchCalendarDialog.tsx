import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Typography from "@mui/material/Typography";
import { useBranchCalendar } from "../../../../hooks/useBranchCalendar";
import { BranchCalendarGrid } from "../../../../components/calendar";

interface BranchCalendarDialogProps {
  open: boolean;
  branchId: string | null;
  branchName?: string;
  onClose: () => void;
}

export function BranchCalendarDialog({
  open,
  branchId,
  branchName,
  onClose,
}: BranchCalendarDialogProps) {
  const {
    calendarData,
    loading,
    isFetching,
    error,
    nextMonth,
    prevMonth,
    resetToCurrent,
  } = useBranchCalendar({
    branchId: branchId || undefined,
    autoFetch: open && Boolean(branchId),
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            maxHeight: "90vh",
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
          <CalendarMonthIcon sx={{ color: "#6D5DF6" }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {branchName ? `${branchName} Schedule` : "Branch Calendar"}
          </Typography>
        </Box>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderTop: "1px solid #E5E7EB", py: 2.5 }}>
        {!calendarData && loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : calendarData ? (
          <BranchCalendarGrid
            data={calendarData}
            isFetching={isFetching}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onResetMonth={resetToCurrent}
          />
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No calendar schedule found for this branch.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BranchCalendarDialog;

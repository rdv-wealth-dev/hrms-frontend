import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";

import TextInput from "../../../components/input/TextInput";
import { formatDate, formatTime } from "../../../utils/format-date";
import { createRegularizationRequest } from "../../../api/attendance.api";
import type { AttendanceRecord } from "../../../store/attendance/attendance.types";

type RegularizeRequestDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  record: AttendanceRecord | null;
};

export default function RegularizeRequestDialog({
  open,
  onClose,
  onSuccess,
  record,
}: RegularizeRequestDialogProps) {
  const [reqCheckInChecked, setReqCheckInChecked] = useState(false);
  const [reqCheckOutChecked, setReqCheckOutChecked] = useState(false);

  const [requestedCheckInTime, setRequestedCheckInTime] = useState("");
  const [requestedCheckOutTime, setRequestedCheckOutTime] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync state when record or dialog opens
  useEffect(() => {
    if (open && record) {
      setError(null);
      setSuccess(null);
      setReqCheckInChecked(false);
      setReqCheckOutChecked(false);
      setRequestedCheckInTime(record.firstCheckIn ? formatTimeForInput(record.firstCheckIn) : "");
      setRequestedCheckOutTime(record.lastCheckOut ? formatTimeForInput(record.lastCheckOut) : "");
      setReason("");
    }
  }, [open, record]);

  if (!record) return null;

  const formatTimeForInput = (timeStr: string) => {
    try {
      if (timeStr.includes("T")) {
        const d = new Date(timeStr);
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      }
      return timeStr;
    } catch {
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const attendanceId = record._id || (record as any).id || (record as any).attendanceId;
    if (!attendanceId) {
      setError("Invalid attendance record ID.");
      return;
    }

    if (!reqCheckInChecked && !reqCheckOutChecked) {
      setError("Please select at least one check-in or check-out time to adjust.");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Please provide a detailed reason (minimum 10 characters).");
      return;
    }

    try {
      setSubmitting(true);
      const datePart = record.attendanceDate
        ? record.attendanceDate.split("T")[0]
        : new Date().toISOString().split("T")[0];

      const parseIsoTime = (timeStr: string) => {
        const parts = timeStr.trim().split(":");
        const cleanTime = parts.length === 2 ? `${timeStr}:00` : timeStr;
        const d = new Date(`${datePart}T${cleanTime}`);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      };

      let requestedCheckIn: string | undefined = undefined;
      if (reqCheckInChecked && requestedCheckInTime) {
        requestedCheckIn = parseIsoTime(requestedCheckInTime);
      }

      let requestedCheckOut: string | undefined = undefined;
      if (reqCheckOutChecked && requestedCheckOutTime) {
        requestedCheckOut = parseIsoTime(requestedCheckOutTime);
      }

      const payload = {
        attendanceId,
        attendanceRecordId: attendanceId,
        requestedCheckIn,
        requestedCheckOut,
        reason: reason.trim(),
      };

      const response = await createRegularizationRequest(payload);
      if (response.succeeded) {
        onSuccess?.();
        onClose();
      } else {
        setError(response.message || "Failed to submit regularization request");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while submitting request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableRestoreFocus
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
          },
        },
        paper: { sx: { borderRadius: "16px", p: 0.5 } },
      }}
    >
      <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <HistoryIcon sx={{ color: "#6D5DF6", fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            Request Regularization
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 3 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, backgroundColor: "#F9FAFB", p: 2, borderRadius: 2.5, border: "1px solid rgba(0,0,0,0.04)" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Shift Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                {formatDate(record.attendanceDate || "", { treatAsDateOnly: true })}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Logged Check-In
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: "#4B5563" }}>
                  {formatTime(record.firstCheckIn)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Logged Check-Out
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: "#4B5563" }}>
                  {formatTime(record.lastCheckOut)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reqCheckInChecked}
                  onChange={(e) => setReqCheckInChecked(e.target.checked)}
                  sx={{ color: "#6D5DF6", "&.Mui-checked": { color: "#6D5DF6" } }}
                />
              }
              label="Request Check-In Adjustment"
            />
            {reqCheckInChecked && (
              <Box sx={{ mt: 1 }}>
                <TextInput
                  type="time"
                  label="Requested Check-In Time"
                  value={requestedCheckInTime}
                  onChange={(e) => setRequestedCheckInTime(e.target.value)}
                  required
                  disabled={submitting}
                />
              </Box>
            )}
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reqCheckOutChecked}
                  onChange={(e) => setReqCheckOutChecked(e.target.checked)}
                  sx={{ color: "#6D5DF6", "&.Mui-checked": { color: "#6D5DF6" } }}
                />
              }
              label="Request Check-Out Adjustment"
            />
            {reqCheckOutChecked && (
              <Box sx={{ mt: 1 }}>
                <TextInput
                  type="time"
                  label="Requested Check-Out Time"
                  value={requestedCheckOutTime}
                  onChange={(e) => setRequestedCheckOutTime(e.target.value)}
                  required
                  disabled={submitting}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <TextInput
              multiline
              rows={2}
              label="Reason for Regularization"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              disabled={submitting}
              placeholder="Please enter a detailed reason (minimum 10 characters)"
            />
            <Typography variant="caption" sx={{ color: "#64748B", ml: 0.5 }}>
              e.g. Forgot to clock in, biometric punch error, etc.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="contained"
            sx={{
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4BEA" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

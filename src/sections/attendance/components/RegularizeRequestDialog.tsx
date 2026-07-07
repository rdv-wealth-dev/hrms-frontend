import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";

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
  const [reqCheckInChecked, setReqCheckInChecked] = useState(true);
  const [reqCheckOutChecked, setReqCheckOutChecked] = useState(false);

  const [requestedCheckInTime, setRequestedCheckInTime] = useState("09:00");
  const [requestedCheckOutTime, setRequestedCheckOutTime] = useState("18:00");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Parse and prefill timestamps when record loads
  useEffect(() => {
    if (record) {
      if (record.firstCheckIn) {
        const checkInDate = new Date(record.firstCheckIn);
        const hh = String(checkInDate.getHours()).padStart(2, "0");
        const mm = String(checkInDate.getMinutes()).padStart(2, "0");
        setRequestedCheckInTime(`${hh}:${mm}`);
      } else {
        setRequestedCheckInTime("09:00");
      }

      if (record.lastCheckOut) {
        const checkOutDate = new Date(record.lastCheckOut);
        const hh = String(checkOutDate.getHours()).padStart(2, "0");
        const mm = String(checkOutDate.getMinutes()).padStart(2, "0");
        setRequestedCheckOutTime(`${hh}:${mm}`);
        setReqCheckOutChecked(true);
      } else {
        setRequestedCheckOutTime("18:00");
        setReqCheckOutChecked(false);
      }
      setReason("");
      setError(null);
      setSuccess(null);
    }
  }, [record]);

  if (!record) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(navigator.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "None";
    return new Date(timeStr).toLocaleTimeString(navigator.language, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reqCheckInChecked && !reqCheckOutChecked) {
      setError("Please check at least one checkbox to request check-in or check-out time adjustment.");
      return;
    }
    if (reason.trim().length < 10) {
      setError("Please provide a reason of at least 10 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const datePart = record.attendanceDate
        ? record.attendanceDate.split("T")[0]
        : new Date().toISOString().split("T")[0];

      let requestedCheckIn: string | undefined = undefined;
      let checkInDate: Date | null = null;
      if (reqCheckInChecked) {
        checkInDate = new Date(`${datePart}T${requestedCheckInTime}:00`);
        if (isNaN(checkInDate.getTime())) {
          throw new Error("Invalid requested check-in time format");
        }
        requestedCheckIn = checkInDate.toISOString();
      }

      let requestedCheckOut: string | undefined = undefined;
      if (reqCheckOutChecked) {
        const checkOutDate = new Date(`${datePart}T${requestedCheckOutTime}:00`);
        if (isNaN(checkOutDate.getTime())) {
          throw new Error("Invalid requested check-out time format");
        }
        if (checkInDate && checkOutDate.getTime() < checkInDate.getTime()) {
          throw new Error("Requested check-out time cannot be earlier than check-in time.");
        }
        requestedCheckOut = checkOutDate.toISOString();
      }

      const response = await createRegularizationRequest({
        attendanceId: record._id || "",
        requestedCheckIn,
        requestedCheckOut,
        reason,
      });

      if (response.succeeded) {
        setSuccess("Regularization request submitted successfully!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
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

          {/* 1. Date & Original Timings Details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, backgroundColor: "#F9FAFB", p: 2, borderRadius: 2.5, border: "1px solid rgba(0,0,0,0.04)" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Shift Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                {formatDate(record.attendanceDate)}
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

          {/* 2. Requested Check-In */}
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
              <TextField
                label="Requested Check-In Time"
                type="time"
                value={requestedCheckInTime}
                onChange={(e) => setRequestedCheckInTime(e.target.value)}
                fullWidth
                size="small"
                required
                disabled={submitting}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* 3. Requested Check-Out */}
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
              <TextField
                label="Requested Check-Out Time"
                type="time"
                value={requestedCheckOutTime}
                onChange={(e) => setRequestedCheckOutTime(e.target.value)}
                fullWidth
                size="small"
                required
                disabled={submitting}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* 4. Reason */}
          <TextField
            label="Reason for Regularization"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            size="small"
            required
            disabled={submitting}
            placeholder="Please enter a detailed reason (minimum 10 characters)"
            helperText="e.g. Forgot to clock in, biometric punch error, etc."
          />
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

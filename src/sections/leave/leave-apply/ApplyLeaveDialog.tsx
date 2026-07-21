import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import type { LeaveBalance, LeaveType, CreateLeaveRequest } from "../../../api/leave.api";

interface ApplyLeaveDialogProps {
  open: boolean;
  submitting: boolean;
  error: string | null;
  balances: LeaveBalance[];
  leaveTypes: LeaveType[];
  onClose: () => void;
  onSubmit: (data: CreateLeaveRequest) => void;
}

export default function ApplyLeaveDialog({
  open,
  submitting,
  error,
  balances,
  leaveTypes,
  onClose,
  onSubmit,
}: ApplyLeaveDialogProps) {
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromSession, setFromSession] = useState<"FULL_DAY" | "FIRST_HALF" | "SECOND_HALF">("FULL_DAY");
  const [toSession, setToSession] = useState<"FULL_DAY" | "FIRST_HALF" | "SECOND_HALF">("FULL_DAY");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      const initial = balances[0]?.leaveTypeId as any;
      setLeaveTypeId(initial ? (typeof initial === "string" ? initial : (initial._id || "")) : "");
      setFromDate("");
      setToDate("");
      setFromSession("FULL_DAY");
      setToSession("FULL_DAY");
      setReason("");
    }
  }, [open, balances]);

  const handleSubmit = () => {
    if (!leaveTypeId || !fromDate || !toDate || reason.trim().length < 5) return;
    onSubmit({
      leaveTypeId,
      fromDate,
      toDate,
      fromSession,
      toSession,
      reason: reason.trim(),
    });
  };

  const getLeaveTypeName = (id: string | { _id?: string; name?: string; code?: string }) => {
    if (!id) return "Other Leave";
    const typeId = typeof id === "string" ? id : id._id;
    const type = leaveTypes.find((t) => t._id === typeId);
    return type ? `${type.name} (${type.code})` : (typeof id === "object" ? id.name : "Other Leave") || "Other Leave";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Apply for Leave</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <TextField
          select
          label="Leave Type"
          value={leaveTypeId}
          onChange={(e) => setLeaveTypeId(e.target.value)}
          fullWidth
          size="small"
          required
        >
          {balances.map((b) => {
            const val = typeof b.leaveTypeId === "string" ? b.leaveTypeId : (b.leaveTypeId as any)?._id || "";
            return (
              <MenuItem key={b._id} value={val}>
                {getLeaveTypeName(b.leaveTypeId)} — Balance: {b.available}
              </MenuItem>
            );
          })}
        </TextField>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            fullWidth
            size="small"
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="From Session"
            value={fromSession}
            onChange={(e) => setFromSession(e.target.value as any)}
            fullWidth
            size="small"
          >
            <MenuItem value="FULL_DAY">Full Day</MenuItem>
            <MenuItem value="FIRST_HALF">First Half</MenuItem>
            <MenuItem value="SECOND_HALF">Second Half</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            fullWidth
            size="small"
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="To Session"
            value={toSession}
            onChange={(e) => setToSession(e.target.value as any)}
            fullWidth
            size="small"
          >
            <MenuItem value="FULL_DAY">Full Day</MenuItem>
            <MenuItem value="FIRST_HALF">First Half</MenuItem>
            <MenuItem value="SECOND_HALF">Second Half</MenuItem>
          </TextField>
        </Box>

        <TextField
          label="Reason for Leave"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          size="small"
          multiline
          rows={3}
          placeholder="Please enter a detailed reason (minimum 5 characters)..."
          required
          error={reason.trim().length > 0 && reason.trim().length < 5}
          helperText={reason.trim().length > 0 && reason.trim().length < 5 ? "Reason must be at least 5 characters long." : ""}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !leaveTypeId || !fromDate || !toDate || reason.trim().length < 5}
          variant="contained"
          sx={{
            backgroundColor: "#6D5DF6",
            "&:hover": { backgroundColor: "#5B4EE4" },
            fontWeight: 600,
            px: 3,
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

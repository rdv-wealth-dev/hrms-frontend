import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

import TextInput from "../../../components/input/TextInput";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.4)",
          },
        },
        paper: { sx: { borderRadius: "16px", p: 1 } },
      }}
    >
      <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
          Apply for Leave
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF" }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: "10px" }}>
              {error}
            </Alert>
          )}

          <TextInput
            select
            label="Leave Type"
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            disabled={submitting}
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
          </TextInput>

          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Box sx={{ flex: 1 }}>
              <TextInput
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={submitting}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextInput
                select
                label="From Session"
                value={fromSession}
                onChange={(e) => setFromSession(e.target.value as any)}
                disabled={submitting}
              >
                <MenuItem value="FULL_DAY">Full Day</MenuItem>
                <MenuItem value="FIRST_HALF">First Half</MenuItem>
                <MenuItem value="SECOND_HALF">Second Half</MenuItem>
              </TextInput>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Box sx={{ flex: 1 }}>
              <TextInput
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={submitting}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextInput
                select
                label="To Session"
                value={toSession}
                onChange={(e) => setToSession(e.target.value as any)}
                disabled={submitting}
              >
                <MenuItem value="FULL_DAY">Full Day</MenuItem>
                <MenuItem value="FIRST_HALF">First Half</MenuItem>
                <MenuItem value="SECOND_HALF">Second Half</MenuItem>
              </TextInput>
            </Box>
          </Box>

          <TextInput
            label="Reason for Leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            placeholder="Please enter a detailed reason (minimum 5 characters)..."
            required
            disabled={submitting}
            error={reason.trim().length > 0 && reason.trim().length < 5 ? "Reason must be at least 5 characters long." : undefined}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !leaveTypeId || !fromDate || !toDate || reason.trim().length < 5}
            variant="contained"
            sx={{
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4BE4" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

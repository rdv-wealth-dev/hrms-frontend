import { useEffect, useState, useMemo } from "react";
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
import { useCurrentEmployeeProfile } from "../../../hooks/useCurrentEmployeeProfile";

interface ApplyLeaveDialogProps {
  open: boolean;
  submitting: boolean;
  error: string | null;
  balances: LeaveBalance[];
  leaveTypes: LeaveType[];
  gender?: string;
  maritalStatus?: string;
  onClose: () => void;
  onSubmit: (data: CreateLeaveRequest) => void;
}

export default function ApplyLeaveDialog({
  open,
  submitting,
  error,
  balances,
  leaveTypes,
  gender,
  maritalStatus,
  onClose,
  onSubmit,
}: ApplyLeaveDialogProps) {
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromSession, setFromSession] = useState<"FULL_DAY" | "FIRST_HALF" | "SECOND_HALF">("FULL_DAY");
  const [toSession, setToSession] = useState<"FULL_DAY" | "FIRST_HALF" | "SECOND_HALF">("FULL_DAY");
  const [reason, setReason] = useState("");

  // When gender/maritalStatus are not threaded from parent, fetch self-service profile
  const { gender: hookGender, maritalStatus: hookMarital } = useCurrentEmployeeProfile({
    enabled: open && (!gender || !maritalStatus),
  });

  const resolvedGender = (gender || hookGender || "").toUpperCase();
  const resolvedMarital = (maritalStatus || hookMarital || "").toUpperCase();

  // Robust ID resolver: handles both raw string IDs and Mongoose populated objects ({ _id, name, code, isPaid })
  const resolveLeaveTypeId = (ref: any): string => {
    if (!ref) return "";
    return typeof ref === "string" ? ref : ref?._id || "";
  };

  // Smart client-side filtering based on gender, marital status, and available balance
  const filteredBalances = useMemo(() => {
    return (balances || []).filter((b) => {
      const typeId = resolveLeaveTypeId(b?.leaveTypeId);
      const type = (leaveTypes || []).find((t) => t?._id === typeId);
      const code = (type?.code || (b?.leaveTypeId as any)?.code || "").toUpperCase();
      const name = (type?.name || (b?.leaveTypeId as any)?.name || "").toUpperCase();
      const isActive = type?.isActive ?? (b?.leaveTypeId as any)?.isActive ?? true;

      // 1. Filter out inactive / deprecated leave types
      if (!isActive) return false;

      // 2. Hide Maternity Leave for male employees
      if ((code === "ML" || name.includes("MATERNITY")) && resolvedGender === "MALE") {
        return false;
      }

      // 3. Hide Paternity Leave for female employees
      if ((code === "PAT" || name.includes("PATERNITY")) && resolvedGender === "FEMALE") {
        return false;
      }

      // 4. Hide Marriage Leave for already married employees
      if ((code === "MAR" || name.includes("MARRIAGE")) && resolvedMarital === "MARRIED") {
        return false;
      }

      // 5. Hide Compensatory Off if available balance is 0 or negative
      if ((code === "COMP_OFF" || name.includes("COMPENSATORY")) && (b?.available ?? 0) <= 0) {
        return false;
      }

      return true;
    });
  }, [balances, leaveTypes, resolvedGender, resolvedMarital]);

  useEffect(() => {
    if (open) {
      const initial = filteredBalances[0]?.leaveTypeId;
      const initialId = resolveLeaveTypeId(initial);
      setLeaveTypeId(initialId);
      setFromDate("");
      setToDate("");
      setFromSession("FULL_DAY");
      setToSession("FULL_DAY");
      setReason("");
    }
  }, [open, filteredBalances]);

  // Ensure current selection remains valid if filteredBalances change
  useEffect(() => {
    if (leaveTypeId && filteredBalances.length > 0) {
      const exists = filteredBalances.some(
        (b) => resolveLeaveTypeId(b?.leaveTypeId) === leaveTypeId
      );
      if (!exists) {
        setLeaveTypeId(resolveLeaveTypeId(filteredBalances[0]?.leaveTypeId));
      }
    }
  }, [leaveTypeId, filteredBalances]);

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
    const typeId = resolveLeaveTypeId(id);
    const type = (leaveTypes || []).find((t) => t?._id === typeId);
    if (type) {
      return `${type.name} (${type.code})`;
    }
    if (typeof id === "object" && id?.name) {
      return id?.code ? `${id.name} (${id.code})` : id.name;
    }
    return "Other Leave";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableRestoreFocus
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
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          Apply for Leave
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
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
            disabled={submitting || filteredBalances.length === 0}
            required
          >
            {filteredBalances.length === 0 ? (
              <MenuItem disabled value="">
                <em>No applicable leave types available for your profile</em>
              </MenuItem>
            ) : (
              filteredBalances.map((b) => {
                const val = resolveLeaveTypeId(b?.leaveTypeId);
                return (
                  <MenuItem key={b?._id || val} value={val}>
                    {getLeaveTypeName(b?.leaveTypeId)} — Balance: {b?.available ?? 0}
                  </MenuItem>
                );
              })
            )}
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
            disabled={
              submitting ||
              !leaveTypeId ||
              !fromDate ||
              !toDate ||
              reason.trim().length < 5 ||
              filteredBalances.length === 0
            }
            variant="contained"
            sx={{
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
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

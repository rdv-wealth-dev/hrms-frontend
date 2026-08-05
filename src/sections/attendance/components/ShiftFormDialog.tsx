import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import TextInput from "../../../components/input/TextInput";

import type { Shift, CreateShiftRequest, UpdateShiftRequest } from "../../../store/attendance/attendance.types";
import { createShift, updateShift } from "../../../api/attendance.api";

interface ShiftFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Shift | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShiftFormDialog({
  open,
  mode,
  initialValues,
  onClose,
  onSuccess,
}: ShiftFormDialogProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState<number | "">(15);
  const [graceLimitPerMonth, setGraceLimitPerMonth] = useState<number | "">(0);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number | "">(60);
  const [halfDayThresholdMinutes, setHalfDayThresholdMinutes] = useState<number | "">(240);
  const [fullDayMinutes, setFullDayMinutes] = useState<number | "">(480);
  const [absentThresholdMinutes, setAbsentThresholdMinutes] = useState<number | "">(255);
  const [lateArrivalHalfDayMinutes, setLateArrivalHalfDayMinutes] = useState<number | "">(90);
  const [isDefault, setIsDefault] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoUpdateThresholds = (start: string, end: string, breakM: number | "") => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (timeRegex.test(start) && timeRegex.test(end)) {
      const [startH, startM] = start.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const totalDuration = endMin >= startMin ? endMin - startMin : (1440 - startMin) + endMin;
      const breakMin = Number(breakM) || 0;
      const fullDayVal = Math.max(0, totalDuration - breakMin);
      const halfDayVal = Math.round(fullDayVal / 2);
      setFullDayMinutes(fullDayVal);
      setHalfDayThresholdMinutes(halfDayVal);
    }
  };

  useEffect(() => {
    if (open) {
      setError(null);
      if (mode === "edit" && initialValues) {
        setName(initialValues.name || "");
        setCode(initialValues.code || "");
        setStartTime(initialValues.startTime || "09:00");
        setEndTime(initialValues.endTime || "18:00");
        setGracePeriodMinutes(initialValues.gracePeriodMinutes ?? 15);
        setGraceLimitPerMonth(initialValues.graceLimitPerMonth ?? 0);
        setBreakDurationMinutes(initialValues.breakDurationMinutes ?? 60);
        setHalfDayThresholdMinutes(initialValues.halfDayThresholdMinutes ?? 240);
        setFullDayMinutes(initialValues.fullDayMinutes ?? 480);
        setAbsentThresholdMinutes(initialValues.absentThresholdMinutes ?? 255);
        setLateArrivalHalfDayMinutes(initialValues.lateArrivalHalfDayMinutes ?? 90);
        setIsDefault(initialValues.isDefault ?? false);
      } else {
        setName("");
        setCode("");
        setStartTime("09:00");
        setEndTime("18:00");
        setGracePeriodMinutes(15);
        setGraceLimitPerMonth(0);
        setBreakDurationMinutes(60);
        setHalfDayThresholdMinutes(240);
        setFullDayMinutes(480);
        setAbsentThresholdMinutes(255);
        setLateArrivalHalfDayMinutes(90);
        setIsDefault(false);
      }
    }
  }, [open, mode, initialValues]);

  const handleSubmit = async () => {
    setError(null);

    // Client-side validations
    if (!name.trim()) {
      setError("Shift name is required.");
      return;
    }
    if (mode === "create" && !code.trim()) {
      setError("Shift code is required.");
      return;
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime)) {
      setError("Start time must be a valid time in HH:mm format (00:00–23:59).");
      return;
    }
    if (!timeRegex.test(endTime)) {
      setError("End time must be a valid time in HH:mm format (00:00–23:59).");
      return;
    }

    const grace = Number(gracePeriodMinutes);
    if (isNaN(grace) || grace < 0) {
      setError("Grace period minutes must be a non-negative number.");
      return;
    }

    const halfDay = Number(halfDayThresholdMinutes);
    const fullDay = Number(fullDayMinutes);
    const absentT = Number(absentThresholdMinutes);
    const lateArrivalT = Number(lateArrivalHalfDayMinutes);

    if (isNaN(halfDay) || halfDay <= 0) {
      setError("Half-day threshold minutes must be a positive number.");
      return;
    }
    if (isNaN(fullDay) || fullDay <= 0) {
      setError("Full-day minutes must be a positive number.");
      return;
    }
    if (fullDay <= halfDay) {
      setError("Full-day minutes must be strictly greater than half-day threshold minutes.");
      return;
    }
    if (isNaN(absentT) || absentT < 0) {
      setError("Absent threshold minutes must be a non-negative number.");
      return;
    }
    if (isNaN(lateArrivalT) || lateArrivalT < 0) {
      setError("Late arrival half-day threshold minutes must be a non-negative number.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        const payload: CreateShiftRequest = {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          startTime,
          endTime,
          gracePeriodMinutes: grace,
          graceLimitPerMonth: Number(graceLimitPerMonth) || 0,
          breakDurationMinutes: Number(breakDurationMinutes) || 0,
          halfDayThresholdMinutes: halfDay,
          fullDayMinutes: fullDay,
          absentThresholdMinutes: absentT,
          lateArrivalHalfDayMinutes: lateArrivalT,
          isDefault,
        };
        await createShift(payload);
      } else if (mode === "edit" && initialValues?._id) {
        const payload: UpdateShiftRequest = {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          startTime,
          endTime,
          gracePeriodMinutes: grace,
          graceLimitPerMonth: Number(graceLimitPerMonth) || 0,
          breakDurationMinutes: Number(breakDurationMinutes) || 0,
          halfDayThresholdMinutes: halfDay,
          fullDayMinutes: fullDay,
          absentThresholdMinutes: absentT,
          lateArrivalHalfDayMinutes: lateArrivalT,
          isDefault,
        };
        await updateShift(initialValues._id, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save shift details.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
          },
        },
        paper: {
          sx: {
            borderRadius: "20px",
            p: { xs: 2.5, sm: 3.5 },
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
            mx: { xs: 2, sm: "auto" },
            width: { xs: "calc(100% - 32px)", sm: "100%" },
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 0, mb: 2, fontWeight: 800, fontSize: { xs: "1.15rem", sm: "1.3rem" }, color: "#0F172A" }}>
        {mode === "create" ? "Create New Shift" : "Edit Shift Details"}
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Shift Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. General Shift"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Shift Code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value ?? "")}
              onBlur={() => setCode((prev) => prev.toUpperCase())}
              placeholder="e.g. GEN_SHIFT"
              disabled={mode === "edit"}
              slotProps={{ htmlInput: { style: { textTransform: "uppercase" } } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Start Time (HH:mm) *"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                autoUpdateThresholds(e.target.value, endTime, breakDurationMinutes);
              }}
              placeholder="09:00"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="End Time (HH:mm) *"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                autoUpdateThresholds(startTime, e.target.value, breakDurationMinutes);
              }}
              placeholder="18:00"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Grace Period (Minutes)"
              type="number"
              value={gracePeriodMinutes}
              onChange={(e) => setGracePeriodMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="15"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Grace Limit / Month (0 = Unlimited)"
              type="number"
              value={graceLimitPerMonth}
              onChange={(e) => setGraceLimitPerMonth(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0 for unlimited"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Break Duration (Minutes)"
              type="number"
              value={breakDurationMinutes}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Number(e.target.value);
                setBreakDurationMinutes(val);
                autoUpdateThresholds(startTime, endTime, val);
              }}
              placeholder="60"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Half-Day Threshold (Minutes) *"
              type="number"
              value={halfDayThresholdMinutes}
              onChange={(e) => setHalfDayThresholdMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="240"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Full-Day Threshold (Minutes) *"
              type="number"
              value={fullDayMinutes}
              onChange={(e) => setFullDayMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="480"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Absent Threshold (Minutes) *"
              type="number"
              value={absentThresholdMinutes}
              onChange={(e) => setAbsentThresholdMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="255"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Late Arrival Half-Day Threshold (Minutes) *"
              type="number"
              value={lateArrivalHalfDayMinutes}
              onChange={(e) => setLateArrivalHalfDayMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="90"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  sx={{ color: "#6366F1", "&.Mui-checked": { color: "#6366F1" } }}
                />
              }
              label="Set as default shift for new employees"
              sx={{ color: "#334155", fontWeight: 600 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 0, pb: 0, pt: 3, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            borderRadius: "12px",
            color: "#64748B",
            fontWeight: 600,
            textTransform: "none",
            px: 2.5,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          sx={{
            borderRadius: "12px",
            backgroundColor: "#6366F1",
            color: "#FFFFFF",
            fontWeight: 700,
            textTransform: "none",
            px: 3,
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
            "&:hover": { backgroundColor: "#4F46E5" },
          }}
        >
          {submitting ? (
            <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
          ) : mode === "create" ? (
            "Create Shift"
          ) : (
            "Save Shift"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ShiftFormDialog;

import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
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
  // 1. Basic Info
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // 2. Timings & Windows
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("19:30");
  const [checkInWindowStart, setCheckInWindowStart] = useState("08:00");
  const [checkInWindowEnd, setCheckInWindowEnd] = useState("10:00");
  const [allowedCheckInFromTime, setAllowedCheckInFromTime] = useState("08:00");
  const [earlyLeaveStartTime, setEarlyLeaveStartTime] = useState("18:00");

  // 3. Grace & Duration Thresholds
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState<number | "">(15);
  const [graceLimitPerMonth, setGraceLimitPerMonth] = useState<number | "">(3);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number | "">(60);
  const [halfDayThresholdMinutes, setHalfDayThresholdMinutes] = useState<number | "">(240);
  const [fullDayMinutes, setFullDayMinutes] = useState<number | "">(480);
  const [absentThresholdMinutes, setAbsentThresholdMinutes] = useState<number | "">(255);
  const [lateArrivalHalfDayMinutes, setLateArrivalHalfDayMinutes] = useState<number | "">(90);

  // 4. Cutoffs, Weights & Quotas
  const [firstHalfCutoffMinutes, setFirstHalfCutoffMinutes] = useState<number | "">(240);
  const [secondHalfCutoffMinutes, setSecondHalfCutoffMinutes] = useState<number | "">(210);
  const [minimumWorkMinutesForHalfDay, setMinimumWorkMinutesForHalfDay] = useState<number | "">(270);
  const [halfDayWeight, setHalfDayWeight] = useState<number | "">(0.5);
  const [lateArrivalQuotaPerMonth, setLateArrivalQuotaPerMonth] = useState<number | "">(3);
  const [earlyLeaveQuotaPerMonth, setEarlyLeaveQuotaPerMonth] = useState<number | "">(3);
  const [rejectEarlyPunch, setRejectEarlyPunch] = useState(true);

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
        setStartTime(initialValues.startTime || "10:00");
        setEndTime(initialValues.endTime || "19:30");
        setCheckInWindowStart(initialValues.checkInWindowStart || "08:00");
        setCheckInWindowEnd(initialValues.checkInWindowEnd || "10:00");
        setAllowedCheckInFromTime(initialValues.allowedCheckInFromTime || "08:00");
        setEarlyLeaveStartTime(initialValues.earlyLeaveStartTime || "18:00");

        setGracePeriodMinutes(initialValues.gracePeriodMinutes ?? 15);
        setGraceLimitPerMonth(initialValues.graceLimitPerMonth ?? 3);
        setBreakDurationMinutes(initialValues.breakDurationMinutes ?? 60);
        setHalfDayThresholdMinutes(initialValues.halfDayThresholdMinutes ?? 240);
        setFullDayMinutes(initialValues.fullDayMinutes ?? 480);
        setAbsentThresholdMinutes(initialValues.absentThresholdMinutes ?? 255);
        setLateArrivalHalfDayMinutes(initialValues.lateArrivalHalfDayMinutes ?? 90);

        setFirstHalfCutoffMinutes(initialValues.firstHalfCutoffMinutes ?? 240);
        setSecondHalfCutoffMinutes(initialValues.secondHalfCutoffMinutes ?? 210);
        setMinimumWorkMinutesForHalfDay(initialValues.minimumWorkMinutesForHalfDay ?? 270);
        setHalfDayWeight(initialValues.halfDayWeight ?? 0.5);
        setLateArrivalQuotaPerMonth(initialValues.lateArrivalQuotaPerMonth ?? 3);
        setEarlyLeaveQuotaPerMonth(initialValues.earlyLeaveQuotaPerMonth ?? 3);
        setRejectEarlyPunch(initialValues.rejectEarlyPunch ?? true);
        setIsDefault(initialValues.isDefault ?? false);
      } else {
        setName("");
        setCode("");
        setStartTime("10:00");
        setEndTime("19:30");
        setCheckInWindowStart("08:00");
        setCheckInWindowEnd("10:00");
        setAllowedCheckInFromTime("08:00");
        setEarlyLeaveStartTime("18:00");

        setGracePeriodMinutes(15);
        setGraceLimitPerMonth(3);
        setBreakDurationMinutes(60);
        setHalfDayThresholdMinutes(240);
        setFullDayMinutes(480);
        setAbsentThresholdMinutes(255);
        setLateArrivalHalfDayMinutes(90);

        setFirstHalfCutoffMinutes(240);
        setSecondHalfCutoffMinutes(210);
        setMinimumWorkMinutesForHalfDay(270);
        setHalfDayWeight(0.5);
        setLateArrivalQuotaPerMonth(3);
        setEarlyLeaveQuotaPerMonth(3);
        setRejectEarlyPunch(true);
        setIsDefault(false);
      }
    }
  }, [open, mode, initialValues]);

  const handleSubmit = async () => {
    setError(null);

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
      setError("Start time must be a valid time in HH:mm 24h format.");
      return;
    }
    if (!timeRegex.test(endTime)) {
      setError("End time must be a valid time in HH:mm 24h format.");
      return;
    }

    const grace = Number(gracePeriodMinutes);
    if (isNaN(grace) || grace < 0) {
      setError("Grace period minutes must be a non-negative number.");
      return;
    }

    const halfDay = Number(halfDayThresholdMinutes);
    const fullDay = Number(fullDayMinutes);
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

    setSubmitting(true);
    try {
      const payload: CreateShiftRequest = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        startTime,
        endTime,
        checkInWindowStart,
        checkInWindowEnd,
        allowedCheckInFromTime,
        earlyLeaveStartTime,
        gracePeriodMinutes: grace,
        graceLimitPerMonth: Number(graceLimitPerMonth) || 0,
        breakDurationMinutes: Number(breakDurationMinutes) || 0,
        halfDayThresholdMinutes: halfDay,
        fullDayMinutes: fullDay,
        absentThresholdMinutes: Number(absentThresholdMinutes) || 255,
        lateArrivalHalfDayMinutes: Number(lateArrivalHalfDayMinutes) || 90,
        firstHalfCutoffMinutes: Number(firstHalfCutoffMinutes) || 240,
        secondHalfCutoffMinutes: Number(secondHalfCutoffMinutes) || 210,
        minimumWorkMinutesForHalfDay: Number(minimumWorkMinutesForHalfDay) || 270,
        halfDayWeight: Number(halfDayWeight) || 0.5,
        lateArrivalQuotaPerMonth: Number(lateArrivalQuotaPerMonth) || 3,
        earlyLeaveQuotaPerMonth: Number(earlyLeaveQuotaPerMonth) || 3,
        rejectEarlyPunch,
        isDefault,
      };

      if (mode === "create") {
        await createShift(payload);
      } else if (mode === "edit" && initialValues?._id) {
        await updateShift(initialValues._id, payload as UpdateShiftRequest);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save shift details.";
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
            maxHeight: "90vh",
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 0, mb: 2, fontWeight: 800, fontSize: { xs: "1.15rem", sm: "1.3rem" }, color: "#0F172A" }}>
        {mode === "create" ? "Create Custom Shift" : "Edit Shift Configuration"}
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* ── 1. Basic Information ────────────────────────────────────────── */}
        <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "#4F46E5", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.78rem" }}>
          1. Basic Shift Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Shift Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. General Custom Shift"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Shift Code *"
              value={code}
              onChange={(e) => setCode(e.target.value ?? "")}
              onBlur={() => setCode((prev) => prev.toUpperCase())}
              placeholder="e.g. GEN_CUST"
              disabled={mode === "edit"}
              slotProps={{ htmlInput: { style: { textTransform: "uppercase" } } }}
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
              label="Set as default shift for new organization employees"
              sx={{ color: "#334155", fontWeight: 600 }}
            />
          </Grid>
        </Grid>

        <Divider />

        {/* ── 2. Timings & Windows ────────────────────────────────────────── */}
        <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "#4F46E5", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.78rem" }}>
          2. Shift Timings &amp; Check-in / Early Leave Windows
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Start Time (HH:mm) *"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                autoUpdateThresholds(e.target.value, endTime, breakDurationMinutes);
              }}
              placeholder="10:00"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="End Time (HH:mm) *"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                autoUpdateThresholds(startTime, e.target.value, breakDurationMinutes);
              }}
              placeholder="19:30"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Break Duration (Mins)"
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

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Check-In Window Start"
              value={checkInWindowStart}
              onChange={(e) => setCheckInWindowStart(e.target.value)}
              placeholder="08:00"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Check-In Window End"
              value={checkInWindowEnd}
              onChange={(e) => setCheckInWindowEnd(e.target.value)}
              placeholder="10:00"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Allowed Punch From Time"
              value={allowedCheckInFromTime}
              onChange={(e) => setAllowedCheckInFromTime(e.target.value)}
              placeholder="08:00"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Allowed Early Leave Start"
              value={earlyLeaveStartTime}
              onChange={(e) => setEarlyLeaveStartTime(e.target.value)}
              placeholder="18:00"
            />
          </Grid>
        </Grid>

        <Divider />

        {/* ── 3. Duration Thresholds & Cutoffs ───────────────────────────── */}
        <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "#4F46E5", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.78rem" }}>
          3. Work Duration Thresholds &amp; Cutoff Rules
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Grace Period (Minutes)"
              type="number"
              value={gracePeriodMinutes}
              onChange={(e) => setGracePeriodMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="15"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Grace Limit / Month"
              type="number"
              value={graceLimitPerMonth}
              onChange={(e) => setGraceLimitPerMonth(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="3"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Full-Day Work (Minutes)"
              type="number"
              value={fullDayMinutes}
              onChange={(e) => setFullDayMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="480"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Half-Day Work (Minutes)"
              type="number"
              value={halfDayThresholdMinutes}
              onChange={(e) => setHalfDayThresholdMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="240"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Min Half-Day Credit Floor"
              type="number"
              value={minimumWorkMinutesForHalfDay}
              onChange={(e) => setMinimumWorkMinutesForHalfDay(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="270"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextInput
              label="Half-Day Weight Multiplier"
              type="number"
              value={halfDayWeight}
              onChange={(e) => setHalfDayWeight(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0.5"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="First-Half Cutoff (Minutes)"
              type="number"
              value={firstHalfCutoffMinutes}
              onChange={(e) => setFirstHalfCutoffMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="240"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Second-Half Cutoff (Minutes)"
              type="number"
              value={secondHalfCutoffMinutes}
              onChange={(e) => setSecondHalfCutoffMinutes(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="210"
            />
          </Grid>
        </Grid>

        <Divider />

        {/* ── 4. Monthly Quotas & Punch Rules ────────────────────────────── */}
        <Typography variant="subtitle2" sx={{ fontWeight: 750, color: "#4F46E5", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.78rem" }}>
          4. Monthly Quotas &amp; Punch Constraints
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Late Arrival Quota / Month"
              type="number"
              value={lateArrivalQuotaPerMonth}
              onChange={(e) => setLateArrivalQuotaPerMonth(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="3"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              label="Early Leave Quota / Month"
              type="number"
              value={earlyLeaveQuotaPerMonth}
              onChange={(e) => setEarlyLeaveQuotaPerMonth(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="3"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rejectEarlyPunch}
                  onChange={(e) => setRejectEarlyPunch(e.target.checked)}
                  sx={{ color: "#6366F1", "&.Mui-checked": { color: "#6366F1" } }}
                />
              }
              label="Reject punches attempted before allowed check-in time"
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

import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import TextInput from "../../../components/input/TextInput";

import type {
  Shift,
  CreateRotationPlanRequest,
  CycleDuration,
  RotationSlot,
} from "../../../store/attendance/attendance.types";

type Props = {
  open: boolean;
  submitting: boolean;
  error: string | null;
  shifts: Shift[];
  onClose: () => void;
  onSubmit: (data: CreateRotationPlanRequest) => void;
};

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CYCLE_DURATIONS: CycleDuration[] = ["WEEKLY", "BIWEEKLY", "MONTHLY"];

export default function RotationPlanFormDialog({
  open,
  submitting,
  error,
  shifts,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cycleDuration, setCycleDuration] = useState<CycleDuration>("WEEKLY");
  const [slots, setSlots] = useState<Omit<RotationSlot, "order">[]>([
    { shiftId: "", offDays: ["Saturday", "Sunday"] },
    { shiftId: "", offDays: ["Saturday", "Sunday"] },
  ]);

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setCycleDuration("WEEKLY");
      setSlots([
        { shiftId: "", offDays: ["Saturday", "Sunday"] },
        { shiftId: "", offDays: ["Saturday", "Sunday"] },
      ]);
      setValidationError(null);
    }
  }, [open]);

  const handleAddSlot = () => {
    setSlots((prev) => [...prev, { shiftId: "", offDays: ["Saturday", "Sunday"] }]);
    setValidationError(null);
  };

  const handleRemoveSlot = (index: number) => {
    if (slots.length <= 2) {
      setValidationError("A rotation plan must contain at least 2 slots.");
      return;
    }
    setSlots((prev) => prev.filter((_, i) => i !== index));
    setValidationError(null);
  };

  const handleSlotShiftChange = (index: number, shiftId: string) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, shiftId } : slot))
    );
  };

  const handleSlotOffDayToggle = (index: number, day: string) => {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i !== index) return slot;
        const offDays = slot.offDays.includes(day)
          ? slot.offDays.filter((d) => d !== day)
          : [...slot.offDays, day];
        return { ...slot, offDays };
      })
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError("Rotation plan name is required.");
      return;
    }

    if (slots.some((slot) => !slot.shiftId)) {
      setValidationError("Please select a shift for every slot.");
      return;
    }

    const payload: CreateRotationPlanRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      cycleDuration,
      slots: slots.map((slot, index) => ({
        order: index + 1,
        shiftId: slot.shiftId,
        offDays: slot.offDays,
      })),
    };

    onSubmit(payload);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <Box component="form" onSubmit={handleFormSubmit}>
        <DialogTitle sx={{ p: 0, mb: 2, fontWeight: 800, fontSize: { xs: "1.15rem", sm: "1.3rem" }, color: "#0F172A" }}>
          Create Rotation Plan
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }}>
              {error || validationError}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Plan Details */}
            <Grid size={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6D5DF6", mb: 0.5 }}>
                Plan Details
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                required
                label="Plan Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. IT 24x7 Support Rotation"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                select
                label="Cycle Duration"
                value={cycleDuration}
                onChange={(e) => setCycleDuration(e.target.value as CycleDuration)}
              >
                {CYCLE_DURATIONS.map((dur) => (
                  <MenuItem key={dur} value={dur}>
                    {dur === "WEEKLY" ? "Weekly (Every 7 days)" : dur === "BIWEEKLY" ? "Bi-Weekly (Every 14 days)" : "Monthly (Every 30 days)"}
                  </MenuItem>
                ))}
              </TextInput>
            </Grid>

            <Grid size={12}>
              <TextInput
                multiline
                rows={2}
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the purpose of this rotation..."
              />
            </Grid>

            {/* Slots Configurations */}
            <Grid size={12} sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6D5DF6" }}>
                Rotation Slots Sequence
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={handleAddSlot}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: "#6D5DF6",
                  color: "#6D5DF6",
                  "&:hover": { borderColor: "#5B4BEA", backgroundColor: "rgba(109, 93, 246, 0.04)" }
                }}
              >
                Add Slot
              </Button>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {slots.map((slot, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.02)",
                      backgroundColor: "#FCFDFE",
                      position: "relative"
                    }}
                  >
                    <Grid container spacing={2} sx={{ alignItems: "center" }}>
                      {/* Slot Header */}
                      <Grid size={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827" }}>
                          Slot {index + 1}
                        </Typography>
                        {slots.length > 2 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveSlot(index)}
                            sx={{ p: 0.5 }}
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Grid>

                      {/* Shift Choice Selector */}
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextInput
                          select
                          required
                          label="Assigned Shift"
                          value={slot.shiftId}
                          onChange={(e) => handleSlotShiftChange(index, e.target.value)}
                        >
                          <MenuItem value="" disabled>
                            Select Shift
                          </MenuItem>
                          {shifts.map((shift) => (
                            <MenuItem key={shift._id} value={shift._id}>
                              {shift.name} ({shift.startTime} - {shift.endTime})
                            </MenuItem>
                          ))}
                        </TextInput>
                      </Grid>

                      {/* Rest Days Checklist */}
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
                          Rest Days (Off-duty)
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {WEEKDAYS.map((day) => {
                            const isChecked = slot.offDays.includes(day);
                            return (
                              <Box
                                key={day}
                                onClick={() => handleSlotOffDayToggle(index, day)}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  mr: 1.5
                                }}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  size="small"
                                  sx={{ p: 0.5, color: "#6D5DF6", "&.Mui-checked": { color: "#6D5DF6" } }}
                                />
                                <Typography variant="body2" sx={{ ml: 0.25, fontSize: 13, userSelect: "none", color: "#4B5563" }}>
                                  {day.substring(0, 3)}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button onClick={onClose} disabled={submitting} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              backgroundColor: "#6D5DF6",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 4,
              "&:hover": { backgroundColor: "#5B4BEA" }
            }}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            ) : null}
            Create Plan
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

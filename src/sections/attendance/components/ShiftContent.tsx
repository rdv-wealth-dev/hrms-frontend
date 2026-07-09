import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";

import { createShift, listShifts } from "../../../api/attendance.api";
import type { CreateShiftRequest, Shift } from "../../../store/attendance/attendance.types";
import { usePermissions } from "../../../hooks/usePermissions";

type ShiftFormProps = {
  open: boolean;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: CreateShiftRequest) => void;
};

function ShiftFormDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: ShiftFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [gracePeriod, setGracePeriod] = useState(15);
  const [graceLimit, setGraceLimit] = useState(0);
  const [halfDayThreshold, setHalfDayThreshold] = useState(240);
  const [fullDayMinutes, setFullDayMinutes] = useState(480);
  const [isDefault, setIsDefault] = useState(false);

  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const startMatch = startTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    const endMatch = endTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (startMatch && endMatch) {
      const startMins = parseInt(startMatch[1]) * 60 + parseInt(startMatch[2]);
      let endMins = parseInt(endMatch[1]) * 60 + parseInt(endMatch[2]);

      if (endMins < startMins) {
        endMins += 24 * 60; // Shift crosses midnight
      }

      const totalMins = endMins - startMins;
      const breakMins = totalMins >= 300 ? 60 : 0;
      const fullDay = Math.max(0, totalMins - breakMins);
      const halfDay = Math.round(fullDay / 2);

      setFullDayMinutes(fullDay);
      setHalfDayThreshold(halfDay);
    }
  }, [startTime, endTime]);

  const validateTime = (timeStr: string): boolean => {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr);
  };

  const handleFormSubmit = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Shift name is required";
    if (!code.trim()) errors.code = "Shift code is required";
    if (!validateTime(startTime)) errors.startTime = "Use HH:MM 24h format (e.g. 09:00)";
    if (!validateTime(endTime)) errors.endTime = "Use HH:MM 24h format (e.g. 18:00)";
    if (gracePeriod < 0) errors.gracePeriod = "Must be at least 0";
    if (graceLimit < 0) errors.graceLimit = "Must be at least 0";
    if (halfDayThreshold < 0) errors.halfDayThreshold = "Must be at least 0";
    if (fullDayMinutes < 0) errors.fullDayMinutes = "Must be at least 0";

    if (Object.keys(errors).length > 0) {
      setFormValidationErrors(errors);
      return;
    }

    setFormValidationErrors({});
    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      startTime,
      endTime,
      gracePeriodMinutes: gracePeriod,
      graceLimitPerMonth: graceLimit,
      halfDayThresholdMinutes: halfDayThreshold,
      fullDayMinutes: fullDayMinutes,
      isDefault,
    });
  };

  const handleClose = () => {
    setName("");
    setCode("");
    setStartTime("09:00");
    setEndTime("18:00");
    setGracePeriod(15);
    setGraceLimit(0);
    setHalfDayThreshold(240);
    setFullDayMinutes(480);
    setIsDefault(false);
    setFormValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create New Shift</DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          pt: "24px !important",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Shift Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
            placeholder="e.g. Morning Shift"
            required
            error={!!formValidationErrors.name}
            helperText={formValidationErrors.name}
          />
          <TextField
            label="Shift Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            size="small"
            placeholder="e.g. MS"
            required
            error={!!formValidationErrors.code}
            helperText={formValidationErrors.code}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Start Time (24h)"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            fullWidth
            size="small"
            placeholder="HH:MM (e.g. 09:00)"
            required
            error={!!formValidationErrors.startTime}
            helperText={formValidationErrors.startTime}
          />
          <TextField
            label="End Time (24h)"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            fullWidth
            size="small"
            placeholder="HH:MM (e.g. 18:00)"
            required
            error={!!formValidationErrors.endTime}
            helperText={formValidationErrors.endTime}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Grace Period (Mins)"
            type="number"
            value={gracePeriod}
            onChange={(e) => setGracePeriod(Number(e.target.value))}
            fullWidth
            size="small"
            error={!!formValidationErrors.gracePeriod}
            helperText={formValidationErrors.gracePeriod}
          />
          <TextField
            label="Grace Limit Per Month"
            type="number"
            value={graceLimit}
            onChange={(e) => setGraceLimit(Number(e.target.value))}
            fullWidth
            size="small"
            placeholder="0 = Unlimited"
            error={!!formValidationErrors.graceLimit}
            helperText={formValidationErrors.graceLimit || "Enter 0 for unlimited"}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Half Day Min (Mins)"
            type="number"
            value={halfDayThreshold}
            onChange={(e) => setHalfDayThreshold(Number(e.target.value))}
            fullWidth
            size="small"
            error={!!formValidationErrors.halfDayThreshold}
            helperText={formValidationErrors.halfDayThreshold}
          />
          <TextField
            label="Full Day Duration (Mins)"
            type="number"
            value={fullDayMinutes}
            onChange={(e) => setFullDayMinutes(Number(e.target.value))}
            fullWidth
            size="small"
            error={!!formValidationErrors.fullDayMinutes}
            helperText={formValidationErrors.fullDayMinutes}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              sx={{ color: "#6D5DF6", "&.Mui-checked": { color: "#6D5DF6" } }}
            />
          }
          label="Set as default shift for organization"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleFormSubmit}
          disabled={submitting}
          variant="contained"
          sx={{
            backgroundColor: "#6D5DF6",
            "&:hover": { backgroundColor: "#5B4BEA" },
          }}
        >
          {submitting ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            "Create Shift"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ShiftContent() {
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("attendance.read");
  const canCreate = hasPermission("attendance.create");

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadShiftsList = async () => {
    if (!canRead) return;
    setLoadingShifts(true);
    try {
      const response = await listShifts();
      if (response.succeeded && response.data) {
        setShifts(response.data);
      } else {
        setError(response.message || "Failed to load shifts");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to load shifts"
      );
    } finally {
      setLoadingShifts(false);
    }
  };

  useEffect(() => {
    loadShiftsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  const handleCreateSubmit = async (data: CreateShiftRequest) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await createShift(data);
      if (response.succeeded) {
        setSuccess(`Shift "${data.name}" created successfully!`);
        setCreateOpen(false);
        loadShiftsList();
      } else {
        setError(response.message || "Failed to create shift");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!canRead) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity="error">
          You do not have permission to view shifts.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ScheduleOutlinedIcon sx={{ fontSize: 32, color: "#6D5DF6" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              Shift Master
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure shift timings and rules for your organization
            </Typography>
          </Box>
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              setError(null);
              setSuccess(null);
              setCreateOpen(true);
            }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4BEA" },
            }}
          >
            Create Shift
          </Button>
        )}
      </Box>

      {/* Success/Error Alerts */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && !createOpen && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading / List Table */}
      {loadingShifts ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} sx={{ color: "#6D5DF6" }} />
        </Box>
      ) : shifts.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 2,
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#374151" }}>
            Shifts Setup
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ maxWidth: 360, mt: 0.5 }}
          >
            Click "Create Shift" to define shift timings, grace periods, and set
            up the default shift rules for attendance calculations.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Shift Details</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timings</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Grace Period</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Grace Limit / Month</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rules (Half/Full Day)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift._id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                        {shift.name}
                      </Typography>
                      {shift.isDefault && (
                        <Chip
                          label="Default"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.75rem",
                            backgroundColor: "#6D5DF6",
                            color: "#fff",
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={shift.code} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                  </TableCell>
                  <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                  <TableCell>{shift.gracePeriodMinutes} mins</TableCell>
                  <TableCell>
                    {shift.graceLimitPerMonth && shift.graceLimitPerMonth > 0
                      ? `${shift.graceLimitPerMonth} times`
                      : "Unlimited"}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      Half: {shift.halfDayThresholdMinutes}m / Full: {shift.fullDayMinutes}m
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={shift.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={shift.isActive ? "success" : "default"}
                      sx={{ height: 22, fontSize: "0.75rem", fontWeight: 500 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form Dialog */}
      <ShiftFormDialog
        open={createOpen}
        submitting={submitting}
        error={error}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </Box>
  );
}

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

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { createShift, listShifts, getShiftAssignments, listRotationPlans, createRotationPlan, assignRotationPlan } from "../../../api/attendance.api";
import type { CreateShiftRequest, Shift, ShiftAssignment, ShiftRotationPlan, CreateRotationPlanRequest, RotationSlot, AssignRotationPlanRequest } from "../../../store/attendance/attendance.types";
import { usePermissions } from "../../../hooks/usePermissions";
import RotationPlanFormDialog from "./RotationPlanFormDialog";
import AssignRotationPlanDialog from "./AssignRotationPlanDialog";

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

  const [activeTab, setActiveTab] = useState(0);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [rotationPlans, setRotationPlans] = useState<ShiftRotationPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [assignPlanOpen, setAssignPlanOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getSlotShiftName = (slot: RotationSlot): string => {
    if (!slot.shiftId) return "Shift";
    if (typeof slot.shiftId === "string") {
      return shifts.find((s) => s._id === slot.shiftId)?.name ?? "Shift";
    }
    return slot.shiftId.name || "Shift";
  };

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

  const loadAssignmentsList = async () => {
    if (!canRead) return;
    setLoadingAssignments(true);
    try {
      const response = await getShiftAssignments();
      if (response.succeeded && response.data) {
        setAssignments(response.data);
      } else {
        setError(response.message || "Failed to load shift assignments");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to load shift assignments"
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadRotationPlansList = async () => {
    if (!canRead) return;
    setLoadingPlans(true);
    try {
      const response = await listRotationPlans();
      if (response.succeeded && response.data) {
        setRotationPlans(response.data);
      } else {
        setError(response.message || "Failed to load rotation plans");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to load rotation plans"
      );
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      loadShiftsList();
    } else if (activeTab === 1) {
      loadAssignmentsList();
      loadRotationPlansList();
    } else if (activeTab === 2) {
      loadRotationPlansList();
      if (shifts.length === 0) {
        loadShiftsList();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead, activeTab]);

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

  const handleCreatePlanSubmit = async (data: CreateRotationPlanRequest) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await createRotationPlan(data);
      if (response.succeeded) {
        setSuccess(`Rotation plan "${data.name}" created successfully!`);
        setCreatePlanOpen(false);
        loadRotationPlansList();
      } else {
        setError(response.message || "Failed to create rotation plan");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignPlanSubmit = async (data: AssignRotationPlanRequest) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await assignRotationPlan(data);
      if (response.succeeded) {
        setSuccess(response.message || "Rotation plan assigned successfully!");
        setAssignPlanOpen(false);
        loadAssignmentsList();
      } else {
        setError(response.message || "Failed to assign rotation plan");
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
              if (activeTab === 2) {
                setCreatePlanOpen(true);
              } else if (activeTab === 1) {
                setAssignPlanOpen(true);
              } else {
                setCreateOpen(true);
              }
            }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              backgroundColor: "#6D5DF6",
              "&:hover": { backgroundColor: "#5B4BEA" },
            }}
          >
            {activeTab === 2
              ? "Create Rotation Plan"
              : activeTab === 1
              ? "Assign Rotation Plan"
              : "Create Shift"}
          </Button>
        )}
      </Box>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "14px" },
            "& .MuiTabs-indicator": { backgroundColor: "#6D5DF6" },
            "& .MuiTab-root.Mui-selected": { color: "#6D5DF6" }
          }}
        >
          <Tab label="Shifts List" />
          <Tab label="Employee Assignments" />
          <Tab label="Rotation Plans" />
        </Tabs>
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

      {/* Loading / List Content */}
      {activeTab === 0 && (
        loadingShifts ? (
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
        )
      )}

      {activeTab === 1 && (
        loadingAssignments ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : assignments.length === 0 ? (
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
              No Shift Assignments
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ maxWidth: 360, mt: 0.5 }}
            >
              No active shift assignments found for your employees. Update employee profiles or onboarding details to link shifts.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Assigned Shift</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Timings</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Assignment Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((row) => (
                  <TableRow key={row.employeeId} hover>
                    <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
                      {row.name}
                    </TableCell>
                    <TableCell>
                      <Chip label={row.employeeCode} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                    </TableCell>
                    <TableCell>{row.department || "-"}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {row.shift?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {row.shift?.startTime && row.shift?.endTime 
                        ? `${row.shift.startTime} - ${row.shift.endTime}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.isOverride ? "Override" : "Default"}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          borderRadius: "4px",
                          backgroundColor: row.isOverride 
                            ? "rgba(245, 158, 11, 0.08)" 
                            : "rgba(16, 185, 129, 0.08)",
                          color: row.isOverride ? "#F59E0B" : "#10B981",
                          border: row.isOverride 
                            ? "1px solid rgba(245, 158, 11, 0.2)" 
                            : "1px solid rgba(16, 185, 129, 0.2)",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {activeTab === 2 && (
        loadingPlans ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : rotationPlans.length === 0 ? (
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
              Rotation Plans Setup
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ maxWidth: 360, mt: 0.5 }}
            >
              Click "Create Rotation Plan" to define sequences of shifts (e.g. Morning, Evening, Night) and weekend off patterns for rotational schedules.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Desktop Table View */}
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 3, 
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", 
                overflow: "hidden",
                display: { xs: "none", md: "block" }
              }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Plan Details</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cycle Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Slots Sequence</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rotationPlans.map((plan) => (
                    <TableRow key={plan._id} hover>
                      <TableCell sx={{ verticalAlign: "top" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                          {plan.name}
                        </Typography>
                        {plan.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, maxWidth: 220 }}>
                            {plan.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ verticalAlign: "top" }}>
                        <Chip
                          label={plan.cycleDuration}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(109, 93, 246, 0.08)",
                            color: "#6D5DF6",
                            fontWeight: 600,
                            fontSize: "0.75rem"
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ verticalAlign: "top" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {plan.slots.map((slot) => {
                            return (
                              <Box key={slot.order} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Chip label={`Slot ${slot.order}`} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }} />
                                <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                                  {getSlotShiftName(slot)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({slot.offDays.length > 0 ? `${slot.offDays.join(", ")} Off` : "No Off Days"})
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: "top" }}>
                        <Chip
                          label={plan.isActive ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            backgroundColor: plan.isActive ? "rgba(16, 185, 129, 0.08)" : "rgba(107, 114, 128, 0.08)",
                            color: plan.isActive ? "#10B981" : "#6B7280",
                            border: plan.isActive ? "1px solid rgba(16, 185, 129, 0.15)" : "1px solid rgba(107, 114, 128, 0.15)"
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile Cards Stack View */}
            <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 2 }}>
              {rotationPlans.map((plan) => (
                <Box
                  key={plan._id}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.02)"
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827" }}>
                      {plan.name}
                    </Typography>
                    <Chip
                      label={plan.cycleDuration}
                      size="small"
                      sx={{
                        height: 20,
                        backgroundColor: "rgba(109, 93, 246, 0.08)",
                        color: "#6D5DF6",
                        fontWeight: 600,
                        fontSize: "0.7rem"
                      }}
                    />
                  </Box>

                  {plan.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mb: 2 }}>
                      {plan.description}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, backgroundColor: "#F9FAFB", p: 1.5, borderRadius: 2, border: "1px solid rgba(0,0,0,0.03)" }}>
                    {plan.slots.map((slot) => {
                      return (
                        <Box key={slot.order} sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.5 }}>
                          <Chip label={`Slot ${slot.order}`} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600 }} />
                          <Typography variant="body2" sx={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>
                            {getSlotShiftName(slot)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11.5 }}>
                            ({slot.offDays.length > 0 ? `${slot.offDays.join(", ")} Off` : "No Off Days"})
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, pt: 1.5, borderTop: "1px solid rgba(0, 0, 0, 0.06)" }}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={plan.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        backgroundColor: plan.isActive ? "rgba(16, 185, 129, 0.08)" : "rgba(107, 114, 128, 0.08)",
                        color: plan.isActive ? "#10B981" : "#6B7280",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )
      )}

      {/* Form Dialog */}
      <ShiftFormDialog
        open={createOpen}
        submitting={submitting}
        error={error}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Rotation Plan Form Dialog */}
      <RotationPlanFormDialog
        open={createPlanOpen}
        submitting={submitting}
        error={error}
        shifts={shifts}
        onClose={() => setCreatePlanOpen(false)}
        onSubmit={handleCreatePlanSubmit}
      />

      {/* Assign Rotation Plan Dialog */}
      <AssignRotationPlanDialog
        open={assignPlanOpen}
        submitting={submitting}
        error={error}
        rotationPlans={rotationPlans}
        onClose={() => setAssignPlanOpen(false)}
        onSubmit={handleAssignPlanSubmit}
      />
    </Box>
  );
}

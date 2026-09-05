import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
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
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import { listShifts, getShiftAssignments, listRotationPlans, createRotationPlan, assignRotationPlan } from "../../../api/attendance.api";
import type { Shift, ShiftAssignment, ShiftRotationPlan, CreateRotationPlanRequest, RotationSlot, AssignRotationPlanRequest } from "../../../store/attendance/attendance.types";
import { usePermissions } from "../../../hooks/usePermissions";
import ShiftFormDialog from "./ShiftFormDialog";
import RotationPlanFormDialog from "./RotationPlanFormDialog";
import AssignRotationPlanDialog from "./AssignRotationPlanDialog";
import DeleteShiftDialog from "./DeleteShiftDialog";

export default function ShiftContent() {
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("attendance.read");
  const canCreate = hasPermission("attendance.create");
  const canUpdate = hasPermission("attendance.update");

  const [activeTab, setActiveTab] = useState(0);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [rotationPlans, setRotationPlans] = useState<ShiftRotationPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [assignPlanOpen, setAssignPlanOpen] = useState(false);

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState<"create" | "edit">("create");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const [deleteShiftOpen, setDeleteShiftOpen] = useState(false);
  const [deleteTargetShift, setDeleteTargetShift] = useState<Shift | null>(null);

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

  const handleOpenCreateShift = () => {
    setError(null);
    setSuccess(null);
    setShiftModalMode("create");
    setSelectedShift(null);
    setShiftModalOpen(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setError(null);
    setSuccess(null);
    setShiftModalMode("edit");
    setSelectedShift(shift);
    setShiftModalOpen(true);
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
          <ScheduleOutlinedIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
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
                handleOpenCreateShift();
              }
            }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
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

      {/* Tabs Navigation (Outer Sub-Nav Responsive Pattern) */}
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab ?? 0}
            onChange={(_, newValue) => setActiveTab?.(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            slots={{
              startScrollButtonIcon: ChevronLeftRoundedIcon,
              endScrollButtonIcon: ChevronRightRoundedIcon,
            }}
            sx={{
              minHeight: 44,

              "& .MuiTabs-scroller": {
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              },

              "& .MuiTabs-list": {
                alignItems: "stretch",
              },

              // Chevron buttons matching outer navigation
              "& .MuiTabScrollButton-root": {
                flexShrink: 0,
                width: 28,
                minWidth: 28,
                color: "primary.main",
                opacity: 0.9,
                transition: "all 0.2s ease",

                "&.Mui-disabled": {
                  opacity: 0.25,
                },

                "&:hover": {
                  backgroundColor: "primary.lighter",
                },
              },

              // Tab Styling (Auto content fit without truncation, smooth scroll chevrons)
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: {
                  xs: "13px",
                  md: "14px",
                },
                fontWeight: 600,
                minHeight: 44,
                boxSizing: "border-box",
                flexShrink: 0,
                minWidth: "auto",
                width: "auto",
                px: {
                  xs: 2,
                  sm: 2.5,
                },
                py: 1,
                color: "#64748B",
                whiteSpace: "nowrap",

                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: 700,
                },
              },

              "& .MuiTabs-indicator": {
                backgroundColor: "primary.main",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab label="Shifts List" />
            <Tab label="Shift Assignments" />
            <Tab label="Rotation Plans" />
          </Tabs>
        </Paper>
      </Box>

      {/* Success/Error Alerts */}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && !shiftModalOpen && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading / List Content */}
      {activeTab === 0 && (
        loadingShifts ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} sx={{ color: "primary.main" }} />
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
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
          >
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
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                          {shift.name}
                        </Typography>
                        {shift.isDefault && (
                          <Chip
                            label="Default"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.75rem",
                              backgroundColor: "primary.main",
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
                    <TableCell align="right">
                      {canUpdate && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                          <Tooltip title="Edit Shift">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditShift(shift)}
                              sx={{ color: "#64748B", "&:hover": { color: "primary.main", backgroundColor: "primary.lighter" } }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={shift.isDefault ? "Cannot delete default shift" : "Delete Shift"}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={shift.isDefault}
                                onClick={() => {
                                  setDeleteTargetShift(shift);
                                  setDeleteShiftOpen(true);
                                }}
                                sx={{ color: "#64748B", "&:hover": { color: "#DC2626", backgroundColor: "#FEE2E2" } }}
                              >
                                <DeleteOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      )}
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
            <CircularProgress size={36} sx={{ color: "primary.main" }} />
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
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
          >
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
                    <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
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
            <CircularProgress size={36} sx={{ color: "primary.main" }} />
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
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
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
                            backgroundColor: "primary.lighter",
                            color: "primary.main",
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
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                      {plan.name}
                    </Typography>
                    <Chip
                      label={plan.cycleDuration}
                      size="small"
                      sx={{
                        height: 20,
                        backgroundColor: "primary.lighter",
                        color: "primary.main",
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

      {/* Reusable Shift Form Dialog (Create / Edit) */}
      <ShiftFormDialog
        open={shiftModalOpen}
        mode={shiftModalMode}
        initialValues={selectedShift}
        onClose={() => setShiftModalOpen(false)}
        onSuccess={() => {
          setSuccess(shiftModalMode === "create" ? "Shift created successfully!" : "Shift updated successfully!");
          loadShiftsList();
        }}
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

      {/* Delete Shift Dialog */}
      <DeleteShiftDialog
        open={deleteShiftOpen}
        onClose={() => setDeleteShiftOpen(false)}
        shift={deleteTargetShift}
        onSuccess={async () => {
          setSuccess("Shift deleted successfully!");
          await loadShiftsList();
        }}
        showSnackbar={(msg) => setSuccess(msg)}
      />
    </Box>
  );
}

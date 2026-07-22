import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";

import AddIcon from "@mui/icons-material/Add";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { usePermissions } from "../../../hooks/usePermissions";
import { useDialog } from "../../../hooks/useDialog";
import { useSubmitSuccess } from "../../../hooks/useSubmitSuccess";
import {
  listLeaveTypesRequest,
  createLeaveTypeRequest,
  resetLeaveStatus,
} from "../../../store/leave";
import type { LeaveType, CreateLeaveTypeRequest } from "../../../api/leave.api";
import { createLeaveTypeSchema } from "../../../validations/leave/create-leave-type.schema";

// ============================================================
// Create Leave Type Form Dialog
// ============================================================

interface LeaveFormProps {
  open: boolean;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: CreateLeaveTypeRequest) => void;
}

function LeaveTypeFormDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: LeaveFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [annualQuota, setAnnualQuota] = useState(12);
  const [accrualFrequency, setAccrualFrequency] = useState<"MONTHLY" | "YEARLY" | "NONE">("NONE");
  const [accrualAmountPerCycle, setAccrualAmountPerCycle] = useState(0);
  const [maxCarryForwardDays, setMaxCarryForwardDays] = useState(0);
  const [maxConsecutiveDays, setMaxConsecutiveDays] = useState(0);
  const [advanceNoticeDays, setAdvanceNoticeDays] = useState(0);
  const [approvalLevels, setApprovalLevels] = useState(1);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Switches
  const [isPaid, setIsPaid] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [allowNegativeBalance, setAllowNegativeBalance] = useState(false);
  const [probationEligible, setProbationEligible] = useState(true);
  const [applySandwichPolicy, setApplySandwichPolicy] = useState(false);

  useEffect(() => {
    if (open) {
      setFormErrors({});
      setName("");
      setCode("");
      setDescription("");
      setAnnualQuota(12);
      setAccrualFrequency("NONE");
      setAccrualAmountPerCycle(0);
      setMaxCarryForwardDays(0);
      setMaxConsecutiveDays(0);
      setAdvanceNoticeDays(0);
      setApprovalLevels(1);
      setIsPaid(true);
      setRequiresApproval(true);
      setAllowNegativeBalance(false);
      setProbationEligible(true);
      setApplySandwichPolicy(false);
    }
  }, [open]);

  const handleSubmit = () => {
    const data: CreateLeaveTypeRequest = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      isPaid,
      annualQuota,
      accrualFrequency,
      accrualAmountPerCycle,
      maxCarryForwardDays,
      maxConsecutiveDays,
      advanceNoticeDays,
      requiresApproval,
      approvalLevels,
      allowNegativeBalance,
      probationEligible,
      applySandwichPolicy,
    };

    const result = createLeaveTypeSchema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create Leave Type</DialogTitle>

      <DialogContent sx={{ pt: "16px !important" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column: General Information */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary" }}>
              General Information
            </Typography>

            <TextField
              label="Leave Type Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. Casual Leave"
              required
            />

            <TextField
              label="Leave Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. CL"
              required
              slotProps={{ htmlInput: { maxLength: 10 } }}
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="Brief description of this leave policy"
            />

            <TextField
              label="Annual Quota (Days)"
              type="number"
              value={annualQuota}
              onChange={(e) => setAnnualQuota(Math.max(0, parseInt(e.target.value) || 0))}
              error={!!formErrors.annualQuota}
              helperText={formErrors.annualQuota}
              fullWidth
              size="small"
              required
              sx={{
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                "& input[type=number]": { MozAppearance: "textfield" },
              }}
            />

            <TextField
              select
              label="Accrual Frequency"
              value={accrualFrequency}
              onChange={(e) => {
                const val = e.target.value as "MONTHLY" | "YEARLY" | "NONE";
                setAccrualFrequency(val);
                if (val === "NONE") setAccrualAmountPerCycle(0);
              }}
              fullWidth
              size="small"
            >
              <MenuItem value="NONE">No Accrual (Credited upfront)</MenuItem>
              <MenuItem value="MONTHLY">Monthly</MenuItem>
              <MenuItem value="YEARLY">Yearly</MenuItem>
            </TextField>

            {accrualFrequency !== "NONE" && (
              <TextField
                label="Accrual Amount Per Cycle"
                type="number"
                value={accrualAmountPerCycle}
                onChange={(e) => setAccrualAmountPerCycle(Math.max(0, parseFloat(e.target.value) || 0))}
                error={!!formErrors.accrualAmountPerCycle}
                helperText={formErrors.accrualAmountPerCycle}
                fullWidth
                size="small"
                sx={{
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                  "& input[type=number]": { MozAppearance: "textfield" },
                }}
              />
            )}
          </Grid>

          {/* Right Column: Policies & Rules */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.secondary" }}>
              Leave Policies & Thresholds
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Max Carry Forward (Days)"
                  type="number"
                  value={maxCarryForwardDays}
                  onChange={(e) => setMaxCarryForwardDays(Math.max(0, parseInt(e.target.value) || 0))}
                  error={!!formErrors.maxCarryForwardDays}
                  helperText={formErrors.maxCarryForwardDays}
                  fullWidth
                  size="small"
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                    "& input[type=number]": { MozAppearance: "textfield" },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Max Consecutive Days"
                  type="number"
                  value={maxConsecutiveDays}
                  onChange={(e) => setMaxConsecutiveDays(Math.max(0, parseInt(e.target.value) || 0))}
                  error={!!formErrors.maxConsecutiveDays}
                  helperText={formErrors.maxConsecutiveDays}
                  fullWidth
                  size="small"
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                    "& input[type=number]": { MozAppearance: "textfield" },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Advance Notice (Days)"
                  type="number"
                  value={advanceNoticeDays}
                  onChange={(e) => setAdvanceNoticeDays(Math.max(0, parseInt(e.target.value) || 0))}
                  error={!!formErrors.advanceNoticeDays}
                  helperText={formErrors.advanceNoticeDays}
                  fullWidth
                  size="small"
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                    "& input[type=number]": { MozAppearance: "textfield" },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Approval Levels"
                  type="number"
                  value={approvalLevels}
                  onChange={(e) => setApprovalLevels(Math.min(3, Math.max(1, parseInt(e.target.value) || 1)))}
                  error={!!formErrors.approvalLevels}
                  helperText={formErrors.approvalLevels}
                  fullWidth
                  size="small"
                  slotProps={{ htmlInput: { min: 1, max: 3 } }}
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                    "& input[type=number]": { MozAppearance: "textfield" },
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
              <FormControlLabel
                control={<Switch checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Is Paid Leave</Typography>
                    <Typography variant="caption" color="text.secondary">Deducts pay if false</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Requires Approval</Typography>
                    <Typography variant="caption" color="text.secondary">Must be approved by supervisors</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={allowNegativeBalance} onChange={(e) => setAllowNegativeBalance(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Allow Negative Balance</Typography>
                    <Typography variant="caption" color="text.secondary">Allows applying beyond available quota</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={probationEligible} onChange={(e) => setProbationEligible(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Probation Eligible</Typography>
                    <Typography variant="caption" color="text.secondary">Can be requested during probation periods</Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={applySandwichPolicy} onChange={(e) => setApplySandwichPolicy(e.target.checked)} color="primary" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Apply Sandwich Policy</Typography>
                    <Typography variant="caption" color="text.secondary">Counts intervening weekends/holidays as leave</Typography>
                  </Box>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || !code.trim()}
          variant="contained"
          sx={{
            backgroundColor: "#6D5DF6",
            "&:hover": { backgroundColor: "#5B4EE4" },
            fontWeight: 600,
            px: 3,
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================
// Main LeaveTypeContent Layout Component
// ============================================================

export default function LeaveTypeContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("leave.create");

  const { leaveTypes, loading, submitting, success, error } = useSelector(
    (state: RootState) => state.leave ?? { leaveTypes: [], loading: false, submitting: false, success: false, error: null }
  );

  const formDialog = useDialog<any>();

  // Fetch list on mount
  useEffect(() => {
    dispatch(listLeaveTypesRequest());
  }, [dispatch]);

  // Handle success auto-close
  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: () => {
      formDialog.close();
      dispatch(listLeaveTypesRequest());
    },
  });

  const handleOpenCreate = () => {
    dispatch(resetLeaveStatus());
    formDialog.open();
  };

  const handleCreateSubmit = (data: CreateLeaveTypeRequest) => {
    dispatch(createLeaveTypeRequest(data));
  };

  return (
    <>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PolicyOutlinedIcon sx={{ fontSize: 36, color: "#6D5DF6" }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Leave Types
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Manage and configure your organization's leave policies
              </Typography>
            </Box>
          </Box>

          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                backgroundColor: "#6D5DF6",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { backgroundColor: "#5B4EE4" },
              }}
            >
              Add Leave Type
            </Button>
          )}
        </Box>

        {/* Content Section */}
        {loading && leaveTypes.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : error && !formDialog.isOpen ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : leaveTypes.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed rgba(224, 224, 224, 1)",
              boxShadow: "none",
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Leave Types Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Leave types represent policies like Annual Leave, Casual Leave, or Sick Leave.
            </Typography>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                sx={{
                  backgroundColor: "#6D5DF6",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#5B4EE4" },
                }}
              >
                Create Your First Leave Type
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", border: "1px solid rgba(224, 224, 224, 0.8)" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quota (Days)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Accrual Frequency</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Paid Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Approval Levels</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveTypes.map((type: LeaveType) => (
                  <TableRow key={type._id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{type.name}</TableCell>
                    <TableCell>
                      <Chip label={type.code} size="small" sx={{ fontWeight: 600, backgroundColor: "#E0F2FE", color: "#0369A1", borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell>{type.annualQuota} Days</TableCell>
                    <TableCell>
                      {type.accrualFrequency === "NONE" ? "Upfront Credit" : type.accrualFrequency}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={type.isPaid ? "Paid" : "Unpaid"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: type.isPaid ? "#ECFDF5" : "#FEF2F2",
                          color: type.isPaid ? "#047857" : "#B91C1C",
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>
                    <TableCell>{type.approvalLevels} Level(s)</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Leave Type Form Dialog */}
      <LeaveTypeFormDialog
        open={formDialog.isOpen}
        submitting={submitting}
        error={error}
        onClose={formDialog.close}
        onSubmit={handleCreateSubmit}
      />
    </>
  );
}

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import AddIcon from "@mui/icons-material/Add";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { useDialog } from "../../../hooks/useDialog";
import { useSubmitSuccess } from "../../../hooks/useSubmitSuccess";
import {
  getMyLeaveBalancesRequest,
  listLeaveTypesRequest,
  applyLeaveRequest,
  resetLeaveStatus,
} from "../../../store/leave";
import type { LeaveBalance, LeaveType, CreateLeaveRequest } from "../../../api/leave.api";

// ============================================================
// Apply Leave Form Dialog Component
// ============================================================

interface ApplyLeaveDialogProps {
  open: boolean;
  submitting: boolean;
  error: string | null;
  balances: LeaveBalance[];
  leaveTypes: LeaveType[];
  onClose: () => void;
  onSubmit: (data: CreateLeaveRequest) => void;
}

function ApplyLeaveDialog({
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
      setLeaveTypeId(balances[0]?.leaveTypeId || "");
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

  const getLeaveTypeName = (id: string) => {
    const type = leaveTypes.find((t) => t._id === id);
    return type ? `${type.name} (${type.code})` : "Other Leave";
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
          {balances.map((b) => (
            <MenuItem key={b._id} value={b.leaveTypeId}>
              {getLeaveTypeName(b.leaveTypeId)} — Balance: {b.available}
            </MenuItem>
          ))}
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

// ============================================================
// Main LeaveDashboardView Component
// ============================================================

export default function LeaveDashboardView() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const {
    balances = [],
    leaveTypes = [],
    loading,
    loadingBalances,
    submitting,
    success,
    error,
  } = useSelector((state: RootState) => state.leave ?? {
    balances: [],
    leaveTypes: [],
    loading: false,
    loadingBalances: false,
    submitting: false,
    success: false,
    error: null,
  });

  const applyDialog = useDialog<any>();

  // Fetch balances for selected year and load leave types on mount/year changes
  useEffect(() => {
    dispatch(getMyLeaveBalancesRequest(selectedYear));
    dispatch(listLeaveTypesRequest());
  }, [dispatch, selectedYear]);

  // Handle success auto-close and reload balances
  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: () => {
      applyDialog.close();
      dispatch(getMyLeaveBalancesRequest(selectedYear));
    },
  });

  const handleOpenApply = () => {
    dispatch(resetLeaveStatus());
    applyDialog.open();
  };

  const handleApplySubmit = (data: CreateLeaveRequest) => {
    dispatch(applyLeaveRequest(data));
  };

  const getLeaveTypeInfo = (leaveTypeId: string): LeaveType | undefined => {
    return leaveTypes.find((type: LeaveType) => type._id === leaveTypeId);
  };

  const isDataLoading = loadingBalances || (loading && leaveTypes.length === 0);

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
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
                My Leaves
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                View your leave balances and request leaves
              </Typography>
            </Box>
          </Box>

          {balances.length > 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenApply}
              sx={{
                backgroundColor: "#6D5DF6",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { backgroundColor: "#5B4EE4" },
              }}
            >
              Apply Leave
            </Button>
          )}
        </Box>

        {/* Year Filter Selector */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Year:
          </Typography>
          <TextField
            select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
            size="small"
            sx={{ width: 120 }}
          >
            <MenuItem value={2024}>2024</MenuItem>
            <MenuItem value={2025}>2025</MenuItem>
            <MenuItem value={2026}>2026</MenuItem>
            <MenuItem value={2027}>2027</MenuItem>
            <MenuItem value={2028}>2028</MenuItem>
          </TextField>
        </Box>

        {/* Main Content Layout */}
        {isDataLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : error && !applyDialog.isOpen ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : balances.length === 0 ? (
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
              No Leave Balances Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no leave policies assigned to your profile for the year {selectedYear}.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {balances.map((balance: LeaveBalance) => {
              const typeInfo = getLeaveTypeInfo(balance.leaveTypeId);
              const name = typeInfo?.name ?? "Other Leave";
              const code = typeInfo?.code ?? "OL";
              const isPaid = typeInfo?.isPaid ?? true;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={balance._id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                      border: "1px solid rgba(224, 224, 224, 0.8)",
                      overflow: "hidden",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.08)",
                      },
                    }}
                  >
                    {/* Top Accent Strip */}
                    <Box
                      sx={{
                        height: 6,
                        backgroundColor: isPaid ? "#10B981" : "#EF4444",
                      }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      {/* Card Header */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, pr: 1 }} noWrap>
                          {name}
                        </Typography>
                        <Chip
                          label={code}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            backgroundColor: "#E0F2FE",
                            color: "#0369A1",
                            borderRadius: 1,
                          }}
                        />
                      </Box>

                      {/* Main Stat Block */}
                      <Box sx={{ my: 3 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: "#6D5DF6", display: "inline-block" }}>
                          {balance.available}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            display: "inline-block",
                            ml: 1,
                            fontWeight: 600,
                            color: "text.secondary",
                          }}
                        >
                          {balance.available === 1 ? "Day" : "Days"} Available
                        </Typography>
                      </Box>

                      {/* Breakdown Stats */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 1.5,
                          pt: 2.5,
                          borderTop: "1px solid rgba(224, 224, 224, 0.5)",
                        }}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            Allocated
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                            {balance.allocated}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            Used
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5, color: "#EF4444" }}>
                            {balance.used}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            Pending
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5, color: "#F59E0B" }}>
                            {balance.pending}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Apply Leave Dialog */}
      <ApplyLeaveDialog
        open={applyDialog.isOpen}
        submitting={submitting}
        error={error}
        balances={balances}
        leaveTypes={leaveTypes}
        onClose={applyDialog.close}
        onSubmit={handleApplySubmit}
      />
    </DashboardLayout>
  );
}

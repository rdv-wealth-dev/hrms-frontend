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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

import AddIcon from "@mui/icons-material/Add";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { useDialog } from "../../../hooks/useDialog";
import { useSubmitSuccess } from "../../../hooks/useSubmitSuccess";
import { usePagination } from "../../../hooks/usePagination";
import {
  getMyLeaveBalancesRequest,
  listLeaveTypesRequest,
  applyLeaveRequest,
  resetLeaveStatus,
  getMyLeaveRequestsRequest,
} from "../../../store/leave";
import type { LeaveBalance, LeaveType, CreateLeaveRequest, LeaveRequest } from "../../../api/leave.api";

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
  const [tabValue, setTabValue] = useState(0);

  const {
    balances = [],
    leaveTypes = [],
    myRequests = [],
    totalMyRecords = 0,
    loading,
    loadingBalances,
    submitting,
    success,
    error,
  } = useSelector((state: RootState) => state.leave ?? {
    balances: [],
    leaveTypes: [],
    myRequests: [],
    totalMyRecords: 0,
    loading: false,
    loadingBalances: false,
    submitting: false,
    success: false,
    error: null,
  });

  const applyDialog = useDialog<any>();
  const detailDialog = useDialog<LeaveRequest>();
  const { pageNumber, pageSize, handlePageChange, handleRowsPerPageChange } =
    usePagination({ initialPageSize: 10 });

  // Fetch balances and requests when tabs, pages, or options change
  useEffect(() => {
    if (tabValue === 0) {
      dispatch(getMyLeaveBalancesRequest(selectedYear));
      dispatch(listLeaveTypesRequest());
    } else {
      dispatch(getMyLeaveRequestsRequest({ pageNumber, pageSize }));
    }
  }, [dispatch, selectedYear, tabValue, pageNumber, pageSize]);

  // Handle success auto-close and reload balances
  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: () => {
      applyDialog.close();
      if (tabValue === 0) {
        dispatch(getMyLeaveBalancesRequest(selectedYear));
      } else {
        dispatch(getMyLeaveRequestsRequest({ pageNumber, pageSize }));
      }
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

  const formatDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString(navigator.language, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return dateStr;
    }
  };

  const getLeaveStatusChip = (status: string) => {
    let color = "#F59E0B";
    let bg = "rgba(245, 158, 11, 0.08)";
    let border = "1px solid rgba(245, 158, 11, 0.15)";
    let label = "Pending";

    if (status === "APPROVED") {
      color = "#10B981";
      bg = "rgba(16, 185, 129, 0.08)";
      border = "1px solid rgba(16, 185, 129, 0.15)";
      label = "Approved";
    } else if (status === "REJECTED") {
      color = "#EF4444";
      bg = "rgba(239, 68, 68, 0.08)";
      border = "1px solid rgba(239, 68, 68, 0.15)";
      label = "Rejected";
    } else if (status === "CANCELLED") {
      color = "#6B7280";
      bg = "rgba(107, 114, 128, 0.08)";
      border = "1px solid rgba(107, 114, 128, 0.15)";
      label = "Cancelled";
    }

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: "0.75rem",
          color,
          backgroundColor: bg,
          border,
        }}
      />
    );
  };

  const isDataLoading = loadingBalances || (loading && leaveTypes.length === 0 && tabValue === 0) || (loading && tabValue === 1);

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
            mb: 3,
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
        </Box>

        {/* Tab Selection */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            mb: 3,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            "& .MuiTabs-indicator": { backgroundColor: "#6D5DF6" },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "#6B7280",
              "&.Mui-selected": { color: "#6D5DF6" },
            },
          }}
        >
          <Tab label="Leave Balances" />
          <Tab label="My Requests" />
        </Tabs>

        {/* Tab 0: Leave Balances View */}
        {tabValue === 0 && (
          <Box>
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
        )}

        {/* Tab 1: Leave Requests Table List */}
        {tabValue === 1 && (
          <Box>
            {isDataLoading && myRequests.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#6D5DF6" }} />
              </Box>
            ) : error && !applyDialog.isOpen ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : myRequests.length === 0 ? (
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
                  No Leave Requests Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You have not submitted any leave requests yet.
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", border: "1px solid rgba(224, 224, 224, 0.8)", overflow: "hidden" }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total Days</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myRequests.map((request: LeaveRequest) => {
                        const typeName = request.leaveTypeId?.name ?? "Other Leave";
                        const typeCode = request.leaveTypeId?.code ?? "OL";

                        return (
                          <TableRow key={request._id} hover>
                            {/* Leave Type */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Chip
                                  label={typeCode}
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    backgroundColor: "#E0F2FE",
                                    color: "#0369A1",
                                    borderRadius: 1,
                                  }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {typeName}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Duration */}
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {formatDate(request.fromDate)}
                              </Typography>
                              {request.fromDate !== request.toDate && (
                                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                  to {formatDate(request.toDate)}
                                </Typography>
                              )}
                            </TableCell>

                            {/* Total Days */}
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {request.totalDays} {request.totalDays === 1 ? "Day" : "Days"}
                              </Typography>
                            </TableCell>

                            {/* Reason */}
                            <TableCell sx={{ maxWidth: 220 }}>
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ display: "block", textOverflow: "ellipsis" }} title={request.reason}>
                                {request.reason || "—"}
                              </Typography>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              {getLeaveStatusChip(request.status)}
                            </TableCell>

                            {/* Details Action */}
                            <TableCell sx={{ textAlign: "center" }}>
                              <IconButton
                                size="small"
                                onClick={() => detailDialog.open(request)}
                                sx={{ color: "#6D5DF6", "&:hover": { backgroundColor: "rgba(109, 93, 246, 0.08)" } }}
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 20]}
                  component="div"
                  count={totalMyRecords}
                  rowsPerPage={pageSize}
                  page={pageNumber - 1}
                  onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
                  onRowsPerPageChange={(e) => handleRowsPerPageChange(parseInt(e.target.value, 10))}
                />
              </Paper>
            )}
          </Box>
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

      {/* Request Details Dialog */}
      <Dialog
        open={detailDialog.isOpen}
        onClose={detailDialog.close}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            Leave Request Details
          </Typography>
          <IconButton onClick={detailDialog.close} size="small" sx={{ color: "#9CA3AF" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)", py: 2.5 }}>
          {detailDialog.target && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Leave Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                    {detailDialog.target.leaveTypeId?.name || "Other Leave"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Duration
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                    {formatDate(detailDialog.target.fromDate)}
                    {detailDialog.target.fromDate !== detailDialog.target.toDate && ` to ${formatDate(detailDialog.target.toDate)}`}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Total Days
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                    {detailDialog.target.totalDays} {detailDialog.target.totalDays === 1 ? "Day" : "Days"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                    Status
                  </Typography>
                  {getLeaveStatusChip(detailDialog.target.status)}
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Reason
                </Typography>
                <Typography variant="body2" sx={{ color: "#374151", mt: 0.5 }}>
                  {detailDialog.target.reason || "—"}
                </Typography>
              </Box>

              {detailDialog.target.approvals && detailDialog.target.approvals.length > 0 && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#374151" }}>
                    Approval Details
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {detailDialog.target.approvals.map((approval, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                            Level {approval.level} Reviewer
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                            Role: {approval.approverRole}
                          </Typography>
                          {approval.comments && (
                            <Typography variant="body2" sx={{ fontStyle: "italic", mt: 1, color: "#4B5563" }}>
                              "{approval.comments}"
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Chip
                            label={approval.status}
                            size="small"
                            color={approval.status === "APPROVED" ? "success" : approval.status === "REJECTED" ? "error" : "warning"}
                            sx={{ fontWeight: 600, fontSize: "0.7rem", height: 20 }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button
            onClick={detailDialog.close}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#4B5563",
              borderRadius: 2,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

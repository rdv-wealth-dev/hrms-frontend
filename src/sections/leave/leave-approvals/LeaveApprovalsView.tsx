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
import TablePagination from "@mui/material/TablePagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextInput from "../../../components/input/TextInput";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { usePagination } from "../../../hooks/usePagination";
import { useSubmitSuccess } from "../../../hooks/useSubmitSuccess";
import { useDialog } from "../../../hooks/useDialog";
import { formatDate } from "../../../utils/format-date";
import {
  getPendingLeaveRequestsRequest,
  reviewLeaveRequestRequest,
} from "../../../store/leave";
import type { LeaveRequest } from "../../../api/leave.api";

export default function LeaveApprovalsView() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    pendingRequests = [],
    totalPendingRecords = 0,
    leaveTypes = [],
    loading,
    submitting,
    success,
    error,
  } = useSelector((state: RootState) => state.leave ?? {
    pendingRequests: [],
    totalPendingRecords: 0,
    leaveTypes: [],
    loading: false,
    submitting: false,
    success: false,
    error: null,
  });

  const { pageNumber, pageSize, handlePageChange, handleRowsPerPageChange } =
    usePagination({ initialPageSize: 10 });

  const [reviewComments, setReviewComments] = useState("");
  const reviewDialog = useDialog<{ id: string; status: "APPROVED" | "REJECTED" }>();

  const getLeaveTypeName = (leaveTypeId: string | { _id?: string; name?: string; code?: string } | undefined): string => {
    if (!leaveTypeId) return "Other Leave";
    if (typeof leaveTypeId === "string") {
      const type = leaveTypes.find((t) => t._id === leaveTypeId);
      return type?.name ?? "Other Leave";
    }
    return leaveTypeId.name || "Other Leave";
  };

  const getLeaveTypeCode = (leaveTypeId: string | { _id?: string; name?: string; code?: string } | undefined): string => {
    if (!leaveTypeId) return "OL";
    if (typeof leaveTypeId === "string") {
      const type = leaveTypes.find((t) => t._id === leaveTypeId);
      return type?.code ?? "OL";
    }
    return leaveTypeId.code || "OL";
  };

  // Fetch pending requests when page/pageSize changes
  useEffect(() => {
    dispatch(
      getPendingLeaveRequestsRequest({
        pageNumber,
        pageSize,
      })
    );
  }, [dispatch, pageNumber, pageSize]);

  // Handle auto-refresh and modal close on successful approval/rejection
  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: () => {
      reviewDialog.close();
      dispatch(
        getPendingLeaveRequestsRequest({
          pageNumber,
          pageSize,
        })
      );
    },
  });

  useEffect(() => {
    if (reviewDialog.isOpen) {
      setReviewComments("");
    }
  }, [reviewDialog.isOpen]);

  const handleOpenReview = (id: string, status: "APPROVED" | "REJECTED") => {
    reviewDialog.open({ id, status });
  };

  const handleConfirmReview = () => {
    const target = reviewDialog.target;
    if (target) {
      dispatch(
        reviewLeaveRequestRequest({
          id: target.id,
          status: target.status,
          reviewComments: reviewComments.trim() || undefined,
        })
      );
    }
  };

  return (
    <>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
          <PolicyOutlinedIcon sx={{ fontSize: 36, color: "#6D5DF6" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Leave Approvals
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Review and process employee leave applications
            </Typography>
          </Box>
        </Box>

        {/* Global Action Errors */}
        {error && !reviewDialog.isOpen && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* List Content */}
        {loading && pendingRequests.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : pendingRequests.length === 0 ? (
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
              No Pending Leave Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Excellent! There are no employee leave applications awaiting your review.
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 3, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", border: "1px solid rgba(224, 224, 224, 0.8)", overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Days</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((request: LeaveRequest) => {
                    const empName = request.employeeId
                      ? `${request.employeeId.firstName} ${request.employeeId.lastName}`
                      : "Unknown Employee";
                    const empCode = request.employeeId?.employeeCode || "—";
                    const typeName = getLeaveTypeName(request.leaveTypeId);
                    const typeCode = getLeaveTypeCode(request.leaveTypeId);

                    return (
                      <TableRow key={request._id} hover>
                        {/* Employee */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                            {empName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            ID: {empCode}
                          </Typography>
                        </TableCell>

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
                            <Typography variant="body2">{typeName}</Typography>
                          </Box>
                        </TableCell>

                        {/* Duration */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatDate(request.fromDate, { treatAsDateOnly: true })}
                          </Typography>
                          {request.fromDate !== request.toDate && (
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                              to {formatDate(request.toDate, { treatAsDateOnly: true })}
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

                        {/* Actions */}
                        <TableCell sx={{ textAlign: "right" }}>
                          <Box sx={{ display: "inline-flex", gap: 1.5 }}>
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleOpenReview(request._id, "APPROVED")}
                              disabled={submitting}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderColor: "#10B981",
                                color: "#10B981",
                                "&:hover": {
                                  borderColor: "#059669",
                                  backgroundColor: "rgba(16, 185, 129, 0.05)",
                                },
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => handleOpenReview(request._id, "REJECTED")}
                              disabled={submitting}
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderColor: "#EF4444",
                                color: "#EF4444",
                                "&:hover": {
                                  borderColor: "#DC2626",
                                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                                },
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
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
              count={totalPendingRecords}
              rowsPerPage={pageSize}
              page={pageNumber - 1}
              onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
              onRowsPerPageChange={(e) => handleRowsPerPageChange(parseInt(e.target.value, 10))}
            />
          </Paper>
        )}
      </Box>

      {/* Review Request Comments Modal */}
      <Dialog
        open={reviewDialog.isOpen}
        onClose={reviewDialog.close}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {reviewDialog.target?.status === "APPROVED" ? "Approve Leave Request" : "Reject Leave Request"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {error && reviewDialog.isOpen && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to {reviewDialog.target?.status === "APPROVED" ? "approve" : "reject"} this leave request? You can add review comments below.
          </Typography>
          <TextInput
            label="Review Comments"
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            multiline
            rows={3}
            placeholder="Add comments or notes..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={reviewDialog.close} disabled={submitting} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReview}
            disabled={submitting}
            variant="contained"
            color={reviewDialog.target?.status === "APPROVED" ? "success" : "error"}
            sx={{
              fontWeight: 600,
              px: 3,
            }}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : reviewDialog.target?.status === "APPROVED" ? (
              "Confirm Approve"
            ) : (
              "Confirm Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

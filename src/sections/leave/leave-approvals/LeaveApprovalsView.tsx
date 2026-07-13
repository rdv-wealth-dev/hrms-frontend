import { useEffect } from "react";
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

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { usePagination } from "../../../hooks/usePagination";
import { useSubmitSuccess } from "../../../hooks/useSubmitSuccess";
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
    loading,
    submitting,
    success,
    error,
  } = useSelector((state: RootState) => state.leave ?? {
    pendingRequests: [],
    totalPendingRecords: 0,
    loading: false,
    submitting: false,
    success: false,
    error: null,
  });

  const { pageNumber, pageSize, handlePageChange, handleRowsPerPageChange } =
    usePagination({ initialPageSize: 10 });

  // Fetch pending requests when page/pageSize changes
  useEffect(() => {
    dispatch(
      getPendingLeaveRequestsRequest({
        pageNumber,
        pageSize,
      })
    );
  }, [dispatch, pageNumber, pageSize]);

  // Handle auto-refresh on successful approval/rejection
  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: () => {
      dispatch(
        getPendingLeaveRequestsRequest({
          pageNumber,
          pageSize,
        })
      );
    },
  });

  const handleAction = (id: string, status: "APPROVED" | "REJECTED") => {
    dispatch(reviewLeaveRequestRequest({ id, status }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout>
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
        {error && (
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
                    const typeName = request.leaveTypeId?.name ?? "Other Leave";
                    const typeCode = request.leaveTypeId?.code ?? "OL";

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

                        {/* Actions */}
                        <TableCell sx={{ textAlign: "right" }}>
                          <Box sx={{ display: "inline-flex", gap: 1.5 }}>
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleAction(request._id, "APPROVED")}
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
                              onClick={() => handleAction(request._id, "REJECTED")}
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
    </DashboardLayout>
  );
}

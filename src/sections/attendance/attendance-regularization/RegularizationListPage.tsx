import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import DashboardLayout from "../../../layouts/dashboard/DashboardLayout";
import { getPendingRegularizationRequests } from "../../../api/attendance.api";
import { listEmployees } from "../../../api/employee.api";
import type { RegularizationRequest } from "../../../store/attendance/attendance.types";
import type { EmployeeListItem } from "../../../store/employee/employee.types";
import ReviewRegularizationDialog from "./components/ReviewRegularizationDialog";

function RegularizationListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [employeesList, setEmployeesList] = useState<EmployeeListItem[]>([]);

  // Dialog State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RegularizationRequest | null>(null);

  const loadData = useCallback(async (isInitial = true) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      // Load both pending regularizations and employees in parallel
      const [regRes, empRes] = await Promise.all([
        getPendingRegularizationRequests(),
        listEmployees(1, 1000), // Get first 1000 employees for mapping
      ]);

      let fetchedRequests: RegularizationRequest[] = [];

      if (Array.isArray(regRes)) {
        fetchedRequests = regRes;
      } else if (regRes && Array.isArray((regRes as any).data)) {
        fetchedRequests = (regRes as any).data;
      } else if (regRes && Array.isArray((regRes as any).items)) {
        fetchedRequests = (regRes as any).items;
      } else if (regRes && Array.isArray((regRes as any).data?.items)) {
        fetchedRequests = (regRes as any).data.items;
      } else if (regRes && Array.isArray((regRes as any).regularizations)) {
        fetchedRequests = (regRes as any).regularizations;
      } else if (regRes && Array.isArray((regRes as any).requests)) {
        fetchedRequests = (regRes as any).requests;
      }

      setRequests(fetchedRequests);

      if (empRes.succeeded && empRes.data) {
        setEmployeesList(empRes.data);
      }
    } catch (err: any) {
      if (isInitial) {
        setError(
          err.response?.data?.message || err.message || "Something went wrong while fetching data"
        );
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);

    // Auto-poll every 15s to automatically show incoming requests
    const interval = setInterval(() => {
      loadData(false);
    }, 15000);

    // Auto-refetch when window regains focus
    const handleFocus = () => loadData(false);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadData]);

  const getEmployeeName = (empId: string) => {
    const emp = employeesList.find((e) => e._id === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Employee";
  };

  const getEmployeeCode = (empId: string) => {
    const emp = employeesList.find((e) => e._id === empId);
    return emp ? emp.employeeCode : "—";
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString(undefined, {
          dateStyle: "medium",
        });
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
        {/* Page Header */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              Attendance Regularizations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Review and approve daily punch corrections submitted by employees.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => loadData(true)}
            startIcon={<RefreshIcon />}
            sx={{
              borderRadius: "10px",
              borderColor: "#CBD5E1",
              color: "#374151",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { borderColor: "#6D5DF6", color: "#6D5DF6", backgroundColor: "#F5F3FF" },
            }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Content Section */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#6D5DF6" }} />
          </Box>
        ) : requests.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
              backgroundColor: "#fff",
              borderRadius: 4,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              border: "1px solid #F3F4F6",
            }}
          >
            <HistoryEduOutlinedIcon sx={{ fontSize: 56, color: "#D1D5DB", mb: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#374151" }}>
              All Caught Up!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 300, textAlign: "center" }}>
              There are no pending regularization requests requiring your review.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F3F4F6", overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Requested Check In</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Requested Check Out</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 13 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                          {getEmployeeName(request.employeeId)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getEmployeeCode(request.employeeId)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{formatDate(request.attendanceDate)}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>
                      {formatTime(request.requestedCheckIn)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>
                      {formatTime(request.requestedCheckOut)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={request.reason}>
                      {request.reason}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Pending"
                        size="small"
                        sx={{
                          backgroundColor: "#FEF3C7",
                          color: "#D97706",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<RateReviewOutlinedIcon />}
                        onClick={() => {
                          setSelectedRequest(request);
                          setReviewOpen(true);
                        }}
                        sx={{
                          color: "#6D5DF6",
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": { backgroundColor: "rgba(109, 93, 246, 0.04)" },
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Review Dialog */}
        <ReviewRegularizationDialog
          open={reviewOpen}
          request={selectedRequest}
          employeeName={selectedRequest ? getEmployeeName(selectedRequest.employeeId) : ""}
          employeeCode={selectedRequest ? getEmployeeCode(selectedRequest.employeeId) : ""}
          onClose={() => {
            setReviewOpen(false);
            setSelectedRequest(null);
          }}
          onSuccess={loadData}
        />
      </Box>
    </DashboardLayout>
  );
}

export default RegularizationListPage;

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
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
import Avatar from "@mui/material/Avatar";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import { useSelector } from "react-redux";
import type { RootState } from "../../../store/rootReducer";
import { usePermissions } from "../../../hooks/usePermissions";
import { getPendingRegularizationRequests, getMyRegularizationRequests } from "../../../api/attendance.api";
import { listEmployees } from "../../../api/employee.api";
import type { RegularizationRequest } from "../../../store/attendance/attendance.types";
import type { EmployeeListItem } from "../../../store/employee/employee.types";
import ReviewRegularizationDialog from "./components/ReviewRegularizationDialog";

function RegularizationListPage() {
  const { role } = usePermissions();
  const isEmployee = role === "EMPLOYEE";
  const user = useSelector((state: RootState) => state.auth?.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [employeesList, setEmployeesList] = useState<EmployeeListItem[]>([]);

  // Dialog State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RegularizationRequest | null>(null);

  const getStatusChipStyles = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") {
      return { label: "Approved", bg: "#D1FAE5", text: "#047857" };
    }
    if (s === "REJECTED") {
      return { label: "Rejected", bg: "#FEE2E2", text: "#B91C1C" };
    }
    return { label: "Pending", bg: "#FEF3C7", text: "#D97706" };
  };

  const loadData = useCallback(async (isInitial = true) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      let fetchedRequests: RegularizationRequest[] = [];

      if (isEmployee) {
        // Load personal regularization requests
        const regRes = await getMyRegularizationRequests();
        if (regRes.succeeded && regRes.data) {
          fetchedRequests = regRes.data;
        } else {
          setError(regRes.message || "Failed to fetch regularization requests");
        }
      } else {
        // Load both pending regularizations and employees in parallel
        const [regRes, empRes] = await Promise.all([
          getPendingRegularizationRequests(),
          listEmployees(1, 1000), // Get first 1000 employees for mapping
        ]);

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

        if (empRes.succeeded && empRes.data) {
          setEmployeesList(empRes.data);
        }
      }

      setRequests(fetchedRequests);
    } catch (err: any) {
      if (isInitial) {
        setError(
          err.response?.data?.message || err.message || "Something went wrong while fetching data"
        );
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [isEmployee]);

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

  const getEmployeeAvatar = (empId: string) => {
    const emp = employeesList.find((e) => e._id === empId);
    return (emp as any)?.avatarUrl || (emp as any)?.avatar || (emp as any)?.profilePicture || undefined;
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
    <>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: "1200px", margin: "0 auto" }}>
        {/* Page Header */}
        <Box
          sx={{
            mb: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              Attendance Regularizations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isEmployee
                ? "View and track your daily punch correction requests."
                : "Review and approve daily punch corrections submitted by employees."}
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
              alignSelf: { xs: "stretch", sm: "auto" },
              justifyContent: "center",
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
              py: { xs: 6, sm: 10 },
              px: 2,
              backgroundColor: "#fff",
              borderRadius: 4,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              border: "1px solid #F3F4F6",
            }}
          >
            <HistoryEduOutlinedIcon sx={{ fontSize: 56, color: "#D1D5DB", mb: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#374151" }}>
              {isEmployee ? "No Regularization Requests" : "All Caught Up!"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 300, textAlign: "center" }}>
              {isEmployee
                ? "You have not submitted any attendance regularization requests."
                : "There are no pending regularization requests requiring your review."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: "100%" }}>
            {/* Mobile Card View (xs < 600px) */}
            <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 2 }}>
              {requests.map((request) => {
                const empName = isEmployee
                  ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "My Profile"
                  : getEmployeeName(request.employeeId);
                const empCode = isEmployee
                  ? (user as any)?.employeeCode || user?.employeeId || "—"
                  : getEmployeeCode(request.employeeId);
                const empAvatar = isEmployee
                  ? user?.avatarUrl || (user as any)?.profilePicture || undefined
                  : getEmployeeAvatar(request.employeeId);
                const initials = empName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "E";

                return (
                  <Card
                    key={request._id}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    {/* Card Header: Employee Info & Status */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          src={empAvatar}
                          sx={{
                            width: 38,
                            height: 38,
                            backgroundColor: "#6D5DF6",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                            {empName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {empCode} • {formatDate(request.attendanceDate)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={getStatusChipStyles(request.status).label}
                        size="small"
                        sx={{
                          backgroundColor: getStatusChipStyles(request.status).bg,
                          color: getStatusChipStyles(request.status).text,
                          fontWeight: 700,
                          fontSize: 10,
                          height: 22,
                        }}
                      />
                    </Box>

                    {/* Requested Timings Banner */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #F1F5F9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-around",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                          Check In
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>
                          {formatTime(request.requestedCheckIn)}
                        </Typography>
                      </Box>
                      <Box sx={{ width: "1px", minWidth: "1px", height: 24, backgroundColor: "#CBD5E1" }} />
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                          Check Out
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>
                          {formatTime(request.requestedCheckOut)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Reason */}
                    {request.reason && (
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8", mt: 0.2 }} />
                        <Typography variant="caption" sx={{ color: "#475569", fontWeight: 500 }}>
                          <strong>Reason:</strong> {request.reason}
                        </Typography>
                      </Box>
                    )}

                    {/* Review Button Action / Requested On details */}
                      {isEmployee ? (
                        <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", pt: 1.5 }}>
                          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                            Requested On
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1F2937" }}>
                            {formatDate(request.createdAt)}
                          </Typography>
                        </Box>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<RateReviewOutlinedIcon />}
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewOpen(true);
                          }}
                          sx={{
                            mt: 0.5,
                            backgroundColor: "#6D5DF6",
                            color: "#FFFFFF",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#5B4EB3", boxShadow: "none" },
                          }}
                        >
                          Review Request
                        </Button>
                      )}
                  </Card>
                );
              })}
            </Box>

            {/* Desktop & Tablet Table View (sm+) */}
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                display: { xs: "none", sm: "block" },
                borderRadius: 4,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                border: "1px solid #F3F4F6",
                overflowX: "auto",
                maxWidth: "100%",
                scrollbarWidth: "thin",
                scrollbarColor: "#CBD5E1 transparent",
                "&::-webkit-scrollbar": { height: "6px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "#CBD5E1", borderRadius: "10px" },
              }}
            >
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, minWidth: 160 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, minWidth: 120 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, minWidth: 140 }}>Requested Check In</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, minWidth: 140 }}>Requested Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, minWidth: 160 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 13, minWidth: 100 }}>Status</TableCell>
                    {isEmployee ? (
                        <TableCell sx={{ fontWeight: 600, fontSize: 13, minWidth: 120 }}>Requested On</TableCell>
                      ) : (
                        <TableCell sx={{ fontWeight: 600, fontSize: 13, minWidth: 100 }} align="center">Action</TableCell>
                      )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => {
                      const empName = isEmployee
                        ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "My Profile"
                        : getEmployeeName(request.employeeId);
                      const empCode = isEmployee
                        ? (user as any)?.employeeCode || user?.employeeId || "—"
                        : getEmployeeCode(request.employeeId);
                      const empAvatar = isEmployee
                        ? user?.avatarUrl || (user as any)?.profilePicture || undefined
                        : getEmployeeAvatar(request.employeeId);
                      const initials = empName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "E";

                      return (
                        <TableRow key={request._id} hover sx={{ "&:last-child td": { border: 0 } }}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                src={empAvatar}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  backgroundColor: "#6D5DF6",
                                  color: "#FFFFFF",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                }}
                              >
                                {initials}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
                                  {empName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {empCode}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap" }}>{formatDate(request.attendanceDate)}</TableCell>
                          <TableCell sx={{ fontSize: 13, color: "#059669", fontWeight: 500, whiteSpace: "nowrap" }}>
                            {formatTime(request.requestedCheckIn)}
                          </TableCell>
                          <TableCell sx={{ fontSize: 13, color: "#059669", fontWeight: 500, whiteSpace: "nowrap" }}>
                            {formatTime(request.requestedCheckOut)}
                          </TableCell>
                          <TableCell sx={{ fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={request.reason}>
                            {request.reason}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusChipStyles(request.status).label}
                              size="small"
                              sx={{
                                backgroundColor: getStatusChipStyles(request.status).bg,
                                color: getStatusChipStyles(request.status).text,
                                fontWeight: 600,
                                fontSize: 11,
                              }}
                            />
                          </TableCell>
                          {isEmployee ? (
                            <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
                              {formatDate(request.createdAt)}
                            </TableCell>
                          ) : (
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
                          )}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
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
    </>
  );
}

export default RegularizationListPage;

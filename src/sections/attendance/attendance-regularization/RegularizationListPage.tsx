import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

import PageHeader from "../../../components/common/PageHeader";
import { VirtualizedTable } from "../../../components/table";

const AVATAR_COLORS = ["#4F46E5", "#D97706", "#059669", "#0284C7", "#7C3AED", "#DB2777"];

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
      <Box sx={{ p: { xs: 2, md: 3 }, width: "100%" }}>
        {/* Unified Enterprise Page Header */}
        <PageHeader
          icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 26, color: "primary.main" }} />}
          title="Attendance Regularizations"
          action={
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
                "&:hover": { borderColor: "primary.main", color: "primary.main", backgroundColor: "primary.lighter" },
              }}
            >
              Refresh
            </Button>
          }
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Content Section */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "primary.main" }} />
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
                            backgroundColor: "primary.main",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                            {empName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(request.attendanceDate)}
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
                            backgroundColor: "primary.main",
                            color: "#FFFFFF",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "primary.dark", boxShadow: "none" },
                          }}
                        >
                          Review Request
                        </Button>
                      )}
                  </Card>
                );
              })}
            </Box>

            {/* Desktop & Tablet Virtualized Table View (sm+) */}
            <Box sx={{ display: { xs: "none", sm: "block" }, width: "100%" }}>
              <VirtualizedTable<RegularizationRequest>
                data={requests}
                loading={loading}
                maxHeight="none"
                minWidth={800}
                estimateRowHeight={58}
                rowKey={(request, idx) => request._id || `reg-${idx}`}
                columns={[
                  {
                    id: "employee",
                    header: "EMPLOYEE",
                    minWidth: 180,
                    sticky: "left",
                    cell: (request, idx) => {
                      const empName = isEmployee
                        ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "My Profile"
                        : getEmployeeName(request.employeeId);
                      const empAvatar = isEmployee
                        ? user?.avatarUrl || (user as any)?.profilePicture || undefined
                        : getEmployeeAvatar(request.employeeId);
                      const initials = empName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "E";
                      const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                      return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={empAvatar}
                            sx={{
                              width: 34,
                              height: 34,
                              fontSize: "12px",
                              fontWeight: 700,
                              backgroundColor: avatarBg,
                              color: "#FFFFFF",
                            }}
                          >
                            {initials}
                          </Avatar>
                          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}>
                            {empName}
                          </Typography>
                        </Box>
                      );
                    },
                  },
                  {
                    id: "attendanceDate",
                    header: "ATTENDANCE DATE",
                    minWidth: 140,
                    cell: (request) => (
                      <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>
                        {formatDate(request.attendanceDate)}
                      </Typography>
                    ),
                  },
                  {
                    id: "requestedCheckIn",
                    header: "REQUESTED CHECK IN",
                    minWidth: 140,
                    cell: (request) => (
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#059669" }}>
                        {formatTime(request.requestedCheckIn)}
                      </Typography>
                    ),
                  },
                  {
                    id: "requestedCheckOut",
                    header: "REQUESTED CHECK OUT",
                    minWidth: 140,
                    cell: (request) => (
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#059669" }}>
                        {formatTime(request.requestedCheckOut)}
                      </Typography>
                    ),
                  },
                  {
                    id: "reason",
                    header: "REASON",
                    minWidth: 160,
                    cell: (request) => (
                      <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#475569", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }} title={request.reason}>
                        {request.reason || "—"}
                      </Typography>
                    ),
                  },
                  {
                    id: "status",
                    header: "STATUS",
                    minWidth: 110,
                    cell: (request) => (
                      <Chip
                        label={getStatusChipStyles(request.status).label}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: "11px",
                          fontWeight: 700,
                          borderRadius: "12px",
                          backgroundColor: getStatusChipStyles(request.status).bg,
                          color: getStatusChipStyles(request.status).text,
                          px: 0.5,
                        }}
                      />
                    ),
                  },
                  {
                    id: "actions",
                    header: isEmployee ? "REQUESTED ON" : "ACTIONS",
                    minWidth: 120,
                    align: "center",
                    sticky: "right",
                    cell: (request) => {
                      const isPending = (request?.status || "").toUpperCase() === "PENDING";
                      return isEmployee ? (
                        <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>
                          {formatDate(request.createdAt)}
                        </Typography>
                      ) : (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                          <Tooltip title={isPending ? "Review Request" : "View Details"}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setReviewOpen(true);
                              }}
                              sx={{
                                color: isPending ? "#4F46E5" : "#64748B",
                                backgroundColor: isPending ? "#EEF2FF" : "#F1F5F9",
                                "&:hover": { backgroundColor: isPending ? "#E0E7FF" : "action.hover" },
                              }}
                            >
                              {isPending ? <RateReviewOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      );
                    },
                  },
                ]}
              />
            </Box>
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

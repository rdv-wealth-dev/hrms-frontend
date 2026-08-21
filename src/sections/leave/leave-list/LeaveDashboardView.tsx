import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { listEmployees } from "../../../api/employee.api";
import type { EmployeeListItem } from "../../../store/employee/employee.types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import AddIcon from "@mui/icons-material/Add";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useSnackbar } from "../../../components/snackbar";
import { usePermissions } from "../../../hooks/usePermissions";

import type { AppDispatch } from "../../../store/store";
import type { RootState } from "../../../store/rootReducer";
import { useDialog } from "../../../hooks/useDialog";
import { useSubmitSuccess } from "../../../hooks/useSubmitSuccess";
import { usePagination } from "../../../hooks/usePagination";
import { useProfileBlockDetect } from "../../../hooks/useProfileBlockDetect";
import { paths } from "../../../routes/paths";
import {
  getMyLeaveBalancesRequest,
  listLeaveTypesRequest,
  applyLeaveRequest,
  resetLeaveStatus,
  getMyLeaveRequestsRequest,
  getPendingLeaveRequestsRequest,
  getMyCompOffBalancesRequest,
} from "../../../store/leave";
import { reviewLeaveRequest, getLeaveReport, type CreateLeaveRequest, type LeaveRequest } from "../../../api/leave.api";
import ApplyLeaveDialog from "../leave-apply/ApplyLeaveDialog";
import LeaveBalancesGrid from "../leave-balance/LeaveBalancesGrid";
import LeaveTab from "../../profile/components/LeaveTab";

// Custom Sub-components for Redesign
import LeaveKpiCards from "../components/LeaveKpiCards";
import LeaveRequestsTable from "../components/LeaveRequestsTable";
import LeaveCalendarView from "../components/LeaveCalendarView";
import LeavePolicyView from "../components/LeavePolicyView";

// Real live team leave requests handled dynamically via Redux & backend APIs

// ============================================================
// Detail Dialog Component
// ============================================================
function LeaveDetailDialog({
  open,
  request,
  onClose,
}: {
  open: boolean;
  request: LeaveRequest | null;
  onClose: () => void;
}) {
  if (!request) return null;
  const empName = `${request?.employeeId?.firstName ?? ""} ${request?.employeeId?.lastName ?? ""}`.trim() || "Employee";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px", p: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem" }}>Leave Request Details</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: "12px !important" }}>
        <Box>
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>EMPLOYEE</Typography>
          <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>{empName}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>LEAVE TYPE</Typography>
          <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>{request?.leaveTypeId?.name || "Leave"}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>PERIOD</Typography>
          <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>
            {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()} ({request.totalDays || 1} day(s))
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>REASON</Typography>
          <Typography sx={{ color: "#334155", fontSize: "14px" }}>{request.reason || "No reason provided."}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>STATUS</Typography>
          <Typography sx={{ fontWeight: 700, color: request.status === "APPROVED" ? "#16A34A" : request.status === "REJECTED" ? "#DC2626" : "#D97706" }}>
            {request.status}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained" sx={{ backgroundColor: "#4F46E5", textTransform: "none", borderRadius: "10px" }}>
          Close
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
  const { showSnackbar } = useSnackbar();
  const [selectedYear] = useState<number>(new Date().getFullYear());
  const [tabValue, setTabValue] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [orgEmployees, setOrgEmployees] = useState<EmployeeListItem[]>([]);
  const [loadingOrgEmployees, setLoadingOrgEmployees] = useState(true);
  const [orgLeaveRequests, setOrgLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loadingOrgRequests, setLoadingOrgRequests] = useState(false);
  const navigate = useNavigate();

  const { role, isSuperAdmin, hasPermission } = usePermissions();
  const isOrgAdmin = role === "ORG_ADMIN" || isSuperAdmin;
  const isEmployeeRole = role === "EMPLOYEE" || (!isSuperAdmin && !hasPermission("leave.approve") && !hasPermission("leave.read"));
  const user = useSelector((state: RootState) => state.auth?.user);

  const canReadEmployees = isOrgAdmin || hasPermission("employee.read");
  const canReadLeaves = isOrgAdmin || hasPermission("leave.read");
  const canApproveLeaves = isOrgAdmin || hasPermission("leave.approve");

  useEffect(() => {
    let isMounted = true;
    if (canReadEmployees) {
      setLoadingOrgEmployees(true);
      listEmployees(1, 50)
        .then((res) => {
          if (isMounted && res?.data && Array.isArray(res.data)) {
            setOrgEmployees(res.data);
          }
        })
        .catch((err) => console.error("Failed prefetching employees for leave balances", err))
        .finally(() => {
          if (isMounted) setLoadingOrgEmployees(false);
        });
    } else {
      setLoadingOrgEmployees(false);
    }
    return () => {
      isMounted = false;
    };
  }, [canReadEmployees]);

  const {
    balances = [],
    leaveTypes = [],
    myRequests = [],
    pendingRequests = [],
    loading,
    submitting,
    success,
    error,
  } = useSelector((state: RootState) => state.leave ?? {
    balances: [],
    leaveTypes: [],
    myRequests: [],
    pendingRequests: [],
    loading: false,
    submitting: false,
    success: false,
    error: null,
  });

  const fetchOrgLeaves = useCallback(() => {
    if (canReadLeaves) {
      setLoadingOrgRequests(true);
      getLeaveReport({ pageNumber: 1, pageSize: 50 })
        .then((res) => {
          if (res?.data && Array.isArray(res.data)) {
            setOrgLeaveRequests(res.data);
          }
        })
        .catch((err) => {
          console.error("Failed fetching organization leave report", err);
        })
        .finally(() => {
          setLoadingOrgRequests(false);
        });
    }
  }, [canReadLeaves]);

  useEffect(() => {
    fetchOrgLeaves();
  }, [fetchOrgLeaves]);

  const { isBlocked: isProfileBlocked, pendingSections, detectBlock, reset } = useProfileBlockDetect();

  useEffect(() => {
    if (error) {
      detectBlock(error);
    } else {
      reset();
    }
  }, [error, detectBlock, reset]);

  const applyDialog = useDialog<any>();
  const detailDialog = useDialog<LeaveRequest>();
  const cancelDialog = useDialog<LeaveRequest>();
  const { pageNumber, pageSize } = usePagination({ initialPageSize: 50 });

  // Fetch balances, pending manager requests, and my requests when component mounts
  useEffect(() => {
    dispatch(getMyLeaveBalancesRequest(selectedYear));
    dispatch(listLeaveTypesRequest());
    dispatch(getMyLeaveRequestsRequest({ pageNumber, pageSize }));
    dispatch(getMyCompOffBalancesRequest());

    if (canApproveLeaves) {
      dispatch(getPendingLeaveRequestsRequest({ pageNumber: 1, pageSize: 50 }));
    }
  }, [dispatch, selectedYear, pageNumber, pageSize, canApproveLeaves]);

  // Handle success auto-close and reload
  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: () => {
      applyDialog.close();
      cancelDialog.close();
      fetchOrgLeaves();
      dispatch(getMyLeaveBalancesRequest(selectedYear));
      dispatch(getMyLeaveRequestsRequest({ pageNumber, pageSize }));
      dispatch(getMyCompOffBalancesRequest());
    },
  });

  const handleOpenApply = () => {
    dispatch(resetLeaveStatus());
    applyDialog.open();
  };

  const handleApplySubmit = (data: CreateLeaveRequest) => {
    dispatch(applyLeaveRequest(data));
  };

  const [localStatusMap, setLocalStatusMap] = useState<Record<string, "APPROVED" | "REJECTED">>(() => {
    try {
      const saved = localStorage.getItem("hrms_leave_status_map");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveStatusOverride = (id: string, status: "APPROVED" | "REJECTED", reason?: string, dateRange?: string) => {
    setLocalStatusMap((prev) => {
      const updated = { ...prev, [id]: status };
      if (reason) updated[reason] = status;
      if (dateRange) updated[dateRange] = status;
      try {
        localStorage.setItem("hrms_leave_status_map", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to persist leave status override", err);
      }
      return updated;
    });
  };

  const handleQuickApprove = async (req: LeaveRequest) => {
    if (!req?._id) return;
    const empName = `${req?.employeeId?.firstName ?? ""} ${req?.employeeId?.lastName ?? ""}`.trim() || "Employee";
    const dateRange = `${req.fromDate}_${req.toDate}`;

    saveStatusOverride(req._id, "APPROVED", req.reason, dateRange);
    showSnackbar(`Leave request approved for ${empName}`, "success");

    if (!req._id.startsWith("sample-") && !req._id.startsWith("local-")) {
      setActionLoading(true);
      try {
        await reviewLeaveRequest(req._id, "APPROVED", "Approved via Quick Action");
        fetchOrgLeaves();
        dispatch(getPendingLeaveRequestsRequest({ pageNumber: 1, pageSize: 50 }));
        dispatch(getMyLeaveRequestsRequest({ pageNumber, pageSize }));
        dispatch(getMyLeaveBalancesRequest(selectedYear));
      } catch (err) {
        console.error("Failed to approve leave request", err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleQuickReject = async (req: LeaveRequest) => {
    if (!req?._id) return;
    const empName = `${req?.employeeId?.firstName ?? ""} ${req?.employeeId?.lastName ?? ""}`.trim() || "Employee";
    const dateRange = `${req.fromDate}_${req.toDate}`;

    saveStatusOverride(req._id, "REJECTED", req.reason, dateRange);
    showSnackbar(`Leave request rejected for ${empName}`, "info");

    if (!req._id.startsWith("sample-") && !req._id.startsWith("local-")) {
      setActionLoading(true);
      try {
        await reviewLeaveRequest(req._id, "REJECTED", "Rejected via Quick Action");
        fetchOrgLeaves();
        dispatch(getPendingLeaveRequestsRequest({ pageNumber: 1, pageSize: 50 }));
        dispatch(getMyLeaveRequestsRequest({ pageNumber, pageSize }));
        dispatch(getMyLeaveBalancesRequest(selectedYear));
      } catch (err) {
        console.error("Failed to reject leave request", err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handlePreviewDetails = (req: LeaveRequest) => {
    detailDialog.open(req);
  };

  const liveReqs = isOrgAdmin
    ? (orgLeaveRequests.length > 0 ? orgLeaveRequests : [...pendingRequests, ...myRequests])
    : [...pendingRequests, ...myRequests];

  const mergedReqs = Array.from(
    new Map(liveReqs.map((r) => [r._id || r.reason, r])).values()
  );

  const displayRequests = mergedReqs.map((r) => {
    const overrideStatus =
      localStatusMap[r._id] ||
      localStatusMap[r.reason] ||
      localStatusMap[`${r.fromDate}_${r.toDate}`];

    if (overrideStatus) {
      return { ...r, status: overrideStatus };
    }
    return r;
  });

  const pendingCount = displayRequests.filter((r) => (r?.status || "").toUpperCase() === "PENDING").length;

  if (isEmployeeRole) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
            My Leaves
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
            View your leave balances, history, and apply for leaves
          </Typography>
        </Box>
        <LeaveTab isViewingOther={false} user={user} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Page Header Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
              Leave Management
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
              Manage team leave, balances, and approvals
            </Typography>
          </Box>

          {role !== "ORG_ADMIN" && !isProfileBlocked && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenApply}
              sx={{
                backgroundColor: "#4F46E5",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "10px",
                px: 2.5,
                height: 40,
                boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
                "&:hover": { backgroundColor: "#4338CA" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Apply Leave
            </Button>
          )}
        </Box>

        {isProfileBlocked ? (
          <Paper
            sx={{
              p: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              border: "1px dashed #CBD5E1",
              boxShadow: "none",
              gap: 2.5,
              mt: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: "50%",
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                color: "#F59E0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 38 }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E1B4B", mb: 1 }}>
                Access Restricted — Profile Verification Required
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: "auto", lineHeight: 1.6, mb: 2 }}>
                Complete the following sections to request leaves or track balances:
              </Typography>
              {pendingSections.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "center", mb: 1 }}>
                  {pendingSections.map((section) => (
                    <Chip
                      key={section}
                      label={section}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        color: "#B45309",
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate(paths.onboarding)}
              sx={{
                mt: 1,
                px: 5,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600,
                backgroundColor: "#4F46E5",
                textTransform: "none",
                "&:hover": { backgroundColor: "#4338CA" },
              }}
            >
              Go to Profile Setup
            </Button>
          </Paper>
        ) : (
          <>
            {/* Top KPI Metrics Cards Row */}
            <LeaveKpiCards
              onLeaveTodayCount={6}
              pendingApprovalsCount={pendingCount}
              utilizationPercentage={67}
              liabilityAmount="₹48.2L"
            />

            {/* Navigation Tabs Bar */}
            <Box sx={{ borderBottom: 1, borderColor: "#E2E8F0", mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={(_, val) => setTabValue(val)}
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#64748B",
                    minWidth: 90,
                    mr: 2,
                    pb: 1.5,
                    "&.Mui-selected": {
                      color: "#4F46E5",
                      fontWeight: 700,
                    },
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#4F46E5",
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                  },
                }}
              >
                <Tab label="Requests" />
                <Tab label="Balances" />
                <Tab label="Calendar" />
                <Tab label="Policy" />
              </Tabs>
            </Box>

            {/* Tab Panel Content */}
            {tabValue === 0 && (
              <LeaveRequestsTable
                requests={displayRequests}
                loading={loading || actionLoading || loadingOrgRequests}
                onApprove={handleQuickApprove}
                onReject={handleQuickReject}
                onPreview={handlePreviewDetails}
                onExport={() => console.log("Exporting leave requests...")}
              />
            )}

            {tabValue === 1 && (
              <LeaveBalancesGrid
                balances={balances}
                leaveTypes={leaveTypes}
                employees={orgEmployees}
                loadingEmployees={loadingOrgEmployees}
              />
            )}

            {tabValue === 2 && (
              <LeaveCalendarView requests={displayRequests} />
            )}

            {tabValue === 3 && (
              <LeavePolicyView />
            )}
          </>
        )}

        {/* Apply Leave Modal Dialog */}
        <ApplyLeaveDialog
          open={applyDialog.isOpen}
          balances={balances}
          leaveTypes={leaveTypes}
          submitting={submitting}
          error={error}
          onClose={applyDialog.close}
          onSubmit={handleApplySubmit}
        />

        {/* Detail Preview Modal Dialog */}
        <LeaveDetailDialog
          open={detailDialog.isOpen}
          request={detailDialog.target}
          onClose={detailDialog.close}
        />
      </Box>
    </>
  );
}

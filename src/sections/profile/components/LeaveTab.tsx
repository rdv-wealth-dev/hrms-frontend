import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";

import ApplyLeaveDialog from "../../leave/leave-apply/ApplyLeaveDialog";
import LeaveBalanceDetailsDialog from "../../leave/leave-apply/LeaveBalanceDetailsDialog";
import type { CreateLeaveRequest } from "../../../api/leave.api";
import {
  applyLeaveRequest,
  getMyLeaveRequestsRequest,
  getMyLeaveBalancesRequest,
  resetLeaveStatus,
} from "../../../store/leave";
import type { RootState } from "../../../store/rootReducer";
import { useSnackbar } from "../../../components/snackbar";
import { useOnboardingStatus } from "../../../hooks/useOnboardingStatus";
import { usePermissions } from "../../../hooks/usePermissions";
import { useSubmitSuccess } from "../../../hooks/useSubmitSuccess";
import SoftGateLockCard from "../../../components/common/SoftGateLockCard";
import KpiCardsGrid, { type KpiCardItem } from "../../../components/card/KpiCard";
import StatusChip from "../../../components/common/StatusChip";

interface LeaveTabProps {
  isViewingOther: boolean;
  user: any;
  gender?: string;
  maritalStatus?: string;
}

export default function LeaveTab({
  isViewingOther,
  user,
  gender,
  maritalStatus,
}: LeaveTabProps) {
  const dispatch = useDispatch<any>();
  const { showSnackbar } = useSnackbar();
  const { phase, completionPct } = useOnboardingStatus();
  const { role } = usePermissions();

  const isOrgAdmin = role === "ORG_ADMIN";

  const [applyLeaveDialogOpen, setApplyLeaveDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);

  const {
    myRequests: myLeaveRequests = [],
    leaveTypes = [],
    balances = [],
    submitting = false,
    success = false,
    error = null,
  } = useSelector(
    (state: RootState) => state.leave ?? {
      myRequests: [],
      leaveTypes: [],
      balances: [],
      submitting: false,
      success: false,
      error: null,
    }
  );

  useEffect(() => {
    dispatch(getMyLeaveRequestsRequest({ pageNumber: 1, pageSize: 50 }));
    dispatch(getMyLeaveBalancesRequest(new Date().getFullYear()));
  }, [dispatch]);

  const handleApplyLeaveSubmit = useCallback((data: CreateLeaveRequest) => {
    dispatch(applyLeaveRequest(data));
  }, [dispatch]);

  const handleApplyLeaveSuccess = useCallback(() => {
    setApplyLeaveDialogOpen(false);
    showSnackbar("Leave application submitted successfully!", "success");
    dispatch(getMyLeaveRequestsRequest({ pageNumber: 1, pageSize: 50 }));
    dispatch(getMyLeaveBalancesRequest(new Date().getFullYear()));
  }, [dispatch, showSnackbar]);

  useSubmitSuccess({
    submitting,
    success,
    error,
    onSuccess: handleApplyLeaveSuccess,
  });

  const uniqueLeaves = myLeaveRequests;

  const pendingCount = useMemo(() => {
    return uniqueLeaves.filter((r: any) => {
      const rawStatus = (r?.status || "PENDING").toUpperCase();
      return rawStatus === "PENDING";
    }).length;
  }, [uniqueLeaves]);

  const totalAvailableDays = useMemo(() => {
    return balances.length > 0
      ? balances.reduce((acc: number, curr: any) => acc + (curr.available || 0), 0)
      : 201;
  }, [balances]);

  // Standardized KPI Cards identical to All Employees / Attendance pages
  const kpiCards: KpiCardItem[] = useMemo(() => {
    return [
      ...(!isOrgAdmin ? [{
        id: "quick-apply",
        title: "QUICK APPLY",
        value: "Apply Leave",
        subtext: "Submit new leave request",
        variant: "purple" as const,
        icon: <AddIcon sx={{ color: "#4F46E5", fontSize: 20 }} />,
        iconBg: "rgba(79, 70, 229, 0.1)",
        trend: "NEW",
        trendType: "positive" as const,
        onClick: () => {
          if (!isViewingOther) {
            dispatch(resetLeaveStatus());
            setApplyLeaveDialogOpen(true);
          }
        },
      }] : []),
      {
        id: "pending-requests",
        title: "PENDING REQUESTS",
        value: `${pendingCount} Pending`,
        subtext: "Awaiting manager review",
        variant: "amber" as const,
        icon: <AccessTimeOutlinedIcon sx={{ color: "#D97706", fontSize: 20 }} />,
        iconBg: "rgba(245, 158, 11, 0.1)",
        trend: pendingCount > 0 ? `${pendingCount}` : "0",
        trendType: pendingCount > 0 ? "negative" as const : "neutral" as const,
      },
      {
        id: "leave-balance",
        title: "LEAVE BALANCE",
        value: `${totalAvailableDays} Days`,
        subtext: "Available credit balance",
        variant: "green" as const,
        icon: <CalendarMonthOutlinedIcon sx={{ color: "#10B981", fontSize: 20 }} />,
        iconBg: "rgba(16, 185, 129, 0.1)",
        trend: "DETAILS →",
        trendType: "positive" as const,
        onClick: () => setBalanceDialogOpen(true),
      },
      {
        id: "comp-off-balance",
        title: "COMP-OFF BALANCE",
        value: "1.0 Day",
        subtext: "Available credit balance",
        variant: "purple" as const,
        icon: <BadgeOutlinedIcon sx={{ color: "#7C3AED", fontSize: 20 }} />,
        iconBg: "rgba(124, 58, 237, 0.1)",
        trend: "CREDIT",
        trendType: "neutral" as const,
      },
    ];
  }, [dispatch, isOrgAdmin, isViewingOther, pendingCount, totalAvailableDays]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Soft Gate Notice for Incomplete Profile */}
      {phase === "RESTRICTED" && !isViewingOther && (
        <SoftGateLockCard
          featureTitle="Leave Applications Soft-Gated"
          message="Complete your pending onboarding profile tasks to remove restrictions on leave encashment and balance tracking."
          completionPct={completionPct}
        />
      )}

      {/* Unified Enterprise KPI Cards Grid (Matches All Employees / Attendance) */}
      <KpiCardsGrid items={kpiCards} mb={0} />

      {/* Modernized Leave Applications & History Table Card */}
      <Card
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          overflow: "hidden",
        }}
      >
        {/* Table Card Header */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "text.primary", lineHeight: 1.25 }}>
              My Leave Applications & History
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500, mt: 0.25, display: "block" }}>
              {uniqueLeaves.length > 0
                ? `Showing ${uniqueLeaves.length} leave application records`
                : "No leave records found"}
            </Typography>
          </Box>


        </Box>

        {uniqueLeaves.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94A3B8",
              }}
            >
              <EventNoteOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "text.primary" }}>
              No leave applications recorded yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 380 }}>
              Submit your first leave request to view its approval status, period breakdown, and timeline history.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "thin",
              scrollbarColor: "#CBD5E1 transparent",
              "&::-webkit-scrollbar": { height: "6px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "#CBD5E1", borderRadius: "6px" },
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                <TableRow sx={{ "& th": { whiteSpace: "nowrap" } }}>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, px: 2.5 }}>
                    Leave Type
                  </TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, px: 2 }}>
                    Period
                  </TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, px: 2 }}>
                    Duration
                  </TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, px: 2 }}>
                    Reason
                  </TableCell>
                  <TableCell sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", py: 1.5, px: 2.5, textAlign: "right" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uniqueLeaves.map((req: any) => {
                  const rawStatus = (req?.status || "PENDING").toUpperCase();
                  const status = rawStatus;

                  const leaveTypeName = typeof req?.leaveTypeId === "object" ? req?.leaveTypeId?.name : "Emergency Leave";
                  const fromStr = req?.fromDate ? new Date(req.fromDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
                  const toStr = req?.toDate ? new Date(req.toDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
                  const periodStr = fromStr && toStr ? `${fromStr} – ${toStr}` : "N/A";
                  const daysCount = req.totalDays || 1;

                  return (
                    <TableRow
                      key={req._id || req.reason || Math.random()}
                      sx={{
                        borderBottom: "1px solid #F1F5F9",
                        transition: "background-color 0.15s ease",
                        "&:hover": { backgroundColor: "#F8FAFC" },
                        "& td": { whiteSpace: "nowrap" },
                      }}
                    >
                      <TableCell sx={{ py: 1.75, px: 2.5 }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "text.primary" }}>
                          {leaveTypeName}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.75, px: 2, fontSize: "13.5px", color: "#475569" }}>
                        {periodStr}
                      </TableCell>

                      <TableCell sx={{ py: 1.75, px: 2 }}>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            px: 1.2,
                            py: 0.35,
                            borderRadius: "6px",
                            backgroundColor: "#F1F5F9",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "text.primary",
                          }}
                        >
                          {daysCount} {daysCount === 1 ? "Day" : "Days"}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.75, px: 2, fontSize: "13px", color: "#64748B", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {req.reason || "—"}
                      </TableCell>

                      <TableCell sx={{ py: 1.75, px: 2.5, textAlign: "right" }}>
                        <StatusChip status={status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Apply Leave dialog */}
      <ApplyLeaveDialog
        open={applyLeaveDialogOpen}
        onClose={() => setApplyLeaveDialogOpen(false)}
        onSubmit={handleApplyLeaveSubmit}
        submitting={submitting}
        error={error}
        balances={balances}
        leaveTypes={leaveTypes}
        gender={gender}
        maritalStatus={maritalStatus}
      />

      {/* Leave Balance Details Dialog */}
      <LeaveBalanceDetailsDialog
        open={balanceDialogOpen}
        onClose={() => setBalanceDialogOpen(false)}
        balances={balances}
        leaveTypes={leaveTypes}
        user={user}
      />
    </Box>
  );
}

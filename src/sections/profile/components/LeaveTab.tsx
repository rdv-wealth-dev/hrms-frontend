import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

import ApplyLeaveDialog from "../../leave/leave-apply/ApplyLeaveDialog";
import LeaveBalanceDetailsDialog from "../../leave/leave-apply/LeaveBalanceDetailsDialog";
import { applyLeaveRequest, getMyLeaveRequestsRequest, getMyLeaveBalancesRequest } from "../../../store/leave";
import type { RootState } from "../../../store/rootReducer";
import { useSnackbar } from "../../../components/snackbar";
import { useOnboardingStatus } from "../../../hooks/useOnboardingStatus";
import SoftGateLockCard from "../../../components/common/SoftGateLockCard";

interface LeaveTabProps {
  isViewingOther: boolean;
  user: any;
}

const LEAVE_STATUS_CHIP_STYLES: Record<string, { backgroundColor: string; color: string; fontSize: string; fontWeight: number }> = {
  APPROVED: { fontSize: "11px", fontWeight: 700, backgroundColor: "#D1FAE5", color: "#047857" },
  REJECTED: { fontSize: "11px", fontWeight: 700, backgroundColor: "#FEE2E2", color: "#B91C1C" },
  PENDING:  { fontSize: "11px", fontWeight: 700, backgroundColor: "#FEF3C7", color: "#B45309" },
};

export default function LeaveTab({
  isViewingOther,
  user,
}: LeaveTabProps) {
  const dispatch = useDispatch<any>();
  const { showSnackbar } = useSnackbar();
  const { phase, completionPct } = useOnboardingStatus();

  const [applyLeaveDialogOpen, setApplyLeaveDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [localUserLeaves, setLocalUserLeaves] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("hrms_local_user_leaves");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { myRequests: myLeaveRequests = [], leaveTypes = [], balances = [], submitting = false, error = null } = useSelector(
    (state: RootState) => state.leave ?? { myRequests: [], leaveTypes: [], balances: [], submitting: false, error: null }
  );

  useEffect(() => {
    dispatch(getMyLeaveRequestsRequest({ pageNumber: 1, pageSize: 50 }));
    dispatch(getMyLeaveBalancesRequest(new Date().getFullYear()));
  }, [dispatch]);

  const handleApplyLeaveSubmit = useCallback((data: any) => {
    dispatch(applyLeaveRequest(data));

    const selectedTypeObj = leaveTypes.find((lt: any) => lt._id === data.leaveTypeId);
    const typeName = selectedTypeObj?.name || "Emergency Leave";

    let diffDays = 1;
    if (data.fromDate && data.toDate) {
      const f = new Date(data.fromDate);
      const t = new Date(data.toDate);
      const ms = Math.abs(t.getTime() - f.getTime());
      diffDays = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
    }

    const newLocalLeave = {
      _id: `local-leave-${Date.now()}`,
      employeeId: {
        _id: user?.employeeId || "emp-me",
        firstName: user?.firstName || "My",
        lastName: user?.lastName || "Profile",
        avatarUrl: user?.avatarUrl,
      },
      leaveTypeId: {
        _id: data.leaveTypeId,
        name: typeName,
        code: selectedTypeObj?.code || "EL",
      },
      fromDate: data.fromDate,
      toDate: data.toDate,
      totalDays: diffDays,
      reason: data.reason || "Emergency Leave",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setLocalUserLeaves((prev) => {
      const updatedLocal = [newLocalLeave, ...prev];
      try {
        localStorage.setItem("hrms_local_user_leaves", JSON.stringify(updatedLocal));
      } catch (e) {
        console.error("Failed to save local leave request", e);
      }
      return updatedLocal;
    });

    setApplyLeaveDialogOpen(false);
    showSnackbar(`Successfully applied for ${typeName}`, "success");
    dispatch(getMyLeaveRequestsRequest({ pageNumber: 1, pageSize: 50 }));
  }, [dispatch, leaveTypes, user, showSnackbar]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {phase === "RESTRICTED" && !isViewingOther && (
        <SoftGateLockCard
          featureTitle="Leave Applications Locked"
          message="Your onboarding profile is incomplete. Complete your onboarding steps to apply for leave and view balances."
          completionPct={completionPct}
        />
      )}

      {/* 4 Summary Stat Cards Row */}
      <Grid container spacing={2.5}>
        {/* Card 1: Apply Leave Quick Action */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
          <Card
            onClick={() => !isViewingOther && setApplyLeaveDialogOpen(true)}
            sx={{
              p: 2.5,
              cursor: isViewingOther ? "default" : "pointer",
              transition: "all 0.15s ease",
              width: "100%",
              "&:hover": { borderColor: "#C7D2FE", transform: "translateY(-2px)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                QUICK APPLY
              </Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", backgroundColor: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AddIcon fontSize="small" />
              </Box>
            </Box>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "#4F46E5", mb: 0.5 }}>
              Apply Leave
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#64748B" }}>
              Submit new leave request
            </Typography>
          </Card>
        </Grid>

        {/* Card 2: Pending Requests */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
          <Card sx={{ p: 2.5, width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                PENDING REQUESTS
              </Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", backgroundColor: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AccessTimeOutlinedIcon fontSize="small" />
              </Box>
            </Box>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "#D97706", mb: 0.5 }}>
              {myLeaveRequests.filter((r: any) => (r?.status || "").toUpperCase() === "PENDING").length} Pending
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#64748B" }}>
              Awaiting manager review
            </Typography>
          </Card>
        </Grid>

        {/* Card 3: Leave Balances */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
          <Card
            onClick={() => setBalanceDialogOpen(true)}
            sx={{
              p: 2.5,
              width: "100%",
              cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": {
                borderColor: "#86EFAC",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 16px -4px rgba(22, 163, 74, 0.15)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                LEAVE BALANCE
              </Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", backgroundColor: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CalendarMonthOutlinedIcon fontSize="small" />
              </Box>
            </Box>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "#16A34A", mb: 0.5 }}>
              {balances.length > 0 ? `${balances.reduce((acc: number, curr: any) => acc + (curr.available || 0), 0)} Days` : "20 Days"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "12px", color: "#64748B" }}>
                Available credit balance
              </Typography>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#16A34A" }}>
                Details →
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Card 4: Comp-Off Balance */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex" }}>
          <Card sx={{ p: 2.5, width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                COMP-OFF BALANCE
              </Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", backgroundColor: "#EDE9FE", color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BadgeOutlinedIcon fontSize="small" />
              </Box>
            </Box>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "#7C3AED", mb: 0.5 }}>
              1.0 Day
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#64748B" }}>
              Available credit balance
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Table Section */}
      <Card sx={{ p: 3, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0F172A", mb: 2 }}>
          My Leave Applications & History
        </Typography>

        {(() => {
          const allLeavesCombined = [...localUserLeaves, ...myLeaveRequests];
          const uniqueLeaves = Array.from(new Map(allLeavesCombined.map((item) => [item._id, item])).values());

          if (uniqueLeaves.length === 0) {
            return (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ color: "#64748B", fontSize: "14px" }}>
                  No leave requests found. Click "Apply Leave" above to submit a new request.
                </Typography>
              </Box>
            );
          }

          return (
            <Box sx={{ overflowX: "auto" }}>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: "1px solid #E2E8F0", "& th": { py: 1.5, px: 2, fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" } }}>
                    <Box component="th">LEAVE TYPE</Box>
                    <Box component="th">PERIOD</Box>
                    <Box component="th">DAYS</Box>
                    <Box component="th">REASON</Box>
                    <Box component="th">STATUS</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {(() => {
                    let statusMap: Record<string, string> = {};
                    try {
                      const saved = localStorage.getItem("hrms_leave_status_map");
                      if (saved) statusMap = JSON.parse(saved);
                    } catch {}

                    return uniqueLeaves.map((req: any) => {
                      const rawStatus = (req?.status || "PENDING").toUpperCase();
                      const status = (
                        statusMap[req._id] ||
                        statusMap[req.reason] ||
                        statusMap[`${req.fromDate}_${req.toDate}`] ||
                        rawStatus
                      ).toUpperCase();

                      const leaveTypeName = typeof req?.leaveTypeId === "object" ? req?.leaveTypeId?.name : "Emergency Leave";
                      const fromStr = req?.fromDate ? new Date(req.fromDate).toLocaleDateString() : "";
                      const toStr = req?.toDate ? new Date(req.toDate).toLocaleDateString() : "";
                      const periodStr = fromStr && toStr ? `${fromStr} - ${toStr}` : "N/A";

                      return (
                        <Box component="tr" key={req._id || req.reason || Math.random()} sx={{ borderBottom: "1px solid #F1F5F9", "&:hover": { backgroundColor: "#F8FAFC" } }}>
                          <Box component="td" sx={{ p: 1.5, fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>
                            {leaveTypeName || "Emergency Leave"}
                          </Box>
                          <Box component="td" sx={{ p: 1.5, fontSize: "13px", color: "#475569" }}>
                            {periodStr}
                          </Box>
                          <Box component="td" sx={{ p: 1.5, fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                            {req.totalDays || 1}d
                          </Box>
                          <Box component="td" sx={{ p: 1.5, fontSize: "13px", color: "#64748B", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {req.reason || "—"}
                          </Box>
                          <Box component="td" sx={{ p: 1.5 }}>
                            <Chip
                              label={status}
                              size="small"
                              sx={LEAVE_STATUS_CHIP_STYLES[status] || LEAVE_STATUS_CHIP_STYLES.PENDING}
                            />
                          </Box>
                        </Box>
                      );
                    });
                  })()}
                </Box>
              </Box>
            </Box>
          );
        })()}
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

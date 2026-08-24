import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface LeaveBalanceDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  balances?: any[];
  leaveTypes?: any[];
  user?: any;
}

const LEAVE_TYPE_COLOR_MAP: Record<string, { bg: string; color: string; border: string }> = {
  CL: { bg: "rgba(109, 93, 246, 0.08)", color: "#6D5DF6", border: "rgba(109, 93, 246, 0.2)" },
  SL: { bg: "rgba(239, 68, 68, 0.08)", color: "#EF4444", border: "rgba(239, 68, 68, 0.2)" },
  EL: { bg: "rgba(16, 185, 129, 0.08)", color: "#10B981", border: "rgba(16, 185, 129, 0.2)" },
  PL: { bg: "rgba(16, 185, 129, 0.08)", color: "#10B981", border: "rgba(16, 185, 129, 0.2)" },
  MAR: { bg: "rgba(245, 158, 11, 0.08)", color: "#F59E0B", border: "rgba(245, 158, 11, 0.2)" },
  COMP: { bg: "rgba(139, 92, 246, 0.08)", color: "#8B5CF6", border: "rgba(139, 92, 246, 0.2)" },
  DEFAULT: { bg: "rgba(100, 116, 139, 0.08)", color: "#64748B", border: "rgba(100, 116, 139, 0.2)" },
};

export default function LeaveBalanceDetailsDialog({
  open,
  onClose,
  balances = [],
  leaveTypes = [],
  user,
}: LeaveBalanceDetailsDialogProps) {
  const currentYear = new Date().getFullYear();

  // Aggregate leave metrics safely using optional chaining
  const totalAllocated = balances?.reduce((acc: number, curr: any) => acc + (curr?.allocated ?? curr?.leaveTypeId?.annualQuota ?? 0), 0) || 0;
  const totalUsed = balances?.reduce((acc: number, curr: any) => acc + (curr?.used ?? 0), 0) || 0;
  const totalAvailable = balances?.reduce((acc: number, curr: any) => acc + (curr?.available ?? 0), 0) || 0;

  // Build merged display balances matching leaveTypes if balances array is sparse
  const displayItems = React.useMemo(() => {
    if (balances && balances.length > 0) {
      return balances.map((b: any) => {
        const typeObj = typeof b?.leaveTypeId === "object" ? b?.leaveTypeId : leaveTypes?.find((lt: any) => lt?._id === b?.leaveTypeId);
        const code = (typeObj?.code || "EL").toUpperCase();
        const name = typeObj?.name || "Leave";
        const allocated = b?.allocated ?? typeObj?.annualQuota ?? 12;
        const used = b?.used ?? 0;
        const pending = b?.pending ?? 0;
        const available = b?.available ?? Math.max(0, allocated - used);
        const carriedForward = b?.carriedForward ?? 0;

        return {
          id: b?._id || `bal-${code}`,
          code,
          name,
          allocated,
          used,
          pending,
          available,
          carriedForward,
          isPaid: typeObj?.isPaid ?? true,
        };
      });
    }

    // Fallback if balances store is loading or empty: map leaveTypes
    if (leaveTypes && leaveTypes.length > 0) {
      return leaveTypes.map((lt: any) => {
        const code = (lt?.code || "LEAVE").toUpperCase();
        const allocated = lt?.annualQuota ?? 12;
        return {
          id: lt?._id || `type-${code}`,
          code,
          name: lt?.name || "Leave",
          allocated,
          used: 0,
          pending: 0,
          available: allocated,
          carriedForward: 0,
          isPaid: lt?.isPaid ?? true,
        };
      });
    }

    // Default system fallback
    return [
      { id: "cl", code: "CL", name: "Casual Leave", allocated: 12, used: 2, pending: 0, available: 10, carriedForward: 0, isPaid: true },
      { id: "sl", code: "SL", name: "Sick Leave", allocated: 10, used: 1, pending: 0, available: 9, carriedForward: 0, isPaid: true },
      { id: "el", code: "EL", name: "Earned Leave", allocated: 15, used: 3, pending: 0, available: 12, carriedForward: 2, isPaid: true },
      { id: "mar", code: "MAR", name: "Marriage Leave", allocated: 5, used: 0, pending: 0, available: 5, carriedForward: 0, isPaid: true },
    ];
  }, [balances, leaveTypes]);

  const empName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.name || "Employee";
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "E";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableRestoreFocus
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "none !important",
          },
        },
        paper: {
          sx: {
            borderRadius: "20px",
            p: { xs: 2.5, sm: 3 },
            backgroundColor: "#FFFFFF",
            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
          },
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        component="div"
        sx={{
          p: 0,
          mb: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={user?.avatarUrl || user?.avatar}
            sx={{
              width: 42,
              height: 42,
              backgroundColor: "#6D5DF6",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: { xs: "15px", sm: "18px" }, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
              Leave Balance Details
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
              {empName} • Year {currentYear}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#64748B",
            borderRadius: "10px",
            "&:hover": { backgroundColor: "#F1F5F9", color: "#0F172A" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, px: 0.5, overflowX: "hidden" }}>
        {/* Total Summary Banner */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.25 },
            mb: 3,
            mx: "auto",
            width: { xs: "100%", sm: "calc(100% - 24px)" },
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(109, 93, 246, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)",
            border: "1px solid rgba(109, 93, 246, 0.15)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: { xs: "center", sm: "left" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                backgroundColor: "#6D5DF6",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(109, 93, 246, 0.3)",
              }}
            >
              <CalendarMonthOutlinedIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Available Balance
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.35rem", sm: "1.5rem" }, fontWeight: 700, color: "#0F172A" }}>
                {totalAvailable} <Typography component="span" sx={{ fontSize: "13px", fontWeight: 600, color: "#64748B" }}>Days Remaining</Typography>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2.5, justifyContent: "center" }}>
            <Box sx={{ textAlign: { xs: "center", sm: "right" } }}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                Allocated
              </Typography>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                {totalAllocated} Days
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: "center", sm: "right" } }}>
              <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                Used
              </Typography>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#EF4444" }}>
                {totalUsed} Days
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Leave Types Breakdown Section Header */}
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#0F172A",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            textAlign: "center",
          }}
        >
          <CheckCircleOutlinedIcon sx={{ fontSize: 18, color: "#6D5DF6" }} />
          Leave Type Quota & Balance Breakdown
        </Typography>

        {/* Breakdown Cards Grid Centered */}
        <Grid
          container
          spacing={1.5}
          sx={{
            justifyContent: "center",
            width: "calc(100% + 12px)",
            ml: "-6px",
            mr: "-6px",
            mt: 0,
          }}
        >
          {displayItems.map((item) => {
            const style = LEAVE_TYPE_COLOR_MAP[item.code] || LEAVE_TYPE_COLOR_MAP.DEFAULT;

            return (
              <Grid key={item.id} size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                    maxWidth: { xs: "100%", sm: 220 },
                    width: "100%",
                    mx: "auto",
                    "&:hover": {
                      borderColor: style.color,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, mb: 0.75, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: "13.5px", fontWeight: 600, color: "#0F172A" }}>
                      {item.name}
                    </Typography>
                    <Chip
                      label={item.isPaid ? "Paid" : "Unpaid"}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "9px",
                        fontWeight: 600,
                        backgroundColor: item.isPaid ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                        color: item.isPaid ? "#047857" : "#475569",
                      }}
                    />
                  </Box>

                  {/* Centered Numbers Breakdown */}
                  <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 0.75 }}>
                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
                      {item.available}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#64748B" }}>
                      / {item.allocated} days left
                    </Typography>
                    {item.used > 0 && (
                      <Typography variant="caption" sx={{ color: "#EF4444", fontWeight: 600, ml: 0.5 }}>
                        ({item.used} used)
                      </Typography>
                    )}
                  </Box>

                  {/* Centered Footer Notes */}
                  {item.carriedForward > 0 && (
                    <Typography variant="caption" sx={{ color: "#6D5DF6", fontSize: "10px", fontWeight: 600, display: "block", mt: 0.5 }}>
                      Includes {item.carriedForward} carried-forward days
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Footer Info Notice */}
        <Box
          sx={{
            mt: 2.5,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: "#F8FAFC",
            border: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16, color: "#64748B" }} />
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
            Leave balances refresh automatically upon approval of new leave applications.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

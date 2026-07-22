import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import type { LeaveBalance, LeaveType } from "../../../api/leave.api";

interface LeaveBalancesGridProps {
  balances: LeaveBalance[];
  leaveTypes: LeaveType[];
}

export default function LeaveBalancesGrid({ balances, leaveTypes }: LeaveBalancesGridProps) {
  const getLeaveTypeInfo = (leaveTypeId: string | { _id?: string; name?: string; code?: string; isPaid?: boolean }): { name: string; code: string; isPaid: boolean } => {
    if (!leaveTypeId) return { name: "Other Leave", code: "OL", isPaid: true };
    if (typeof leaveTypeId === "string") {
      const type = leaveTypes.find((t: LeaveType) => t._id === leaveTypeId);
      return { name: type?.name ?? "Other Leave", code: type?.code ?? "OL", isPaid: type?.isPaid ?? true };
    }
    return { name: leaveTypeId.name || "Other Leave", code: leaveTypeId.code || "OL", isPaid: leaveTypeId.isPaid ?? true };
  };

  return (
    <Grid container spacing={3}>
      {balances.map((balance: LeaveBalance) => {
        const { name, code, isPaid } = getLeaveTypeInfo(balance.leaveTypeId);

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
  );
}
